import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { loadUser } = useAuthStore();

  useWebSocket();

  // Load user from localStorage on app initialization for persistent auth
  useEffect(() => {
    const initAuth = async () => {
      await loadUser();
      setIsInitialized(true);
    };
    initAuth();
  }, [loadUser]);

  // Show loading state while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
