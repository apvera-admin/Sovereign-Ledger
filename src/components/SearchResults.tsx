import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { getDocumentUrl } from '@/utils/supabaseUtils';
import { useAppContext } from '@/contexts/AppContext';

interface SearchResultsProps {
  results: any[];
  onViewCertificate: (document: any) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onViewCertificate }) => {
  const { user } = useAppContext();
  
  // Add null check for results
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h3 className="text-lg font-semibold mb-4">Search Results ({results.length})</h3>
      {results.map((doc) => {
        // Check if current user is the owner of the document
        const isOwner = user && doc.user_id === user.id;
        
        return (
          <Card key={doc.id} className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">{doc.title}</span>
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
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getDocumentUrl(doc.file_path), '_blank')}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  View PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewCertificate(doc)}
                  className="w-full sm:w-auto"
                >
                  View Certificate
                </Button>
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/document/${doc.record_number}`;
                        navigator.clipboard.writeText(shareUrl).catch(() => {
                          alert(`Share this link: ${shareUrl}`);
                        });
                      }}
                      className="w-full sm:w-auto"
                    >
                      Share
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

export default SearchResults;