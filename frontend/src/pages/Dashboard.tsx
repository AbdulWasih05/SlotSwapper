import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { useSwapStore } from '../store/swapStore';
import { Calendar, Users, ArrowLeftRight, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { events, fetchEvents, isLoading: eventsLoading } = useEventStore();
  const { incomingRequests, outgoingRequests, fetchSwapRequests, isLoading: swapsLoading } = useSwapStore();

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
        <div className="relative mb-12 overflow-hidden animate-fade-in">
          {/* Blue Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

          <div className="relative z-10 text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4 animate-fade-in-down">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to your dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in-up">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">{user?.name}</span>!
            </h1>
            <p className="text-gray-400 text-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Manage your schedule and swap time slots with others
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Events Card */}
          <div 
            className="group bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 
                       hover:border-blue-500/50 transition-all duration-300 
                       hover:shadow-blue-500/20 hover:shadow-xl hover:-translate-y-1
                       animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-4xl font-bold text-white mt-1 tabular-nums">{events.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <Link
                to="/calendar"
                className="text-blue-500 hover:text-blue-400 text-sm font-semibold inline-flex items-center group/link"
              >
                <span>View Calendar</span>
                <span className="ml-1 transform group-hover/link:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Swappable Slots Card */}
          <div 
            className="group bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 
                       hover:border-green-500/50 transition-all duration-300 
                       hover:shadow-green-500/20 hover:shadow-xl hover:-translate-y-1
                       animate-fade-in-up"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Swappable Slots</p>
                <p className="text-4xl font-bold text-white mt-1 tabular-nums">{swappableEvents.length}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                <ArrowLeftRight className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <Link
                to="/marketplace"
                className="text-green-500 hover:text-green-400 text-sm font-semibold inline-flex items-center group/link"
              >
                <span>Browse Marketplace</span>
                <span className="ml-1 transform group-hover/link:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div 
            className="group bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 
                       hover:border-purple-500/50 transition-all duration-300 
                       hover:shadow-purple-500/20 hover:shadow-xl hover:-translate-y-1
                       animate-fade-in-up"
            style={{ animationDelay: '350ms' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Requests</p>
                <p className="text-4xl font-bold text-white mt-1 tabular-nums">
                  {pendingIncoming.length + pendingOutgoing.length}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <Link
                to="/requests"
                className="text-purple-500 hover:text-purple-400 text-sm font-semibold inline-flex items-center group/link"
              >
                <span>View Requests</span>
                <span className="ml-1 transform group-hover/link:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoming Requests */}
          <div 
            className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 animate-fade-in-up"
            style={{ animationDelay: '450ms' }}
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Incoming Requests ({pendingIncoming.length})
            </h2>
            {pendingIncoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500">No pending incoming requests</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingIncoming.slice(0, 3).map((request, index) => (
                  <li
                    key={request.id}
                    className="border-l-4 border-blue-500 pl-4 py-3 bg-[#1a1a1a] rounded-r-lg 
                               hover:bg-[#222222] hover:border-blue-400 transition-all duration-200
                               hover:translate-x-1 cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${500 + index * 100}ms` }}
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
                <span>View all {pendingIncoming.length} requests</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>

          {/* Outgoing Requests */}
          <div 
            className="bg-[#111111] rounded-xl shadow-lg border border-gray-800 p-6 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Outgoing Requests ({pendingOutgoing.length})
            </h2>
            {pendingOutgoing.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowLeftRight className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500">No pending outgoing requests</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingOutgoing.slice(0, 3).map((request, index) => (
                  <li
                    key={request.id}
                    className="border-l-4 border-purple-500 pl-4 py-3 bg-[#1a1a1a] rounded-r-lg 
                               hover:bg-[#222222] hover:border-purple-400 transition-all duration-200
                               hover:translate-x-1 cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${550 + index * 100}ms` }}
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
                <span>View all {pendingOutgoing.length} requests</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
