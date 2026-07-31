import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { Edit2, X, LogOut, User } from 'lucide-react';

export default function Account() {
  const { user, logout, settings, updateSettings, showAlert, isGuest, setGuestMode } = useStudents();
  
  const [formData, setFormData] = useState(settings);
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(false);
  };

  if (!user && isGuest) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[70vh] pb-10">
        <div className="bg-white dark:bg-[#11241c] rounded-2xl shadow-lg p-8 max-w-md text-center border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <User className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 font-kalpurush">অফলাইন মুড চলছে</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-kalpurush">
            একাউন্ট তৈরি করে বা লগইন করে আপনার ডাটা অনলাইনে সংরক্ষণ ও সিঙ্ক করুন।
          </p>
          <button 
            onClick={() => setGuestMode(false)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md font-kalpurush"
          >
            লগইন বা একাউন্ট তৈরি করুন
          </button>
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[70vh] pb-10">
        <div className="relative mt-24 pt-28 pb-8 px-8 sm:px-12 bg-white dark:bg-[#11241c] rounded-[2rem] shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
          
          <div className="absolute -top-24 left-1/2 -translate-x-1/2">
            <div className="w-48 h-48 rounded-full border-[8px] border-gray-50 dark:border-[#0a1510] shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 font-kalpurush relative z-10 transition-transform">
              {settings.madrasaLogo ? (
                <img src={settings.madrasaLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold">লোগো</span>
              )}
            </div>
          </div>

          <div className="absolute top-6 right-6">
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 font-kalpurush transition-colors hover:shadow-md"
            >
              <Edit2 size={20} />
            </button>
          </div>

          <div className="text-center font-kalpurush mt-4 space-y-3 text-gray-900 dark:text-gray-100">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{settings.madrasaName || 'মাদরাসার নাম'}</h2>
            <p className="text-xl sm:text-2xl">{settings.address || 'ঠিকানা'}</p>
            
            <div className="pt-8 space-y-3 pb-8">
              <p className="text-xl sm:text-2xl">ই-মেইল: {user?.email}</p>
              <p className="text-xl sm:text-2xl">অ্যাডমিন: {settings.adminName || 'অ্যাডমিন'}</p>
            </div>
          </div>

          <div className="mt-8 text-right font-kalpurush text-gray-600 dark:text-gray-400 text-xl font-medium border-t border-gray-100 dark:border-gray-800 pt-6">
            মাদ্রাসা ম্যানেজমেন্ট
          </div>
        </div>

        <button 
          onClick={logout} 
          className="mt-8 flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-6 py-3 rounded-full font-kalpurush text-lg transition-colors border border-red-200 dark:border-red-800/50"
        >
          <LogOut size={20} />
          লগআউট করুন
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start min-h-[60vh] space-y-8 pb-10 relative">
      <div className="text-center space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">একাউন্ট ও সেটিংস</h2>
        <p className="text-gray-500 dark:text-gray-400 font-kalpurush">আপনার মাদরাসার তথ্য পরিবর্তন করুন</p>
      </div>

      <div className="bg-white dark:bg-[#11241c] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl w-full relative">
        <button 
          onClick={() => setIsEditing(false)} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleSave} className="space-y-5 font-kalpurush mt-4">
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
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">মাদরাসার লোগো</label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-emerald-200 dark:border-emerald-800/50 border-dashed rounded-md relative hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  if (file.size > 800 * 1024) {
                    showAlert('লোগোর সাইজ ৮০০ কেবি এর নিচে হতে হবে!', 'warning');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFormData(prev => ({ ...prev, madrasaLogo: event.target?.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <div className="space-y-1 text-center">
                {formData.madrasaLogo ? (
                  <div className="relative">
                    <img src={formData.madrasaLogo} alt="Logo preview" className="mx-auto h-24 w-auto object-contain mb-4 rounded-md" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, madrasaLogo: '' }))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1 text-xs px-2">রিমুভ</button>
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label htmlFor="logo-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                    <span>ফাইল আপলোড করুন</span>
                    <input 
                      id="logo-upload" 
                      name="logo-upload" 
                      type="file" 
                      accept="image/*"
                      className="sr-only" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 800 * 1024) {
                            showAlert('লোগোর সাইজ ৮০০ কেবি এর নিচে হতে হবে!', 'warning');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData(prev => ({ ...prev, madrasaLogo: event.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="pl-1">বা টেনে এনে ছেড়ে দিন</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF আপলোড করা যাবে</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">আদায়কারীর স্বাক্ষর (রশিদে প্রিন্ট হবে)</label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-emerald-200 dark:border-emerald-800/50 border-dashed rounded-md relative hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  if (file.size > 800 * 1024) {
                    showAlert('স্বাক্ষরের সাইজ ৮০০ কেবি এর নিচে হতে হবে!', 'warning');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFormData(prev => ({ ...prev, signature: event.target?.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <div className="space-y-1 text-center">
                {formData.signature ? (
                  <div className="relative">
                    <img src={formData.signature} alt="Signature preview" className="mx-auto h-16 w-auto object-contain mb-4 rounded-md" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, signature: '' }))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1 text-xs px-2">রিমুভ</button>
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M12.5 35.5L35.5 12.5M12.5 12.5l23 23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label htmlFor="signature-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                    <span>ফাইল আপলোড করুন</span>
                    <input 
                      id="signature-upload" 
                      name="signature-upload" 
                      type="file" 
                      accept="image/*"
                      className="sr-only" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 800 * 1024) {
                            showAlert('স্বাক্ষরের সাইজ ৮০০ কেবি এর নিচে হতে হবে!', 'warning');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData(prev => ({ ...prev, signature: event.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="pl-1">বা টেনে এনে ছেড়ে দিন</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">পিছনের ব্যাকগ্রাউন্ড ছাড়া (PNG) আপলোড করা ভালো</p>
              </div>
            </div>
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
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">রশিদের হেডার স্টাইল</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="headerType" 
                  value="text_logo" 
                  checked={formData.headerType === 'text_logo' || !formData.headerType} 
                  onChange={handleChange} 
                  className="accent-emerald-600"
                />
                <span className="text-gray-800 dark:text-gray-200">নাম, ঠিকানা ও লোগো</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="headerType" 
                  value="header_photo" 
                  checked={formData.headerType === 'header_photo'} 
                  onChange={handleChange} 
                  className="accent-emerald-600"
                />
                <span className="text-gray-800 dark:text-gray-200">হেডার ফটো</span>
              </label>
            </div>
          </div>

          {formData.headerType === 'header_photo' && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">হেডার ফটো আপলোড (রশিদে প্রিন্ট হবে)</label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-emerald-200 dark:border-emerald-800/50 border-dashed rounded-md relative hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    if (file.size > 800 * 1024) {
                      showAlert('ছবির সাইজ ৮০০ কেবি এর নিচে হতে হবে!', 'warning');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData(prev => ({ ...prev, headerPhoto: event.target?.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <div className="space-y-1 text-center">
                  {formData.headerPhoto ? (
                    <div className="relative">
                      <img src={formData.headerPhoto} alt="Header preview" className="mx-auto h-24 w-auto object-contain mb-4 rounded-md" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, headerPhoto: '' }))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1 text-xs px-2">রিমুভ</button>
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="headerphoto-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                      <span>ফাইল আপলোড করুন</span>
                      <input 
                        id="headerphoto-upload" 
                        name="headerphoto-upload" 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 800 * 1024) {
                              showAlert('ছবির সাইজ ৮০০ কেবি এর নিচে হতে হবে!', 'warning');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setFormData(prev => ({ ...prev, headerPhoto: event.target?.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">বা টেনে এনে ছেড়ে দিন</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG আপলোড করা যাবে</p>
                </div>
              </div>
            </div>
          )}

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
