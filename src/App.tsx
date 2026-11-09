/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Type, Palette, Camera, Download, Trash2, Shield, Info, Lock, CheckCircle2, Instagram, Printer } from 'lucide-react';
import { toPng } from 'html-to-image';
import { LegalModal } from './components/LegalModals';

interface CoverData {
  headline: string;
  subheader: string;
  issue: string;
  date: string;
  bgColor: string;
  textColor: string;
  image: string | null;
  filter: 'none' | 'grayscale' | 'contrast' | 'sepia';
  hasFrame: boolean;
  showBadge: boolean;
  accentColor: string;
  hasGrain: boolean;
  fontTheme: 'serif' | 'sans';
  headlineSize: number;
  logoSize: number;
}

export default function App() {
  const [data, setData] = useState<CoverData>({
    headline: 'THE NEW ERA',
    subheader: 'EXPLORING MINIMALISM',
    issue: 'ISSUE NO. 42',
    date: 'AUTUMN 2024',
    bgColor: '#f5f5f5',
    textColor: '#000000',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600',
    filter: 'none',
    hasFrame: false,
    showBadge: false,
    accentColor: '#dc2626', // red-600
    hasGrain: false,
    fontTheme: 'serif',
    headlineSize: 84,
    logoSize: 38,
  });

  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{amount: number, service: string}>({ amount: 2.99, service: 'Export Unlock' });
  const [isInstagramOrdered, setIsInstagramOrdered] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [paymentAgreed, setPaymentAgreed] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'legal' | null>(null);
  const [showInstagramSuccess, setShowInstagramSuccess] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('dwonder-cookie-consent');
    if (consent) setCookieConsent(true);
  }, []);

  const handleCookieConsent = () => {
    localStorage.setItem('dwonder-cookie-consent', 'true');
    setCookieConsent(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async () => {
    if (!isPaid) {
      setShowPaymentModal(true);
      return;
    }

    if (coverRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(coverRef.current, { 
        cacheBust: true,
        style: {
          transform: 'scale(1)',
        }
      });
      const link = document.createElement('a');
      link.download = `dwonder-magazine-${data.issue.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Call backend to create intent
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: paymentConfig.amount, 
          service: paymentConfig.service 
        })
      });
      const result = await response.json();
      console.log('Payment Intent:', result);
      
      // Simulate Stripe checkout delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (paymentConfig.service === 'Instagram Post') {
        setIsInstagramOrdered(true);
        setShowInstagramSuccess(true);
      } else {
        setIsPaid(true);
      }
      
      setIsProcessing(false);
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Payment failed', err);
      setIsProcessing(false);
    }
  };

  const openPaymentModal = (amount: number, service: string) => {
    setPaymentConfig({ amount, service });
    setShowPaymentModal(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#111] overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[320px] sidebar-bg border-r border-subtle p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-baseline gap-[1px] font-logo font-black text-3xl tracking-[-2px] text-white uppercase">
            D<div className="w-2 h-2 bg-red-600 rounded-full mb-1"></div>WONDER
          </div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-[2px] mt-1 font-bold">Studio Editor</div>
        </div>

        {/* Cover Settings */}
        <div className="space-y-6">
          <div className="space-y-3 pb-6 border-b border-subtle">
            <label className="text-[11px] font-bold uppercase tracking-wider text-label">Branding</label>
            <div className="space-y-2">
               <label className="text-[10px] text-neutral-500 uppercase font-bold text-label">Logo Size</label>
               <div className="flex gap-2">
                  {[28, 38, 48, 60, 80].map((size) => (
                    <button
                      key={size}
                      onClick={() => setData({ ...data, logoSize: size })}
                      className={`flex-1 py-1 px-1 rounded border text-[10px] font-bold transition-all ${data.logoSize === size ? 'bg-white text-black border-white' : 'border-subtle text-neutral-400 hover:border-neutral-500'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          <div className="space-y-3 pb-6 border-b border-subtle">
            <label className="text-[11px] font-bold uppercase tracking-wider text-label">Cover Image</label>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white text-black py-3 rounded-md font-bold text-[13px] hover:bg-neutral-200 transition-all cursor-pointer"
              >
                📸 Upload Photo
              </button>
              {data.image && (
                <button 
                  onClick={removeImage}
                  className="w-full bg-[#333] text-white py-3 rounded-md text-[13px] hover:bg-[#444] transition-all border border-[#444] cursor-pointer"
                >
                  ❌ Remove Photo
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="space-y-4 pb-6 border-b border-subtle">
            <label className="text-[11px] font-bold uppercase tracking-wider text-label">Typography</label>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold">Headline</label>
                <textarea
                  value={data.headline}
                  onChange={(e) => setData({ ...data, headline: e.target.value })}
                  className="w-full p-2.5 input-bg border border-subtle rounded text-white focus:outline-none focus:border-neutral-500 transition-all font-serif leading-tight outline-none"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold text-label">Headline Size</label>
                <div className="flex gap-2">
                  {[48, 64, 84, 100, 120].map((size) => (
                    <button
                      key={size}
                      onClick={() => setData({ ...data, headlineSize: size })}
                      className={`flex-1 py-1 px-1 rounded border text-[10px] font-bold transition-all ${data.headlineSize === size ? 'bg-white text-black border-white' : 'border-subtle text-neutral-400 hover:border-neutral-500'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold">Subline</label>
                <input
                  type="text"
                  value={data.subheader}
                  onChange={(e) => setData({ ...data, subheader: e.target.value })}
                  className="w-full p-2.5 input-bg border border-subtle rounded text-white focus:outline-none focus:border-neutral-500 transition-all text-xs tracking-widest uppercase font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-label">Details</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.issue}
                onChange={(e) => setData({ ...data, issue: e.target.value })}
                className="w-full p-2.5 input-bg border border-subtle rounded text-white text-[10px] uppercase font-bold tracking-wider outline-none"
                placeholder="Issue"
              />
              <input
                type="text"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full p-2.5 input-bg border border-subtle rounded text-white text-[10px] uppercase font-bold tracking-wider outline-none"
                placeholder="Date"
              />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[11px] font-bold uppercase tracking-wider text-label">Styling</label>
             
             {/* Background Color */}
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Background</span>
                  <input 
                    type="color" 
                    value={data.bgColor} 
                    onChange={(e) => setData({ ...data, bgColor: e.target.value })}
                    className="w-6 h-6 rounded border border-subtle cursor-pointer bg-transparent p-0 overflow-hidden"
                  />
                </div>
                <div className="flex gap-1.5">
                  {['#f5f5f5', '#000000', '#dc2626', '#eab308', '#2563eb', '#16a34a'].map(color => (
                    <button
                      key={color}
                      onClick={() => setData({ ...data, bgColor: color })}
                      className={`w-6 h-6 rounded-full border border-subtle transition-transform hover:scale-110 ${data.bgColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111]' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
             </div>

             {/* Text Color */}
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Text Color</span>
                  <input 
                    type="color" 
                    value={data.textColor} 
                    onChange={(e) => setData({ ...data, textColor: e.target.value })}
                    className="w-6 h-6 rounded border border-subtle cursor-pointer bg-transparent p-0 overflow-hidden"
                  />
                </div>
                <div className="flex gap-1.5">
                  {['#ffffff', '#000000', '#eab308', '#dc2626', '#38bdf8', '#fb7185'].map(color => (
                    <button
                      key={color}
                      onClick={() => setData({ ...data, textColor: color })}
                      className={`w-6 h-6 rounded-full border border-subtle transition-transform hover:scale-110 ${data.textColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111]' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
             </div>

             {/* Dot Color */}
             <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Accent Dot</span>
                <input 
                  type="color" 
                  value={data.accentColor} 
                  onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                  className="w-6 h-6 rounded border border-subtle cursor-pointer bg-transparent p-0 overflow-hidden"
                />
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[11px] font-bold uppercase tracking-wider text-label">Effects</label>
             <div className="grid grid-cols-2 gap-2">
               <select 
                value={data.filter} 
                onChange={(e) => setData({ ...data, filter: e.target.value as any })}
                className="w-full text-[10px] uppercase font-bold p-2.5 input-bg border border-subtle rounded text-white focus:outline-none"
               >
                 <option value="none">No Filter</option>
                 <option value="grayscale">Noir</option>
                 <option value="contrast">Hi-Cont</option>
                 <option value="sepia">Vintage</option>
               </select>
               <button 
                onClick={() => setData({ ...data, hasFrame: !data.hasFrame })}
                className={`text-[10px] uppercase font-bold py-2.5 px-3 rounded border transition-all ${data.hasFrame ? 'bg-white text-black border-white' : 'border-subtle text-neutral-400'}`}
               >
                 {data.hasFrame ? 'Frame ON' : 'Frame OFF'}
               </button>
               <button 
                onClick={() => setData({ ...data, showBadge: !data.showBadge })}
                className={`text-[10px] uppercase font-bold py-2.5 px-3 rounded border transition-all ${data.showBadge ? 'bg-white text-black border-white' : 'border-subtle text-neutral-400'}`}
               >
                 {data.showBadge ? 'Badge ON' : 'Badge OFF'}
               </button>
               <button 
                onClick={() => setData({ ...data, hasGrain: !data.hasGrain })}
                className={`text-[10px] uppercase font-bold py-2.5 px-3 rounded border transition-all ${data.hasGrain ? 'bg-white text-black border-white' : 'border-subtle text-neutral-400'}`}
               >
                 {data.hasGrain ? 'Grain ON' : 'Grain OFF'}
               </button>
               <button 
                onClick={() => setData({ ...data, fontTheme: data.fontTheme === 'serif' ? 'sans' : 'serif' })}
                className={`text-[10px] uppercase font-bold py-2.5 px-3 rounded border transition-all ${data.fontTheme === 'sans' ? 'bg-white text-black border-white' : 'border-subtle text-neutral-400'}`}
               >
                 {data.fontTheme === 'serif' ? 'Classic Font' : 'Modern Font'}
               </button>
             </div>
          </div>

          <div className="pt-6 border-t border-subtle space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-neutral-500">
               <Shield size={12} className="text-neutral-600" />
               <span className="uppercase font-bold tracking-widest">GDPR Compliance</span>
            </div>
            <p className="text-[9px] text-neutral-500 leading-normal">
              Photos are processed locally in your browser. No personal image data is stored on our servers.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-neutral-600 font-bold uppercase tracking-tighter">
               <button onClick={() => setLegalModal('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy</button>
               <button onClick={() => setLegalModal('terms')} className="hover:text-white transition-colors cursor-pointer">Terms</button>
               <button onClick={() => setLegalModal('legal')} className="hover:text-white transition-colors cursor-pointer">Legal Notice</button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3">
             {!isPaid && (
               <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-2">Magazine Export</div>
                  <div className="text-white text-lg font-display font-bold mb-3">€2.99 <span className="text-xs text-neutral-500 line-through tracking-normal font-normal ml-1">€9.99</span></div>
                  <button 
                    onClick={() => openPaymentModal(2.99, 'Export Unlock')}
                    disabled={isProcessing}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing && paymentConfig.service === 'Export Unlock' ? "Processing..." : "Unlock Export"}
                  </button>
               </div>
             )}

             <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-2">Service Promotion</div>
                <div className="text-white text-lg font-display font-bold mb-3">€25.00</div>
                <button 
                  onClick={() => openPaymentModal(25.00, 'Instagram Post')}
                  disabled={isProcessing || isInstagramOrdered}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${isInstagramOrdered ? 'bg-green-600 text-white cursor-default' : 'bg-white text-black hover:bg-neutral-200 shadow-lg'}`}
                >
                  {isInstagramOrdered ? "Order Placed ✓" : "Order Instagram Post"}
                </button>
             </div>

             <div className="bg-neutral-900/40 p-4 rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-2">Print Editions</div>
                <p className="text-[11px] text-neutral-400 mb-3 leading-tight">Get professional physical copies of our magazine via MagCloud.</p>
                <a 
                  href="https://www.magcloud.com/user/3dfashionelle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-neutral-100 text-black rounded-lg font-bold text-xs hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer size={14} />
                  Buy Print Version
                </a>
             </div>
          </div>
          
          <button 
            onClick={handleDownload}
            className={`w-full py-4 rounded-md font-black text-xs uppercase tracking-[2px] transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${isPaid ? 'bg-[#eab308] text-black hover:bg-[#d9a307]' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'}`}
          >
            <Download size={16} />
            {isPaid ? "Export PNG" : "Pay to Unlock"}
          </button>
        </div>
      </div>

      {/* Payment Modal Overlay */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-black w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="text-2xl font-display font-bold">Finalize Your Cover</h2>
                      <p className="text-neutral-500 text-sm mt-1">Ready to download in high definition?</p>
                   </div>
                   <button onClick={() => setShowPaymentModal(false)} className="text-neutral-400 hover:text-black transition-colors">
                     <X size={24} />
                   </button>
                </div>

                <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 flex flex-col items-center">
                   <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                      <Palette size={32} />
                   </div>
                   <div className="text-3xl font-black">$2.99</div>
                   <div className="text-xs text-neutral-400 uppercase tracking-widest mt-1">One-time payment</div>
                </div>

                <ul className="space-y-3 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">✅ High Resolution PNG Export</li>
                  <li className="flex items-center gap-2">✅ Remove all watermarks</li>
                  <li className="flex items-center gap-2">✅ Commercial usage license</li>
                </ul>

                <div className="space-y-4">
                   <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-[11px] text-blue-700 leading-snug">
                      <Info className="shrink-0" size={16} />
                      <p>
                        <strong>EU Regulation (Chapter 1, Sec. 3):</strong> By clicking purchase, you request immediate performance and acknowledge that you lose your 14-day right of withdrawal for {paymentConfig.service === 'Instagram Post' ? 'services' : 'digital content'}.
                      </p>
                   </div>

                   <label className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={paymentAgreed} 
                        onChange={(e) => setPaymentAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-black"
                      />
                      <span className="text-[12px] text-neutral-600 group-hover:text-black transition-colors leading-normal">
                        I agree to the Terms of Service and acknowledge the waiver of the right of withdrawal. <span className="text-neutral-400 font-medium">(VAT included where applicable)</span>
                      </span>
                   </label>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing || !paymentAgreed}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isProcessing || !paymentAgreed ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' : 'bg-black text-white hover:bg-neutral-800 shadow-lg'}`}
                >
                  {isProcessing ? "Processing Payment..." : `Purchase ${paymentConfig.service} • €${paymentConfig.amount}`}
                </button>
                <div className="text-[10px] text-center text-neutral-400 font-mono">SECURE STRIPE CHECKOUT • PCI COMPLIANT</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Preview */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#111] relative">
        <div 
          id="magazine-cover"
          ref={coverRef}
          className="magazine-canvas relative overflow-hidden text-black active-canvas group shrink-0 shadow-2xl"
          style={{ backgroundColor: data.bgColor }}
        >
          {/* Background Image */}
          <AnimatePresence mode="wait">
            {data.image && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-0 overflow-hidden"
              >
                <img 
                  src={data.image} 
                  alt="Background" 
                  className="w-full h-full object-cover transition-all duration-700"
                  style={{ 
                    filter: 
                      data.filter === 'grayscale' ? 'grayscale(100%)' : 
                      data.filter === 'contrast' ? 'contrast(150%) brightness(90%)' :
                      data.filter === 'sepia' ? 'sepia(80%)' : 'none'
                  }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 z-[5] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] opacity-50"></div>

          {/* Grain Effect */}
          {data.hasGrain && (
            <div className="absolute inset-0 z-[6] pointer-events-none opacity-[0.035] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
          )}

          {/* Frame Effect */}
          {data.hasFrame && (
            <div className="absolute inset-0 z-20 border-[24px] border-white pointer-events-none shadow-inner"></div>
          )}

          {/* Cover Layers */}
          <div className={`relative z-10 flex flex-col h-full text-black transition-all duration-300 ${data.hasFrame ? 'p-10' : 'p-5'}`} style={{ color: data.textColor }}>
            {/* Logo */}
            <div className="flex justify-center mt-2">
              <div 
                className={`flex items-baseline gap-[1.2px] font-logo font-black tracking-[-3px] uppercase drop-shadow-lg origin-center transition-all duration-300`}
                style={{ 
                  transform: 'scaleX(1.5) scaleY(1.2)',
                  fontSize: `${data.logoSize}px`
                }}
              >
                <div className="relative">
                  D
                  <div className="absolute top-[85%] left-0 mt-1 pointer-events-none">
                    <svg 
                      width={34 * (data.logoSize / 38)} 
                      height={18 * (data.logoSize / 38)} 
                      viewBox="0 0 40 18" 
                      fill="currentColor" 
                      className="opacity-90"
                    >
                      <rect x="0" y="0" width="1.5" height="18" />
                      <rect x="3" y="0" width="0.8" height="18" />
                      <rect x="5" y="0" width="2" height="18" />
                      <rect x="9" y="0" width="0.8" height="18" />
                      <rect x="11" y="0" width="1.2" height="18" />
                      <rect x="14" y="0" width="3" height="18" />
                      <rect x="18" y="0" width="0.8" height="18" />
                      <rect x="21" y="0" width="1.5" height="18" />
                      <rect x="24" y="0" width="2" height="18" />
                      <rect x="28" y="0" width="0.8" height="18" />
                      <rect x="31" y="0" width="3.5" height="18" />
                      <rect x="36" y="0" width="1.2" height="18" />
                      <rect x="39" y="0" width="1" height="18" />
                    </svg>
                  </div>
                </div>
                <div className="w-[12px] h-[12px] rounded-full mb-1.5" style={{ backgroundColor: data.accentColor }}></div>WONDER
              </div>
            </div>

            {/* Special Badge */}
            {data.showBadge && (
              <div className="absolute top-[160px] left-[40px] rotate-[-12deg]">
                <div className="bg-red-600 text-white font-black text-[10px] tracking-[2px] uppercase px-4 py-1.5 rounded-sm shadow-xl flex items-center gap-2 border-2 border-white/20">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Limited Edition
                </div>
              </div>
            )}

            {/* Issue Info */}
            <div className="absolute bottom-[30px] right-[30px] text-right">
               <div className="text-[5px] font-bold uppercase tracking-[2px] leading-tight opacity-80">
                  {data.issue}<br />{data.date}
               </div>
            </div>

            {/* Headlines */}
            <div className="mt-auto mb-[20px]">
              <motion.div 
                key={data.headline + data.fontTheme + data.headlineSize}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`font-bold leading-[0.85] tracking-[-3px] uppercase break-words ${data.fontTheme === 'serif' ? 'font-serif' : 'font-sans tracking-[-5px]'}`}
                style={{ 
                  whiteSpace: "pre-wrap",
                  fontSize: `${data.headlineSize}px`
                }}
              >
                {data.headline.split(' ').map((word, i) => (
                  <span key={i}>{word}<br/></span>
                ))}
              </motion.div>
              <motion.div 
                key={data.subheader}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                className="text-[14px] font-sans tracking-[4px] uppercase mt-4"
              >
                {data.subheader}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 text-[#444] text-[12px] font-mono select-none">
          1024 x 768 Viewport • 4:3 Aspect
        </div>
      </div>

      {/* GDPR Cookie Consent Banner */}
      <AnimatePresence>
        {cookieConsent === null && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-[400px] z-[2000] bg-white text-black p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-neutral-100 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-display font-bold text-lg">Privacy Preference</h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We use essential cookies to manage your single-time payment session and remember your preferences. No tracking or marketing cookies are involved.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCookieConsent}
                className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-all"
              >
                Accept All
              </button>
              <button 
                onClick={handleCookieConsent}
                className="flex-1 bg-neutral-100 text-neutral-600 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-all"
              >
                Essential Only
              </button>
            </div>
            <div className="text-[10px] text-neutral-400 text-center font-bold uppercase tracking-widest">
               GDPR Compliant Architecture
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstagramSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-black w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl p-8 space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Instagram size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold">Заказ принят!</h2>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Ваш заказ будет размещен в течение 7 дней на нашей странице в Instagram:
                </p>
                <a 
                  href="https://www.instagram.com/d.wondermagazin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-600 font-bold hover:underline block truncate"
                >
                  @d.wondermagazin
                </a>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-500 italic">
                Спасибо за выбор DWONDER Studio!
              </div>

              <button 
                onClick={() => setShowInstagramSuccess(false)}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg"
              >
                Понятно
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Modals Implementation */}
      <AnimatePresence>
        {legalModal && (
          <LegalModal 
            type={legalModal} 
            onClose={() => setLegalModal(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
