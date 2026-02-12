import { useEffect, useState } from 'react';
import { useSwapStore } from '../store/swapStore';
import { useEventStore } from '../store/eventStore';
import { SwapRequest } from '../types';
import { format } from 'date-fns';
import { Calendar, Clock, User, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Requests() {
  const { incomingRequests, outgoingRequests, fetchSwapRequests, respondToSwapRequest } = useSwapStore();
  const { fetchEvents } = useEventStore();
  const [mobileTab, setMobileTab] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  const handleResponse = async (requestId: number, accept: boolean) => {
    try {
      await respondToSwapRequest(requestId, accept);
      toast.success(accept ? 'Swap request accepted!' : 'Swap request rejected');
      fetchSwapRequests();
      fetchEvents();
    } catch (error) {
      toast.error('Failed to process swap request');
    }
  };

  const renderSwapRequest = (request: SwapRequest, isIncoming: boolean) => {
    const isPending = request.status === 'PENDING';
    const statusColor = {
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
      ACCEPTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      REJECTED: 'bg-red-50 text-red-700 border border-red-200',
    }[request.status];

    return (
      <div key={request.id} className="bg-white rounded-xl border border-slate-200 shadow-card p-6 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-900">
                {isIncoming ? request.requester.name : request.recipient.name}
              </span>
            </div>
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
              {request.status}
            </span>
          </div>
          <span className="text-sm text-slate-400">
            {format(new Date(request.createdAt), 'MMM dd, yyyy')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">
              {isIncoming ? 'Your Slot' : 'Your Offered Slot'}
            </h4>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <p className="font-medium text-slate-900">
                {isIncoming ? request.recipientSlot.title : request.requesterSlot.title}
              </p>
              <div className="flex items-center text-slate-500 mt-2">
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
              <div className="flex items-center text-slate-500 mt-1">
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
            <h4 className="text-sm font-medium text-slate-600 mb-2">
              {isIncoming ? 'Their Offered Slot' : 'Their Slot'}
            </h4>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="font-medium text-slate-900">
                {isIncoming ? request.requesterSlot.title : request.recipientSlot.title}
              </p>
              <div className="flex items-center text-slate-500 mt-2">
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
              <div className="flex items-center text-slate-500 mt-1">
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
              className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleResponse(request.id, false)}
              className="flex-1 flex items-center justify-center space-x-2 bg-white text-red-600 border border-red-200 py-3 px-4 rounded-lg font-medium hover:bg-red-50 transition-all"
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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Swap Requests</h1>
          <p className="text-slate-500 mt-1">Manage your incoming and outgoing swap requests</p>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setMobileTab('incoming')}
              className={`flex-1 pb-3 text-sm font-medium text-center transition-colors relative ${
                mobileTab === 'incoming'
                  ? 'text-teal-600'
                  : 'text-slate-400'
              }`}
            >
              Incoming ({incomingRequests.length})
              {mobileTab === 'incoming' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
            <button
              onClick={() => setMobileTab('outgoing')}
              className={`flex-1 pb-3 text-sm font-medium text-center transition-colors relative ${
                mobileTab === 'outgoing'
                  ? 'text-teal-600'
                  : 'text-slate-400'
              }`}
            >
              Outgoing ({outgoingRequests.length})
              {mobileTab === 'outgoing' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile: Tab content */}
        <div className="lg:hidden">
          {mobileTab === 'incoming' ? (
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
                  <p className="text-slate-400">No incoming requests</p>
                </div>
              ) : (
                incomingRequests.map((request) => renderSwapRequest(request, true))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
                  <p className="text-slate-400">No outgoing requests</p>
                </div>
              ) : (
                outgoingRequests.map((request) => renderSwapRequest(request, false))
              )}
            </div>
          )}
        </div>

        {/* Desktop: Two-column grid */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Incoming Requests ({incomingRequests.length})
            </h2>
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
                  <p className="text-slate-400">No incoming requests</p>
                </div>
              ) : (
                incomingRequests.map((request) => renderSwapRequest(request, true))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Outgoing Requests ({outgoingRequests.length})
            </h2>
            <div className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-card p-12 text-center">
                  <p className="text-slate-400">No outgoing requests</p>
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
