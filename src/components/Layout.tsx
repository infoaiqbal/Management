import React, { useState } from 'react';
import { Menu, Moon, Sun, X, Home, UserPlus, Files, Wallet, List, Database, Search, User, Crown } from 'lucide-react';
import { useStudents } from '../store/StudentContext';


/**
 * ==========================================
 * লেআউট এবং নেভিগেশন (Layout & Navigation)
 * ==========================================
 * এটি পুরো অ্যাপের মেইন কাঠামো। এখানে সাইডবার এবং হেডার রয়েছে।
 * কোনো মেনু আইটেম পরিবর্তন করতে হলে `menuItems` অ্যারে এডিট করুন।
 */

interface LayoutProps {
  children: React.ReactNode;
  activeMenuItem: string;
  setActiveMenuItem: (item: string) => void;
}

export default function Layout({ children, activeMenuItem, setActiveMenuItem }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme, settings } = useStudents();

  // সাইডবারের মেনু সমূহ
  const menuItems = [
    { id: 'home', label: 'হোম', icon: <Home size={18} /> },
    { id: 'forms', label: 'ফরম সমূহ', icon: <Files size={18} /> },
    { id: 'fees', label: 'বেতন গ্রহণ', icon: <Wallet size={18} /> },
    { id: 'reports', label: 'তালিকা তৈরি', icon: <List size={18} /> },
    { id: 'add_info', label: 'তথ্য সংযোগ', icon: <Database size={18} /> },
    { id: 'search_info', label: 'তথ্য খুঁজুন', icon: <Search size={18} /> },
    { id: 'account', label: 'একাউন্ট', icon: <User size={18} /> },
    { id: 'developer', label: 'ডেভেলপার সম্পর্কে', icon: <Crown size={18} className="text-amber-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1510] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex font-kalpurush">
      {/* 
        =================
        সাইডবার অংশ (Sidebar Navigation)
        =================
      */}
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`print:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0f2119] shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 z-50 flex flex-col border-r border-gray-200 dark:border-gray-800`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {settings.madrasaLogo && (
              <img src={settings.madrasaLogo} alt="Logo" className="w-8 h-8 object-contain rounded-full" />
            )}
            <h1 className="flex-1 text-lg font-bold text-emerald-800 dark:text-emerald-400 line-clamp-2">
              {settings.madrasaName || 'মাদরাসা ডাটাবেস'}
            </h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveMenuItem(item.id);
                    setIsSidebarOpen(false); // Close sidebar on mobile after click
                  }}
                  className={`w-full text-left px-6 py-3 transition-colors flex items-center gap-3 ${
                    activeMenuItem === item.id 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-r-4 border-emerald-500 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={`${activeMenuItem === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 
        =================
        মূল কন্টেন্ট অংশ (Main Content Area)
        =================
      */}
      <main className="flex-1 lg:ml-64 print:ml-0 flex flex-col min-h-screen relative w-full">
        {/* হেডার (Header) */}
        <header className="print:hidden h-16 bg-white dark:bg-[#0f2119] shadow-sm flex items-center justify-between px-4 sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="font-semibold text-lg lg:hidden">মাদরাসা ডাটাবেস</div>
          
          {/* থিম টগল বাটন (Theme Toggle) */}
          <div className="ml-auto">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* ডাইনামিক পেইজ কন্টেন্ট (Dynamic Page Content) */}
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden print:overflow-visible print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
