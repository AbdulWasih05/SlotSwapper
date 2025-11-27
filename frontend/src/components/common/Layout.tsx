import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Calendar, Users, ArrowLeftRight, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Open menu with animation
  const openMenu = () => {
    setIsMobileMenuOpen(true);
    // Small delay to trigger CSS transition
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  // Close menu with animation
  const closeMenu = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      closeMenu();
    }
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    
    const diff = touchStartX.current - touchCurrentX.current;
    
    // Only allow swiping left (to close)
    if (diff > 0 && drawerRef.current) {
      const translateX = Math.min(diff, 288); // 288px = w-72
      drawerRef.current.style.transform = `translateX(-${translateX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) return;
    
    const diff = touchStartX.current - touchCurrentX.current;
    
    // If swiped more than 80px left, close the menu
    if (diff > 80) {
      closeMenu();
    } else if (drawerRef.current) {
      // Reset position if not enough swipe
      drawerRef.current.style.transform = 'translateX(0)';
    }
    
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

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
      <nav className="bg-[#111111] shadow-lg border-b border-gray-800 backdrop-blur-sm bg-opacity-90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Hamburger + Logo + Desktop Nav */}
            <div className="flex items-center space-x-4 md:space-x-8">
              {/* Mobile hamburger button */}
              <button
                onClick={() => isMobileMenuOpen ? closeMenu() : openMenu()}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link
                to="/dashboard"
                className="text-xl font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                SlotSwapper
              </Link>

              {/* Desktop navigation */}
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

            {/* Right side: User info + Logout */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-sm text-gray-300 hidden sm:block">
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop with fade animation */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMenu}
          />

          {/* Drawer panel with slide animation and swipe support */}
          <div
            ref={drawerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`fixed inset-y-0 left-0 w-72 bg-[#111111] border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-out ${
              isAnimating ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <Link
                to="/dashboard"
                className="text-xl font-bold text-blue-500"
                onClick={closeMenu}
              >
                SlotSwapper
              </Link>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User info in drawer */}
            <div className="px-4 py-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Swipe indicator */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Navigation links */}
            <nav className="px-3 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout button at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
              <button
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
