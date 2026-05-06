import React from 'react';
import { Shield, Scale, FileCheck } from 'lucide-react';

const WhyItMattersSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#0C0D11] text-[#F0EAD6]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-[#C8963C] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-8 text-[#F0EAD6]">
            Why This Matters
          </h2>

          <div className="text-lg text-[#D4C9B0] space-y-6 mb-12">
            <p>
              We live in a world governed by assumption and presumption. What is not rebutted stands as truth.
              That's why creating a lawful paper trail in the public is critical.
            </p>
            <p>
              Sovereign Ledger helps you stand in your private capacity and assert your rights and intentions
              with clarity and permanence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Scale className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
              <h3 className="font-semibold text-[#F0EAD6] mb-2">Legal Standing</h3>
              <p className="text-[#B8B09A] text-sm">Establish your position with documented evidence</p>
            </div>
            <div className="text-center">
              <FileCheck className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
              <h3 className="font-semibold text-[#F0EAD6] mb-2">Public Notice</h3>
              <p className="text-[#B8B09A] text-sm">Create constructive notice in the public record</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-[#C8963C] mx-auto mb-4" />
              <h3 className="font-semibold text-[#F0EAD6] mb-2">Private Capacity</h3>
              <p className="text-[#B8B09A] text-sm">Assert your rights outside statutory jurisdictions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;