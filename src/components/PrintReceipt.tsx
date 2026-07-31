import React from 'react';
import { MadrasaSettings, Student } from '../types';
import { toBng, numberToBanglaWords } from '../utils/banglaHelpers';
import { getStudentTerms } from '../utils/studentTerms';

export interface ReceiptItem {
  sl: number;
  description: string;
  month: string;
  amount: number;
}

interface PrintReceiptProps {
  title: string;
  student: Student;
  items: ReceiptItem[];
  settings: MadrasaSettings;
  date: string;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({ title, student, items, settings, date }) => {
  const terms = getStudentTerms(settings.studentGender);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="hidden print:block font-kalpurush" style={{
      width: '105mm', // A4 Quarter (approx A6) width
      height: '148mm', // A4 Quarter height
      padding: '10mm',
      border: '1px solid #ccc',
      boxSizing: 'border-box',
      pageBreakInside: 'avoid',
      position: 'relative',
      margin: '0 auto auto 0', // Top left corner
      background: 'white',
      color: 'black'
    }}>
      {/* Header */}
      {settings.headerType === 'header_photo' && settings.headerPhoto ? (
        <div className="mb-2 text-center w-full">
          <img src={settings.headerPhoto} alt="Header" className="w-full h-auto object-contain max-h-24" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center mb-2">
          {settings.madrasaLogo && (
            <img src={settings.madrasaLogo} alt="Logo" className="w-12 h-12 object-cover rounded-full mb-1" />
          )}
          <div>
            <h1 className="text-xl font-bold text-black leading-tight">{settings.madrasaName}</h1>
            <p className="text-xs text-black">{settings.address}</p>
          </div>
        </div>
      )}
      
      {/* Title & Date */}
      <div className="relative mb-2 mt-2">
        <h2 className="text-lg font-bold text-center w-full">{title}</h2>
        <div className="text-sm absolute right-0 top-0 mt-1">তারিখ: {toBng(new Date(date).toLocaleDateString('en-GB'))}</div>
      </div>
      
      <hr className="border-black mb-3" />
      
      {/* Student Details */}
      <div className="text-sm mb-4 space-y-1">
        <div className="flex justify-between gap-4">
          <div><strong>দাখেলা:</strong> {toBng(student.id)}</div>
        </div>
        <div className="flex justify-between gap-4">
          <div><strong>নাম:</strong> {student.name}</div>
          <div className="text-right"><strong>জামাত:</strong> {student.admissionClass}</div>
        </div>
        <div>
          <strong>ঠিকানা:</strong> {student.presentAddress?.village}, {student.presentAddress?.thana}, {student.presentAddress?.district}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr>
            <th className="border border-black px-1 py-1 text-center w-10">ক্রমিক</th>
            <th className="border border-black px-1 py-1 text-left">বিবরণ</th>
            <th className="border border-black px-1 py-1 text-center">মাস</th>
            <th className="border border-black px-1 py-1 text-right">টাকা</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black px-1 py-1 text-center">{toBng(item.sl)}</td>
              <td className="border border-black px-1 py-1 text-left">{item.description}</td>
              <td className="border border-black px-1 py-1 text-center">{item.month}</td>
              <td className="border border-black px-1 py-1 text-right">{toBng(item.amount)}/-</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} className="border border-black px-1 py-1 text-right font-bold">মোট:</td>
            <td className="border border-black px-1 py-1 text-right font-bold">{toBng(totalAmount)}/-</td>
          </tr>
        </tbody>
      </table>

      {/* In Words */}
      <div className="text-sm mb-8">
        <strong>কথায়:</strong> {numberToBanglaWords(totalAmount)} টাকা মাত্র।
      </div>

      {/* Footer / Signature */}
      <div className="absolute bottom-4 right-4 text-right">
        {settings.signature && (
          <img src={settings.signature} alt="Signature" className="h-10 object-contain ml-auto mb-1" />
        )}
        <div className="border-t border-black inline-block pt-1 text-sm font-bold w-24 text-center">
          আদায়কারী
        </div>
      </div>
    </div>
  );
};
