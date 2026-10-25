import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { getStudentTerms } from '../utils/studentTerms';
import { toBng, toEng, generateMemoNumber } from '../utils/banglaHelpers';
import { FeeItem, Fees } from '../types';
import { DigitalReceiptModal, ReceiptItem } from '../components/DigitalReceiptModal';
import { Receipt } from 'lucide-react';

/**
 * ==========================================
 * তথ্য খুঁজুন (Search Information)
 * ==========================================
 * একজন ছাত্রের পূর্ণাঙ্গ প্রোফাইল এবং পেমেন্ট সামারি দেখা যাবে।
 */
export default function SearchInfo() {
  const { students, settings, showAlert } = useStudents();
  const terms = getStudentTerms(settings.studentGender);
  const [searchId, setSearchId] = useState('');
  const [student, setStudent] = useState<any>(null);

  const handleSearch = () => {
    const st = students.find(s => 
      s.status !== 'pending' && (
      s.id === searchId || 
      toEng(s.id) === toEng(searchId) || 
      s.guardianMobile === searchId || 
      toEng(s.guardianMobile || '') === toEng(searchId) ||
      s.murubbiMobile === searchId ||
      toEng(s.murubbiMobile || '') === toEng(searchId))
    );
    if (st) {
      setStudent(st);
    } else {
      showAlert(`এই নাম্বার বা দাখেলায় কোনো অনুমোদিত ${terms.singular} পাওয়া যায়নি!`, 'warning');
      setStudent(null);
    }
  };

  const inputClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm font-kalpurush">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-emerald-500 pb-2">{terms.singular_er} পূর্ণাঙ্গ প্রোফাইল</h2>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-sm">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা বা মোবাইল নাম্বার দিয়ে খুঁজুন</label>
            <input 
              type="tel" 
              value={searchId} 
              onChange={e => setSearchId(e.target.value)} 
              className={inputClass}
              placeholder="এখানে লিখুন..."
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 pb-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors">
            খুঁজুন
          </button>
        </div>
      </div>

      {student && <StudentProfile student={student} settings={settings} />}
    </div>
  );
}

function StudentProfile({ student, settings }: { student: any, settings: any }) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptDate, setReceiptDate] = useState<string>('');
  const [receiptMemo, setReceiptMemo] = useState<string>('');

  const catLabels: Record<string, string> = { 
    admission: 'ভর্তি ফি', 
    food: 'খোরাকি', 
    electricity: 'বিদ্যুৎ বিল', 
    tuition: 'মাসিক বেতন', 
    development: 'উন্নয়ন ফি', 
    library: 'পাঠাগার ফি' 
  };

  const openFullReceipt = () => {
    const payments = student.payments || [];
    if (payments.length === 0) return;
    const items: ReceiptItem[] = payments.map((p: any, idx: number) => ({
      sl: idx + 1,
      description: catLabels[p.feeCategory] || p.feeCategory,
      month: p.month,
      installment: p.installment ? `${p.installment} কিস্তি` : undefined,
      amount: p.amount,
      quantity: 1
    }));
    setReceiptItems(items);
    setReceiptDate(new Date().toISOString());
    setReceiptMemo(generateMemoNumber(student.id + Date.now().toString()));
    setIsReceiptOpen(true);
  };

  const openSingleReceipt = (payment: any) => {
    const items: ReceiptItem[] = [{
      sl: 1,
      description: catLabels[payment.feeCategory] || payment.feeCategory,
      month: payment.month,
      installment: payment.installment ? `${payment.installment} কিস্তি` : undefined,
      amount: payment.amount,
      quantity: 1
    }];
    setReceiptItems(items);
    setReceiptDate(payment.date || new Date().toISOString());
    setReceiptMemo(generateMemoNumber(payment.id || student.id));
    setIsReceiptOpen(true);
  };

  // সহায়ক ফাংশন ফর লেবেল রেন্ডারিং (Helper for info rows)
  const InfoRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex py-2 border-b border-dashed border-gray-200 dark:border-gray-800 last:border-0">
      <span className="w-1/3 text-gray-500 dark:text-gray-400 font-medium">{label}:</span>
      <span className="w-2/3 text-gray-900 dark:text-gray-100">{value || '-'}</span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-300 font-kalpurush">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-400">{student.name}</h1>
          <div className="text-emerald-600 dark:text-emerald-500 mt-2 font-medium">দাখেলা নাম্বার: {toBng(student.id)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0 text-sm">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-emerald-50 dark:border-gray-700">
            <span className="text-gray-500 block text-xs">জামাত</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{student.admissionClass}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-emerald-50 dark:border-gray-700">
            <span className="text-gray-500 block text-xs">বিভাগ</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{student.admissionSection}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Personal details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">ব্যক্তিগত তথ্য</h3>
          <InfoRow label="জন্ম তারিখ" value={student.dob} />
          <InfoRow label="জন্ম নিবন্ধন" value={student.nid} />
          <InfoRow label="রক্তের গ্রুপ" value={student.bloodGroup} />
          <InfoRow label="হাফেজ" value={student.isHafiz ? 'হ্যাঁ' : 'না'} />
          <InfoRow label="পিতার নাম" value={student.fatherName} />
          <InfoRow label="মাতার নাম" value={student.motherName} />
        </section>

        {/* Address */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">ঠিকানা</h3>
          <div className="mb-4">
            <div className="text-sm text-gray-500 font-bold mb-1">বর্তমান ঠিকানা:</div>
            <div className="text-gray-800 dark:text-gray-200">
              {student.presentAddress?.village}, {student.presentAddress?.postOffice}, {student.presentAddress?.thana}, {student.presentAddress?.district}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 font-bold mb-1">স্থায়ী ঠিকানা:</div>
            <div className="text-gray-800 dark:text-gray-200">
              {student.permanentAddress?.village}, {student.permanentAddress?.postOffice}, {student.permanentAddress?.thana}, {student.permanentAddress?.district}
            </div>
          </div>
        </section>

        {/* Guardian & Extras */}
        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">যোগাযোগ</h3>
            <InfoRow label="অভিভাবক" value={student.guardianName} />
            <InfoRow label="মোবাইল" value={toBng(student.guardianMobile)} />
            <InfoRow label="মুরুব্বির নাম" value={student.murubbiName} />
            <InfoRow label="মুরুব্বির মোবাইল" value={toBng(student.murubbiMobile)} />
          </div>

          {student.extraInfo && student.extraInfo.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">সংযুক্ত তথ্য</h3>
              {student.extraInfo.map((info: any, i: number) => (
                 <InfoRow key={i} label={info.name} value={info.value} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Payment Summary */}
      <section className="mt-8">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">বেতন ও পেমেন্ট রেকর্ড</h3>
          {student.payments && student.payments.length > 0 && (
            <button 
              onClick={openFullReceipt}
              className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition shadow-sm font-medium"
            >
              <Receipt size={14} />
              ডিজিটাল মেমো (সব পেমেন্ট)
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
          {(!student.payments || student.payments.length === 0) ? (
            <div className="text-gray-500 text-center py-4">কোনো পেমেন্ট রেকর্ড নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 text-sm">
                    <th className="py-2 pl-2">বিবরণ</th>
                    <th className="py-2">মাস/কিস্তি</th>
                    <th className="py-2 text-right pr-2">পরিমাণ</th>
                    <th className="py-2 text-right pr-2">ডিজিটাল রসিদ</th>
                  </tr>
                </thead>
                <tbody>
                  {student.payments.map((pay: any, idx: number) => {
                    return (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-white dark:hover:bg-gray-800/50 transition-colors text-gray-800 dark:text-gray-200">
                        <td className="py-3 pl-2 font-medium">{catLabels[pay.feeCategory] || pay.feeCategory}</td>
                        <td className="py-3 text-gray-500">{pay.month || (pay.installment ? `${pay.installment} কিস্তি` : '-')}</td>
                        <td className="py-3 text-right font-medium pr-2 text-emerald-600 dark:text-emerald-400">{toBng(pay.amount)} ৳</td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => openSingleReceipt(pay)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded border border-emerald-200 dark:border-emerald-800 transition font-medium"
                          >
                            <Receipt size={12} /> মেমো
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        student={student}
        items={receiptItems}
        settings={settings}
        date={receiptDate}
        memoNumber={receiptMemo}
      />

    </div>
  );
}


