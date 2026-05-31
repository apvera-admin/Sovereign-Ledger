import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, HelpCircle } from 'lucide-react';
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
  const [isPublic, setIsPublic] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

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
      console.log('isPublic state:', isPublic);
      
      const result = await uploadDocument({
        file,
        title: title.trim(),
        submitterName: submitterName.trim(),
        isTrusteeUpload: false,
        isPublic: isPublic
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

          <div className="space-y-3">
            <Label className="text-sm font-medium">Record Visibility:</Label>
            <RadioGroup
              value={isPublic ? 'public' : 'private'}
              onValueChange={(value) => setIsPublic(value === 'public')}
              className="flex flex-col space-y-2"
              disabled={uploading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="font-normal cursor-pointer">Private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="font-normal cursor-pointer">Public</Label>
              </div>
            </RadioGroup>
            
            <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
              <DialogTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center text-sm text-amber-600 hover:text-amber-700 hover:underline"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Public vs Private — What's the Difference?
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-amber-900">
                    What is the difference between Private and Public records?
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-6 text-sm">
                    <section>
                      <h3 className="font-bold text-lg text-blue-700 mb-2">Private records</h3>
                      <p className="mb-2">Private records are visible only to you. The contents are not publicly accessible.</p>
                      <p className="mb-1">They are used to:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 text-slate-600">
                        <li>Establish proof of existence</li>
                        <li>Preserve priority and authorship</li>
                        <li>Maintain privacy and control</li>
                        <li>Allow selective disclosure later if needed</li>
                      </ul>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-lg text-green-700 mb-2">Public records</h3>
                      <p className="mb-2">Public records make limited information visible (such as title, date, and record ID) to establish notice. The full document itself may still remain private.</p>
                      <p className="mb-1">Public records are used to:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 text-slate-600">
                        <li>Provide public notice</li>
                        <li>Show that a document or action exists</li>
                        <li>Support lawful or administrative processes</li>
                      </ul>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">Why would I record a document if it's private?</h3>
                      <p className="mb-2">Because recording creates proof — even if no one else sees the document.</p>
                      <p className="mb-1">A private record:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 text-slate-600">
                        <li>Proves the document existed at a certain time</li>
                        <li>Proves you held or authored it</li>
                        <li>Allows you to disclose it later if required, without losing control upfront</li>
                      </ul>
                      <p className="mt-2 font-medium text-slate-700">Recording is about proof and priority, not publicity.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">What types of documents should usually be kept private?</h3>
                      <p className="mb-2">Documents that establish authority, structure, or internal administration are commonly kept private, including:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 text-slate-600">
                        <li>Status correction documents</li>
                        <li>Affidavits of fact</li>
                        <li>Revocation of Election (ROE)</li>
                        <li>Private trust instruments</li>
                        <li>Trust schedules or asset lists</li>
                        <li>Powers of attorney</li>
                        <li>Family or estate documents</li>
                        <li>Internal administrative records</li>
                      </ul>
                      <p className="mt-2 text-slate-600">These documents are typically not intended for public disclosure.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">What types of documents are commonly made public?</h3>
                      <p className="mb-2">Public records are usually limited to notices, not full documents. Examples include:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 text-slate-600">
                        <li>Notices of record</li>
                        <li>Certificates of recording</li>
                        <li>Declarations of existence</li>
                        <li>Administrative notices already served</li>
                        <li>Proof-of-record pages</li>
                      </ul>
                      <p className="mt-2 text-slate-600">Public records are meant to show that notice was given, not to disclose private details.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">Can I change a document from private to public later?</h3>
                      <p className="text-slate-600">Yes. You retain control. A document can remain private indefinitely or be made public later if and when disclosure is appropriate.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">Does Sovereign Ledger give legal or tax advice?</h3>
                      <p className="text-slate-600">No. Sovereign Ledger is a private, educational recording platform. It does not provide legal, tax, or financial advice. Users are responsible for their own documents and decisions.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">Is Sovereign Ledger a government registry?</h3>
                      <p className="text-slate-600">No. Sovereign Ledger is not a government registry, court system, or statutory filing office. It is a private platform designed to help users create proof of record and maintain documentation in the private domain.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">Can I delete a recorded document?</h3>
                      <p className="text-slate-600">You may delete access to your document from your dashboard. However, once a document is recorded, the timestamp and record ID may remain as proof that the record once existed.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">What information is visible on a public record?</h3>
                      <p className="mb-2">Public records typically display limited metadata such as:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 text-slate-600">
                        <li>Document title</li>
                        <li>Date recorded</li>
                        <li>Record ID</li>
                        <li>Status (Public or Private)</li>
                      </ul>
                      <p className="mt-2 text-slate-600">The full document contents are not automatically public unless you choose to make them so.</p>
                    </section>
                    
                    <section>
                      <h3 className="font-bold text-amber-800 mb-2">Who owns the documents I upload?</h3>
                      <p className="text-slate-600">You do. Sovereign Ledger does not claim ownership of any uploaded documents. You remain the sole owner and controller of your records.</p>
                    </section>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
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