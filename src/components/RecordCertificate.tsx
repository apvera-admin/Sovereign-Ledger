import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User, Hash, Printer, ArrowLeft, Globe, Lock } from 'lucide-react';

interface RecordCertificateProps {
  document: any;
  onBack: () => void;
}

const RecordCertificate: React.FC<RecordCertificateProps> = ({ document, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  // Extract document details with proper field mapping
  const documentTitle = document?.title || 'Untitled Document';
  const recordNumber = document?.recording_number || document?.record_number || `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const recordingDate = document?.created_at || document?.upload_date || new Date().toISOString();
  
  // Handle submitter name based on upload type
  let submitterName = 'Unknown';
  if (document?.is_trustee_upload || document?.trustee_id) {
    // For trustee uploads, show the client name with trustee attribution
    const clientName = document?.client_name || document?.submitter_name || 'Unknown Client';
    const trusteeName = document?.trustee_name || 'Unknown Trustee';
    submitterName = `${clientName} (via Trustee: ${trusteeName})`;
  } else {
    // For regular uploads, show the submitter name
    submitterName = document?.submitter_name || 'Unknown';
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F0EAD6]">Record Certificate</h2>
        <div className="flex space-x-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Card className="print-certificate bg-[#131520] border border-[rgba(200,150,60,0.3)] overflow-hidden">
        <div className="h-1 bg-[#C8963C]" />
        <CardHeader className="text-center bg-[#0C0D11] p-4 sm:p-6 border-b border-[rgba(200,150,60,0.15)]">
          <CardTitle className="text-xl sm:text-3xl font-serif font-bold text-[#F0EAD6]">
            SOVEREIGN RECORD ARCHIVE
          </CardTitle>
          <p className="text-sm sm:text-lg text-[#8A8070] mt-2">Official Record Certificate</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm sm:text-lg mb-2 text-[#D4C9B0]">This certifies that the following document has been officially recorded:</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#C8963C] mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#D4C9B0] text-sm sm:text-base">Document Title:</p>
                <p className="text-base sm:text-lg text-[#F0EAD6] break-words">{documentTitle}</p>
              </div>
            </div>

            <Separator className="bg-[rgba(200,150,60,0.15)]" />

            <div className="flex items-start space-x-3">
              <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-[#C8963C] mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#D4C9B0] text-sm sm:text-base">Record Number:</p>
                <p className="text-sm sm:text-lg font-mono text-[#C8963C] bg-[#111318] px-2 sm:px-3 py-1 rounded inline-block break-all border border-[rgba(200,150,60,0.2)]">
                  {recordNumber}
                </p>
              </div>
            </div>

            <Separator className="bg-[rgba(200,150,60,0.15)]" />

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#C8963C] mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#D4C9B0] text-sm sm:text-base">Date and Time of Recording:</p>
                <p className="text-base sm:text-lg text-[#F0EAD6]">
                  {new Date(recordingDate).toLocaleString()}
                </p>
              </div>
            </div>

            <Separator className="bg-[rgba(200,150,60,0.15)]" />

            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#C8963C] mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#D4C9B0] text-sm sm:text-base">Submitted By:</p>
                <p className="text-base sm:text-lg text-[#F0EAD6] break-words">{submitterName}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start space-x-3">
              {document?.is_public ? (
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mt-1 flex-shrink-0" />
              ) : (
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-1 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-700 text-sm sm:text-base">Record Status:</p>
                {document?.is_public ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-sm">
                    <Globe className="h-3 w-3 mr-1" />
                    Public Record
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-sm">
                    <Lock className="h-3 w-3 mr-1" />
                    Private Record
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[rgba(200,150,60,0.15)]">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-[#8A8070] mb-2">
                This document has been permanently recorded in the Sovereign Record Archive
              </p>
              <p className="text-xs text-[#8A8070]">
                Certificate generated on {new Date().toLocaleString()}
              </p>
              <div className="mt-4 font-mono text-[#8A8070]" style={{fontSize: '9px'}}>
                RECORDED STAMP: {recordNumber} - {new Date(recordingDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordCertificate;