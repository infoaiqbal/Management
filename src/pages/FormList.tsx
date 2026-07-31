import React, { useState, useMemo } from 'react';
import { useStudents } from '../store/StudentContext';
import { getStudentTerms } from '../utils/studentTerms';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { toBng } from '../utils/banglaHelpers';
import { Student } from '../types';
import CustomSelect from '../components/CustomSelect';

export default function FormList({ onEdit, isPendingView = false }: { onEdit?: (id: string) => void, isPendingView?: boolean }) {
  const { students, settings, deleteStudent, updateStudent, showAlert } = useStudents();
  const terms = getStudentTerms(settings.studentGender);
  
  const [filterSort, setFilterSort] = useState('newest');
  const [filterClass, setFilterClass] = useState('');

  const filteredStudents = useMemo(() => {
    let list = students.filter(s => isPendingView ? s.status === 'pending' : (s.status !== 'pending'));
    
    if (filterClass) {
      list = list.filter(s => s.admissionClass === filterClass);
    }
    
    list.sort((a, b) => {
      const dateA = new Date(a.admissionDate || 0).getTime();
      const dateB = new Date(b.admissionDate || 0).getTime();
      if (filterSort === 'newest') return dateB - dateA;
      if (filterSort === 'oldest') return dateA - dateB;
      return 0;
    });
    
    return list;
  }, [students, isPendingView, filterSort, filterClass]);

  const uniqueClasses = Array.from(new Set(students.map(s => s.admissionClass).filter(Boolean)));

  const handleApprove = async (student: Student) => {
    const updated = { ...student, status: 'approved' as const };
    await updateStudent(updated);
    showAlert(`${student.name}-এর ভর্তি এপ্রুভ হয়েছে!`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {isPendingView ? 'পেন্ডিং ভর্তি ফরম' : 'সকল ভর্তি ফরম'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">মোট {terms.title}: {toBng(filteredStudents.length)} জন</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto md:min-w-[350px]">
          <div className="flex-1 md:w-48">
            <CustomSelect
              value={filterClass}
              onChange={setFilterClass}
              options={[
                { value: '', label: 'সব জামাত' },
                ...uniqueClasses.map(cls => ({ value: cls, label: cls }))
              ]}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0f2119] text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex-1 md:w-48">
            <CustomSelect
              value={filterSort}
              onChange={setFilterSort}
              options={[
                { value: 'newest', label: 'সবচেয়ে নতুন' },
                { value: 'oldest', label: 'সবচেয়ে পুরাতন' }
              ]}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#0f2119] text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="w-full text-center py-20 text-gray-500">
          কোনো ভর্তি ফরম পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentBox 
              key={student.id} 
              student={student} 
              onDelete={deleteStudent} 
              onEdit={onEdit} 
              onApprove={isPendingView ? handleApprove : undefined} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

const StudentBox: React.FC<{ student: Student; onDelete: (id: string) => void; onEdit?: (id: string) => void; onApprove?: (student: Student) => void }> = ({ student, onDelete, onEdit, onApprove }) => {
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
    <div className="bg-white dark:bg-[#0f2119] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col h-full">
      <div className={`absolute top-0 left-0 w-1 h-full ${onApprove ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${onApprove ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'}`}>
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
      
      <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400 flex-1">
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
        <div className="flex justify-between pt-1 mb-4">
          <span>রক্তের গ্রুপ:</span>
          <span className="font-medium text-red-500">{student.bloodGroup || '-'}</span>
        </div>
      </div>

      {onApprove && (
        <button 
          onClick={() => onApprove(student)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 py-2 rounded-md font-medium transition-colors"
        >
          <CheckCircle size={18} /> এপ্রুভ করুন
        </button>
      )}
    </div>
  );
}

