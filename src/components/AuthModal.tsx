import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'customer_login' | 'customer_register' | 'admin_login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'customer_login',
}) => {
  const [mode, setMode] = useState<'customer_login' | 'customer_register' | 'admin_login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickAdminFill = () => {
    setEmail('admin@store.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'admin_login') {
      if (email.toLowerCase() === 'admin@store.com' && password === 'admin123') {
        const adminUser: UserProfile = {
          uid: 'admin-master-001',
          email: 'admin@store.com',
          name: 'Store Administrator',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        onLoginSuccess(adminUser);
        onClose();
      } else {
        setError('Invalid admin credentials. Use admin@store.com / admin123');
      }
      return;
    }

    if (mode === 'customer_login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      // Customer sign in
      const customerUser: UserProfile = {
        uid: `cust-${Date.now()}`,
        email: email.trim(),
        name: email.split('@')[0].toUpperCase(),
        phone: '+880 1712-000000',
        address: 'Dhaka, Bangladesh',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(customerUser);
      onClose();
      return;
    }

    if (mode === 'customer_register') {
      if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
        setError('Please complete all required fields.');
        return;
      }
      const newCustomer: UserProfile = {
        uid: `cust-${Date.now()}`,
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || 'Dhaka',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(newCustomer);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              mode === 'admin_login' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode === 'admin_login' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {mode === 'admin_login' ? 'Admin Portal Access' : mode === 'customer_login' ? 'Customer Sign In' : 'Create Customer Account'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'admin_login' ? 'Manage products, inventory & orders' : 'Access your past orders & fast checkout'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-100 text-xs font-semibold bg-slate-50/50">
          <button
            type="button"
            onClick={() => { setMode('customer_login'); setError(''); }}
            className={`flex-1 py-2.5 text-center cursor-pointer transition-colors ${
              mode === 'customer_login' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('customer_register'); setError(''); }}
            className={`flex-1 py-2.5 text-center cursor-pointer transition-colors ${
              mode === 'customer_register' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin_login'); setError(''); }}
            className={`flex-1 py-2.5 text-center cursor-pointer transition-colors ${
              mode === 'admin_login' ? 'bg-white text-purple-700 border-b-2 border-purple-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'admin_login' && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />
                  Default Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={handleQuickAdminFill}
                  className="text-[11px] font-bold text-purple-700 bg-white border border-purple-300 px-2 py-0.5 rounded hover:bg-purple-100 cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
              <p className="text-[11px] text-purple-700">
                Email: <code>admin@store.com</code> | Pass: <code>admin123</code>
              </p>
            </div>
          )}

          {mode === 'customer_register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asif Mahmud"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {mode === 'customer_register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Shipping Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area, City"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
              mode === 'admin_login'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {mode === 'admin_login'
              ? 'Enter Admin Portal'
              : mode === 'customer_login'
              ? 'Sign In to Account'
              : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
