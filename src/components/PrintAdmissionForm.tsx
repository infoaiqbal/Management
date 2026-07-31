import React from 'react';
import { Student, Settings } from '../types';
import { PrintHeader } from './PrintHeader';
import { getStudentTerms } from '../utils/studentTerms';

interface Props {
  student: Partial<Student>;
  settings: Settings;
  isNew: boolean;
}

export const PrintAdmissionForm: React.FC<Props> = ({ student, settings, isNew }) => {
  const gender = settings.studentGender === 'both' ? (student.gender === 'girl' ? 'girls' : 'boys') : settings.studentGender;
  const terms = getStudentTerms(gender);

  return (
    <div className="w-full text-black bg-white">
      <PrintHeader settings={settings} title={`ভর্তি ফরম`} />
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase underline decoration-double">{terms.singular} ভর্তি ফরম</h2>
        <p className="mt-1 font-medium">{isNew ? 'নতুন ভর্তি' : 'পুরাতন ভর্তি (নবায়ন)'}</p>
      </div>

      <div className="border border-gray-400 p-4 rounded-sm space-y-4 text-sm font-medium">
        <div className="flex justify-between border-b border-gray-300 pb-2">
          <span><strong>দাখেলা নাম্বার:</strong> {student.id}</span>
          <span><strong>ভর্তির বিভাগ:</strong> {student.admissionSection}</span>
          <span><strong>জামাত:</strong> {student.admissionClass}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><strong>নাম:</strong> {student.name}</div>
          <div><strong>রক্তের গ্রুপ:</strong> {student.bloodGroup || '-'}</div>
          <div><strong>জন্ম তারিখ:</strong> {student.dob}</div>
          <div><strong>হাফেজ:</strong> {student.isHafiz ? 'হ্যাঁ' : 'না'}</div>
          <div><strong>পিতার নাম:</strong> {student.fatherName}</div>
          <div><strong>পেশা:</strong> {student.fatherOccupation || '-'}</div>
          <div><strong>মাতার নাম:</strong> {student.motherName || '-'}</div>
          <div><strong>প্রকার:</strong> {student.studentType || 'আবাসিক'}</div>
        </div>

        <div className="border-t border-gray-300 pt-3">
          <strong>বর্তমান ঠিকানা:</strong> {student.presentAddress?.village}, {student.presentAddress?.postOffice}, {student.presentAddress?.thana}, {student.presentAddress?.district}
        </div>
        <div>
          <strong>স্থায়ী ঠিকানা:</strong> {student.permanentAddress?.village}, {student.permanentAddress?.postOffice}, {student.permanentAddress?.thana}, {student.permanentAddress?.district}
        </div>

        <div className="border-t border-gray-300 pt-3 grid grid-cols-2 gap-4">
          <div><strong>অভিভাবকের নাম:</strong> {student.guardianName || '-'}</div>
          <div><strong>সম্পর্ক:</strong> {student.guardianRelation || '-'}</div>
          <div><strong>মোবাইল:</strong> {student.guardianMobile || '-'}</div>
          <div><strong>পেশা:</strong> {student.guardianOccupation || '-'}</div>
        </div>

        <div className="border-t border-gray-300 pt-3">
          <strong>পূর্ববর্তী প্রতিষ্ঠানের নাম:</strong> {student.prevInstitutionName || '-'}
        </div>
        <div>
          <strong>পঠিত জামাত:</strong> {student.prevInstitutionStudied || '-'}
        </div>
      </div>

      <div className="mt-6">
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 w-1/3 font-bold">{isNew ? 'ভর্তি পরীক্ষার ফলাফল:' : 'বার্ষিক পরীক্ষার ফলাফল:'}</td>
              <td className="border border-gray-400 p-2 w-2/3"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 w-1/3 font-bold">বেশভূষা (وضع قطع):</td>
              <td className="border border-gray-400 p-2 w-2/3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 italic font-medium leading-relaxed">
        <p>মুহতারাম,</p>
        <p className="mt-2 text-justify">
          আমি অত্র মাদ্রাসার সমস্ত নিয়মকানুন পড়ে, বুঝে-শুনে এবং তা মানতে প্রতিজ্ঞাবদ্ধ হয়ে এখানে ভর্তি হওয়ার সুযোগ কামনা করছি।
        </p>
      </div>

      <div className="mt-20 flex justify-end">
        <div className="text-center">
          <div className="border-t border-gray-800 w-48 mx-auto"></div>
          <p className="mt-2 font-bold">মুহতামিমের স্বাক্ষর</p>
        </div>
      </div>
    </div>
  );
};

export default PrintAdmissionForm;
