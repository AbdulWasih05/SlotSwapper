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
    socketService.on('event:created', (data) => {
      if (data.event && data.userId !== user.id) {
        // Only show notification if it's not the current user's event
        toast.info('A new event was created in the marketplace');
      }
      // Refresh events for all users to see the new event
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
            toast.info('New slot available in marketplace');
          } else {
            // If event is no longer SWAPPABLE, remove it from marketplace
            removeSwappableSlot(data.event.id);
          }
        }

        if (data.userId !== user.id) {
          toast.info('An event has been updated');
        }
      }
    });

    socketService.on('event:deleted', (data) => {
      if (data.eventId) {
        // Remove from marketplace if it was there
        removeSwappableSlot(data.eventId);
        // Refresh events to remove deleted event
        fetchEvents();
        if (data.userId !== user.id) {
          toast.info('An event has been removed');
        }
      }
    });

    // Listen for swap request received
    socketService.on('swap:request:received', (data) => {
      toast.info(`${data.message}`, {
        description: 'Check your requests page',
        duration: 5000,
      });
      fetchSwapRequests();
      fetchEvents(); // Refresh to show SWAP_PENDING status
    });

    // Listen for swap request accepted
    socketService.on('swap:request:accepted', (data) => {
      toast.success(`${data.message}`, {
        description: 'The swap has been completed',
        duration: 5000,
      });
      fetchSwapRequests();
      fetchEvents(); // Refresh to show new ownership
      if (data.swapRequest) {
        updateSwapRequestInStore(data.swapRequest);
      }
    });

    // Listen for swap request rejected
    socketService.on('swap:request:rejected', (data) => {
      toast.error(`${data.message}`, {
        description: 'Your slots have been reset to swappable',
        duration: 5000,
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
