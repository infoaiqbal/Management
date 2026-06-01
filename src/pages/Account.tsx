import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';

export default function Account() {
  const { user, logout, settings, updateSettings, showAlert } = useStudents();
  
  const [formData, setFormData] = useState(settings);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start min-h-[60vh] space-y-8 pb-10">
      <div className="text-center space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">একাউন্ট ও সেটিংস</h2>
        <p className="text-gray-500 dark:text-gray-400 font-kalpurush">আপনার মাদরাসার তথ্য পরিবর্তন করুন</p>
      </div>

      <div className="bg-white dark:bg-[#11241c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {user?.email}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-kalpurush">
              বর্তমান এডমিন
            </div>
          </div>
          <div className="ml-auto">
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-800/50"
            >
              লগআউট করুন
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 font-kalpurush">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">মাদরাসার নাম</label>
            <input 
              type="text" 
              name="madrasaName"
              value={formData.madrasaName}
              onChange={handleChange}
              className="w-full p-2 border border-emerald-200 dark:border-emerald-800/50 rounded-md focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">মাদরাসার লোগো (ইউআরএল)</label>
            <input 
              type="text" 
              name="madrasaLogo"
              value={formData.madrasaLogo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="w-full p-2 border border-emerald-200 dark:border-emerald-800/50 rounded-md focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">এডমিনের নাম</label>
              <input 
                type="text" 
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                className="w-full p-2 border border-emerald-200 dark:border-emerald-800/50 rounded-md focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ঠিকানা</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-emerald-200 dark:border-emerald-800/50 rounded-md focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">এখানে কারা পড়ে?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="studentGender" 
                  value="boys" 
                  checked={formData.studentGender === 'boys'} 
                  onChange={handleChange} 
                  className="accent-emerald-600"
                />
                <span className="text-gray-800 dark:text-gray-200">ছেলে</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="studentGender" 
                  value="girls" 
                  checked={formData.studentGender === 'girls'} 
                  onChange={handleChange} 
                  className="accent-emerald-600"
                />
                <span className="text-gray-800 dark:text-gray-200">মেয়ে</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="studentGender" 
                  value="both" 
                  checked={formData.studentGender === 'both'} 
                  onChange={handleChange} 
                  className="accent-emerald-600"
                />
                <span className="text-gray-800 dark:text-gray-200">উভয়</span>
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">এর উপর ভিত্তি করে ফরমে "ছাত্র/ছাত্রী" পরিবর্তন হবে।</p>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
             <button 
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-colors"
             >
                সেভ করুন
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
