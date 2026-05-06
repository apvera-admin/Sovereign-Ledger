import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, FileText, Hash, Search } from 'lucide-react';

const SearchArchiveSection: React.FC = () => {
  const searchTypes = [
    {
      icon: User,
      title: "Name",
      description: "Search by the name entered during recording"
    },
    {
      icon: FileText,
      title: "Document Title",
      description: "Find documents by their title or subject"
    },
    {
      icon: Hash,
      title: "Recording Number",
      description: "Look up specific documents by their unique ID"
    }
  ];

  return (
    <section className="py-16 bg-[#131520]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Search className="h-16 w-16 text-[#C8963C] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F0EAD6] mb-6">
              Search the Archive
            </h2>
            <p className="text-lg text-[#B8B09A] mb-8">
              All public records are searchable by:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {searchTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <Card key={index} className="bg-[#111318] border-[rgba(255,255,255,0.06)] hover:border-[rgba(200,150,60,0.2)] transition-colors">
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
                    <h3 className="font-semibold text-[#F0EAD6] mb-2">{type.title}</h3>
                    <p className="text-[#8A8070] text-sm">{type.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-lg text-[#B8B09A]">
              This creates a transparent and tamper-evident alternative to traditional public records—without the bureaucracy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchArchiveSection;