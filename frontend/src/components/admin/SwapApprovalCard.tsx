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
    <div className="bg-[#111111] rounded-xl border border-gray-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-400">
            {new Date(swap.createdAt).toLocaleString()}
          </span>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
          Pending
        </span>
      </div>

      {/* Swap Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Requester */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{swap.requester.name}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{swap.requester.email}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{swap.requesterSlot.title}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(swap.requesterSlot.startTime)} at {formatTime(swap.requesterSlot.startTime)}
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-gray-400">⇄</span>
          </div>
        </div>

        {/* Recipient */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">{swap.recipient.name}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{swap.recipient.email}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{swap.recipientSlot.title}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(swap.recipientSlot.startTime)} at {formatTime(swap.recipientSlot.startTime)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onReject(swap.id)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Reject</span>
        </button>
        <button
          onClick={() => onApprove(swap.id)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Approve</span>
        </button>
      </div>
    </div>
  );
}
