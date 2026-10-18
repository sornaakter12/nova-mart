import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Phone, Mail, MapPin, Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenGuide: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">Nova<span className="text-emerald-500">Mart</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your trusted full-stack e-commerce destination with Cash on Delivery across all 64 districts. Real inventory tracking and verified suppliers.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <Truck className="w-3.5 h-3.5 mr-1" />
                Cash On Delivery Verified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenGuide} className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center">
                  <Sparkles className="w-3 h-3 mr-1.5 text-amber-400" />
                  Firebase & Vercel Guide
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-purple-400 transition-colors cursor-pointer flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1.5 text-purple-400" />
                  Store Admin Dashboard
                </button>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Return & Exchange Policy (7 Days)
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Terms of Service & Privacy
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>+880 1700-123456 (9 AM - 10 PM)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>support@novamart.store</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Level 4, Gulshan 1 Avenue, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Payment security notice */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Payment Safety</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              We prioritize customer protection by enforcing <strong>Cash on Delivery</strong> first. Inspect and approve your product before handing cash to the courier.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-mono border border-slate-700">
                COD Ready
              </span>
              <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-mono border border-slate-700">
                bKash Ready
              </span>
              <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-mono border border-slate-700">
                Vercel Ready
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© 2026 NovaMart. Crafted for modern commerce and quick Firebase deployment.</p>
          <p className="flex items-center">
            Built with speed & precision for full-stack independence.
          </p>
        </div>
      </div>
    </footer>
  );
};
