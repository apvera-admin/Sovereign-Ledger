import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import ProfilePage from '@/components/ProfilePage';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const { currentView, user, authInitialized } = useAppContext();
  const navigate = useNavigate();

  // Ensure recovery links that land on "/" are routed to reset page.
  React.useEffect(() => {
    const hash = window.location.hash || '';
    const isRecoveryLink = hash.includes('type=recovery');
    if (isRecoveryLink) {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  // Redirect to dashboard if user is logged in
  React.useEffect(() => {
    if (authInitialized && user && currentView === 'home') {
      navigate('/dashboard');
    }
  }, [authInitialized, user, currentView, navigate]);

  // Wait for Supabase to resolve the session before rendering anything,
  // so old users with a persisted session are redirected without ever
  // seeing the landing page.
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C8963C]" />
      </div>
    );
  }

  // Handle profile view
  if (currentView === 'profile' && user) {
    return (
      <ProfilePage 
        userEmail={user.email || ''} 
        onBack={() => navigate('/dashboard')} 
      />
    );
  }

  // Handle dashboard view
  if (currentView === 'dashboard' && user) {
    return <Dashboard />;
  }

  return <AppLayout />;
};

export default Index;
