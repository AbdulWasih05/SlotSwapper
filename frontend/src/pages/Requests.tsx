import { useEffect } from 'react';
import { useSwapStore } from '../store/swapStore';
import { useEventStore } from '../store/eventStore';
import { SwapRequest } from '../types';
import { format } from 'date-fns';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Requests() {
  const { incomingRequests, outgoingRequests, fetchSwapRequests, respondToSwapRequest } = useSwapStore();
  const { fetchEvents } = useEventStore();

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  const handleResponse = async (requestId: number, accept: boolean) => {
    try {
      await respondToSwapRequest(requestId, accept);
      toast.success(accept ? 'Swap request accepted!' : 'Swap request rejected');
      fetchSwapRequests();
      fetchEvents(); // Refresh events to show updated ownership
    } catch (error) {
      toast.error('Failed to process swap request');
    }
  };

  const renderSwapRequest = (request: SwapRequest, isIncoming: boolean) => {
    const isPending = request.status === 'PENDING';
    const statusColor = {
      PENDING: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50',
      ACCEPTED: 'bg-green-600/20 text-green-400 border border-green-600/50',
      REJECTED: 'bg-red-600/20 text-red-400 border border-red-600/50',
    }[request.status];

    return (
      <div key={request.id} className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 hover:border-purple-500/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-white">
                {isIncoming ? request.requester.name : request.recipient.name}
              </span>
            </div>
            <span className={`inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
              {request.status}
            </span>
          </div>
          <span className="text-sm text-gray-400">
            {format(new Date(request.createdAt), 'MMM dd, yyyy')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              {isIncoming ? 'Your Slot' : 'Your Offered Slot'}
            </h4>
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
              <p className="font-medium text-white">
                {isIncoming ? request.recipientSlot.title : request.requesterSlot.title}
              </p>
              <div className="flex items-center text-gray-400 mt-2">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="text-xs">
                  {format(
                    new Date(
                      isIncoming ? request.recipientSlot.startTime : request.requesterSlot.startTime
                    ),
                    'MMM dd, yyyy'
                  )}
                </span>
              </div>
              <div className="flex items-center text-gray-400 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-xs">
                  {format(
                    new Date(
                      isIncoming ? request.recipientSlot.startTime : request.requesterSlot.startTime
                    ),
                    'HH:mm'
                  )}{' '}
                  -{' '}
                  {format(
                    new Date(
                      isIncoming ? request.recipientSlot.endTime : request.requesterSlot.endTime
                    ),
                    'HH:mm'
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              {isIncoming ? 'Their Offered Slot' : 'Their Slot'}
            </h4>
            <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
              <p className="font-medium text-white">
                {isIncoming ? request.requesterSlot.title : request.recipientSlot.title}
              </p>
              <div className="flex items-center text-gray-400 mt-2">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="text-xs">
                  {format(
                    new Date(
                      isIncoming ? request.requesterSlot.startTime : request.recipientSlot.startTime
                    ),
                    'MMM dd, yyyy'
                  )}
                </span>
              </div>
              <div className="flex items-center text-gray-400 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-xs">
                  {format(
                    new Date(
                      isIncoming ? request.requesterSlot.startTime : request.recipientSlot.startTime
                    ),
                    'HH:mm'
                  )}{' '}
                  -{' '}
                  {format(
                    new Date(
                      isIncoming ? request.requesterSlot.endTime : request.recipientSlot.endTime
                    ),
                    'HH:mm'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isIncoming && isPending && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleResponse(request.id, true)}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleResponse(request.id, false)}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Swap Requests</h1>
          <p className="text-gray-400 mt-2 text-lg">Manage your incoming and outgoing swap requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Incoming Requests ({incomingRequests.length})
            </h2>
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-400">No incoming requests</p>
                </div>
              ) : (
                incomingRequests.map((request) => renderSwapRequest(request, true))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Outgoing Requests ({outgoingRequests.length})
            </h2>
            <div className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="bg-[#111111] border border-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-400">No outgoing requests</p>
                </div>
              ) : (
                outgoingRequests.map((request) => renderSwapRequest(request, false))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
