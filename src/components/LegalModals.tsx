import { motion } from 'motion/react';
import { X, Shield, FileText, Scale } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'legal';
  onClose: () => void;
}

export const LegalModal = ({ type, onClose }: LegalModalProps) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield className="text-blue-600" />,
      body: (
        <div className="space-y-4">
          <p><strong>1. Data Collection:</strong> D.WONDER Magazine Editor processes your photos locally in your browser. We do not upload or store your personal images on our servers.</p>
          <p><strong>2. Payments:</strong> Payments are processed securely via Stripe. We do not store your credit card information.</p>
          <p><strong>3. Analytics:</strong> We may use essential cookies to manage your payment session and app preferences.</p>
          <p><strong>4. Your Rights:</strong> As an EU resident, you have the right to access, rectify, or erase your personal data under GDPR.</p>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="text-purple-600" />,
      body: (
        <div className="space-y-4">
          <p><strong>1. License:</strong> Upon payment of $2.99, you are granted a non-exclusive, worldwide license to use the exported cover for personal and commercial purposes.</p>
          <p><strong>2. Digital Content:</strong> By purchasing, you acknowledge that the service is performed immediately and you waive your right of withdrawal.</p>
          <p><strong>3. Restrictions:</strong> You may not use the tool to generate offensive, illegal, or infringing content.</p>
        </div>
      )
    },
    legal: {
      title: 'Legal Notice (Impressum)',
      icon: <Scale className="text-neutral-600" />,
      body: (
        <div className="space-y-4 text-xs">
          <p className="font-bold">Angaben gemäß § 5 TMG:</p>
          <div className="space-y-1">
            <p><strong>Liudmyla Elle Podolska</strong></p>
            <p>Einzelunternehmerin</p>
            <p className="text-neutral-500 italic">Design, Redactor in magazine & Creative</p>
          </div>
          <div className="space-y-1">
            <p><strong>Address:</strong></p>
            <p>Gartenweg 2</p>
            <p>16515 Oranienburg</p>
            <p>Deutschland</p>
          </div>
          <div className="space-y-1">
            <p><strong>Contact:</strong></p>
            <p>Email: legal@dwonder.magazine</p>
            <p>Profile: <a href="https://linktr.ee/3dfashionelle?utm_source=linktree_profile_share&ltsid=8dd21ad4-278e-4202-acd4-ce799b5a4af5" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">@3dfashionelle</a></p>
          </div>
        </div>
      )
    }
  };

  const active = content[type];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white text-black w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-neutral-50 rounded-2xl">
              {active.icon}
            </div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{active.title}</h2>
          </div>

          <div className="prose prose-sm font-sans text-neutral-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-2">
            {active.body}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
