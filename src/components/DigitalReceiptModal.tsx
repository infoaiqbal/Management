import React, { useRef } from 'react';
import { MadrasaSettings, Student } from '../types';
import { toBng, formatBanglaDateTime, generateMemoNumber, numberToBanglaWords } from '../utils/banglaHelpers';
import { Printer, X, CheckCircle2, Receipt, BookOpen } from 'lucide-react';

export interface ReceiptItem {
  sl: number;
  description: string;
  month?: string;
  installment?: string;
  amount: number;
  quantity?: number | string;
  unitPrice?: number;
}

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  student: Student;
  items: ReceiptItem[];
  settings: MadrasaSettings;
  date?: string;
  memoNumber?: string;
  paymentMethod?: string;
}

// Deterministic barcode pattern generator based on seed string
const generateBarcodePattern = (seed: string): boolean[] => {
  const pattern: boolean[] = [true, false, true, true]; // Guard bar
  for (let i = 0; i < seed.length; i++) {
    const charCode = seed.charCodeAt(i);
    pattern.push((charCode % 2 === 0));
    pattern.push(true);
    pattern.push((charCode % 3 === 0));
    pattern.push((charCode % 5 === 0));
    pattern.push(false);
    pattern.push(true);
  }
  pattern.push(true, false, true); // End bar
  return pattern;
};

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  title = 'ক্যাশ মেমো / ইনভয়েস',
  student,
  items,
  settings,
  date,
  memoNumber: customMemoNumber,
  paymentMethod = 'CASH / নগদ'
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const formattedDateTime = formatBanglaDateTime(date || new Date().toISOString());
  
  // Create consistent memo number
  const memoNumber = customMemoNumber || generateMemoNumber(student.id + (date || ''));
  const barcodePattern = generateBarcodePattern(memoNumber);

  const address = student.presentAddress;
  const addressParts = [address?.village, address?.postOffice, address?.thana, address?.district].filter(Boolean);
  const addressStr = addressParts.join(', ');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Outer Modal Container */}
      <div className="w-full max-w-lg bg-[#0e1726] rounded-2xl shadow-2xl border border-gray-700/60 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:w-full print:max-w-none">
        
        {/* Modal Top Header (Screen Only, matches user screenshot) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#142337] border-b border-gray-700/50 print:hidden shrink-0">
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm sm:text-base">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>অফিসিয়াল ডিজিটাল ক্যাশ মেমো (Receipt)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট মেমো</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Area */}
        <div className="p-3 sm:p-6 overflow-y-auto print:p-0 print:overflow-visible">
          
          {/* Printable Digital Receipt Card (Identical to reference screenshot) */}
          <div 
            id="digital-receipt-printable"
            ref={receiptRef}
            className="bg-white text-gray-900 rounded-2xl p-5 sm:p-8 shadow-md border border-gray-200/80 mx-auto max-w-md w-full relative font-kalpurush print:border-none print:shadow-none print:max-w-full print:w-full print:p-4"
          >
            {/* Header: Institution Logo & Name */}
            <div className="text-center">
              {settings.headerType === 'header_photo' && settings.headerPhoto ? (
                <div className="mb-3 text-center w-full">
                  <img src={settings.headerPhoto} alt="Header" className="w-full h-auto object-contain max-h-24 mx-auto rounded" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {settings.madrasaLogo ? (
                    <img 
                      src={settings.madrasaLogo} 
                      alt="Logo" 
                      className="w-14 h-14 object-cover rounded-full mx-auto mb-2 border border-emerald-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                      <BookOpen className="w-6 h-6 text-emerald-700" />
                    </div>
                  )}
                  
                  <h1 className="text-xl sm:text-2xl font-bold text-emerald-950 leading-tight">
                    {settings.madrasaName || 'জামিয়া আরাবিয়া মাদরাসা'}
                  </h1>
                  
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    জ্ঞানের আলো ছড়ানোর বিশ্বস্ত প্ল্যাটফর্ম
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-0.5">
                    {settings.address || 'বাংলাদেশ'}
                  </p>
                  
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    মোবাইল: {toBng(student.guardianMobile || student.murubbiMobile || '০১৭১২-৩৪৫৬৭৮')}
                    {settings.adminName ? ` • অ্যাডমিন: ${settings.adminName}` : ''}
                  </p>
                </div>
              )}

              {/* Title Pill Badge */}
              <div className="flex justify-center mt-3">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {title}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b-2 border-gray-800 my-4" />

            {/* Meta Row: Memo Number & Date/Time */}
            <div className="flex justify-between items-start text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 block text-[11px]">মেমো নম্বর</span>
                <span className="font-bold text-gray-900 tracking-wide">{memoNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[11px]">তারিখ ও সময়</span>
                <span className="font-bold text-gray-900">{formattedDateTime}</span>
              </div>
            </div>

            {/* Customer / Student Info */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-gray-500 block text-[11px] font-medium">গ্রাহকের তথ্য</span>
              <div className="text-base font-bold text-gray-950 mt-0.5 leading-tight">
                {student.name}
              </div>
              <div className="text-xs text-gray-600 mt-0.5 font-medium">
                {toBng(student.guardianMobile || student.murubbiMobile || '০১৭০০-০০০০০০')}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                জামাত: {student.admissionClass || 'উল্লেখ নেই'} • দাখেলা: {toBng(student.id)} • বিভাগ: {student.admissionSection || 'সাধারণ'}
              </div>
              {addressStr && (
                <div className="text-xs text-gray-500 mt-0.5">
                  ঠিকানা: {addressStr}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700 font-bold pb-2">
                    <th className="text-left pb-2 font-bold text-gray-800">বইয়ের বিবরণ / ফি</th>
                    <th className="text-center pb-2 font-bold text-gray-800">শেলফ / মাস</th>
                    <th className="text-center pb-2 font-bold text-gray-800">পরিমাণ</th>
                    <th className="text-right pb-2 font-bold text-gray-800">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="py-2.5">
                      <td className="py-2 text-left">
                        <div className="font-bold text-gray-950">{item.description}</div>
                        <div className="text-[11px] text-gray-500">
                          ৳ {toBng(item.amount)} প্রতি কিস্তি/মাস
                        </div>
                      </td>
                      <td className="py-2 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          {item.month || item.installment || 'নির্ধারিত'}
                        </span>
                      </td>
                      <td className="py-2 text-center font-medium text-gray-700">
                        {toBng(item.quantity || 1)}
                      </td>
                      <td className="py-2 text-right font-bold text-gray-950">
                        ৳ {toBng(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal & Total */}
              <div className="border-t border-gray-200 mt-3 pt-2 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>উপমোট (Subtotal):</span>
                  <span className="font-semibold text-gray-800">৳ {toBng(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base font-bold text-gray-950 border-t border-gray-200 pt-1.5">
                  <span>সর্বমোট পরিশোধিত:</span>
                  <span className="text-emerald-800 text-base sm:text-lg font-bold">৳ {toBng(totalAmount)}</span>
                </div>
              </div>

              {/* In Words */}
              <div className="text-[11px] text-gray-500 mt-1 italic">
                কথায়: {numberToBanglaWords(totalAmount)} টাকা মাত্র।
              </div>
            </div>

            {/* Paid Status Box (Highlight from Screenshot) */}
            <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>পরিশোধিত (PAID) - {paymentMethod}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                ক্যাশ কাউন্টার রসিদ • পরিবর্তনযোগ্য (৭ দিনের মধ্যে মেমোসহ)
              </p>
            </div>

            {/* Barcode Graphic at Bottom (Screenshot match) */}
            <div className="mt-4 pt-1 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-[2px] h-9 max-w-[240px] w-full px-2">
                {barcodePattern.map((bar, i) => (
                  <span
                    key={i}
                    className={`h-full ${
                      bar ? 'w-[2px] bg-black' : 'w-[1px] bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] text-gray-400 mt-1 tracking-wider uppercase font-mono">
                {memoNumber}
              </span>
            </div>

            {/* Authorized Signature if available */}
            {settings.signature && (
              <div className="mt-4 pt-2 border-t border-dashed border-gray-200 flex justify-end">
                <div className="text-center">
                  <img src={settings.signature} alt="Signature" className="h-8 object-contain mx-auto mb-0.5" />
                  <span className="text-[10px] text-gray-500 border-t border-gray-300 pt-0.5 block px-2 font-medium">আদায়কারীর স্বাক্ষর</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer (Screen Only) */}
        <div className="px-6 py-3 bg-[#142337] border-t border-gray-700/50 flex justify-end gap-3 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs sm:text-sm transition-colors"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট মেমো</span>
          </button>
        </div>

      </div>
    </div>
  );
};
