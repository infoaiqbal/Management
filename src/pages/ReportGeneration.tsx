import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { getStudentTerms } from '../utils/studentTerms';
import { toBng } from '../utils/banglaHelpers';
import { Printer } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

/**
 * ==========================================
 * তালিকা তৈরি (Report Generation)
 * ==========================================
 * PDF প্রিন্ট এর জন্য।
 */
export default function ReportGeneration() {
  const { students, settings } = useStudents();
  const terms = getStudentTerms(settings.studentGender);
  
  const [reportType, setReportType] = useState('studentList');
  const [filterClass, setFilterClass] = useState('');
  const [filterAddressKey, setFilterAddressKey] = useState('');

  const classList = Array.from(new Set(students.map(s => s.admissionClass).filter(Boolean))) as string[];

  const handlePrint = () => {
    window.print();
  };

  // Filter students based on selection
  let finalData = students;
  if (filterClass) {
    finalData = finalData.filter(s => s.admissionClass === filterClass);
  }
  
  if (reportType === 'hafizList') {
    finalData = finalData.filter(s => s.isHafiz);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 
        =================
        কন্ট্রোল প্যানেল (Control Panel) - স্ক্রিন অনলি (Hide on Print) 
        =================
      */}
      <div className="bg-white dark:bg-[#0f2119] p-6 rounded-lg shadow-sm print:hidden">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-emerald-500 pb-2">রিপোর্ট ও তালিকা তৈরি</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">তালিকার ধরন</label>
            <CustomSelect 
              value={reportType} 
              onChange={val => setReportType(val)}
              className="w-full p-2 bg-transparent border-b-2 border-dashed border-gray-400 dark:border-gray-600 focus:border-emerald-500 outline-none text-gray-900 dark:text-gray-100"
              options={[
                { value: 'studentList', label: `সাধারণ ${terms.singular} তালিকা` },
                { value: 'hafizList', label: 'হাফেজদের তালিকা' },
                { value: 'bloodGroup', label: 'রক্তের গ্রুপ তালিকা' },
                { value: 'mobileList', label: 'অভিভাবকের মোবাইল নম্বর' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">জামাত ফিল্টার</label>
            <CustomSelect 
              value={filterClass} 
              onChange={val => setFilterClass(val)}
              className="w-full p-2 bg-transparent border-b-2 border-dashed border-gray-400 dark:border-gray-600 focus:border-emerald-500 outline-none text-gray-900 dark:text-gray-100"
              options={[
                { value: '', label: 'সকল জামাত' },
                ...classList.map(c => ({ value: c, label: c }))
              ]}
            />
          </div>
          <div className="flex items-end">
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 pb-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors w-full justify-center">
              <Printer size={18} /> প্রিন্ট / PDF সংরক্ষণ
            </button>
          </div>
        </div>
      </div>

      {/* 
        =================
        প্রিন্ট এরিয়া (Print View Area)
        =================
      */}
      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none print:p-0 dark:bg-[#0f2119] print:dark:bg-white print:text-black">
        <div className="text-center mb-8">
          {settings.madrasaLogo && (
            <img src={settings.madrasaLogo} alt={settings.madrasaName} className="h-16 mx-auto mb-2 object-contain" />
          )}
          <h1 className="text-2xl font-bold dark:text-gray-100 print:text-black mb-2">{settings.madrasaName || 'মাদরাসা বায়তুল উলুম'}</h1>
          <h2 className="text-lg font-semibold border-b-2 border-gray-300 inline-block pb-1 dark:text-gray-200 print:text-gray-800">
            {reportType === 'studentList' && `${terms.singular} তালিকা`}
            {reportType === 'hafizList' && `হিফজ সম্পন্ন ${terms.plural_der} তালিকা`}
            {reportType === 'bloodGroup' && 'রক্তের গ্রুপ অনুযায়ী তালিকা'}
            {reportType === 'mobileList' && 'অভিভাবকের যোগাযোগ তালিকা'}
            {filterClass && ` (জামাত: ${filterClass})`}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300 dark:border-gray-700 print:border-gray-400">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800/50 print:bg-gray-100 font-semibold text-gray-700 dark:text-gray-300 print:text-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 w-16 text-center">ক্রমিক</th>
                <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">দাখেলা</th>
                <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">নাম</th>
                {!filterClass && <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">জামাত</th>}
                
                {/* Dynamic Columns based on Report Type */}
                {reportType === 'bloodGroup' && <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 text-center">রক্তের গ্রুপ</th>}
                {reportType === 'mobileList' && <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মোবাইল নম্বর</th>}
                {reportType === 'studentList' && <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">গ্রাম</th>}
              </tr>
            </thead>
            <tbody>
              {finalData.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 print:hover:bg-transparent dark:text-gray-200 print:text-black">
                  <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 text-center">{toBng(idx + 1)}</td>
                  <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.id}</td>
                  <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.name}</td>
                  {!filterClass && <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.admissionClass || '-'}</td>}
                  
                  {reportType === 'bloodGroup' && <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 text-center font-medium text-red-600 dark:text-red-400 print:text-black">{s.bloodGroup || '-'}</td>}
                  {reportType === 'mobileList' && <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.guardianMobile || s.murubbiMobile || '-'}</td>}
                  {reportType === 'studentList' && <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.permanentAddress.village || s.presentAddress.village || '-'}</td>}
                </tr>
              ))}
              {finalData.length === 0 && (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">কোনো তথ্য পাওয়া যায়নি</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer for print */}
        <div className="hidden print:block mt-16 flex justify-between pr-8">
          <div></div>
          <div className="border-t-2 border-gray-800 pt-2 px-8 font-semibold">
            স্বাক্ষর
          </div>
        </div>
      </div>
    </div>
  );
}

