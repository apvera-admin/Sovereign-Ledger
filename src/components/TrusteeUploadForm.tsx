import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, User, Mail, StickyNote, Folder } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { uploadDocument } from '@/utils/supabaseUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import RecordCertificate from './RecordCertificate';

interface TrusteeUploadFormProps {
  onUploadComplete?: (document: any) => void;
  selectedFolderId?: string;
}

interface ClientFolder {
  id: string;
  name: string;
}

export const TrusteeUploadForm: React.FC<TrusteeUploadFormProps> = ({ 
  onUploadComplete,
  selectedFolderId 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [folderId, setFolderId] = useState(selectedFolderId || '');
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [foldersLoaded, setFoldersLoaded] = useState(false);
  const { user, userProfile } = useAppContext();
  const { toast } = useToast();

  const fetchFolders = useCallback(async () => {
    if (!user || foldersLoaded) return;
    
    try {
      const { data, error } = await supabase
        .from('client_folders')
        .select('id, name')
        .eq('trustee_id', user.id)
        .order('name');

      if (error) throw error;
      setFolders(data || []);
      setFoldersLoaded(true);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFoldersLoaded(true);
    }
  }, [user, foldersLoaded]);

  React.useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!documentTitle) {
        setDocumentTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isUploading) {
      console.log('Upload already in progress, ignoring submit');
      return;
    }
    
    if (!file || !clientName || !documentTitle || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Starting trustee upload process...');
      const result = await uploadDocument({
        file,
        title: documentTitle,
        clientName,
        clientEmail: clientEmail || undefined,
        privateNote: privateNote || undefined,
        isTrusteeUpload: true,
        trusteeId: user.id,
        trusteeName: userProfile?.display_name || userProfile?.full_name || user.email || 'Unknown Trustee',
        folderId: folderId || undefined
      });

      console.log('Trustee upload result:', result);

      if (result.success && result.document) {
        toast({
          title: 'Document uploaded successfully',
          description: `Document recorded on behalf of ${clientName}`,
        });
        
        setUploadedDocument(result.document);
        setShowCertificate(true);
        
        // Reset form
        setFile(null);
        setClientName('');
        setClientEmail('');
        setDocumentTitle('');
        setPrivateNote('');
        setFolderId(selectedFolderId || '');
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        if (onUploadComplete) {
          onUploadComplete(result.document);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackFromCertificate = () => {
    setShowCertificate(false);
    setUploadedDocument(null);
  };

  if (showCertificate && uploadedDocument) {
    return (
      <RecordCertificate 
        document={uploadedDocument} 
        onBack={handleBackFromCertificate} 
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#131520] border border-[rgba(200,150,60,0.22)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Trustee Document Upload
        </CardTitle>
        <CardDescription>
          Upload documents on behalf of clients as a trusted agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client-name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Client's Full Legal Name *
            </Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client's full legal name"
              required
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Client's Email (Optional)
            </Label>
            <Input
              id="client-email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-select" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Client Folder (Optional)
            </Label>
            <Select value={folderId} onValueChange={setFolderId} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder or leave blank" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-title">
              Document Title *
            </Label>
            <Input
              id="document-title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter document title"
              required
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="private-note" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Private Note (Trustee Only)
            </Label>
            <Textarea
              id="private-note"
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              placeholder="Add a private note (only visible to you)"
              rows={3}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">
              Select Document *
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              required
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!file || !clientName || !documentTitle || isUploading}
            className="w-full bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Recording Document...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Record Document for Client
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrusteeUploadForm;