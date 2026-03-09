import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/admin/adminAuthStore';
import AdminSidebar from './AdminSidebar';
import { Menu, LogOut } from 'lucide-react';

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
    <div className="h-screen bg-slate-50/50 flex overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb-like title or welcome message could go here */}
            <div className="hidden sm:block">
              <h2 className="text-sm font-medium text-slate-500">Welcome back,</h2>
              <p className="text-slate-900 font-semibold">{admin?.name?.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search bar placeholder - visual only */}
            <div className="hidden md:flex items-center px-4 py-2 bg-slate-100/50 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all w-64">
               <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-600 placeholder:text-slate-400" />
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end mr-1 hidden sm:block">
                <span className="text-sm font-semibold text-slate-700">{admin?.name}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg border-2 border-white shadow-sm">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
