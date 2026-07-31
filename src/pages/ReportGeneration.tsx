import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { getStudentTerms } from '../utils/studentTerms';
import { toBng } from '../utils/banglaHelpers';
import { PrintHeader } from '../components/PrintHeader';
import { Printer } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function ReportGeneration() {
  const { students, settings } = useStudents();
  const terms = getStudentTerms(settings.studentGender);
  
  const [reportType, setReportType] = useState('studentList');
  const [filterClass, setFilterClass] = useState('');

  const classList = Array.from(new Set(students.map(s => s.admissionClass).filter(Boolean))) as string[];

  const handlePrint = () => {
    window.print();
  };

  // Filter students based on selection (only approved students)
  let finalData = students.filter(s => s.status !== 'pending');
  if (filterClass) {
    finalData = finalData.filter(s => s.admissionClass === filterClass);
  }
  
  if (reportType === 'hafizList') {
    finalData = finalData.filter(s => s.isHafiz);
  }
  if (reportType === 'zakatList') {
    finalData = finalData.filter(s => s.wantsZakat);
  }

  const getReportTitle = () => {
    switch(reportType) {
      case 'studentList': return `সাধারণ ${terms.singular} তালিকা`;
      case 'hafizList': return `হিফজ সম্পন্ন ${terms.plural_der} তালিকা`;
      case 'bloodGroup': return 'রক্তের গ্রুপ অনুযায়ী তালিকা';
      case 'guardianContact': return 'অভিভাবকের যোগাযোগ তালিকা';
      case 'murubbiContact': return 'মুরব্বির যোগাযোগ তালিকা';
      case 'addressList': return 'ঠিকানা তালিকা';
      case 'prevInstitution': return 'পূর্ববর্তী প্রতিষ্ঠানের তালিকা';
      case 'zakatList': return 'যাকাত ফান্ডের তালিকা';
      case 'fullInfo': return 'পূর্ণাঙ্গ প্রোফাইল তালিকা';
      default: return `${terms.singular} তালিকা`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
                { value: 'guardianContact', label: 'অভিভাবকের যোগাযোগ' },
                { value: 'murubbiContact', label: 'মুরব্বির যোগাযোগ' },
                { value: 'addressList', label: 'ঠিকানা তালিকা' },
                { value: 'prevInstitution', label: 'পূর্ববর্তী প্রতিষ্ঠানের তালিকা' },
                { value: 'zakatList', label: 'যাকাত ফান্ডের তালিকা' },
                { value: 'fullInfo', label: 'সকল তথ্য (সংক্ষিপ্ত)' }
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

      <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none print:p-0 dark:bg-[#0f2119] print:dark:bg-white print:text-black">
        <PrintHeader 
          settings={settings} 
          title={getReportTitle()}
          subtitle={filterClass ? `জামাত: ${filterClass}` : undefined}
        />
        
        <div className="text-center mb-8 print:hidden relative">
          {settings.madrasaLogo && (
            <img src={settings.madrasaLogo} alt={settings.madrasaName} className="h-16 mx-auto mb-2 object-contain" />
          )}
          <h1 className="text-2xl font-bold dark:text-gray-100 mb-2">{settings.madrasaName || 'মাদ্রাসা ম্যানেজমেন্ট'}</h1>
          <h2 className="text-lg font-semibold dark:text-gray-200">
            {getReportTitle()}
          </h2>
          {filterClass && (
            <h3 className="text-md font-semibold dark:text-gray-300 mt-1">
              জামাত: {filterClass}
            </h3>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300 dark:border-gray-700 print:border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800/50 print:bg-gray-100 font-semibold text-gray-700 dark:text-gray-300 print:text-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 w-16 text-center">ক্রমিক</th>
                <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">দাখেলা</th>
                <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">নাম</th>
                {!filterClass && <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">জামাত</th>}
                
                {reportType === 'studentList' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">পিতার নাম</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">গ্রাম</th>
                  </>
                )}
                {reportType === 'hafizList' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">পিতার নাম</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">বিভাগ</th>
                  </>
                )}
                {reportType === 'bloodGroup' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 text-center">রক্তের গ্রুপ</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মোবাইল নম্বর</th>
                  </>
                )}
                {reportType === 'guardianContact' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">অভিভাবকের নাম</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">সম্পর্ক</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মোবাইল নম্বর</th>
                  </>
                )}
                {reportType === 'murubbiContact' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মুরব্বির নাম</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মোবাইল নম্বর</th>
                  </>
                )}
                {reportType === 'addressList' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">বর্তমান ঠিকানা</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">স্থায়ী ঠিকানা</th>
                  </>
                )}
                {reportType === 'prevInstitution' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">প্রতিষ্ঠানের নাম</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">পঠিত জামাত</th>
                  </>
                )}
                {reportType === 'zakatList' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">পিতার নাম</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মোবাইল নম্বর</th>
                  </>
                )}
                {reportType === 'fullInfo' && (
                  <>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">পিতা</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">মাতা</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">জন্ম তারিখ</th>
                    <th className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">রক্ত</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {finalData.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 print:hover:bg-transparent dark:text-gray-200 print:text-black">
                  <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 text-center">{toBng(idx + 1)}</td>
                  <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.id}</td>
                  <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.name}</td>
                  {!filterClass && <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.admissionClass || '-'}</td>}
                  
                  {reportType === 'studentList' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.fatherName}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.permanentAddress?.village || s.presentAddress?.village || '-'}</td>
                    </>
                  )}
                  {reportType === 'hafizList' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.fatherName}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.admissionSection || '-'}</td>
                    </>
                  )}
                  {reportType === 'bloodGroup' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2 text-center font-medium text-red-600 dark:text-red-400 print:text-black">{s.bloodGroup || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.guardianMobile || s.murubbiMobile || '-'}</td>
                    </>
                  )}
                  {reportType === 'guardianContact' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.guardianName || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.guardianRelation || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.guardianMobile || '-'}</td>
                    </>
                  )}
                  {reportType === 'murubbiContact' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.murubbiName || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.murubbiMobile || '-'}</td>
                    </>
                  )}
                  {reportType === 'addressList' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">
                        {s.presentAddress ? `${s.presentAddress.village}, ${s.presentAddress.postOffice}, ${s.presentAddress.thana}, ${s.presentAddress.district}` : '-'}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">
                        {s.permanentAddress ? `${s.permanentAddress.village}, ${s.permanentAddress.postOffice}, ${s.permanentAddress.thana}, ${s.permanentAddress.district}` : '-'}
                      </td>
                    </>
                  )}
                  {reportType === 'prevInstitution' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.prevInstitutionName || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.prevInstitutionStudied || '-'}</td>
                    </>
                  )}
                  {reportType === 'zakatList' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.fatherName || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.guardianMobile || s.murubbiMobile || '-'}</td>
                    </>
                  )}
                  {reportType === 'fullInfo' && (
                    <>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.fatherName || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.motherName || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.dob || '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-700 print:border-gray-400 p-2">{s.bloodGroup || '-'}</td>
                    </>
                  )}
                </tr>
              ))}
              {finalData.length === 0 && (
                <tr><td colSpan={10} className="text-center p-4 text-gray-500">কোনো তথ্য পাওয়া যায়নি</td></tr>
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

