import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleKnowledgeBaseClick = () => {
    navigate('/knowledge-base');
  };

  return (
    <footer className="bg-[#0C0D11] text-[#F0EAD6] py-12 border-t border-[rgba(200,150,60,0.1)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <img src="/Sovereign Ledger LOGO (400 x 100 px).svg" alt="Sovereign Ledger" className="h-20 w-auto mb-10" />
              <p className="text-[#B8B09A] text-sm">
                A public notice and document recording platform built for free people, by free people.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="text-[#B8B09A] text-sm space-y-2">
                <p>Email: support@asnconsulting.co</p>
                <button 
                  onClick={handleKnowledgeBaseClick}
                  className="block hover:text-[#C8963C] transition-colors cursor-pointer"
                >
                  Knowledge Base / FAQ
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="text-[#B8B09A] text-sm space-y-2">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
                <p>Disclaimer</p>
              </div>
            </div>
          </div>
          
          <Separator className="bg-[rgba(255,255,255,0.08)] mb-8" />
          
          <div className="text-center space-y-4">
            <p className="text-[#B8B09A] text-sm">
              © {new Date().getFullYear()} Sovereign Ledger. All rights reserved.
            </p>
            <div className="bg-[#131520] p-4 rounded-lg border border-[rgba(255,255,255,0.06)]">
              <p className="text-[#B8B09A] text-xs font-semibold mb-2">IMPORTANT DISCLAIMER</p>
              <p className="text-[#8A8070] text-xs leading-relaxed">
                Sovereign Ledger is not a statutory recordkeeping service and does not operate under any government jurisdiction. 
                This platform is provided for informational and recordkeeping purposes only. Users are responsible for ensuring 
                compliance with applicable laws in their jurisdiction. This service does not constitute legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
