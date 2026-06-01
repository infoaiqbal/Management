import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { Users, UserPlus, FileClock, X } from 'lucide-react';
import { toBng, bngMonths } from '../utils/banglaHelpers';
import { Student } from '../types';
import { getStudentTerms } from '../utils/studentTerms';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'motion/react';

const FEEG_LABELS: Record<string, string> = {
  food: 'খোরাকি',
  electricity: 'বিদ্যুৎ বিল',
  tuition: 'বেতন',
  development: 'উন্নয়ন ফি',
  library: 'পাঠাগার ফি'
};

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

  const stats = useMemo(() => {
    const totalStudents = students.length;
    
    // Active admissions this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const admissionsThisMonth = students.filter(s => {
      if (!s.admissionDate) return false;
      const adDate = new Date(s.admissionDate);
      return adDate.getMonth() === currentMonth && adDate.getFullYear() === currentYear;
    });

    const studentsByJamat: Record<string, any[]> = {};
    students.forEach(s => {
      const jamat = s.admissionClass || 'অনির্ধারিত';
      if (!studentsByJamat[jamat]) studentsByJamat[jamat] = [];
      studentsByJamat[jamat].push(s);
    });

    const admissionsByJamat: Record<string, any[]> = {};
    admissionsThisMonth.forEach(s => {
      const jamat = s.admissionClass || 'অনির্ধারিত';
      if (!admissionsByJamat[jamat]) admissionsByJamat[jamat] = [];
      admissionsByJamat[jamat].push(s);
    });

    // Pending fee collections
    const currentBngMonth = bngMonths[currentMonth];
    const pendingByFee: Record<string, any[]> = {};

    students.forEach(s => {
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
      studentsByJamat,
      admissionsByJamat,
      pendingByFee
    };
  }, [students]);

  const handleStudentClick = (id: string) => {
    setModalData(null);
    if (onEdit) onEdit(id);
  };

  return (
    <div className="w-full space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ড্যাশবোর্ড</h2>
        <p className="text-gray-500 dark:text-gray-400">মাদ্রাসার সার্বিক বিষয়ের সারসংক্ষেপ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Students Box */}
        <div className="bg-white dark:bg-[#0f2119] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium text-lg">মোট {terms.title}</h3>
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100"><RollingNumber value={stats.total} /></span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">জন</span>
          </div>
          
          {/* 2 columns for Jamat count */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
            {Object.entries(stats.studentsByJamat).map(([jamat, listUnknown]) => {
              const list = listUnknown as Student[];
              return (
              <div 
                key={jamat} 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded transition-colors"
                onClick={() => setModalData({ title: `মোট ${terms.title} - ${jamat}`, students: list })}
              >
                <span className="text-gray-600 dark:text-gray-400">{jamat}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{toBng(list.length)} জন</span>
              </div>
            )})}
          </div>
        </div>

        {/* Admissions This Month Box */}
        <div className="bg-white dark:bg-[#0f2119] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium text-lg">চলতি মাসে ভর্তি</h3>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100"><RollingNumber value={stats.totalAdmissions} /></span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">জন</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
            {Object.entries(stats.admissionsByJamat).length > 0 ? (
              Object.entries(stats.admissionsByJamat).map(([jamat, listUnknown]) => {
                const list = listUnknown as Student[];
                return (
                <div 
                  key={jamat} 
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded transition-colors"
                  onClick={() => setModalData({ title: `চলতি মাসে ভর্তি - ${jamat}`, students: list })}
                >
                  <span className="text-gray-600 dark:text-gray-400">{jamat}:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{toBng(list.length)} জন</span>
                </div>
              )})
            ) : (
              <div className="col-span-2 text-gray-400 dark:text-gray-500 text-center py-2">চলতি মাসে কেউ ভর্তি হয়নি</div>
            )}
          </div>
        </div>

        {/* Pending Fees Box */}
        <div className="bg-white dark:bg-[#0f2119] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 font-medium text-lg">বকেয়া (চলতি মাস)</h3>
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center">
              <FileClock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-800 dark:text-gray-100"><RollingNumber value={Object.keys(stats.pendingByFee).reduce((acc, k) => acc + (stats.pendingByFee[k] as Student[]).length, 0)} /></span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">টি বিষয়</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
            {Object.entries(stats.pendingByFee).length > 0 ? (
              Object.entries(stats.pendingByFee).map(([feeKey, listUnknown]) => {
                const list = listUnknown as Student[];
                return (
                <div 
                  key={feeKey} 
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded transition-colors"
                  onClick={() => setModalData({ title: `বকেয়া - ${FEEG_LABELS[feeKey] || feeKey}`, students: list, showDetails: true })}
                >
                  <span className="text-gray-600 dark:text-gray-400">{FEEG_LABELS[feeKey] || feeKey}:</span>
                  <span className="font-semibold text-rose-500 dark:text-rose-400">{toBng(list.length)} জন</span>
                </div>
              )})
            ) : (
              <div className="col-span-2 text-gray-400 dark:text-gray-500 text-center py-2">কোনো বকেয়া নেই</div>
            )}
          </div>
        </div>
      </div>

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
                {modalData.students.map(st => (
                  <div 
                    key={st.id} 
                    onClick={() => handleStudentClick(st.id)}
                    className="group bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all"
                  >
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{st.name}</div>
                      {modalData.showDetails && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-2">
                          <span>দাখেলা: {st.id}</span>
                          <span>&bull;</span>
                          <span>জামাত: {st.admissionClass || 'অনির্ধারিত'}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
