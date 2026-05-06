import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useAppContext } from '@/contexts/AppContext';

interface AuthButtonsProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onLoginClick, onSignupClick }) => {
  const { user, setCurrentView, refreshProfile } = useAppContext();

  const handleViewProfile = async () => {
    await refreshProfile();
    setCurrentView('profile');
  };

  const handleLogout = () => {
    // This is handled by ProfileDropdown using the centralized logout
  };

  if (user) {
    return (
      <ProfileDropdown
        userEmail={user.email || ''}
        onViewProfile={handleViewProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        onClick={onLoginClick}
        className="text-sm text-[#8A8070] hover:bg-[rgba(200,150,60,0.1)] hover:text-[#C8963C]"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
      <Button
        onClick={onSignupClick}
        className="text-sm bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;