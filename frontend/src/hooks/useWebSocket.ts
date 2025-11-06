import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { useSwapStore } from '../store/swapStore';
import { toast } from 'sonner';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchEvents, updateEventInStore } = useEventStore();
  const { fetchSwapRequests, updateSwapRequestInStore, addOrUpdateSwappableSlot, removeSwappableSlot, fetchSwappableSlots } = useSwapStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Connect to WebSocket
    socketService.connect(user.id);

    // Listen for real-time event updates
    socketService.on('event:created', () => {
      // Silently refresh events - no toast for new events from others
      fetchEvents();
    });

    socketService.on('event:updated', (data) => {
      if (data.event) {
        updateEventInStore(data.event);

        // Handle marketplace updates in real-time
        if (data.event.userId !== user.id) {
          // If event is now SWAPPABLE, add/update it in marketplace
          if (data.event.status === 'SWAPPABLE') {
            addOrUpdateSwappableSlot(data.event);
            // Show toast ONLY when a slot becomes swappable (meaningful to users)
            toast.info('🎯 New slot available in marketplace!', {
              id: `swappable-${data.event.id}`,
              description: `${data.event.title}`,
              duration: 4000,
            });
          } else {
            // If event is no longer SWAPPABLE, remove it from marketplace
            removeSwappableSlot(data.event.id);
          }
        }
        // Don't show generic "event updated" toasts - too noisy
      }
    });

    socketService.on('event:deleted', (data) => {
      if (data.eventId) {
        // Remove from marketplace if it was there
        removeSwappableSlot(data.eventId);
        // Refresh events to remove deleted event
        fetchEvents();
        // Silently handle deletions - not meaningful to other users
      }
    });

    // Listen for swap request received
    socketService.on('swap:request:received', (data) => {
      toast.info(`🔔 ${data.message}`, {
        id: `swap-request-${data.swapRequest?.id}`,
        description: 'Check your requests page to respond',
        duration: 6000,
      });
      fetchSwapRequests();
      fetchEvents(); // Refresh to show SWAP_PENDING status
    });

    // Listen for swap request accepted
    socketService.on('swap:request:accepted', (data) => {
      toast.success(`✅ ${data.message}`, {
        id: `swap-accepted-${data.swapRequest?.id}`,
        description: 'The swap has been completed successfully',
        duration: 6000,
      });
      fetchSwapRequests();
      fetchEvents(); // Refresh to show new ownership
      if (data.swapRequest) {
        updateSwapRequestInStore(data.swapRequest);
      }
    });

    // Listen for swap request rejected
    socketService.on('swap:request:rejected', (data) => {
      toast.error(`❌ ${data.message}`, {
        id: `swap-rejected-${data.swapRequest?.id}`,
        description: 'Your slots have been reset to swappable',
        duration: 6000,
      });
      fetchSwapRequests();
      fetchEvents(); // Refresh to show SWAPPABLE status
      if (data.swapRequest) {
        updateSwapRequestInStore(data.swapRequest);
      }
    });

    // Listen for slot updated
    socketService.on('slot:updated', (data) => {
      if (data.event) {
        updateEventInStore(data.event);
      }
    });

    // Periodic refresh as backup (every 60 seconds)
    const refreshInterval = setInterval(() => {
      fetchSwappableSlots();
    }, 60000);

    // Cleanup on unmount
    return () => {
      socketService.off('event:created');
      socketService.off('event:updated');
      socketService.off('event:deleted');
      socketService.off('swap:request:received');
      socketService.off('swap:request:accepted');
      socketService.off('swap:request:rejected');
      socketService.off('slot:updated');
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, user]);
};
