import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import LoadingScreen from './components/common/LoadingScreen';

function App() {
  const { isLoading, isAuthenticated } = useAuth0();
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Simulate app initialization (would normally include loading data, checking auth, etc.)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppIsReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading || !appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Protected routes */}
      <Route 
        element={
          <DashboardLayout />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Fallback routes */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;