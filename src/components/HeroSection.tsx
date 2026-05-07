import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search } from 'lucide-react';

interface HeroSectionProps {
  onRecordClick: () => void;
  onSearchClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onRecordClick, onSearchClick }) => {
  return (
    <section
      className="bg-[#0C0D11] text-[#F0EAD6] py-16 sm:py-24"
      style={{backgroundImage: 'radial-gradient(rgba(200,150,60,0.055) 1px, transparent 1px)', backgroundSize: '28px 28px'}}
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight text-[#F0EAD6]">
          Record Lawful Notices & Private Documents with Confidence
        </h1>
        <p className="text-xl sm:text-2xl mb-8 text-[#D4C9B0] max-w-4xl mx-auto">
          Sovereign Ledger is a public notice and document recording platform built for free people, by free people.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRecordClick}
            size="lg"
            className="bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] px-8 py-3 text-lg font-bold"
          >
            <FileText className="mr-2 h-5 w-5" />
            Record Document
          </Button>
          <Button
            onClick={onSearchClick}
            variant="outline"
            size="lg"
            className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)] px-8 py-3 text-lg font-semibold"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Archive
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;