import React from 'react';

/**
 * ==========================================
 * হোম পেইজ (Home Page)
 * ==========================================
 * আপাতত এটি ফাঁকা রাখা হলো। পরবর্তীতে ড্যাশবোর্ড বা অন্যান্য তথ্য এখানে যুক্ত করা হবে।
 */
export default function Home() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">স্বাগতম!</h2>
        <p className="text-gray-500 dark:text-gray-400">ড্যাশবোর্ড ডাটাসমূহ পরবর্তীতে যুক্ত করা হবে।</p>
      </div>
    </div>
  );
}
