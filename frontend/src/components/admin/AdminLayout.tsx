import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/admin/adminAuthStore';
import AdminSidebar from './AdminSidebar';
import { Menu, LogOut, User } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-top-nav flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>{admin?.name}</span>
              {admin?.clinic && (
                <span className="text-slate-400">({admin.clinic.name})</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
