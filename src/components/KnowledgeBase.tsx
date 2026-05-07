import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Book, FileText, Upload, Lock, CreditCard, AlertCircle } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const faqData: FAQ[] = [
  {
    id: '1',
    question: 'What is Sovereign Ledger?',
    answer: 'Sovereign Ledger is a public document recording platform that allows individuals to upload, timestamp, and record lawful documents for public visibility or private reference.',
    category: 'Recording & Documents',
    icon: <Book className="h-4 w-4" />
  },
  {
    id: '2',
    question: 'What types of documents can I record?',
    answer: 'You can record declarations, affidavits, notices, trusts, claims, and any documents you want to place into the public domain for lawful or evidentiary purposes.',
    category: 'Recording & Documents',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: '3',
    question: 'Are my documents legally binding once recorded?',
    answer: 'Recording a document does not make it legally binding on its own. However, it creates public notice and a verifiable timestamp, which can support lawful claims and procedures.',
    category: 'Recording & Documents',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: '4',
    question: 'Is this the same as recording at the County Recorder\'s Office?',
    answer: 'No. Sovereign Ledger is a private, online public notice system — not affiliated with any government agency. It is ideal for those operating in the private or who want a parallel public record.',
    category: 'Recording & Documents',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: '5',
    question: 'How do I upload and record a document?',
    answer: 'Simply log in, go to "Record a Document," upload your file (PDF or image), and confirm the title. Your document will be timestamped and made publicly accessible (or private, if you choose).',
    category: 'Uploading Process',
    icon: <Upload className="h-4 w-4" />
  },
  {
    id: '6',
    question: 'Can I edit or delete a document once recorded?',
    answer: 'You cannot edit an uploaded document, but you can delete it from your archive if necessary and re-upload a revised version. Each upload will generate a new timestamp and recording reference.',
    category: 'Uploading Process',
    icon: <Upload className="h-4 w-4" />
  },
  {
    id: '7',
    question: 'How do I prove my document was recorded?',
    answer: 'Each recorded document is timestamped and stored in the searchable public archive on Sovereign Ledger. You can reference it by title, recording number, or direct URL for proof of notice and publication.',
    category: 'Uploading Process',
    icon: <Upload className="h-4 w-4" />
  },
  {
    id: '8',
    question: 'Can I make my documents private?',
    answer: 'Yes. You can choose to make documents private and only accessible with a direct link or access code.',
    category: 'Privacy & Security',
    icon: <Lock className="h-4 w-4" />
  },
  {
    id: '9',
    question: 'Is my data secure?',
    answer: 'All uploads are stored securely in encrypted cloud storage. Public documents are indexed for viewing, while private ones are hidden unless access is granted.',
    category: 'Privacy & Security',
    icon: <Lock className="h-4 w-4" />
  },
  {
    id: '10',
    question: 'Will this service remain free?',
    answer: 'We may introduce premium options in the future for expanded features, storage, or priority services. Basic recording will always have a free tier.',
    category: 'Billing & Accounts',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: '11',
    question: 'Can I record documents on behalf of someone else?',
    answer: 'Yes. If you\'re a consultant or trusted party, you may request a business account with proxy upload capabilities.',
    category: 'Billing & Accounts',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: '12',
    question: 'Why isn\'t my document showing in My Documents?',
    answer: 'Try refreshing the page. If the issue persists, contact support@asnconsulting.co for assistance.',
    category: 'Troubleshooting',
    icon: <AlertCircle className="h-4 w-4" />
  },
  {
    id: '13',
    question: 'I didn\'t receive my email confirmation. What should I do?',
    answer: 'Check your spam folder. If it\'s not there, ensure you entered your email correctly or request a new confirmation from the login page.',
    category: 'Troubleshooting',
    icon: <AlertCircle className="h-4 w-4" />
  }
];

const KnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = Array.from(new Set(faqData.map(faq => faq.category)));
  
  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedFAQs = categories.reduce((acc, category) => {
    acc[category] = filteredFAQs.filter(faq => faq.category === category);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="bg-[#0C0D11] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#F0EAD6] mb-4">
              Knowledge Base
            </h1>
            <p className="text-lg text-[#8A8070] mb-6">
              Find answers to common questions about Sovereign Ledger
            </p>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A8070] h-4 w-4" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-[#111318] border-[rgba(200,150,60,0.18)] text-[#F0EAD6] focus:border-[rgba(200,150,60,0.5)]"
              />
            </div>
          </div>

          <div className="space-y-6">
            {categories.map(category => {
              const categoryFAQs = groupedFAQs[category];
              if (categoryFAQs.length === 0) return null;
              
              return (
                <Card key={category} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[#F0EAD6] flex items-center gap-2">
                      {categoryFAQs[0]?.icon}
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {categoryFAQs.map(faq => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="text-left text-[#D4C9B0] hover:text-[#C8963C]">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-[#8A8070] leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#8A8070] text-lg">
                No FAQs found matching your search.
              </p>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Card className="bg-[#131520] border-[rgba(200,150,60,0.22)]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[#F0EAD6] mb-2">
                  Still have questions?
                </h3>
                <p className="text-[#8A8070] mb-4">
                  Can't find what you're looking for? Contact our support team at{' '}
                  <a
                    href="mailto:support@asnconsulting.co"
                    className="text-[#C8963C] hover:text-[#D4A84A] font-medium underline"
                  >
                    support@asnconsulting.co
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;