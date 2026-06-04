import React, { useState } from 'react';

export default function DeveloperProfile() {
  const [btnState, setBtnState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleButtonClick = () => {
    if (btnState === 'loading' || btnState === 'done') return;
    
    setBtnState('loading');
    setTimeout(() => {
      setBtnState('done');
      window.open('https://asifio.blogspot.com', '_blank');
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[75vh] py-12 font-kalpurush">
      <div className="bg-white dark:bg-[#0f2119] w-full max-w-[360px] rounded-[20px] pt-[60px] pb-[35px] px-[25px] relative text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] outline outline-1 outline-black/5 dark:outline-white/5 mt-[70px]">
        
        {/* Avatar */}
        <div className="w-[120px] h-[120px] rounded-full border-4 border-white dark:border-[#0f2119] shadow-[0_8px_25px_rgba(0,0,0,0.2)] absolute -top-[60px] left-1/2 -translate-x-1/2 bg-white overflow-hidden flex justify-center items-center">
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjnj7EEJ5DtXVggqXDKNdFdMLP59bgdBCG4sl3sCdA_9P8xDLLyVsEMXWlpLJ1jAP4btysooLOvHdsWLUwcGjaM4E1hyphenhyphennaqjmNKLLXcOLddCjLJhxvyJI_OdsB-7ywEylcZFOc4x1OpW8Uh19OHaWV0r5QonYf7YLc-udO8ynMWrN34i2U2K4zMu9PG2pc/s1884/IMG_20260328_233420_303.webp" 
            alt="Asif Iqbal" 
            className="w-full h-full object-cover pointer-events-none" 
          />
        </div>

        {/* Profile Info */}
        <h2 className="text-[26px] font-bold text-[#1a1a1a] dark:text-gray-100 mb-3 mt-[15px]" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          আসিফ ইকবাল
        </h2>
        <p className="text-[18px] text-[#555555] dark:text-gray-400 leading-relaxed mb-[30px] px-2.5 font-kalpurush">
          আমি একজন তালিবুল ইলম, নাশিদ শিল্পী, ডিজাইনার ও অ্যাপ ডেভেলপার। আমার সাথে যুক্ত হতে নিচের সোশ্যাল লিংকগুলো ফলো করুন।
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-[15px] mb-[30px] flex-wrap">
          {/* Facebook */}
          <a href="https://www.facebook.com/infoaiqbal" target="_blank" rel="noreferrer" className="flex justify-center items-center w-[45px] h-[45px] rounded-full bg-[#f4f6f8] dark:bg-[#1a382a] text-[#0d204a] dark:text-emerald-400 hover:bg-[#035907] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:-translate-y-[5px] hover:shadow-[0_8px_15px_rgba(3,89,7,0.3)] transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
          </a>
          {/* Instagram */}
          <a href="https://www.instagram.com/infoaiqbal" target="_blank" rel="noreferrer" className="flex justify-center items-center w-[45px] h-[45px] rounded-full bg-[#f4f6f8] dark:bg-[#1a382a] text-[#0d204a] dark:text-emerald-400 hover:bg-[#035907] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:-translate-y-[5px] hover:shadow-[0_8px_15px_rgba(3,89,7,0.3)] transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </a>
          {/* Telegram */}
          <a href="https://t.me/infoaiqbal" target="_blank" rel="noreferrer" className="flex justify-center items-center w-[45px] h-[45px] rounded-full bg-[#f4f6f8] dark:bg-[#1a382a] text-[#0d204a] dark:text-emerald-400 hover:bg-[#035907] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:-translate-y-[5px] hover:shadow-[0_8px_15px_rgba(3,89,7,0.3)] transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.43.91-4.04 2.67-.38.26-.73.39-1.05.38-.35-.01-1.03-.2-1.53-.36-.61-.2-1.1-.31-1.06-.66.02-.18.27-.37.75-.56 2.94-1.28 4.9-2.13 5.88-2.54 2.79-1.17 3.37-1.37 3.75-1.38.08 0 .27.02.39.12.1.08.13.19.14.28-.01.05.01.17 0 .2z"/></svg>
          </a>
          {/* Email */}
          <a href="mailto:web.asifio@gmail.com" target="_blank" rel="noreferrer" className="flex justify-center items-center w-[45px] h-[45px] rounded-full bg-[#f4f6f8] dark:bg-[#1a382a] text-[#0d204a] dark:text-emerald-400 hover:bg-[#035907] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:-translate-y-[5px] hover:shadow-[0_8px_15px_rgba(3,89,7,0.3)] transition-all duration-300">
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </a>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button 
            type="button"
            onClick={handleButtonClick}
            className={`
              relative flex justify-center items-center h-[50px]
              text-white font-bold text-[15px] cursor-pointer 
              transition-all duration-300
              ${
                btnState === 'idle' 
                  ? 'w-[160px] bg-[#0984e3] hover:bg-[#0873c7] rounded-xl' 
                  : btnState === 'loading'
                  ? 'w-[50px] bg-[#0984e3] rounded-full text-transparent'
                  : 'w-[160px] bg-[#29fd53] text-[#000000] rounded-xl'
              }
            `}
          >
            {btnState === 'loading' ? (
              <div className="absolute w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="font-kalpurush text-lg">{btnState === 'done' ? 'দেখুন' : 'ওয়েব সাইট'}</span>
            )}
          </button>
        </div>

      </div>
      
      {/* Import the font at runtime if not globally present */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@700&display=swap');
      `}</style>
    </div>
  );
}
