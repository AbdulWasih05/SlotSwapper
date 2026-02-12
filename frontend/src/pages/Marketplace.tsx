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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Slot Marketplace</h1>
          <p className="text-slate-500 mt-1 sm:mt-2">
            Browse and request swaps with other users' available time slots
          </p>
        </div>

        {mySwappableSlots.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-700 text-sm">
              You don't have any swappable slots. Mark your events as "SWAPPABLE" in the calendar to request swaps.
            </p>
          </div>
        )}

        {isLoading && swappableSlots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Loading marketplace...
            </h3>
            <p className="text-slate-400">
              Fetching available slots
            </p>
          </div>
        ) : swappableSlots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No swappable slots available
            </h3>
            <p className="text-slate-400">
              Check back later when other users mark their slots as swappable
            </p>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Updating...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {swappableSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white rounded-xl border border-slate-200 shadow-card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{slot.title}</h3>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200">
                    Available
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center text-slate-500">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">{slot.user?.name}</span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(slot.startTime), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-500">
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
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Request Swap
                </button>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>

      {/* Swap Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Request Swap</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-5">
              <h3 className="font-semibold text-slate-700 mb-2">Their Slot:</h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="font-medium text-slate-900">{selectedSlot.title}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {format(new Date(selectedSlot.startTime), 'MMM dd, yyyy HH:mm')} -{' '}
                  {format(new Date(selectedSlot.endTime), 'HH:mm')}
                </p>
                <p className="text-sm text-slate-500">Owner: {selectedSlot.user?.name}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-2">Select Your Slot to Offer:</h3>
              <select
                value={mySlotId || ''}
                onChange={(e) => setMySlotId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
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
                className="flex-1 bg-white text-slate-700 border border-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSwapRequest}
                className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 active:bg-teal-800 transition-all shadow-sm"
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
