import { Check, X, Clock, User, Calendar } from 'lucide-react';
import type { AdminSwapRequest } from '../../types/admin';

interface SwapApprovalCardProps {
  swap: AdminSwapRequest;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading?: boolean;
}

export default function SwapApprovalCard({
  swap,
  onApprove,
  onReject,
  isLoading,
}: SwapApprovalCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-slate-500">
            {new Date(swap.createdAt).toLocaleString()}
          </span>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Pending
        </span>
      </div>

      {/* Swap Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Requester */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-sky-600" />
            <span className="text-sm font-medium text-slate-900">{swap.requester.name}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">{swap.requester.email}</p>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{swap.requesterSlot.title}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(swap.requesterSlot.startTime)} at {formatTime(swap.requesterSlot.startTime)}
          </p>
        </div>

        {/* Recipient */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-900">{swap.recipient.name}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">{swap.recipient.email}</p>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{swap.recipientSlot.title}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {formatDate(swap.recipientSlot.startTime)} at {formatTime(swap.recipientSlot.startTime)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onReject(swap.id)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Reject</span>
        </button>
        <button
          onClick={() => onApprove(swap.id)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Approve</span>
        </button>
      </div>
    </div>
  );
}
