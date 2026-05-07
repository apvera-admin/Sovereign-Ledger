import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, FileText, Search, Users, Shield, Home, Book } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onHomeClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ 
  currentView, 
  onViewChange, 
  onHomeClick 
}) => {
  const { setCurrentView, user, isTrustee } = useAppContext();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleHomeClick = () => {
    setCurrentView('home');
    navigate('/');
    setOpen(false);
  };

  const handleDashboardClick = () => {
    setCurrentView('dashboard');
    navigate('/dashboard');
    setOpen(false);
  };

  const handleSearchClick = () => {
    setCurrentView('search');
    if (currentView === 'dashboard') {
      navigate('/');
      setTimeout(() => onViewChange('search'), 100);
    } else {
      onViewChange('search');
    }
    setOpen(false);
  };

  const handleKnowledgeBaseClick = () => {
    setCurrentView('knowledge-base');
    navigate('/knowledge-base');
    setOpen(false);
  };

  const handleRecordClick = () => {
    if (user) {
      setCurrentView('upload');
      if (currentView === 'dashboard') {
        navigate('/');
        setTimeout(() => onViewChange('upload'), 100);
      } else {
        onViewChange('upload');
      }
    } else {
      navigate('/login');
    }
    setOpen(false);
  };

  const handleTrusteeUploadClick = () => {
    setCurrentView('trustee-upload');
    if (currentView === 'dashboard') {
      navigate('/');
      setTimeout(() => onViewChange('trustee-upload'), 100);
    } else {
      onViewChange('trustee-upload');
    }
    setOpen(false);
  };

  const handleTrusteeDashboardClick = () => {
    setCurrentView('trustee-dashboard');
    if (currentView === 'dashboard') {
      navigate('/');
      setTimeout(() => onViewChange('trustee-dashboard'), 100);
    } else {
      onViewChange('trustee-dashboard');
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#0C0D11] border-l border-[rgba(200,150,60,0.12)]">
        <nav className="flex flex-col gap-4 mt-8">
          {!user && (
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={handleHomeClick}
              className="justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          )}
          
          <Button
            variant={currentView === 'search' ? 'default' : 'ghost'}
            onClick={handleSearchClick}
            className="justify-start"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Archive
          </Button>
          
          <Button
            variant={currentView === 'knowledge-base' ? 'default' : 'ghost'}
            onClick={handleKnowledgeBaseClick}
            className="justify-start"
          >
            <Book className="mr-2 h-4 w-4" />
            Knowledge Base
          </Button>
          
          {user && (
            <>
              {!isTrustee && (
                <>
                  <Button
                    variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                    onClick={handleDashboardClick}
                    className="justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={currentView === 'upload' ? 'default' : 'ghost'}
                    onClick={handleRecordClick}
                    className="justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Record Document
                  </Button>
                </>
              )}
              {isTrustee && (
                <>
                  <Button
                    variant={currentView === 'trustee-upload' ? 'default' : 'ghost'}
                    onClick={handleTrusteeUploadClick}
                    className="justify-start"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Trustee Upload
                  </Button>
                  <Button
                    variant={currentView === 'trustee-dashboard' ? 'default' : 'ghost'}
                    onClick={handleTrusteeDashboardClick}
                    className="justify-start"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Trustee Dashboard
                  </Button>
                </>
              )}
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;