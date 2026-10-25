import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { 
  Users, 
  UserPlus, 
  FileClock, 
  X, 
  Banknote, 
  Calendar, 
  Clock, 
  GraduationCap, 
  BarChart3, 
  TrendingUp, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { toBng, bngMonths } from '../utils/banglaHelpers';
import { Student } from '../types';
import { getStudentTerms } from '../utils/studentTerms';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'motion/react';

const FEEG_LABELS: Record<string, string> = {
  tuition: 'বেতন (টিউশন)',
  food: 'খোরাকি (খাবার)',
  electricity: 'বিদ্যুৎ বিল',
  development: 'উন্নয়ন ফি',
  library: 'পাঠাগার ফি'
};

const CLASS_SCHEDULES = [
  { id: 1, name: 'ফজর পর পিরিয়ড', time: '০৬:০০ - ০৭:৩০', startHour: 6, endHour: 7.5, subject: 'হিফজ ও নাজেরা সবক', teacher: 'হাফেজ ক্বারী সাহেব', category: 'হিফজ' },
  { id: 2, name: 'সকাল ১ম পিরিয়ড', time: '০৮:৩০ - ১০:০০', startHour: 8.5, endHour: 10, subject: 'দাওরায়ে হাদিস ও মিশকাত', teacher: 'মুহাদ্দিস সাহেব', category: 'কিতাব' },
  { id: 3, name: 'সকাল ২য় পিরিয়ড', time: '১০:১৫ - ১১:৪৫', startHour: 10.25, endHour: 11.75, subject: 'হেদায়া ও শরহে বেকায়া (ফিকহ)', teacher: 'মুফতী সাহেব', category: 'ফিকহ' },
  { id: 4, name: 'যোহর পর পিরিয়ড', time: '০২:০০ - ০৩:৩০', startHour: 14, endHour: 15.5, subject: 'কাফিয়া ও শরহে জামী (নাহু/সরফ)', teacher: 'উস্তাদ মাওলানা', category: 'নাহু-সরফ' },
  { id: 5, name: 'আসর পর পিরিয়ড', time: '০৪:৪৫ - ০৫:৩০', startHour: 16.75, endHour: 17.5, subject: 'মশক ও তাজবীদুল কুরআন', teacher: 'ক্বারী সাহেব', category: 'তাজবীদ' },
  { id: 6, name: 'মাগরিব পর পিরিয়ড', time: '০৬:১৫ - ০৮:০০', startHour: 18.25, endHour: 20, subject: 'মুতালা\'আ ও বিশেষ তালিম', teacher: 'তত্ত্বাবধায়ক উস্তাদ', category: 'তালিম' }
];

type TopicType = 'overview' | 'students' | 'finance' | 'routine';

const DASHBOARD_TOPICS = [
  { id: 'overview' as TopicType, label: 'সার্বিক সারসংক্ষেপ', icon: LayoutDashboard },
  { id: 'students' as TopicType, label: 'জামাতভিত্তিক শিক্ষার্থী', icon: Users },
  { id: 'finance' as TopicType, label: 'ফি আদায় ও বকেয়া', icon: Banknote },
  { id: 'routine' as TopicType, label: 'ক্লাস রুটিন ও সময়সূচি', icon: Calendar }
];

function RollingNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: "some" });
  
  const spring = useSpring(0, {
    stiffness: 70,
    damping: 15,
    bounce: 0
  });

  const display = useTransform(spring, (current) => toBng(Math.round(current)));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    } else {
      spring.jump(0);
    }
  }, [isInView, value, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function Home({ onEdit, onNavigate }: { onEdit?: (id: string) => void, onNavigate?: (page: string) => void }) {
  const { students, settings } = useStudents();
  const terms = getStudentTerms(settings.studentGender);
  const [modalData, setModalData] = useState<{ title: string; students: any[]; showDetails?: boolean } | null>(null);
  
  // Topic-based radio button state
  const [activeTopic, setActiveTopic] = useState<TopicType>('overview');

  // Current time decimal tracker
  const [currentHourDecimal] = useState(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  });

  const stats = useMemo(() => {
    const approvedStudents = students.filter(s => s.status !== 'pending');
    const totalStudents = approvedStudents.length;
    
    // Dates
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const todayStr = currentDate.toISOString().slice(0, 10);
    
    // Admissions this month
    const admissionsThisMonth = approvedStudents.filter(s => {
      if (!s.admissionDate) return false;
      const adDate = new Date(s.admissionDate);
      return adDate.getMonth() === currentMonth && adDate.getFullYear() === currentYear;
    });

    // Students by Jamat
    const studentsByJamat: Record<string, any[]> = {};
    approvedStudents.forEach(s => {
      const jamat = s.admissionClass || 'সাধারণ';
      if (!studentsByJamat[jamat]) studentsByJamat[jamat] = [];
      studentsByJamat[jamat].push(s);
    });

    // Today's collections & Category totals
    let todayCollectedAmount = 0;
    let todayTransactionsCount = 0;
    let totalAllCollections = 0;
    const categoryTotals: Record<string, number> = {
      tuition: 0,
      food: 0,
      electricity: 0,
      development: 0,
      library: 0
    };

    approvedStudents.forEach(s => {
      (s.payments || []).forEach((p: any) => {
        const amt = Number(p.amount) || 0;
        totalAllCollections += amt;
        
        const pDate = p.date ? p.date.slice(0, 10) : '';
        if (pDate === todayStr) {
          todayCollectedAmount += amt;
          todayTransactionsCount += 1;
        }

        const cat = p.feeCategory || 'tuition';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      });
    });

    // Pending fee collections for current month
    const currentBngMonth = bngMonths[currentMonth];
    const pendingByFee: Record<string, any[]> = {};

    approvedStudents.forEach(s => {
      if (!s.fees) return;
      Object.entries(s.fees).forEach(([key, feeItemUnknown]) => {
        const feeItem = feeItemUnknown as any;
        if (!feeItem || !feeItem.applicable) return;
        
        const payments = s.payments || [];
        let isPending = false;
        
        if (feeItem.type === 'one-time') {
          isPending = !payments.some(p => p.feeCategory === key);
        } else if (feeItem.type === 'monthly') {
          isPending = !payments.some(p => p.feeCategory === key && p.month === currentBngMonth);
        } else if (feeItem.type === 'installment') {
          isPending = !payments.some(p => p.feeCategory === key);
        }

        if (isPending) {
          if (!pendingByFee[key]) pendingByFee[key] = [];
          pendingByFee[key].push(s);
        }
      });
    });

    return {
      total: totalStudents,
      totalAdmissions: admissionsThisMonth.length,
      todayCollectedAmount,
      todayTransactionsCount,
      totalAllCollections,
      categoryTotals,
      studentsByJamat,
      pendingByFee
    };
  }, [students]);

  const handleStudentClick = (id: string) => {
    setModalData(null);
    if (onEdit) onEdit(id);
  };

  // Sorted Jamat entries for chart
  const jamatChartData = useMemo(() => {
    const entries = Object.entries(stats.studentsByJamat).map(([jamat, listUnknown]) => {
      const list = listUnknown as Student[];
      return {
        name: jamat,
        count: list.length,
        percentage: stats.total > 0 ? Math.round((list.length / stats.total) * 100) : 0,
        students: list
      };
    });
    return entries.sort((a, b) => b.count - a.count);
  }, [stats.studentsByJamat, stats.total]);

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>ড্যাশবোর্ড</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {settings.madrasaName || 'মাদরাসা'} - বিষয়ভিত্তিক তথ্য ও সার্বিক চিত্র
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('fee-collection')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Banknote className="w-4 h-4" />
              <span>বেতন ও ফি সংগ্রহ</span>
            </button>
          )}
        </div>
      </div>

      {/* Topic-Based Radio Button Bar (বিষয় ভিত্তিক রেডিও বাটন) */}
      <div className="bg-white dark:bg-[#0f2119] p-3 sm:p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
          <span>বিষয়ভিত্তিক ফিল্টার:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label="ড্যাশবোর্ড বিষয়">
          {DASHBOARD_TOPICS.map((topic) => {
            const isSelected = activeTopic === topic.id;
            return (
              <label
                key={topic.id}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-xs'
                    : 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="dashboardTopic"
                  value={topic.id}
                  checked={isSelected}
                  onChange={() => setActiveTopic(topic.id)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 accent-emerald-600"
                />
                <div className="flex items-center gap-1.5 min-w-0">
                  <topic.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`} />
                  <span className={`text-xs sm:text-sm truncate ${isSelected ? 'text-emerald-950 dark:text-emerald-200 font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                    {topic.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Content Section based on selected Radio Button Topic */}
      <div className="transition-all duration-200">
        
        {/* ==================== 1. সার্বিক সারসংক্ষেপ (Overview) ==================== */}
        {activeTopic === 'overview' && (
          <div className="space-y-6">
            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Total Students */}
              <div 
                onClick={() => setActiveTopic('students')}
                className="bg-white dark:bg-[#0f2119] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-blue-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">মোট {terms.title}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <RollingNumber value={stats.total} />
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">জন</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                  <span>জামাতভিত্তিক তালিকা দেখুন</span>
                  <span>&rarr;</span>
                </div>
              </div>

              {/* Today's Collection */}
              <div 
                onClick={() => setActiveTopic('finance')}
                className="bg-white dark:bg-[#0f2119] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-emerald-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">আজকের ফি আদায়</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <Banknote className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">৳</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <RollingNumber value={stats.todayCollectedAmount} />
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>{toBng(stats.todayTransactionsCount)} টি রসিদ সংগৃহীত</span>
                  <span>&rarr;</span>
                </div>
              </div>

              {/* Monthly Admissions */}
              <div 
                onClick={() => onNavigate && onNavigate('admission')}
                className="bg-white dark:bg-[#0f2119] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-purple-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">চলতি মাসে ভর্তি</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <RollingNumber value={stats.totalAdmissions} />
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">জন শিক্ষার্থী</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                  <span>নতুন ভর্তি ফরম</span>
                  <span>+</span>
                </div>
              </div>

              {/* Class Schedule Period */}
              <div 
                onClick={() => setActiveTopic('routine')}
                className="bg-white dark:bg-[#0f2119] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-amber-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">দৈনিক ক্লাস রুটিন</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {toBng(CLASS_SCHEDULES.length)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">টি নিয়মিত পিরিয়ড</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                  <span>সময়সূচি দেখুন</span>
                  <span>&rarr;</span>
                </div>
              </div>

            </div>

            {/* Quick Overview Summary Banner */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm sm:text-base">
                    মাদরাসা সার্বিক হিসাব ও কার্যক্রম সচল রয়েছে
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    নির্দিষ্ট বিষয় সম্পর্কে বিস্তারিত দেখতে উপরের রেডিও বাটনগুলো ব্যবহার করুন।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTopic('students')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 transition"
                >
                  শিক্ষার্থী বিন্যাস
                </button>
                <button
                  onClick={() => setActiveTopic('finance')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  ফি ও আদায়
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. জামাতভিত্তিক শিক্ষার্থী (Students by Jamat) ==================== */}
        {activeTopic === 'students' && (
          <div className="bg-white dark:bg-[#0f2119] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                    জামাতভিত্তিক শিক্ষার্থী বিন্যাস (ভিজ্যুয়াল চার্ট)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    প্রতিটি জামাতের শিক্ষার্থী সংখ্যা ও শতকরা হারের চিত্র (তালিকায় ক্লিক করে ছাত্রদের নাম দেখুন)
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                সর্বমোট শিক্ষার্থী: {toBng(stats.total)} জন
              </span>
            </div>

            {/* Visual Bars for Jamat */}
            <div className="space-y-4 pt-1">
              {jamatChartData.length > 0 ? (
                jamatChartData.map((item, idx) => {
                  const colors = [
                    'from-emerald-500 to-teal-600',
                    'from-blue-500 to-indigo-600',
                    'from-cyan-500 to-blue-600',
                    'from-amber-500 to-orange-600',
                    'from-purple-500 to-pink-600',
                    'from-rose-500 to-red-600'
                  ];
                  const barGradient = colors[idx % colors.length];

                  return (
                    <div 
                      key={item.name}
                      onClick={() => setModalData({ title: `মোট ${terms.title} - ${item.name}`, students: item.students })}
                      className="group cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:border-emerald-200 dark:hover:border-emerald-800/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all"
                    >
                      <div className="flex justify-between items-center text-xs sm:text-sm font-medium mb-2">
                        <span className="text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-bold flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                          <span>{item.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {toBng(item.percentage)}%
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full text-xs">
                            {toBng(item.count)} জন
                          </span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(item.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 3. ফি আদায় ও বকেয়া (Finance & Dues) ==================== */}
        {activeTopic === 'finance' && (
          <div className="space-y-6">
            {/* Top Row: Today's collection and Total all time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#0f2119] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold block mb-1">আজকের মোট আদায়</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-emerald-600">৳</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <RollingNumber value={stats.todayCollectedAmount} />
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  আজকে সংগৃহীত মোট রসিদ: {toBng(stats.todayTransactionsCount)} টি
                </p>
              </div>

              <div className="bg-white dark:bg-[#0f2119] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold block mb-1">সর্বমোট আদায় (চলতি শিক্ষাবর্ষ)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-emerald-600">৳</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    <RollingNumber value={stats.totalAllCollections} />
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  সকল খাতের সমন্বিত পেমেন্ট রেকর্ড
                </p>
              </div>
            </div>

            {/* Category-wise Breakdown */}
            <div className="bg-white dark:bg-[#0f2119] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                  ফি খাতভিত্তিক আদায় বণ্টন
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(FEEG_LABELS).map(([catKey, catLabel]) => {
                  const amount = stats.categoryTotals[catKey] || 0;
                  return (
                    <div key={catKey} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block truncate font-medium">
                        {catLabel}
                      </span>
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1 block">
                        ৳ {toBng(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Dues Section */}
            <div className="bg-white dark:bg-[#0f2119] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileClock className="w-5 h-5 text-rose-600" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                      চলতি মাসের বকেয়া বিষয়সমূহ
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      কোন কোন খাতে কাদের ফি বাকি আছে (ক্লিক করে বিস্তারিত দেখুন)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                  মোট {toBng(Object.keys(stats.pendingByFee).reduce((acc, k) => acc + (stats.pendingByFee[k] as Student[]).length, 0))} জন
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(FEEG_LABELS).map(([feeKey, label]) => {
                  const list = (stats.pendingByFee[feeKey] || []) as Student[];
                  return (
                    <div 
                      key={feeKey} 
                      className="cursor-pointer bg-gray-50 dark:bg-gray-800/40 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors"
                      onClick={() => setModalData({ title: `বকেয়া - ${label}`, students: list, showDetails: true })}
                    >
                      <span className="text-xs text-gray-600 dark:text-gray-400 block truncate font-medium">
                        {label}
                      </span>
                      <span className="text-sm font-bold text-rose-500 dark:text-rose-400 mt-1 block">
                        {toBng(list.length)} জন
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. ক্লাস রুটিন ও সময়সূচি (Routine & Schedules) ==================== */}
        {activeTopic === 'routine' && (
          <div className="bg-white dark:bg-[#0f2119] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                    দৈনিক ক্লাস রুটিন ও সময়সূচি
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    মাদরাসার নির্ধারিত দৈনিক পাঠদান পর্যায়ক্রম ও শিক্ষক তালিকা
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
                আজকের নির্ধারিত সূচি
              </span>
            </div>

            {/* Schedule List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CLASS_SCHEDULES.map((period) => {
                const isRunning = currentHourDecimal >= period.startHour && currentHourDecimal < period.endHour;
                const isUpcoming = currentHourDecimal < period.startHour;

                return (
                  <div 
                    key={period.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isRunning 
                        ? 'bg-emerald-50/70 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 shadow-xs' 
                        : 'bg-gray-50/80 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                          {period.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {period.category}
                        </span>
                      </div>
                      
                      {isRunning ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 animate-pulse">
                          <span>চলমান</span>
                        </span>
                      ) : isUpcoming ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          আসন্ন
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal text-gray-400">
                          সম্পন্ন
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                      {period.subject}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{period.time}</span>
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {period.teacher}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Button for Admission */}
      <button 
        onClick={() => onNavigate && onNavigate('admission')}
        className="fixed bottom-8 right-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 z-40 group flex items-center justify-center print:hidden"
        title="নতুন ভর্তি"
      >
        <UserPlus className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 ease-in-out font-kalpurush font-medium text-base pl-0 group-hover:pl-2">
          নতুন ভর্তি
        </span>
      </button>

      {/* Modal for Student List */}
      <AnimatePresence>
        {modalData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#11241c] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{modalData.title}</h3>
                <button onClick={() => setModalData(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-2 flex-1">
                {modalData.students.length > 0 ? (
                  modalData.students.map(st => (
                    <div 
                      key={st.id} 
                      onClick={() => handleStudentClick(st.id)}
                      className="group bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all"
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{st.name}</div>
                        {modalData.showDetails && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-2">
                            <span>দাখেলা: {toBng(st.id)}</span>
                            <span>&bull;</span>
                            <span>জামাত: {st.admissionClass || 'অনির্ধারিত'}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    কোনো শিক্ষার্থীর তথ্য নেই
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
