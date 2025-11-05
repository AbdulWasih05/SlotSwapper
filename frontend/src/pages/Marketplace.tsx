import { useEffect, useState } from 'react';
import { useSwapStore } from '../store/swapStore';
import { useEventStore } from '../store/eventStore';
import { Event } from '../types';
import { format } from 'date-fns';
import { Calendar, Clock, User, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Marketplace() {
  const { swappableSlots, isLoading, fetchSwappableSlots, createSwapRequest } = useSwapStore();
  const { events, fetchEvents } = useEventStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [mySlotId, setMySlotId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchSwappableSlots();
  }, []);

  const mySwappableSlots = events.filter((e) => e.status === 'SWAPPABLE');

  const handleRequestSwap = (slot: Event) => {
    if (mySwappableSlots.length === 0) {
      toast.error('You need to have at least one swappable slot to request a swap');
      return;
    }
    setSelectedSlot(slot);
    setMySlotId(mySwappableSlots[0]?.id || null);
    setShowModal(true);
  };

  const handleSubmitSwapRequest = async () => {
    if (!selectedSlot || !mySlotId) {
      toast.error('Please select your slot');
      return;
    }

    try {
      await createSwapRequest({
        mySlotId,
        theirSlotId: selectedSlot.id,
      });
      toast.success('Swap request sent successfully!');
      setShowModal(false);
      fetchSwappableSlots();
    } catch (error) {
      toast.error('Failed to send swap request');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Slot Marketplace</h1>
          <p className="text-gray-400 mt-2 text-lg">
            Browse and request swaps with other users' available time slots
          </p>
        </div>

        {mySwappableSlots.length === 0 && (
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-400">
              You don't have any swappable slots. Mark your events as "SWAPPABLE" in the calendar to request swaps.
            </p>
          </div>
        )}

        {isLoading && swappableSlots.length === 0 ? (
          <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Loading marketplace...
            </h3>
            <p className="text-gray-400">
              Fetching available slots
            </p>
          </div>
        ) : swappableSlots.length === 0 ? (
          <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No swappable slots available
            </h3>
            <p className="text-gray-400">
              Check back later when other users mark their slots as swappable
            </p>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Updating...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swappableSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{slot.title}</h3>
                  <span className="bg-green-600/20 text-green-400 text-xs font-medium px-3 py-1 rounded-full border border-green-600/50">
                    Available
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">{slot.user?.name}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(slot.startTime), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(slot.startTime), 'HH:mm')} -{' '}
                      {format(new Date(slot.endTime), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRequestSwap(slot)}
                  disabled={mySwappableSlots.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Request Swap
                </button>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>

      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] rounded-2xl max-w-md w-full p-6 border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Request Swap</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-5">
              <h3 className="font-semibold text-gray-300 mb-2">Their Slot:</h3>
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                <p className="font-medium text-white">{selectedSlot.title}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {format(new Date(selectedSlot.startTime), 'MMM dd, yyyy HH:mm')} -{' '}
                  {format(new Date(selectedSlot.endTime), 'HH:mm')}
                </p>
                <p className="text-sm text-gray-400">Owner: {selectedSlot.user?.name}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-300 mb-2">Select Your Slot to Offer:</h3>
              <select
                value={mySlotId || ''}
                onChange={(e) => setMySlotId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                {mySwappableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.title} ({format(new Date(slot.startTime), 'MMM dd, HH:mm')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-800 text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSwapRequest}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
