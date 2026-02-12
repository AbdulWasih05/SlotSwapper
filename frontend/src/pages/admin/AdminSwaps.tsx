import { useEffect, useState } from 'react';
import { useAdminSwapStore } from '../../store/admin/adminSwapStore';
import SwapApprovalCard from '../../components/admin/SwapApprovalCard';
import DataTable from '../../components/admin/DataTable';
import { toast } from 'sonner';
import type { AdminSwapRequest } from '../../types/admin';

type TabType = 'pending' | 'all';

export default function AdminSwaps() {
  const {
    swapRequests,
    pendingSwaps,
    pagination,
    isLoading,
    fetchSwapRequests,
    fetchPendingSwaps,
    approveSwap,
    rejectSwap,
  } = useAdminSwapStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingSwaps();
    } else {
      fetchSwapRequests(1, 10, statusFilter);
    }
  }, [activeTab, statusFilter]);

  const handleApprove = async (id: number) => {
    setIsProcessing(true);
    try {
      await approveSwap(id);
      toast.success('Swap request approved');
    } catch (err) {
      toast.error('Failed to approve swap');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: number) => {
    setIsProcessing(true);
    try {
      await rejectSwap(id);
      toast.success('Swap request rejected');
    } catch (err) {
      toast.error('Failed to reject swap');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchSwapRequests(page, 10, statusFilter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const columns = [
    {
      key: 'requester',
      header: 'Requester',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="font-medium text-slate-900">{swap.requester.name}</p>
          <p className="text-xs text-slate-500">{swap.requester.email}</p>
        </div>
      ),
    },
    {
      key: 'requesterSlot',
      header: 'Offers',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="text-slate-700">{swap.requesterSlot.title}</p>
          <p className="text-xs text-slate-500">{formatDate(swap.requesterSlot.startTime)}</p>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="font-medium text-slate-900">{swap.recipient.name}</p>
          <p className="text-xs text-slate-500">{swap.recipient.email}</p>
        </div>
      ),
    },
    {
      key: 'recipientSlot',
      header: 'Wants',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="text-slate-700">{swap.recipientSlot.title}</p>
          <p className="text-xs text-slate-500">{formatDate(swap.recipientSlot.startTime)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (swap: AdminSwapRequest) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            swap.status === 'PENDING'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : swap.status === 'ACCEPTED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {swap.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (swap: AdminSwapRequest) => (
        <span className="text-slate-500 text-sm">{formatDate(swap.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Swap Queue</h1>
        <p className="text-slate-500">Manage swap requests between patients</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-teal-600'
              : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          Pending Approval
          {pendingSwaps.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
              {pendingSwaps.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'all'
              ? 'text-teal-600'
              : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          All Requests
          {activeTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
          )}
        </button>
      </div>

      {activeTab === 'pending' ? (
        // Pending swaps - card view
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : pendingSwaps.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-8 text-center">
              <p className="text-slate-400">No pending swap requests</p>
            </div>
          ) : (
            pendingSwaps.map((swap) => (
              <SwapApprovalCard
                key={swap.id}
                swap={swap}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={isProcessing}
              />
            ))
          )}
        </div>
      ) : (
        // All swaps - table view
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={swapRequests}
            keyExtractor={(swap) => swap.id}
            pagination={
              pagination
                ? {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                    onPageChange: handlePageChange,
                  }
                : undefined
            }
            isLoading={isLoading}
            emptyMessage="No swap requests found"
          />
        </div>
      )}
    </div>
  );
}
