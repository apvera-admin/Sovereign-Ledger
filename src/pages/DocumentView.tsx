import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, User, ArrowLeft, Globe, Lock } from 'lucide-react';
import { searchDocuments, getViewableDocumentUrl } from '@/utils/supabaseUtils';
import { useNavigate } from 'react-router-dom';

const DocumentView: React.FC = () => {
  const { recordNumber } = useParams<{ recordNumber: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (recordNumber) {
      loadDocument();
    }
  }, [recordNumber]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const documents = await searchDocuments({ recordNumber });
      
      if (documents && documents.length > 0) {
        setDocument(documents[0]);
      } else {
        setError('Document not found');
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0C0D11] p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center py-8">
              <p className="text-[#8A8070]">Loading document...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !document) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0C0D11] p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-[#8A8070] mx-auto mb-4" />
              <p className="text-[#8A8070] mb-4">{error || 'Document not found'}</p>
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0C0D11] p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 gap-2">
                  <FileText className="h-6 w-6" />
                  <span>{document.title}</span>
                  {document.is_public ? (
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
                <span className="text-sm font-mono bg-[#111318] text-[#C8963C] px-3 py-1 rounded border border-[rgba(200,150,60,0.2)]">
                  {document.record_number}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-[#8A8070]" />
                  <span className="text-sm">
                    Recorded: {new Date(document.upload_date).toLocaleDateString()}
                  </span>
                </div>
                {document.submitter_name && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#8A8070]" />
                    <span className="text-sm">Submitted by: {document.submitter_name}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => window.open(getViewableDocumentUrl(document.file_path), '_blank')}
                  className="w-full bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
                >
                  <Download className="h-4 w-4 mr-2" />
                  View Document PDF
                </Button>
                
                <div className="bg-[#111318] p-4 rounded-lg border border-[rgba(255,255,255,0.06)]">
                  <h3 className="font-semibold mb-2">Document Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Record Number:</strong> {document.record_number}</div>
                    <div><strong>Title:</strong> {document.title}</div>
                    <div><strong>Upload Date:</strong> {new Date(document.upload_date).toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong> 
                      {document.is_public ? (
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
                    {document.submitter_name && (
                      <div><strong>Submitter:</strong> {document.submitter_name}</div>
                    )}
                    {document.submitter_email && (
                      <div><strong>Email:</strong> {document.submitter_email}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocumentView;