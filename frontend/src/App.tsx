import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import { useAuthStore } from './store/authStore';
import { useAdminAuthStore } from './store/admin/adminAuthStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';

// Admin imports
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminPatients from './pages/admin/AdminPatients';
import AdminSwaps from './pages/admin/AdminSwaps';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { loadUser } = useAuthStore();
  const { loadAdmin } = useAdminAuthStore();

  useWebSocket();

  // Load user from localStorage on app initialization for persistent auth
  useEffect(() => {
    const initAuth = async () => {
      await Promise.all([loadUser(), loadAdmin()]);
      setIsInitialized(true);
    };
    initAuth();
  }, [loadUser, loadAdmin]);

  // Show loading state while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <CalendarPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Layout>
                <Requests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminCalendar />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminPatients />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/swaps"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminSwaps />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
