import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Homepage from './Homepage';
import UploadForm from './UploadForm';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import RecordCertificate from './RecordCertificate';
import ProfilePage from './ProfilePage';
import TrusteeUploadForm from './TrusteeUploadForm';
import TrusteeDashboard from './TrusteeDashboard';
import { DocumentRecord } from '@/types/document';
import { useAppContext } from '@/contexts/AppContext';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { currentView, setCurrentView, user, isTrustee } = useAppContext();
  const [searchResults, setSearchResults] = useState<DocumentRecord[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const navigate = useNavigate();

  const handleUploadComplete = (document: DocumentRecord) => {
    setSelectedDocument(document);
    setCurrentView('certificate');
  };

  const handleSearchResults = (results: DocumentRecord[]) => {
    setSearchResults(results);
  };

  const handleViewCertificate = (document: DocumentRecord) => {
    setSelectedDocument(document);
    setCurrentView('certificate');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedDocument(null);
  };

  const handleViewChange = (view: 'upload' | 'search' | 'home' | 'dashboard' | 'trustee-upload' | 'trustee-dashboard' | 'knowledge-base') => {
    setCurrentView(view);
    setSearchResults([]);
    setSelectedDocument(null);
    
    if (view === 'home') {
      window.location.href = '/';
    } else if (view === 'dashboard') {
      navigate('/dashboard');
    } else if (view === 'knowledge-base') {
      navigate('/knowledge-base');
    }
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setSearchResults([]);
    setSelectedDocument(null);
    window.location.href = '/';
  };

  const handleRecordClick = () => {
    if (user) {
      setCurrentView('upload');
    } else {
      navigate('/login');
    }
  };

  const handleSearchClick = () => {
    setCurrentView('search');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    navigate('/dashboard');
  };

  // If children are provided, render them (for dashboard and other pages)
  if (children) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          onHomeClick={handleHomeClick}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  if (currentView === 'home') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          onHomeClick={handleHomeClick}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
        <main className="flex-1">
          <Homepage onRecordClick={handleRecordClick} onSearchClick={handleSearchClick} />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentView === 'profile' && user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          onHomeClick={handleHomeClick}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
        <main className="flex-1">
          <ProfilePage 
            userEmail={user.email || ''} 
            onBack={handleBackToDashboard}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0D11] flex flex-col">
      <Header 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        onHomeClick={handleHomeClick}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      
      <main className="container mx-auto px-4 py-4 sm:py-8 flex-1">
        {currentView === 'upload' && (
          <UploadForm onUploadComplete={handleUploadComplete} />
        )}
        
        {currentView === 'trustee-upload' && isTrustee && (
          <TrusteeUploadForm />
        )}
        
        {currentView === 'trustee-dashboard' && isTrustee && (
          <TrusteeDashboard />
        )}
        
        {currentView === 'search' && (
          <div className="space-y-6">
            <SearchForm onSearchResults={handleSearchResults} />
            <SearchResults results={searchResults} onViewCertificate={handleViewCertificate} />
          </div>
        )}
        
        {currentView === 'certificate' && selectedDocument && (
          <RecordCertificate document={selectedDocument} onBack={handleBackToSearch} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AppLayout;
export { AppLayout };