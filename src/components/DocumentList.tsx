import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, User, Trash2, Share2, FolderOpen, Lock, Globe } from 'lucide-react';
import { getViewableDocumentUrl } from '@/utils/supabaseUtils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

interface DocumentListProps {
  documents: any[];
  onViewCertificate?: (document: any) => void;
  onDocumentDeleted?: () => void;
  onMoveToFolder?: (documentId: string, folderId: string) => void;
  showFolderActions?: boolean;
  showOwnerActions?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onViewCertificate,
  onDocumentDeleted,
  onMoveToFolder,
  showFolderActions = false,
  showOwnerActions = true
}) => {
  const { toast } = useToast();
  const { user } = useAppContext();
  const [folders, setFolders] = useState<any[]>([]);
  const [movingDocument, setMovingDocument] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);
  const [updatingVisibilityDocument, setUpdatingVisibilityDocument] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const operationInProgressRef = useRef<Set<string>>(new Set());

  const loadFolders = useCallback(async () => {
    if (!user || !mountedRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('client_folders')
        .select('*')
        .eq('trustee_id', user.id)
        .order('name');

      if (error) throw error;
      if (mountedRef.current) {
        setFolders(data || []);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    if (showFolderActions && user) {
      loadFolders();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [showFolderActions, user, loadFolders]);

  const handleDelete = async (docId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    if (operationInProgressRef.current.has(docId)) {
      return;
    }

    operationInProgressRef.current.add(docId);
    setDeletingDocument(docId);

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      if (mountedRef.current) {
        toast({
          title: 'Document deleted',
          description: 'The document has been successfully deleted.',
        });

        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      if (mountedRef.current) {
        toast({
          title: 'Error',
          description: 'Failed to delete the document.',
          variant: 'destructive',
        });
      }
    } finally {
      operationInProgressRef.current.delete(docId);
      setDeletingDocument(null);
    }
  };

  const handleShare = async (doc: any) => {
    const shareUrl = `${window.location.origin}/document/${doc.record_number}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied',
        description: 'Shareable link has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Share link',
        description: shareUrl,
      });
    }
  };

  const handleFolderChange = async (documentId: string, folderId: string) => {
    if (operationInProgressRef.current.has(documentId)) return;
    
    const actualFolderId = folderId === 'no-folder' ? null : folderId;
    operationInProgressRef.current.add(documentId);
    setMovingDocument(documentId);
    
    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({ folder_id: actualFolderId })
        .eq('id', documentId);

      if (updateError) throw updateError;

      if (mountedRef.current) {
        toast({
          title: 'Document moved',
          description: actualFolderId ? 'Document moved to folder successfully.' : 'Document removed from folder.',
        });

        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
      }
      
    } catch (error) {
      console.error('Error moving document:', error);
      if (mountedRef.current) {
        toast({
          title: 'Error',
          description: 'Failed to move document.',
          variant: 'destructive',
        });
      }
    } finally {
      operationInProgressRef.current.delete(documentId);
      setMovingDocument(null);
    }
  };

  const handleVisibilityToggle = async (documentId: string, currentlyPublic: boolean) => {
    if (operationInProgressRef.current.has(documentId)) return;

    operationInProgressRef.current.add(documentId);
    setUpdatingVisibilityDocument(documentId);

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({ is_public: !currentlyPublic })
        .eq('id', documentId);

      if (updateError) throw updateError;

      if (mountedRef.current) {
        toast({
          title: 'Visibility updated',
          description: !currentlyPublic
            ? 'Document is now public and searchable.'
            : 'Document is now private.',
        });

        if (onDocumentDeleted) {
          onDocumentDeleted();
        }
      }
    } catch (error) {
      console.error('Error updating document visibility:', error);
      if (mountedRef.current) {
        toast({
          title: 'Error',
          description: 'Failed to update document visibility.',
          variant: 'destructive',
        });
      }
    } finally {
      operationInProgressRef.current.delete(documentId);
      setUpdatingVisibilityDocument(null);
    }
  };

  const handleViewDocument = (doc: any) => {
    try {
      const url = getViewableDocumentUrl(doc.file_path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: 'Error',
        description: 'Failed to open document.',
        variant: 'destructive',
      });
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-[#8A8070] mx-auto mb-4" />
        <p className="text-[#8A8070]">No documents found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const isOwner = user && doc.user_id === user.id;
        const canPerformOwnerActions = showOwnerActions && isOwner;
        
        return (
          <Card key={doc.id} className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">{doc.title}</span>
                  {doc.is_public ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-mono bg-[#111318] text-[#C8963C] px-2 py-1 rounded self-start border border-[rgba(200,150,60,0.2)]">
                  {doc.record_number}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-[#8A8070] flex-shrink-0" />
                  <span className="text-sm">
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </span>
                </div>
                {doc.submitter_name && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#8A8070] flex-shrink-0" />
                    <span className="text-sm truncate">{doc.submitter_name}</span>
                  </div>
                )}
              </div>
              
              {showFolderActions && canPerformOwnerActions && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-[#8A8070]" />
                    <Select
                      value={doc.folder_id || 'no-folder'}
                      onValueChange={(value) => handleFolderChange(doc.id, value)}
                      disabled={movingDocument === doc.id}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-folder">No folder</SelectItem>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {movingDocument === doc.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C8963C]" />
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDocument(doc)}
                  className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Open PDF
                </Button>
                {onViewCertificate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewCertificate(doc)}
                    className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                  >
                    View Certificate
                  </Button>
                )}
                {canPerformOwnerActions && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVisibilityToggle(doc.id, Boolean(doc.is_public))}
                      disabled={updatingVisibilityDocument === doc.id}
                      className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                    >
                      {updatingVisibilityDocument === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2" />
                      ) : doc.is_public ? (
                        <Lock className="h-4 w-4 mr-2" />
                      ) : (
                        <Globe className="h-4 w-4 mr-2" />
                      )}
                      {doc.is_public ? 'Make Private' : 'Make Public'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(doc)}
                      className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.file_path)}
                      disabled={deletingDocument === doc.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      {deletingDocument === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentList;
