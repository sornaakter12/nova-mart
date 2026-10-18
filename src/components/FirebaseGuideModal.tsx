import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Database, Shield, Github, Globe, Flame } from 'lucide-react';

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envSnippet = `VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
ADMIN_EMAIL="admin@store.com"`;

  const rulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        request.auth.token.email == 'admin@store.com'
      );
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /orders/{orderId} {
      allow get, list: if (isSignedIn() && resource.data.userId == request.auth.uid) || isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Firebase & Vercel Upload Guide
              </h2>
              <p className="text-xs text-slate-300">
                সহজ নির্দেশিকা: পরবর্তীতে Firebase ও Vercel এ সংযুক্ত এবং ডিপ্লয় করার নিয়ম
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs text-slate-600">
          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
            <p className="font-bold flex items-center text-emerald-800">
              <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
              এই অ্যাপটি এখনই ১০০% সচল (Ready for Use & Testing)!
            </p>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              আপনি সরাসরি প্রোডাক্ট যোগ/এডিট/ডিলিট করতে পারছেন, অর্ডার প্লেস করতে পারছেন, এবং ক্যাশ অন ডেলিভারি চেকআউট উপভোগ করতে পারছেন। নিচে দেওয়া হলো কীভাবে পরে নিজের Firebase অ্যাকাউন্টে স্থানান্তর করবেন।
            </p>
          </div>

          {/* Section 1: Firebase setup steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>ধাপ ১: Firebase প্রজেক্ট তৈরি ও কনফিগারেশন</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <ol className="list-decimal list-inside space-y-2 pl-1 text-slate-700">
                <li>
                  <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">
                    Firebase Console
                  </a> এ যান এবং <strong>"Create a project"</strong> এ ক্লিক করুন।
                </li>
                <li>
                  <strong>Authentication</strong> মেনুতে যান &gt; <strong>"Get started"</strong> &gt; <strong>Email/Password</strong> এবং <strong>Google</strong> লগইন চালু (Enable) করুন।
                </li>
                <li>
                  <strong>Firestore Database</strong> মেনুতে যান &gt; <strong>"Create database"</strong> &gt; Production mode নির্বাচন করুন।
                </li>
                <li>
                  প্রজেক্ট সেটিংস (Project Settings) &gt; General &gt; "Your apps" &gt; <strong>Web (&lt;/&gt;)</strong> আইকনে ক্লিক করে একটি ওয়েব অ্যাপ তৈরি করুন।
                </li>
                <li>
                  সেখানে পাওয়া কনফিগ কি-গুলো নিচের মতো করে আপনার <code>.env</code> ফাইলে সংরক্ষণ করুন:
                </li>
              </ol>

              {/* Env block */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono text-[11px] font-bold text-slate-700">.env / Environment Variables:</span>
                  <button
                    onClick={() => copyToClipboard(envSnippet, 'env')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedKey === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'env' ? 'Copied' : 'Copy Env'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {envSnippet}
                </pre>
              </div>
            </div>
          </div>

          {/* Section 2: Firestore Security Rules */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>ধাপ ২: Firestore Security Rules স্থাপন</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-slate-700">
                Firebase Console এ <strong>Firestore Database</strong> &gt; <strong>Rules</strong> ট্যাবে গিয়ে পুরো কোডটি রিপ্লেস করে <strong>Publish</strong> দিন। এটি ক্রেতা এবং অ্যাডমিনের ডাটা নিরাপদ রাখে:
              </p>

              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono text-[11px] font-bold text-slate-700">firestore.rules:</span>
                  <button
                    onClick={() => copyToClipboard(rulesSnippet, 'rules')}
                    className="text-purple-700 hover:text-purple-800 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'rules' ? 'Copied' : 'Copy Rules'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-purple-300 font-mono text-[11px] overflow-x-auto max-h-48">
                  {rulesSnippet}
                </pre>
              </div>
            </div>
          </div>

          {/* Section 3: Vercel & GitHub Deployment */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Github className="w-4 h-4 text-slate-900" />
              <span>ধাপ ৩: GitHub এর মাধ্যমে Vercel এ লাইভ ডিপ্লয়</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-700">
                <li>
                  আপনার কম্পিউটারে টার্মিনালে কোডটি গিটহাবে পুশ করুন:
                  <code className="block bg-slate-900 text-white p-2.5 rounded-xl font-mono text-[10px] mt-1 overflow-x-auto">
                    git init <br />
                    git add . <br />
                    git commit -m "NovaMart e-commerce release" <br />
                    git branch -M main <br />
                    git remote add origin https://github.com/&lt;your-username&gt;/&lt;repo-name&gt;.git <br />
                    git push -u origin main
                  </code>
                </li>
                <li>
                  <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">
                    Vercel.com
                  </a> এ লগইন করে <strong>"Add New Project"</strong> এ আপনার GitHub Repository সিলেক্ট করুন।
                </li>
                <li>
                  <strong>Environment Variables</strong> অপশনে ওপরের <code>VITE_FIREBASE_*</code> ভ্যারিয়েবলগুলো যুক্ত করুন।
                </li>
                <li>
                  <strong>Deploy</strong> বাটনে চাপ দিন। ১ মিনিটের ভেতর আপনার সাইট বিশ্বব্যাপী লাইভ হয়ে যাবে!
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
