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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your schedule and swap time slots with others
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Events Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Events</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{events.length}</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl">
                <Calendar className="w-6 h-6 text-sky-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                to="/calendar"
                className="text-teal-600 hover:text-teal-700 text-sm font-semibold"
              >
                View Calendar &rarr;
              </Link>
            </div>
          </div>

          {/* Swappable Slots Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Swappable Slots</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{swappableEvents.length}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <ArrowLeftRight className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                to="/marketplace"
                className="text-teal-600 hover:text-teal-700 text-sm font-semibold"
              >
                Browse Marketplace &rarr;
              </Link>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                  {pendingIncoming.length + pendingOutgoing.length}
                </p>
              </div>
              <div className="p-3 bg-violet-50 rounded-xl">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                to="/requests"
                className="text-teal-600 hover:text-teal-700 text-sm font-semibold"
              >
                View Requests &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Request Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoming Requests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Incoming Requests ({pendingIncoming.length})
            </h2>
            {pendingIncoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400">No pending incoming requests</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingIncoming.slice(0, 3).map((request) => (
                  <li
                    key={request.id}
                    className="border-l-3 border-sky-500 pl-4 py-3 bg-slate-50 rounded-r-lg"
                  >
                    <p className="font-medium text-slate-900">
                      {request.requester.name} wants to swap
                    </p>
                    <p className="text-sm text-slate-500">
                      {request.recipientSlot.title}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pendingIncoming.length > 3 && (
              <Link
                to="/requests"
                className="text-teal-600 hover:text-teal-700 text-sm font-semibold mt-4 inline-block"
              >
                View all {pendingIncoming.length} requests &rarr;
              </Link>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Outgoing Requests ({pendingOutgoing.length})
            </h2>
            {pendingOutgoing.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowLeftRight className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400">No pending outgoing requests</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingOutgoing.slice(0, 3).map((request) => (
                  <li
                    key={request.id}
                    className="border-l-3 border-violet-500 pl-4 py-3 bg-slate-50 rounded-r-lg"
                  >
                    <p className="font-medium text-slate-900">
                      Requested from {request.recipient.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {request.requesterSlot.title}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pendingOutgoing.length > 3 && (
              <Link
                to="/requests"
                className="text-teal-600 hover:text-teal-700 text-sm font-semibold mt-4 inline-block"
              >
                View all {pendingOutgoing.length} requests &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
