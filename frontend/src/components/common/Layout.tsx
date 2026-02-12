import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Calendar, ArrowLeftRight, LayoutDashboard, LogOut, Store } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/requests', label: 'Requests', icon: ArrowLeftRight },
  ];

  const userInitials = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-top-nav">
        <div className="flex items-center justify-between h-12 px-4">
          <span className="text-lg font-bold text-slate-900">SlotSwapper</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2"
            title="Logout"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
              {userInitials}
            </div>
          </button>
        </div>
      </header>

      {/* Desktop Top Nav Bar */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white border-b border-slate-200 shadow-top-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/dashboard"
              className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors"
            >
              SlotSwapper
            </Link>

            {/* Desktop navigation links */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                      isActive
                        ? 'text-teal-600 border-teal-500'
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User info + Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pb-[72px] md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-bottom-nav">
        <div className="flex items-center justify-around h-[72px] px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
