import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { uploadDocument } from '@/utils/supabaseUtils';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import RecordCertificate from './RecordCertificate';

interface UploadFormProps {
  onUploadComplete: (document: any) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadComplete }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [userNameLoaded, setUserNameLoaded] = useState(false);

  const loadUserName = useCallback(async () => {
    if (user && !userNameLoaded) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, display_name')
          .eq('user_id', user.id)
          .single();
        
        const userName = profile?.full_name || profile?.display_name || user.email || '';
        setSubmitterName(userName);
        setUserNameLoaded(true);
      } catch (error) {
        console.log('No profile found, using email');
        setSubmitterName(user.email || '');
        setUserNameLoaded(true);
      }
    }
  }, [user, userNameLoaded]);

  useEffect(() => {
    loadUserName();
  }, [loadUserName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({ title: 'Error', description: 'Only PDF files are allowed', variant: 'destructive' });
        return;
      }
      setFile(selectedFile);
      // Auto-populate title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploading) {
      console.log('Upload already in progress, ignoring submit');
      return;
    }
    
    if (!file || !title.trim() || !submitterName.trim()) {
      toast({ title: 'Error', description: 'Please provide a title, submitter name, and select a PDF file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    
    try {
      console.log('Starting upload process...');
      console.log('File object:', file);
      console.log('File details:', { name: file?.name, size: file?.size, type: file?.type });
      
      const result = await uploadDocument({
        file,
        title: title.trim(),
        submitterName: submitterName.trim(),
        isTrusteeUpload: false
      });
      
      console.log('Upload result:', result);
      
      if (result.success && result.document) {
        setUploadedDocument(result.document);
        setShowCertificate(true);
        
        // Call the callback to refresh the parent component
        onUploadComplete(result.document);
        
        toast({ title: 'Success', description: 'Document recorded successfully!' });
        
        // Reset form
        setTitle('');
        setFile(null);
        const form = e.target as HTMLFormElement;
        form.reset();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to upload document', 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Record New Document</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-[#8A8070]">Document Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
              className="w-full bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
              disabled={uploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submitter" className="text-sm font-medium text-[#8A8070]">Submitter Name *</Label>
            <Input
              id="submitter"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
              disabled={uploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium text-[#8A8070]">PDF Document *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
              className="w-full bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6]"
              disabled={uploading}
            />
          </div>
          <Button
            type="submit"
            disabled={uploading}
            className="w-full mt-6 bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Recording...' : 'Record Document'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;