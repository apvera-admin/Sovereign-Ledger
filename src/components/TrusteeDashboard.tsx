import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Upload } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import TrusteeProfile from './TrusteeProfile';
import RecordCertificate from './RecordCertificate';
import DocumentList from './DocumentList';
import ClientFolderManager from './ClientFolderManager';
import TrusteeUploadForm from './TrusteeUploadForm';

interface TrusteeDocument {
  id: string;
  title: string;
  client_name: string;
  client_email?: string;
  private_note?: string;
  created_at: string;
  record_number: string;
  recording_number?: string;
  file_path: string;
  upload_date: string;
  submitter_name: string;
  trustee_name?: string;
  is_trustee_upload?: boolean;
  folder_id?: string;
}

export const TrusteeDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<TrusteeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const { user, userProfile } = useAppContext();
  const { toast } = useToast();
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchTrusteeDocuments = useCallback(async () => {
    if (!user || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('trustee_id', user.id);
      
      if (selectedFolderId) {
        query = query.eq('folder_id', selectedFolderId);
      } else {
        query = query.is('folder_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      if (mountedRef.current) {
        const transformedData = (data || []).map(doc => ({
          ...doc,
          upload_date: doc.created_at,
          submitter_name: doc.client_name || 'Unknown Client',
          record_number: doc.record_number || doc.recording_number || `REC-${doc.id.slice(0, 8)}`,
          recording_number: doc.record_number || doc.recording_number || `REC-${doc.id.slice(0, 8)}`,
          is_trustee_upload: true,
          trustee_name: userProfile?.display_name || userProfile?.full_name || 'Unknown Trustee'
        }));
        
        setDocuments(transformedData);
      }
    } catch (error) {
      console.error('Error fetching trustee documents:', error);
      if (mountedRef.current) {
        toast({
          title: 'Error loading documents',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [user, selectedFolderId, userProfile, toast]);

  useEffect(() => {
    mountedRef.current = true;
    if (user && !showProfile && !showCertificate && !showUpload) {
      fetchTrusteeDocuments();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [user, selectedFolderId, showProfile, showCertificate, showUpload, fetchTrusteeDocuments]);

  const handleViewCertificate = (document: any) => {
    setSelectedDocument(document);
    setShowCertificate(true);
  };

  const handleBackFromCertificate = () => {
    setShowCertificate(false);
    setSelectedDocument(null);
  };

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    // Only refresh if we're back to dashboard view
    if (!showProfile && !showCertificate) {
      fetchTrusteeDocuments();
    }
  };

  const handleDocumentMoved = useCallback(() => {
    // Only refresh if we're in dashboard view
    if (!showProfile && !showCertificate && !showUpload) {
      setTimeout(() => {
        fetchTrusteeDocuments();
      }, 100);
    }
  }, [fetchTrusteeDocuments, showProfile, showCertificate, showUpload]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8963C]" />
      </div>
    );
  }

  if (showProfile) {
    return <TrusteeProfile onBack={() => setShowProfile(false)} />;
  }

  if (showCertificate && selectedDocument) {
    return (
      <RecordCertificate 
        document={selectedDocument} 
        onBack={handleBackFromCertificate} 
      />
    );
  }

  if (showUpload) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upload Document</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowUpload(false)}
            className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
          >
            Back to Dashboard
          </Button>
        </div>
        <TrusteeUploadForm 
          selectedFolderId={selectedFolderId}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trustee Dashboard</h2>
          <p className="text-muted-foreground">Manage documents recorded on behalf of clients</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowProfile(true)}
            className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ClientFolderManager 
            onFolderSelect={handleFolderSelect}
            selectedFolderId={selectedFolderId}
          />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedFolderName ? `${selectedFolderName} Documents` : 'All Documents'} ({documents.length})
              </CardTitle>
              <CardDescription>
                {selectedFolderName 
                  ? `Documents in ${selectedFolderName} folder`
                  : 'All documents not in folders'
                }
              </CardDescription>
              {selectedFolderId && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedFolderId('');
                    setSelectedFolderName('');
                  }}
                  className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                >
                  Show All Documents
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <DocumentList 
                documents={documents}
                onViewCertificate={handleViewCertificate}
                onDocumentDeleted={handleDocumentMoved}
                showFolderActions={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrusteeDashboard;