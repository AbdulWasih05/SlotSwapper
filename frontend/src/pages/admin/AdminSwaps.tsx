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
          <p className="font-medium text-white">{swap.requester.name}</p>
          <p className="text-xs text-gray-500">{swap.requester.email}</p>
        </div>
      ),
    },
    {
      key: 'requesterSlot',
      header: 'Offers',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="text-gray-300">{swap.requesterSlot.title}</p>
          <p className="text-xs text-gray-500">{formatDate(swap.requesterSlot.startTime)}</p>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="font-medium text-white">{swap.recipient.name}</p>
          <p className="text-xs text-gray-500">{swap.recipient.email}</p>
        </div>
      ),
    },
    {
      key: 'recipientSlot',
      header: 'Wants',
      render: (swap: AdminSwapRequest) => (
        <div>
          <p className="text-gray-300">{swap.recipientSlot.title}</p>
          <p className="text-xs text-gray-500">{formatDate(swap.recipientSlot.startTime)}</p>
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
              ? 'bg-yellow-500/20 text-yellow-400'
              : swap.status === 'ACCEPTED'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
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
        <span className="text-gray-500 text-sm">{formatDate(swap.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Swap Queue</h1>
        <p className="text-gray-400">Manage swap requests between patients</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending Approval
          {pendingSwaps.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
              {pendingSwaps.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'all'
              ? 'text-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Requests
          {activeTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      {activeTab === 'pending' ? (
        // Pending swaps - card view
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingSwaps.length === 0 ? (
            <div className="bg-[#111111] rounded-xl border border-gray-800 p-8 text-center">
              <p className="text-gray-500">No pending swap requests</p>
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
            <span className="text-sm text-gray-400">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
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
