import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Upload, Search, User, Book } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import UploadForm from '@/components/UploadForm';
import SearchForm from '@/components/SearchForm';
import DocumentList from '@/components/DocumentList';
import RecordCertificate from '@/components/RecordCertificate';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { setCurrentView, user, userProfile } = useAppContext();
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [myDocuments, setMyDocuments] = useState<any[]>([]);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const documentsLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    setCurrentView('dashboard');
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, [setCurrentView]);

  const loadMyDocuments = useCallback(async (force = false) => {
    if (!user || !mountedRef.current || loadingRef.current) {
      return;
    }

    if (documentsLoadedRef.current && !force) {
      return;
    }

    loadingRef.current = true;
    setLoadingDocuments(true);
    setError(null);

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Check your connection and try again.')), 12000)
      );

      const query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([query, timeout]) as Awaited<typeof query>;

      if (error) throw error;

      if (mountedRef.current) {
        setMyDocuments(data || []);
        documentsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to load documents. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setLoadingDocuments(false);
      }
      loadingRef.current = false;
    }
  }, [user]);

  // Only load documents when returning to main dashboard view
  useEffect(() => {
    if (user && !showUpload && !showSearch && !showCertificate) {
      loadMyDocuments();
    }
  }, [user, showUpload, showSearch, showCertificate, loadMyDocuments]);

  const handleViewProfile = () => {
    setCurrentView('profile');
    navigate('/profile');
  };

  const handleUpload = () => {
    setCurrentView('upload');
    setShowUpload(true);
    setShowSearch(false);
    setShowCertificate(false);
  };

  const handleSearch = () => {
    setCurrentView('search');
    setShowSearch(true);
    setShowUpload(false);
    setShowCertificate(false);
  };

  const handleKnowledgeBase = () => {
    setCurrentView('knowledge-base');
    navigate('/knowledge-base');
  };

  const handleUploadComplete = (document: any) => {
    setUploadedDocument(document);
    setShowUpload(false);
    setShowCertificate(true);
    documentsLoadedRef.current = false;
  };

  const handleSearchResults = (documents: any[]) => {
    setSearchResults(documents);
  };

  const handleViewCertificate = (document: any) => {
    setSelectedDocument(document);
    setShowCertificate(true);
  };

  const handleBackFromCertificate = () => {
    setShowCertificate(false);
    setSelectedDocument(null);
    setUploadedDocument(null);
    setCurrentView('dashboard');
    documentsLoadedRef.current = false;
    loadMyDocuments(true);
  };

  const handleDocumentDeleted = useCallback(() => {
    documentsLoadedRef.current = false;
    loadMyDocuments(true);
  }, [loadMyDocuments]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = userProfile?.full_name || userProfile?.display_name || user?.email || 'User';

  if (showCertificate && (uploadedDocument || selectedDocument)) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0C0D11] p-4">
          <div className="container mx-auto max-w-4xl">
            <RecordCertificate 
              document={uploadedDocument || selectedDocument} 
              onBack={handleBackFromCertificate} 
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showUpload) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0C0D11] p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUpload(false);
                  setCurrentView('dashboard');
                }}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <UploadForm onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showSearch) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0C0D11] p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSearch(false);
                  setCurrentView('dashboard');
                }}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <SearchForm onSearchResults={handleSearchResults} />
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Search Results ({searchResults.length})</h3>
                <DocumentList 
                  documents={searchResults} 
                  onViewCertificate={handleViewCertificate}
                  showOwnerActions={false}
                />
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0C0D11] p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#F0EAD6] mb-2">Dashboard</h1>
            <p className="text-[#8A8070]">Manage your recorded documents</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={userProfile?.profile_image_url} alt={displayName} />
                    <AvatarFallback className="bg-[#131520] text-[#C8963C] text-xl">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-2">{displayName}</h3>
                  <p className="text-sm text-[#8A8070] mb-4">{user?.email}</p>
                  <Button
                    variant="outline"
                    className="w-full border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                    onClick={handleViewProfile}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Record Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#8A8070] mb-4">Record a new document to the ledger</p>
                    <Button 
                      className="w-full bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
                      onClick={handleUpload}
                    >
                      Upload New Document
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#8A8070] mb-4">Search your recorded documents</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                      onClick={handleSearch}
                    >
                      Search My Documents
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      Knowledge Base
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#8A8070] mb-4">Find answers to common questions</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                      onClick={handleKnowledgeBase}
                    >
                      View FAQ
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Documents ({myDocuments.length})
                {loadingDocuments && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C8963C] ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button 
                    onClick={() => loadMyDocuments(true)}
                    className="bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
                  >
                    Try Again
                  </Button>
                </div>
              ) : loadingDocuments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8963C] mx-auto mb-4" />
                  <p className="text-[#8A8070]">Loading documents...</p>
                </div>
              ) : myDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-[#8A8070] mx-auto mb-4" />
                  <p className="text-[#8A8070] mb-4">No documents recorded yet</p>
                  <Button 
                    className="bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
                    onClick={handleUpload}
                  >
                    Record Your First Document
                  </Button>
                </div>
              ) : (
                <DocumentList 
                  documents={myDocuments} 
                  onViewCertificate={handleViewCertificate}
                  onDocumentDeleted={handleDocumentDeleted}
                  showOwnerActions={true}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;