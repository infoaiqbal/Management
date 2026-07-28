import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Auth({ onAuthSuccess, onSkip }: { onAuthSuccess: () => void, onSkip: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      handleResetPassword();
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('মেইল অথবা পাসওয়ার্ড ভুল হয়েছে');
      } else if (err.code === 'auth/invalid-email') {
        setError('সঠিক ইমেইল প্রদান করুন');
      } else {
        setError('লগইন করতে সমস্যা হয়েছে');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('এই মেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে');
      } else if (err.code === 'auth/weak-password') {
        setError('পাসওয়ার্ডটি খুব সহজ, অন্তত ৬ অক্ষরের হতে হবে');
      } else {
        setError('রেজিস্ট্রেশন করতে সমস্যা হয়েছে');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setMessage('পাসওয়ার্ড রিসেটের লিংক আপনার ইমেইলে পাঠানো হয়েছে।');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-email') {
         setError('সঠিক ইমেইল প্রদান করুন');
      } else if (err.code === 'auth/user-not-found') {
         setError('এই ইমেইলের কোনো একাউন্ট পাওয়া যায়নি');
      } else {
        setError('পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isActive ? 'active' : ''}`}>
        
        {/* LOGIN FORM */}
        <div className="form-box login">
            <form onSubmit={handleLogin}>
                <h1>{isForgotPassword ? 'পাসওয়ার্ড রিসেট' : 'লগইন'}</h1>
                
                {error && <div className="auth-error">{error}</div>}
                {message && <div className="auth-success">{message}</div>}

                <div className="input-box">
                    <input 
                      type="email" 
                      placeholder="ইমেইল" 
                      required 
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                    />
                    <Mail size={20} />
                </div>
                
                {!isForgotPassword && (
                  <div className="input-box">
                      <input 
                        type={showLoginPassword ? "text" : "password"} 
                        placeholder="পাসওয়ার্ড" 
                        required 
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowLoginPassword(!showLoginPassword)} 
                        className="absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none outline-none cursor-pointer flex items-center justify-center p-0"
                        style={{ right: '20px' }}
                      >
                         {showLoginPassword ? <EyeOff size={20} style={{ position: 'static', transform: 'none' }} /> : <Eye size={20} style={{ position: 'static', transform: 'none' }} />}
                      </button>
                  </div>
                )}
                
                {!isForgotPassword && (
                  <div className="forgot-link">
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(''); setMessage(''); }}>পাসওয়ার্ড ভুলে গেছেন?</a>
                  </div>
                )}
                
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'অপেক্ষা করুন...' : (isForgotPassword ? 'লینک পাঠান' : 'লগইন')}
                </button>

                {!isForgotPassword && (
                  <div className="mt-4 text-center">
                    <button type="button" onClick={onSkip} className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline bg-transparent border-none cursor-pointer">
                      লগইন ছাড়াই চালিয়ে যান (অফলাইন মুড)
                    </button>
                  </div>
                )}

                {isForgotPassword && (
                  <div className="forgot-link" style={{marginTop: '15px'}}>
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setError(''); setMessage(''); }}>লগইন পেজে ফিরে যান</a>
                  </div>
                )}
            </form>
        </div>

        {/* REGISTER FORM */}
        <div className="form-box register">
            <form onSubmit={handleRegister}>
                <h1>রেজিস্ট্রেশন</h1>
                {error && <div className="auth-error">{error}</div>}
                <div className="input-box">
                    <input 
                      type="email" 
                      placeholder="ইমেইল" 
                      required 
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                    />
                    <Mail size={20} />
                </div>
                <div className="input-box">
                    <input 
                      type={showRegisterPassword ? "text" : "password"} 
                      placeholder="পাসওয়ার্ড" 
                      required 
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)} 
                      className="absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none outline-none cursor-pointer flex items-center justify-center p-0"
                      style={{ right: '20px' }}
                    >
                       {showRegisterPassword ? <EyeOff size={20} style={{ position: 'static', transform: 'none' }} /> : <Eye size={20} style={{ position: 'static', transform: 'none' }} />}
                    </button>
                </div>
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'অপেক্ষা করুন...' : 'রেজিস্ট্রেশন'}
                </button>
            </form>
        </div>

        {/* TOGGLE PANELS */}
        <div className="toggle-box">
            <div className="toggle-panel toggle-left">
                <h1>আহলান সাহলান!</h1>
                <p>আপনার কি একাউন্ট নেই?</p>
                <button className="auth-btn" onClick={() => { setIsActive(true); setError(''); setMessage(''); setIsForgotPassword(false); }}>
                  রেজিস্ট্রেশন
                </button>
            </div>

            <div className="toggle-panel toggle-right">
                <h1>জাযাকাল্লাহ!</h1>
                <p>আপনার কি আগের একাউন্ট আছে?</p>
                <button className="auth-btn" onClick={() => { setIsActive(false); setError(''); setMessage(''); }}>
                  লগইন
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
