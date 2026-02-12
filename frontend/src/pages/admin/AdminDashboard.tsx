import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import StatsCard from '../../components/admin/StatsCard';
import { Users, Calendar, ArrowLeftRight, Clock, ChevronRight } from 'lucide-react';
import type { DashboardStats, AdminSwapRequest, AdminAppointment, AdminPatient } from '../../types/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSwaps, setRecentSwaps] = useState<AdminSwapRequest[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<AdminAppointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<AdminPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRecentActivity(),
        ]);
        setStats(statsData.stats);
        setRecentSwaps(activityData.recentSwaps);
        setRecentAppointments(activityData.recentAppointments);
        setRecentPatients(activityData.recentPatients);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your clinic operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Pending Swaps"
          value={stats?.pendingSwaps || 0}
          icon={ArrowLeftRight}
          color="yellow"
        />
        <StatsCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Appointments</h2>
            <Link
              to="/admin/calendar"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-slate-400 text-sm">No recent appointments</p>
            ) : (
              recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-slate-900 font-medium">{apt.title}</p>
                    <p className="text-sm text-slate-500">{apt.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{formatDate(apt.startTime)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        apt.status === 'SWAPPABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : apt.status === 'SWAP_PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Swaps */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Pending Swap Requests</h2>
            <Link
              to="/admin/swaps"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSwaps.filter((s) => s.status === 'PENDING').length === 0 ? (
              <p className="text-slate-400 text-sm">No pending swap requests</p>
            ) : (
              recentSwaps
                .filter((s) => s.status === 'PENDING')
                .slice(0, 5)
                .map((swap) => (
                  <div
                    key={swap.id}
                    className="p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-900 font-medium text-sm">
                        {swap.requester.name} ↔ {swap.recipient.name}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDate(swap.createdAt)}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Patients</h2>
          <Link
            to="/admin/patients"
            className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentPatients.length === 0 ? (
            <p className="text-slate-400 text-sm col-span-full">No patients yet</p>
          ) : (
            recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-slate-900 font-medium truncate">{patient.name}</p>
                  <p className="text-sm text-slate-500 truncate">{patient.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
