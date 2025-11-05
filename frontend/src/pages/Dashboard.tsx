import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { useSwapStore } from '../store/swapStore';
import { Calendar, Users, ArrowLeftRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { events, fetchEvents } = useEventStore();
  const { incomingRequests, outgoingRequests, fetchSwapRequests } = useSwapStore();

  useEffect(() => {
    fetchEvents();
    fetchSwapRequests();
  }, []);

  const swappableEvents = events.filter((e) => e.status === 'SWAPPABLE');
  const pendingIncoming = incomingRequests.filter((r) => r.status === 'PENDING');
  const pendingOutgoing = outgoingRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Blue Glow */}
        <div className="relative mb-12 overflow-hidden">
          {/* Blue Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 text-center py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your schedule and swap time slots with others
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-4xl font-bold text-white mt-1">{events.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-4">
              <Link
                to="/calendar"
                className="text-blue-500 hover:text-blue-400 text-sm font-semibold inline-flex items-center group"
              >
                <span>View Calendar</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Swappable Slots</p>
                <p className="text-4xl font-bold text-white mt-1">{swappableEvents.length}</p>
              </div>
              <ArrowLeftRight className="w-12 h-12 text-green-500" />
            </div>
            <div className="mt-4">
              <Link
                to="/marketplace"
                className="text-green-500 hover:text-green-400 text-sm font-semibold inline-flex items-center group"
              >
                <span>Browse Marketplace</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Requests</p>
                <p className="text-4xl font-bold text-white mt-1">
                  {pendingIncoming.length + pendingOutgoing.length}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-500" />
            </div>
            <div className="mt-4">
              <Link
                to="/requests"
                className="text-purple-500 hover:text-purple-400 text-sm font-semibold inline-flex items-center group"
              >
                <span>View Requests</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Incoming Requests ({pendingIncoming.length})
            </h2>
            {pendingIncoming.length === 0 ? (
              <p className="text-gray-500">No pending incoming requests</p>
            ) : (
              <ul className="space-y-3">
                {pendingIncoming.slice(0, 3).map((request) => (
                  <li
                    key={request.id}
                    className="border-l-4 border-blue-500 pl-4 py-3 bg-[#1a1a1a] rounded-r-lg hover:bg-[#222222] transition-colors"
                  >
                    <p className="font-medium text-white">
                      {request.requester.name} wants to swap
                    </p>
                    <p className="text-sm text-gray-400">
                      {request.recipientSlot.title}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pendingIncoming.length > 3 && (
              <Link
                to="/requests"
                className="text-blue-500 hover:text-blue-400 text-sm font-semibold mt-4 inline-flex items-center group"
              >
                <span>View all</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>

          <div className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Outgoing Requests ({pendingOutgoing.length})
            </h2>
            {pendingOutgoing.length === 0 ? (
              <p className="text-gray-500">No pending outgoing requests</p>
            ) : (
              <ul className="space-y-3">
                {pendingOutgoing.slice(0, 3).map((request) => (
                  <li
                    key={request.id}
                    className="border-l-4 border-purple-500 pl-4 py-3 bg-[#1a1a1a] rounded-r-lg hover:bg-[#222222] transition-colors"
                  >
                    <p className="font-medium text-white">
                      Requested from {request.recipient.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {request.requesterSlot.title}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pendingOutgoing.length > 3 && (
              <Link
                to="/requests"
                className="text-purple-500 hover:text-purple-400 text-sm font-semibold mt-4 inline-flex items-center group"
              >
                <span>View all</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
