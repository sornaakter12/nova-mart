import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  User, 
  LogOut, 
  Package, 
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';
import { Currency } from '../utils/format';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenCustomerOrders: () => void;
  onOpenGuide: () => void;
  currency: Currency;
  onToggleCurrency: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onOpenCustomerOrders,
  onOpenGuide,
  currency,
  onToggleCurrency,
  isAdmin
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top micro bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
            Cash on Delivery Available Nationwide
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">⚡ Use code <strong className="text-white">WELCOME10</strong> for 10% OFF</span>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleCurrency}
            className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
            title="Switch Currency (BDT / USD)"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>{currency === 'BDT' ? '৳ BDT' : '$ USD'}</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="text-amber-300 hover:text-amber-200 flex items-center space-x-1 cursor-pointer transition-colors"
            title="Firebase & Vercel deployment guide"
          >
            <Sparkles className="w-3 h-3" />
            <span>Firebase & Vercel Guide</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900 flex items-center space-x-1">
              <span>Nova</span>
              <span className="text-emerald-600">Mart</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">Smart E-Commerce & Inventory</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, gadgets, categories..."
              className="w-full pl-10 pr-9 py-2 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Admin shortcut button */}
          <button
            onClick={onOpenAdmin}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              isAdmin
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-500/20 hover:bg-purple-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
            title="Admin Dashboard (Manage products, inventory & orders)"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-white' : 'text-purple-600'}`} />
            <span className="hidden md:inline">{isAdmin ? 'Admin Portal' : 'Admin Login'}</span>
          </button>

          {/* User Account Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[100px] truncate">{currentUser.name || currentUser.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-sm animate-in fade-in duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {currentUser.role}
                    </span>
                  </div>
                  
                  <button
                    onClick={onOpenCustomerOrders}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>My Orders</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={onOpenAdmin}
                      className="w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50 flex items-center space-x-2 cursor-pointer font-medium"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Admin Control Center</span>
                    </button>
                  )}

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer bg-white transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm shadow-emerald-600/30 cursor-pointer transition-all"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="bg-white text-emerald-700 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
