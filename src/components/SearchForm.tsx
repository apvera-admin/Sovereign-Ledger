import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { searchDocuments } from '@/utils/supabaseUtils';
import { toast } from '@/components/ui/use-toast';

interface SearchFormProps {
  onSearchResults: (documents: any[]) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearchResults }) => {
  const [recordNumber, setRecordNumber] = useState('');
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordNumber.trim() && !title.trim() && !name.trim()) {
      toast({ title: 'Error', description: 'Please enter at least one search term', variant: 'destructive' });
      return;
    }

    setSearching(true);
    try {
      console.log('Starting search with params:', { recordNumber, title, name });
      const documents = await searchDocuments({
        recordNumber: recordNumber.trim() || undefined,
        title: title.trim() || undefined,
        name: name.trim() || undefined
      });
      console.log('Search returned:', documents.length, 'documents');
      onSearchResults(documents);
      
      if (documents.length === 0) {
        toast({ title: 'No Results', description: 'No documents found matching your criteria' });
      } else {
        toast({ title: 'Success', description: `Found ${documents.length} document(s)` });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Search failed. Please try again.', 
        variant: 'destructive' 
      });
      onSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#131520] border border-[rgba(200,150,60,0.22)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Search Documents</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recordNumber" className="text-sm font-medium">Record Number</Label>
            <Input
              id="recordNumber"
              value={recordNumber}
              onChange={(e) => setRecordNumber(e.target.value)}
              placeholder="e.g., SR-20250625-0001"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="searchTitle" className="text-sm font-medium">Document Title</Label>
            <Input
              id="searchTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Search by title"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="searchName" className="text-sm font-medium">Submitter Name</Label>
            <Input
              id="searchName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name"
              className="w-full"
            />
          </div>
          
          <Button type="submit" disabled={searching} className="w-full mt-6 bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold">
            <Search className="h-4 w-4 mr-2" />
            {searching ? 'Searching...' : 'Search Documents'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;