import React, { useState } from 'react';
import { useStudents } from '../store/StudentContext';
import { Plus, Trash2 } from 'lucide-react';
import { toEng } from '../utils/banglaHelpers';

/**
 * ==========================================
 * তথ্য সংযোগ (Add Extra Info)
 * ==========================================
 */
export default function AddInfo() {
  const { students, updateStudent } = useStudents();
  
  const [searchId, setSearchId] = useState('');
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [newInfos, setNewInfos] = useState([{ name: '', value: '' }]);

  const handleSearch = () => {
    const st = students.find(s => s.id === searchId || toEng(s.id) === toEng(searchId));
    if (st) {
      setActiveStudent(st);
      setNewInfos([{ name: '', value: '' }]); // reset fields
    } else {
      alert('ছাত্র পাওয়া যায়নি!');
      setActiveStudent(null);
    }
  };

  const handleAddInput = () => {
    setNewInfos([...newInfos, { name: '', value: '' }]);
  };

  const handleRemoveInput = (idx: number) => {
    setNewInfos(newInfos.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, field: 'name' | 'value', val: string) => {
    const updated = [...newInfos];
    updated[idx][field] = val;
    setNewInfos(updated);
  };

  const handleSave = async () => {
    if (!activeStudent) return;

    // Filter valid ones
    const validInfos = newInfos.filter(inf => inf.name.trim() !== '' && inf.value.trim() !== '').map(inf => ({
      id: Date.now().toString() + Math.random().toString(),
      ...inf
    }));

    if (validInfos.length === 0) {
      alert('দয়া করে তথ্যের নাম ও তথ্য পূরণ করুন!');
      return;
    }

    const updated = {
      ...activeStudent,
      extraInfo: [...(activeStudent.extraInfo || []), ...validInfos]
    };

    await updateStudent(updated);
    setActiveStudent(updated);
    setNewInfos([{ name: '', value: '' }]);
    alert('তথ্য সংযুক্ত করা হয়েছে!');
  };

  const handleDeleteOldInfo = async (infoId: string) => {
    if(!window.confirm('এই তথ্যটি মুছতে চান?')) return;
    
    const updated = {
      ...activeStudent,
      extraInfo: activeStudent.extraInfo.filter((i: any) => i.id !== infoId)
    };
    await updateStudent(updated);
    setActiveStudent(updated);
  }

  const inputClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-emerald-500 pb-2">অতিরিক্ত তথ্য সংযোগ</h2>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-sm">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা নাম্বার</label>
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

      {activeStudent && (
        <div className="bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
            <div>
              <div className="text-xs text-gray-500">নাম</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{activeStudent.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">জামাত</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{activeStudent.admissionClass || 'উল্লেখ নেই'}</div>
            </div>
          </div>

          {/* Existing Info */}
          {activeStudent.extraInfo && activeStudent.extraInfo.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">পূর্বের সংযুক্ত তথ্য:</h3>
              <ul className="space-y-2">
                {activeStudent.extraInfo.map((info: any) => (
                  <li key={info.id} className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex gap-4 w-full">
                      <span className="font-medium text-emerald-700 dark:text-emerald-400 w-1/3">{info.name}:</span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">{info.value}</span>
                    </div>
                    <button onClick={() => handleDeleteOldInfo(info.id)} className="text-red-400 hover:text-red-600 px-2"><Trash2 size={16}/></button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add New Info Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">নতুন তথ্য যোগ করুন</h3>
              <button type="button" onClick={handleAddInput} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 text-sm bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                <Plus size={16} /> আরো যোগ করুন
              </button>
            </div>
            
            {newInfos.map((info, idx) => (
              <div key={idx} className="flex items-end gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-md relative group">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">তথ্যের নাম</label>
                  <input type="text" value={info.name} onChange={e => handleChange(idx, 'name', e.target.value)} className={inputClass} placeholder="যেমন: হাতের লেখা" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">তথ্য</label>
                  <input type="text" value={info.value} onChange={e => handleChange(idx, 'value', e.target.value)} className={inputClass} placeholder="যেমন: ভালো" />
                </div>
                {newInfos.length > 1 && (
                  <button onClick={() => handleRemoveInput(idx)} className="pb-3 text-red-400 hover:text-red-600">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}

            <div className="pt-4 text-right">
              <button onClick={handleSave} className="px-6 py-2 pb-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors">
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

