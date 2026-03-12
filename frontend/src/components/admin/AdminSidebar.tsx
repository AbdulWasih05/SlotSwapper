import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ArrowLeftRight,
  Settings,
  Activity,
  LifeBuoy,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { path: '/admin/patients', label: 'Patients', icon: Users },
  { path: '/admin/swaps', label: 'Swap Queue', icon: ArrowLeftRight },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-[100vh] w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 bg-teal-500/10 rounded-lg group-hover:bg-teal-500/20 transition-colors">
              <Activity className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Slot Swapper</h1>
              <p className="text-xs text-slate-400 font-medium">Admin Portal</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Settings className="w-5 h-5" /> 
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 py-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'} transition-colors`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Card */}
        <div className="p-4 border-t border-slate-700/50 mt-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="text-white font-medium text-sm">Need Help?</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Check our docs or contact support for assistance.
            </p>
            <button className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
