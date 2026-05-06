import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, Shield } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#111318]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F0EAD6] mb-8 text-center">
            What is Sovereign Ledger?
          </h2>
          <div className="text-lg text-[#B8B09A] space-y-6 mb-12">
            <p>
              Sovereign Ledger is a private, neutral recordkeeping system where individuals can publish lawful declarations, affidavits, contracts, and notices—outside of statutory jurisdictions.
            </p>
            <p>
              Each document is timestamped, assigned a unique record number, and stored in the public archive for transparency and evidence of constructive notice.
            </p>
          </div>

          <h3 className="text-2xl font-serif font-bold text-[#F0EAD6] mb-6">Use it to:</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-[#131520] border-[rgba(255,255,255,0.06)]">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
                <p className="text-[#B8B09A]">Record affidavits, trusts, declarations, and revocations</p>
              </CardContent>
            </Card>
            <Card className="bg-[#131520] border-[rgba(255,255,255,0.06)]">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
                <p className="text-[#B8B09A]">Give lawful notice to agencies, entities, or individuals</p>
              </CardContent>
            </Card>
            <Card className="bg-[#131520] border-[rgba(255,255,255,0.06)]">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
                <p className="text-[#B8B09A]">Maintain historical evidence of your claims, standing, or actions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;