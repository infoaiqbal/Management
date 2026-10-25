import React from 'react';
import { MadrasaSettings, Student } from '../types';
import { toBng, formatBanglaDateTime, generateMemoNumber, numberToBanglaWords } from '../utils/banglaHelpers';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export interface ReceiptItem {
  sl: number;
  description: string;
  month?: string;
  days?: number;
  installment?: string;
  amount: number;
  quantity?: number | string;
}

interface PrintReceiptProps {
  title?: string;
  student: Student;
  items: ReceiptItem[];
  settings: MadrasaSettings;
  date?: string;
  memoNumber?: string;
  paymentMethod?: string;
}

const generateBarcodePattern = (seed: string): boolean[] => {
  const pattern: boolean[] = [true, false, true, true];
  for (let i = 0; i < seed.length; i++) {
    const charCode = seed.charCodeAt(i);
    pattern.push(charCode % 2 === 0);
    pattern.push(true);
    pattern.push(charCode % 3 === 0);
    pattern.push(charCode % 5 === 0);
    pattern.push(false);
    pattern.push(true);
  }
  pattern.push(true, false, true);
  return pattern;
};

export const PrintReceipt: React.FC<PrintReceiptProps> = ({ 
  title = 'বেতন রশিদ', 
  student, 
  items, 
  settings, 
  date, 
  memoNumber: customMemoNumber,
  paymentMethod = 'CASH / নগদ'
}) => {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const formattedDateTime = formatBanglaDateTime(date || new Date().toISOString());
  const memoNumber = customMemoNumber || generateMemoNumber(student.id + (date || ''));
  const barcodePattern = generateBarcodePattern(memoNumber);

  const address = student.presentAddress;
  const addressParts = [address?.village, address?.postOffice, address?.thana, address?.district].filter(Boolean);
  const addressStr = addressParts.join(', ');

  return (
    <div 
      id="digital-receipt-printable" 
      className="hidden print:block font-kalpurush bg-white text-gray-900 border border-gray-300 rounded-2xl p-6 mx-auto"
      style={{
        width: '105mm',
        minHeight: '148mm',
        boxSizing: 'border-box',
        pageBreakInside: 'avoid',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#111827'
      }}
    >
      {/* Header */}
      <div className="text-center">
        {settings.headerType === 'header_photo' && settings.headerPhoto ? (
          <div className="mb-2 text-center w-full">
            <img src={settings.headerPhoto} alt="Header" className="w-full h-auto object-contain max-h-20 mx-auto" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {settings.madrasaLogo ? (
              <img src={settings.madrasaLogo} alt="Logo" className="w-12 h-12 object-cover rounded-full mx-auto mb-1 border border-emerald-100" />
            ) : (
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1 border border-emerald-200">
                <BookOpen className="w-5 h-5 text-emerald-700" />
              </div>
            )}
            <h1 className="text-lg font-bold text-emerald-950 leading-tight">
              {settings.madrasaName || 'জামিয়া আরাবিয়া মাদরাসা'}
            </h1>
            <p className="text-[11px] text-gray-600 mt-0.5">জ্ঞানের আলো ছড়ানোর বিশ্বস্ত প্ল্যাটফর্ম</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{settings.address || 'বাংলাদেশ'}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">মোবাইল: {toBng(student.guardianMobile || student.murubbiMobile || '০১৭১২-৩৪৫৬৭৮')}</p>
          </div>
        )}

        {/* Title Badge */}
        <div className="flex justify-center mt-2">
          <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {title}
          </span>
        </div>
      </div>

      <div className="border-b-2 border-gray-800 my-3" />

      {/* Meta */}
      <div className="flex justify-between items-start text-[11px]">
        <div>
          <span className="text-gray-500 block text-[10px]">মেমো নম্বর</span>
          <span className="font-bold text-gray-900">{memoNumber}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500 block text-[10px]">তারিখ ও সময়</span>
          <span className="font-bold text-gray-900">{formattedDateTime}</span>
        </div>
      </div>

      {/* Student Details */}
      <div className="mt-3 pt-2 border-t border-gray-100 text-[11px]">
        <span className="text-gray-500 block text-[10px] font-medium">শিক্ষার্থীর তথ্য</span>
        <div className="text-sm font-bold text-gray-950 leading-tight">{student.name}</div>
        <div className="text-gray-600">{toBng(student.guardianMobile || student.murubbiMobile || '০১৭০০-০০০০০০')}</div>
        <div className="text-gray-500">
          জামাত: {student.admissionClass || 'উল্লেখ নেই'} • দাখেলা: {toBng(student.id)}
        </div>
        {addressStr && <div className="text-gray-500">ঠিকানা: {addressStr}</div>}
      </div>

      {/* Items Table */}
      <div className="mt-3 pt-2 border-t border-gray-100 text-[11px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-gray-700 font-bold pb-1">
              <th className="text-left pb-1">ফি</th>
              <th className="text-center pb-1">মাস</th>
              <th className="text-right pb-1">মোট</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => {
              const monthText = item.month 
                ? (item.days && item.days < 30 && !item.month.includes('দিন') 
                    ? `${item.month} (${toBng(item.days)} দিন)` 
                    : item.month)
                : (item.installment || 'এককালীন');

              return (
                <tr key={idx} className="py-1">
                  <td className="py-1 text-left">
                    <div className="font-bold text-gray-950">{item.description}</div>
                  </td>
                  <td className="py-1 text-center">
                    <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {monthText}
                    </span>
                  </td>
                  <td className="py-1 text-right font-bold">৳ {toBng(item.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Subtotal & Total */}
        <div className="border-t border-gray-200 mt-2 pt-1.5 space-y-1">
          <div className="flex justify-between items-center text-gray-600">
            <span>উপমোট (Subtotal):</span>
            <span className="font-semibold text-gray-800">৳ {toBng(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-gray-950 border-t border-gray-200 pt-1">
            <span>সর্বমোট পরিশোধিত:</span>
            <span className="text-emerald-800 font-bold">৳ {toBng(totalAmount)}</span>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 mt-1 italic">
          কথায়: {numberToBanglaWords(totalAmount)} টাকা মাত্র।
        </div>
      </div>

      {/* Paid Status Box */}
      <div className="mt-3 p-2 bg-emerald-50/80 border border-emerald-300 rounded-lg text-center">
        <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>পরিশোধিত (PAID) - {paymentMethod}</span>
        </div>
        <p className="text-[10px] text-emerald-900 font-medium mt-0.5">
          অনুগ্রহ করে রশিদটি যত্নসহকারে সংরক্ষণ করুন।
        </p>
      </div>

      {/* Barcode Graphic at Bottom */}
      <div className="mt-3 pt-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-[2px] h-7 max-w-[200px] w-full px-2">
          {barcodePattern.map((bar, i) => (
            <span
              key={i}
              className={`h-full ${
                bar ? 'w-[2px] bg-black' : 'w-[1px] bg-transparent'
              }`}
            />
          ))}
        </div>
        <span className="text-[9px] text-gray-500 mt-0.5 tracking-wider uppercase font-mono">
          {memoNumber}
        </span>
      </div>

      {/* Signature */}
      {settings.signature && (
        <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-end">
          <div className="text-center">
            <img src={settings.signature} alt="Signature" className="h-7 object-contain mx-auto mb-0.5" />
            <span className="text-[9px] text-gray-500 border-t border-gray-300 pt-0.5 block px-2 font-medium">আদায়কারীর স্বাক্ষর</span>
          </div>
        </div>
      )}
    </div>
  );
};

