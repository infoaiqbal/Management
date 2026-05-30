import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { toBng, toEng, bngMonths, bngInstallments } from '../utils/banglaHelpers';
import { FeeItem, Fees } from '../types';
import CustomSelect from '../components/CustomSelect';

/**
 * ==========================================
 * বেতন গ্রহণ (Fee Collection)
 * ==========================================
 * এখানে দাখেলা নাম্বার ইনপুট দিলে প্রযোজ্য ফিস সমূহ পেমেন্ট করা যাবে।
 */
export default function FeeCollection() {
  const { students, updateStudent } = useStudents();
  
  const [searchId, setSearchId] = useState('');
  const [activeStudent, setActiveStudent] = useState<any>(null);

  const handleSearch = () => {
    // English number search (because id internally is bangla strings mapped)
    // Wait, the id is generated using toBng so it is a bangla string like '০০১'
    const st = students.find(s => s.id === searchId || toEng(s.id) === toEng(searchId));
    if (st) {
      setActiveStudent(st);
    } else {
      alert('এই নাম্বারে কোনো ছাত্র পাওয়া যায়নি!');
      setActiveStudent(null);
    }
  };

  const handlePayment = async (
    feeKey: keyof Fees, 
    amount: number, 
    month?: string, 
    installment?: string
  ) => {
    if (!activeStudent) return;
    
    const newPayment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      feeCategory: feeKey,
      amount,
      month,
      installment
    };

    const updatedStudent = {
      ...activeStudent,
      payments: [...(activeStudent.payments || []), newPayment]
    };

    await updateStudent(updatedStudent);
    setActiveStudent(updatedStudent); // Update local state to reflect UI instantly
    alert('পেমেন্ট গ্রহণ সম্পন্ন হয়েছে!');
  };

  // স্টাইল
  const inputClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100";
  const selectClass = "p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100 [&>option]:bg-white dark:[&>option]:bg-gray-800";

  const renderPaymentRow = (feeKey: keyof Fees, label: string) => {
    const feeItem: FeeItem = activeStudent.fees[feeKey];
    if (!feeItem || !feeItem.applicable) return null; // প্রযোজ্য না হলে আসবে না

    const payments = activeStudent.payments || [];
    
    // Check based on type
    if (feeItem.type === 'one-time') {
      const isPaid = payments.some((p: any) => p.feeCategory === feeKey);
      return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md border border-gray-100 dark:border-gray-800" key={feeKey}>
          <div className="font-medium flex-1">{label}</div>
          <div className="flex-1 text-gray-500">{toBng(feeItem.amount)} টাকা (এককালিন)</div>
          <div className="flex-1 print:hidden">
            {isPaid ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">পরিশোধ</span>
            ) : (
              <button onClick={() => handlePayment(feeKey, feeItem.amount)} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 transition">গ্রহণ করুন</button>
            )}
          </div>
          <div className="hidden print:block flex-1 text-right">
            {isPaid ? (
              <span className="text-black font-medium">পরিশোধিত</span>
            ) : (
              <span className="text-black">অপরিশোধিত</span>
            )}
          </div>
        </div>
      );
    }

    if (feeItem.type === 'monthly') {
      // Find current selected month. For simplicity, we just loop months or use a selector inside the row
      return <MonthlyPaymentRow key={feeKey} feeKey={feeKey} label={label} feeItem={feeItem} payments={payments} onPay={handlePayment} />;
    }

    if (feeItem.type === 'installment') {
      return <InstallmentPaymentRow key={feeKey} feeKey={feeKey} label={label} feeItem={feeItem} payments={payments} onPay={handlePayment} />;
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm print:hidden">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-emerald-500 pb-2">বেতন গ্রহণ প্যানেল</h2>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-sm">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা নাম্বার খুঁজুন</label>
            <input 
              type="tel" 
              value={searchId} 
              onChange={e => setSearchId(e.target.value)} 
              className={inputClass}
              placeholder="দাখেলা নাম্বার..."
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 pb-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors">
            খুঁজুন
          </button>
        </div>
      </div>

      {activeStudent && (
        <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
            <div>
              <div className="text-xs text-gray-500">নাম</div>
              <div className="font-medium text-gray-800 dark:text-gray-200 print:text-black">{activeStudent.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">জামাত</div>
              <div className="font-medium text-gray-800 dark:text-gray-200 print:text-black">{activeStudent.admissionClass || 'উল্লেখ নেই'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">বিভাগ</div>
              <div className="font-medium text-gray-800 dark:text-gray-200 print:text-black">{activeStudent.admissionSection}</div>
            </div>
            <div className="flex justify-end items-start print:hidden">
              <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                প্রিন্ট
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-emerald-700 dark:text-emerald-400 border-b border-gray-200 dark:border-gray-700 pb-2">নির্ধারিত পেমেন্ট সমূহ</h3>
            
            <div className="flex flex-col gap-3 mt-4">
              {renderPaymentRow('food', 'খোরাকি')}
              {renderPaymentRow('electricity', 'বিদ্যুৎ বিল')}
              {renderPaymentRow('tuition', 'বেতন')}
              {renderPaymentRow('development', 'উন্নয়ন ফি')}
              {renderPaymentRow('library', 'পাঠাগার ফি')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents to handle generic rows
const MonthlyPaymentRow = ({ feeKey, label, feeItem, payments, onPay }: any) => {
  const [selectedMonth, setSelectedMonth] = useState(bngMonths[new Date().getMonth()]);
  
  const isPaidMonth = payments.some((p: any) => p.feeCategory === feeKey && p.month === selectedMonth);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md border border-gray-100 dark:border-gray-800">
      <div className="font-medium flex-1">{label}</div>
      <div className="flex-1 flex gap-2 items-center">
        <CustomSelect 
          className="p-1 px-2 border-b-2 border-dashed border-gray-400 bg-transparent dark:text-white"
          value={selectedMonth}
          onChange={val => setSelectedMonth(val)}
          options={bngMonths.map(m => ({ value: m, label: m }))}
        />
        <span className="text-gray-500">মাস: {toBng(feeItem.amount)} টাকা</span>
      </div>
      <div className="flex-1 print:hidden">
        {isPaidMonth ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">পরিশোধ ({selectedMonth})</span>
        ) : (
          <button onClick={() => onPay(feeKey, feeItem.amount, selectedMonth)} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 transition">গ্রহণ করুন</button>
        )}
      </div>
      <div className="hidden print:block flex-1 text-right">
        {isPaidMonth ? (
          <span className="text-black font-medium">পরিশোধিত</span>
        ) : (
          <span className="text-black">অপরিশোধিত</span>
        )}
      </div>
    </div>
  );
}

const InstallmentPaymentRow = ({ feeKey, label, feeItem, payments, onPay }: any) => {
  const [selectedInst, setSelectedInst] = useState(bngInstallments[0]);
  
  const isPaidInst = payments.some((p: any) => p.feeCategory === feeKey && p.installment === selectedInst);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md border border-gray-100 dark:border-gray-800">
      <div className="font-medium flex-1">{label}</div>
      <div className="flex-1 flex gap-2 items-center">
        <CustomSelect 
          className="p-1 px-2 border-b-2 border-dashed border-gray-400 bg-transparent dark:text-white"
          value={selectedInst}
          onChange={val => setSelectedInst(val)}
          options={bngInstallments.map(m => ({ value: m, label: `${m} কিস্তি` }))}
        />
        <span className="text-gray-500">{toBng(feeItem.amount)} টাকা</span>
      </div>
      <div className="flex-1 print:hidden">
        {isPaidInst ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">পরিশোধ ({selectedInst})</span>
        ) : (
          <button onClick={() => onPay(feeKey, feeItem.amount, undefined, selectedInst)} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 transition">গ্রহণ করুন</button>
        )}
      </div>
      <div className="hidden print:block flex-1 text-right">
        {isPaidInst ? (
          <span className="text-black font-medium">পরিশোধিত</span>
        ) : (
          <span className="text-black">অপরিশোধিত</span>
        )}
      </div>
    </div>
  );
}

