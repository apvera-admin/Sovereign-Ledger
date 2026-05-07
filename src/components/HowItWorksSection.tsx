import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Hash, Archive, Download } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload a PDF document",
      description: "Select and upload your legal document in PDF format"
    },
    {
      icon: Hash,
      title: "We timestamp it and assign a unique Recording Number",
      description: "Your document receives an official timestamp and unique identifier"
    },
    {
      icon: Archive,
      title: "Your document is stored and published to the public archive",
      description: "Document becomes part of the permanent public record"
    },
    {
      icon: Download,
      title: "You receive a downloadable Record Certificate",
      description: "Get proof of recording with date, time, and record ID"
    }
  ];

  return (
    <section className="py-16 bg-[#111318]">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F0EAD6] mb-12 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="bg-[#131520] border-[rgba(255,255,255,0.06)] hover:border-[rgba(200,150,60,0.2)] transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="bg-[rgba(200,150,60,0.1)] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-[#C8963C]" />
                    </div>
                    <div className="bg-[#C8963C] text-[#0C0D11] rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-[#F0EAD6] mb-2">{step.title}</h3>
                    <p className="text-[#8A8070] text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;