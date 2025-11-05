import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Calendar, Users, ArrowLeftRight, LayoutDashboard, LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/marketplace', label: 'Marketplace', icon: Users },
    { path: '/requests', label: 'Requests', icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-[#111111] shadow-lg border-b border-gray-800 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/dashboard"
                className="text-xl font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                SlotSwapper
              </Link>
              <div className="hidden md:flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
