import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { Pencil, Trash2 } from 'lucide-react';
import { toBng } from '../utils/banglaHelpers';
import { Student } from '../types';

/**
 * ==========================================
 * ফরম সমূহ (Form List)
 * ==========================================
 * ইতোপূর্বে যত ভর্তি ফরম পূরণ করা হয়েছে, সব এখানে শো করবে।
 */
export default function FormList({ onEdit }: { onEdit?: (id: string) => void }) {
  const { students, deleteStudent } = useStudents();
  
  if (students.length === 0) {
    return (
      <div className="w-full text-center py-20 text-gray-500">
        কোনো ভর্তি ফরম পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">সকল ভর্তি ফরম</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">মোট ছাত্র: {toBng(students.length)} জন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <StudentBox key={student.id} student={student} onDelete={deleteStudent} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

const StudentBox: React.FC<{ student: Student; onDelete: (id: string) => void; onEdit?: (id: string) => void }> = ({ student, onDelete, onEdit }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleDelete = async () => {
    await onDelete(student.id);
  };

  if (showConfirm) {
    return (
      <div className="bg-white dark:bg-[#0f2119] rounded-lg shadow-sm border border-red-200 dark:border-red-900/50 p-5 relative overflow-hidden flex flex-col justify-center items-center text-center space-y-4">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
        <p className="text-gray-800 dark:text-gray-200 font-medium">সত্যিই {student.name}-এর ডাটা মুছে ফেলতে চান?</p>
        <div className="flex gap-4">
          <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm">
            বাতিল
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium">
            মুছে ফেলুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f2119] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
            দাখেলা: {student.id}
          </span>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button onClick={() => onEdit(student.id)} className="text-gray-400 hover:text-blue-500 transition-colors" title="সম্পাদনা">
              <Pencil size={18} />
            </button>
          )}
          <button onClick={() => setShowConfirm(true)} className="text-gray-400 hover:text-red-500 transition-colors" title="মুছে ফেলুন">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">{student.name}</h3>
      
      <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-800 pb-1">
          <span>জামাত:</span>
          <span className="text-gray-900 dark:text-gray-200 font-medium">{student.admissionClass || '-'}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-800 pb-1">
          <span>বিভাগ:</span>
          <span className="text-gray-900 dark:text-gray-200">{student.admissionSection}</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-800 pb-1">
          <span>পিতার নাম:</span>
          <span className="text-gray-900 dark:text-gray-200 truncate max-w-[150px]">{student.fatherName}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span>রক্তের গ্রুপ:</span>
          <span className="font-medium text-red-500">{student.bloodGroup || '-'}</span>
        </div>
      </div>
    </div>
  );
}

