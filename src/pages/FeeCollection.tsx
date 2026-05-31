import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { toBng, toEng, bngMonths, bngInstallments } from '../utils/banglaHelpers';
import { FeeItem, Fees } from '../types';
import CustomSelect from '../components/CustomSelect';

/**
 * ==========================================
 * বেতন গ্রহণ (Fee Collection)
 * ==========================================
 */
export default function FeeCollection() {
  const { students, updateStudent, showAlert, showConfirm } = useStudents();
  
  const [searchId, setSearchId] = useState('');
  const [activeStudent, setActiveStudent] = useState<any>(null);

  const handleSearch = () => {
    const st = students.find(s => s.id === searchId || toEng(s.id) === toEng(searchId));
    if (st) {
      setActiveStudent(st);
    } else {
      showAlert('এই নাম্বারে কোনো ছাত্র পাওয়া যায়নি!', 'warning');
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
    setActiveStudent(updatedStudent);
    showAlert('পেমেন্ট গ্রহণ সম্পন্ন হয়েছে!', 'success');
  };

  const handleUndoPayment = (paymentId: string) => {
    if (!activeStudent) return;
    showConfirm('আপনি কি নিশ্চিত যে এই পেমেন্টটি বাতিল করতে চান?', async () => {
      const updatedStudent = {
        ...activeStudent,
        payments: activeStudent.payments.filter((p: any) => p.id !== paymentId)
      };
      await updateStudent(updatedStudent);
      setActiveStudent(updatedStudent);
      showAlert('পেমেন্ট বাতিল করা হয়েছে!', 'info');
    });
  };

  const inputClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100";
  
  const renderPaymentRow = (feeKey: keyof Fees, label: string) => {
    const feeItem: FeeItem = activeStudent.fees[feeKey];
    if (!feeItem || !feeItem.applicable) return null;

    const payments = activeStudent.payments || [];
    
    if (feeItem.type === 'one-time') {
      const paymentRecord = payments.find((p: any) => p.feeCategory === feeKey);
      return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md border border-gray-100 dark:border-gray-800" key={feeKey}>
          <div className="font-medium flex-1 text-gray-800 dark:text-gray-200">{label}</div>
          <div className="flex-1 text-gray-500">{toBng(feeItem.amount)} টাকা (এককালিন)</div>
          <div className="flex-1 print:hidden flex items-center justify-end md:justify-start gap-2">
            {paymentRecord ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">পরিশোধিত</span>
                <button onClick={() => handleUndoPayment(paymentRecord.id)} className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors ml-2">ফেরত</button>
              </>
            ) : (
              <button onClick={() => handlePayment(feeKey, feeItem.amount)} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 transition">গ্রহণ করুন</button>
            )}
          </div>
          <div className="hidden print:block flex-1 text-right">
            {paymentRecord ? <span className="text-black font-medium">পরিশোধিত</span> : <span className="text-black">অপরিশোধিত</span>}
          </div>
        </div>
      );
    }

    if (feeItem.type === 'monthly') {
      return <MonthlyPaymentRow key={feeKey} feeKey={feeKey} label={label} feeItem={feeItem} payments={payments} onPay={handlePayment} onUndo={handleUndoPayment} />;
    }

    if (feeItem.type === 'installment') {
      return <InstallmentPaymentRow key={feeKey} feeKey={feeKey} label={label} feeItem={feeItem} payments={payments} onPay={handlePayment} onUndo={handleUndoPayment} />;
    }
    
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 print:hidden transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-emerald-500/30 pb-2">বেতন ও ফি সংগ্রহ</h2>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-sm">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা নাম্বার দিয়ে খুঁজুন</label>
            <input 
              type="tel" 
              value={searchId} 
              onChange={e => setSearchId(e.target.value)} 
              className={inputClass}
              placeholder="দাখেলা নাম্বার..."
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 pb-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow shadow-emerald-500/20">
            খুঁজুন
          </button>
        </div>
      </div>

      {activeStudent && (
        <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-all">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">নাম</div>
              <div className="font-semibold text-lg text-gray-800 dark:text-gray-200 print:text-black">{activeStudent.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">জামাত</div>
              <div className="font-semibold text-lg text-gray-800 dark:text-gray-200 print:text-black">{activeStudent.admissionClass || 'উল্লেখ নেই'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">বিভাগ</div>
              <div className="font-semibold text-lg text-gray-800 dark:text-gray-200 print:text-black">{activeStudent.admissionSection}</div>
            </div>
            <div className="flex justify-end items-start print:hidden">
              <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center gap-2 shadow shadow-gray-500/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                প্রিন্ট রসিদ
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-lg text-emerald-700 dark:text-emerald-400 border-b border-emerald-100 dark:border-gray-700 pb-2">নির্ধারিত পেমেন্ট সমূহ</h3>
            
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
const MonthlyPaymentRow = ({ feeKey, label, feeItem, payments, onPay, onUndo }: any) => {
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(bngMonths[currentMonthIdx]);
  const [daysCount, setDaysCount] = useState<number>(30); // Default 30 days
  
  const paymentRecord = payments.find((p: any) => p.feeCategory === feeKey && p.month === selectedMonth);
  const isPaidMonth = !!paymentRecord;

  // Calculate dynamic amount based on days
  const dynamicAmount = Math.round((feeItem.amount / 30) * daysCount);

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md border border-gray-100 dark:border-gray-800">
      <div className="font-medium text-gray-800 dark:text-gray-200 xl:w-48">{label}</div>
      <div className="flex-1 flex flex-wrap gap-4 xl:gap-8 items-center xl:justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">মাস:</span>
          <CustomSelect 
            className="p-1 px-2 border-b-2 border-dashed border-gray-400 bg-transparent dark:text-white dark:bg-gray-800"
            value={selectedMonth}
            onChange={val => {
              setSelectedMonth(val);
              setDaysCount(30); // reset days for new month
            }}
            options={bngMonths.map(m => ({ value: m, label: m }))}
          />
        </div>
        
        {!isPaidMonth && (
           <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">দিন:</span>
            <input 
              type="number" 
              className="w-16 p-1 border-b-2 border-dashed border-gray-400 bg-transparent text-center dark:text-white focus:outline-none focus:border-emerald-500"
              value={daysCount}
              min={1}
              max={30}
              onChange={(e) => {
                let v = parseInt(e.target.value) || 0;
                if (v > 30) v = 30;
                if (v < 0) v = 0;
                setDaysCount(v);
              }}
            />
            <span className="text-sm text-gray-500">/ ৩০</span>
          </div>
        )}

        <div className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
          {isPaidMonth ? `পরিশোধিত: ${toBng(paymentRecord.amount)} টাকা` : `মোট: ${toBng(dynamicAmount)} টাকা`}
        </div>
      </div>

      <div className="xl:w-48 print:hidden flex items-center xl:justify-end gap-2">
        {isPaidMonth ? (
          <>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-full text-sm">পরিশোধিত</span>
            <button onClick={() => onUndo(paymentRecord.id)} className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors">ফেরত</button>
          </>
        ) : (
          <button 
            onClick={() => onPay(feeKey, dynamicAmount, selectedMonth)} 
            disabled={dynamicAmount <= 0}
            className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 transition hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            গ্রহণ করুন
          </button>
        )}
      </div>
      <div className="hidden print:block flex-1 text-right">
        {isPaidMonth ? <span className="text-black font-medium">পরিশোধিত</span> : <span className="text-black">অপরিশোধিত</span>}
      </div>
    </div>
  );
}

const InstallmentPaymentRow = ({ feeKey, label, feeItem, payments, onPay, onUndo }: any) => {
  const [selectedInst, setSelectedInst] = useState(bngInstallments[0]);
  
  const paymentRecord = payments.find((p: any) => p.feeCategory === feeKey && p.installment === selectedInst);
  const isPaidInst = !!paymentRecord;

  // Thirded amount logic for installment fee
  const installmentAmount = Math.round(feeItem.amount / 3);

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md border border-gray-100 dark:border-gray-800">
      <div className="font-medium text-gray-800 dark:text-gray-200 xl:w-48">{label}</div>
      <div className="flex-1 flex gap-4 xl:gap-8 items-center xl:justify-center">
        <CustomSelect 
          className="p-1 px-2 border-b-2 border-dashed border-gray-400 bg-transparent dark:text-white dark:bg-gray-800"
          value={selectedInst}
          onChange={val => setSelectedInst(val)}
          options={bngInstallments.map(m => ({ value: m, label: `${m} কিস্তি` }))}
        />
        <div className="text-gray-600 dark:text-gray-300 font-medium">
          {isPaidInst ? `পরিশোধিত: ${toBng(paymentRecord.amount)} টাকা` : `পরিমাণ: ${toBng(installmentAmount)} টাকা`}
        </div>
      </div>
      <div className="xl:w-48 print:hidden flex items-center xl:justify-end gap-2">
        {isPaidInst ? (
          <>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-full text-sm">পরিশোধিত</span>
            <button onClick={() => onUndo(paymentRecord.id)} className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors">ফেরত</button>
          </>
        ) : (
          <button 
            onClick={() => onPay(feeKey, installmentAmount, undefined, selectedInst)} 
            className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-200 transition hover:shadow-md"
          >
            গ্রহণ করুন
          </button>
        )}
      </div>
      <div className="hidden print:block flex-1 text-right">
        {isPaidInst ? <span className="text-black font-medium">পরিশোধিত</span> : <span className="text-black">অপরিশোধিত</span>}
      </div>
    </div>
  );
}

