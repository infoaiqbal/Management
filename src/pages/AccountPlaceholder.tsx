import React from 'react';
import { useStudents } from '../store/StudentContext';

/**
 * ==========================================
 * একাউন্ট (Account Placeholder)
 * ==========================================
 */
export default function AccountPlaceholder() {
  const { user, logout } = useStudents();
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">একাউন্ট</h2>
        <p className="text-gray-500 dark:text-gray-400">আপনি বর্তমানে লগইন আছেন</p>
      </div>

      <div className="bg-white dark:bg-[#11241c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center max-w-sm w-full">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold mb-4">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          {user?.email}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          ডেভেলপার ভার্সন - ডাটা সিঙ্ক হচ্ছে
        </div>

        <button 
          onClick={logout}
          className="px-6 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full font-medium transition-colors border border-red-200 dark:border-red-800/50"
        >
          লগআউট করুন
        </button>
      </div>
    </div>
  );
}
