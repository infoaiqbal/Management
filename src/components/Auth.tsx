import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to convert phone number to a valid email representation for Firebase Auth
  const getAuthEmail = (input: string) => {
    const trimmed = input.trim();
    // Assuming BD number format: 01... (11 digits) or +8801...
    if (/^(?:\+88|88)?01[3-9]\d{8}$/.test(trimmed)) {
      // It's a phone number, map it to a fake email
      return `${trimmed.replace(/^\+?88/, '')}@madrasa.local`;
    }
    return trimmed;
  };

  const isPhoneNumber = (input: string) => {
    return /^(?:\+88|88)?01[3-9]\d{8}$/.test(input.trim());
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const authEmail = getAuthEmail(identifier);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, authEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('নাম্বার/মেইল অথবা পাসওয়ার্ড ভুল হয়েছে');
      } else if (err.code === 'auth/invalid-email') {
        setError('সঠিক ইমেইল বা মোবাইল নাম্বার প্রদান করুন');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই নাম্বার বা মেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে');
      } else if (err.code === 'auth/weak-password') {
        setError('পাসওয়ার্ডটি খুব সহজ, অন্তত ৬ অক্ষরের হতে হবে');
      } else {
        setError('একটি ত্রুটি ঘটেছে: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (isPhoneNumber(identifier)) {
      setError('মোবাইল নাম্বার দিয়ে একাউন্ট খোলা হলে, পাসওয়ার্ড রিসেট করতে অনুগ্রহ করে ডেভেলপারের/এডমিন এর সাথে যোগাযোগ করুন।');
      return;
    }

    setLoading(true);
    try {
      const authEmail = getAuthEmail(identifier);
      await sendPasswordResetEmail(auth, authEmail);
      setMessage('পাসওয়ার্ড রিসেটের লিংক আপনার ইমেইলে পাঠানো হয়েছে।');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-email') {
        setError('সঠিক ইমেইল প্রদান করুন');
      } else if (err.code === 'auth/user-not-found') {
         setError('এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি');
      } else {
        setError('পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a1610] p-4 text-gray-900 dark:text-gray-100">
        <div className="max-w-md w-full bg-white dark:bg-[#11241c] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mb-2">পাসওয়ার্ড পরিবর্তন</h1>
            <p className="text-gray-500 dark:text-gray-400">আপনার ইমেইল দিন, আমরা লিংক পাঠিয়ে দিবো</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ইমেইল / নাম্বার</label>
              <input 
                type="text" 
                required 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                placeholder="আপনার ইমেইল বা মোবাইল নাম্বার দিন"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'অপেক্ষা করুন...' : 'রিসেট লিংক পাঠান'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button 
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setMessage('');
              }}
              className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
            >
              পিছনে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a1610] p-4 text-gray-900 dark:text-gray-100">
      <div className="max-w-md w-full bg-white dark:bg-[#11241c] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mb-2">মাদরাসা ম্যানেজমেন্ট</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isLogin ? 'আপনার একাউন্টে প্রবেশ করুন' : 'নতুন একাউন্ট তৈরি করুন'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ইমেইল অথবা মোবাইল নাম্বার</label>
            <input 
              type="text" 
              required 
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
              placeholder="যেমন: admin@m.com বা 017xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">পাসওয়ার্ড</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
              placeholder="পাসওয়ার্ড দিন (অন্তত ৬ অক্ষর)"
            />
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'অপেক্ষা করুন...' : (isLogin ? 'প্রবেশ করুন' : 'একাউন্ট তৈরি করুন')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "একাউন্ট নেই?" : "ইতিমধ্যে একাউন্ট আছে?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
          >
            {isLogin ? 'নতুন একাউন্ট খুলুন' : 'লগইন করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}
