import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Zap, ArrowRight, Tag } from 'lucide-react';
import { CATEGORIES } from '../data/initialProducts';

interface BannerProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onExploreClick: () => void;
}

export const Banner: React.FC<BannerProps> = ({
  selectedCategory,
  onSelectCategory,
  onExploreClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Next-Day Home Delivery • 100% Verified Quality</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Shop Quality Gear With <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                Cash On Delivery
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Discover authentic electronics, smart gadgets, premium home essentials, and fashion. Inspect your package at your doorstep before paying.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-98"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Coupon: <strong className="text-amber-300 font-mono font-bold">WELCOME10</strong> (10% Off)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl hover:border-emerald-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Doorstep Delivery</h3>
              <p className="text-xs text-slate-400 mt-1">Cash on delivery available in all 64 districts with live updates.</p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl hover:border-emerald-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Genuine Guarantee</h3>
              <p className="text-xs text-slate-400 mt-1">100% authentic products sourced directly from licensed vendors.</p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl hover:border-emerald-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">7-Day Return</h3>
              <p className="text-xs text-slate-400 mt-1">Hassle-free replacement if damaged or mismatched upon arrival.</p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-4 rounded-2xl hover:border-emerald-500/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Instant Support</h3>
              <p className="text-xs text-slate-400 mt-1">Dedicated customer care assistance via phone & WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
