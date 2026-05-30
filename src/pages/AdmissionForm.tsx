import React, { useState, useEffect } from 'react';
import { useStudents } from '../store/StudentContext';
import { toBng, toEng } from '../utils/banglaHelpers';
import { Student, Address, Fees, FeeItem } from '../types';
import AddressFields from '../components/AddressFields';
import CustomSelect from '../components/CustomSelect';

/**
 * ==========================================
 * ভর্তি ফরম (Admission Form)
 * ==========================================
 * এখানে ছাত্র ভর্তি করার সব অপশন রয়েছে।
 * ইনপুটগুলোতে dashed বর্ডার ব্যবহার করা হয়েছে।
 */

export default function AdmissionForm({ editId, onSuccess }: { editId?: string | null; onSuccess?: () => void }) {
  const { students, addStudent, updateStudent, showAlert } = useStudents();
  
  // স্বয়ংক্রিয় দাখেলা নাম্বার জেনারেট (Auto generate Daquela Number)
  const generateDaquela = () => {
    const nextId = students.length > 0 ? Math.max(...students.map(s => parseInt(toEng(s.id)))) + 1 : 1;
    return toBng(nextId.toString().padStart(3, '0'));
  };

  const initialAddress: Address = { division: '', district: '', thana: '', union: '', postOffice: '', village: '' };
  
  const [formData, setFormData] = useState({
    id: '', 
    name: '',
    dob: '',
    nid: '',
    bloodGroup: '',
    isHafiz: 'না',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    presentAddress: { ...initialAddress },
    permanentAddress: { ...initialAddress },
    guardianName: '',
    guardianRelation: '',
    guardianOccupation: '',
    guardianMobile: '',
    guardianEmail: '',
    murubbiName: '',
    murubbiMobile: '',
    murubbiEmail: '',
    prevInstitutionName: '',
    prevInstitutionAddress: '',
    prevInstitutionStudied: '',
    admissionSection: 'নূরানী',
    admissionClass: '',
    studentType: 'আবাসিক',
    wantsZakat: 'না',
  });

  const [idType, setIdType] = useState<'birth_cert' | 'nid' | ''>('');
  const [parentType, setParentType] = useState<'father' | 'mother' | ''>('');

  // ফিস (Fees State)
  const buildInitialFee = (): FeeItem => ({ applicable: false, amount: 0, type: 'monthly' });
  const [feesData, setFeesData] = useState({
    food: buildInitialFee(),
    electricity: buildInitialFee(),
    tuition: buildInitialFee(),
    development: buildInitialFee(),
    library: buildInitialFee()
  });

  useEffect(() => {
    if (editId) {
      const studentToEdit = students.find(s => s.id === editId);
      if (studentToEdit) {
        setFormData({
          id: studentToEdit.id,
          name: studentToEdit.name,
          dob: studentToEdit.dob,
          nid: studentToEdit.nid || '',
          bloodGroup: studentToEdit.bloodGroup || '',
          isHafiz: studentToEdit.isHafiz ? 'হ্যাঁ' : 'না',
          fatherName: studentToEdit.fatherName,
          motherName: studentToEdit.motherName || '',
          fatherOccupation: studentToEdit.fatherOccupation || '',
          presentAddress: studentToEdit.presentAddress || { ...initialAddress },
          permanentAddress: studentToEdit.permanentAddress || { ...initialAddress },
          guardianName: studentToEdit.guardianName || '',
          guardianRelation: studentToEdit.guardianRelation || '',
          guardianOccupation: studentToEdit.guardianOccupation || '',
          guardianMobile: studentToEdit.guardianMobile || '',
          guardianEmail: studentToEdit.guardianEmail || '',
          murubbiName: studentToEdit.murubbiName || '',
          murubbiMobile: studentToEdit.murubbiMobile || '',
          murubbiEmail: studentToEdit.murubbiEmail || '',
          prevInstitutionName: studentToEdit.prevInstitutionName || '',
          prevInstitutionAddress: studentToEdit.prevInstitutionAddress || '',
          prevInstitutionStudied: studentToEdit.prevInstitutionStudied || '',
          admissionSection: studentToEdit.admissionSection,
          admissionClass: studentToEdit.admissionClass,
          studentType: studentToEdit.studentType || 'আবাসিক',
          wantsZakat: studentToEdit.wantsZakat ? 'হ্যাঁ' : 'না'
        });
        if (studentToEdit.fees) {
          setFeesData(studentToEdit.fees);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, id: generateDaquela() }));
    }
  }, [editId, students]);

  /**
   * ==========================================
   * ইনপুট হ্যান্ডলার (Utility function for Inputs)
   * ==========================================
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Do not convert dates or emails to Bangla numerals automatically
    const shouldConvert = type !== 'date' && type !== 'email';
    const finalValue = shouldConvert ? toBng(value) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleAddressChange = (type: 'presentAddress' | 'permanentAddress', field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const handleFeeChange = (feeName: keyof Fees, field: string, value: any) => {
    setFeesData(prev => ({
      ...prev,
      [feeName]: { ...prev[feeName], [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert to Student type
    const newStudent: Student = {
      ...formData,
      isHafiz: formData.isHafiz === 'হ্যাঁ',
      wantsZakat: formData.wantsZakat === 'হ্যাঁ',
      fees: feesData,
      extraInfo: editId ? (students.find(s => s.id === editId)?.extraInfo || []) : [],
      payments: editId ? (students.find(s => s.id === editId)?.payments || []) : []
    };

    if (editId) {
      await updateStudent(newStudent);
      showAlert('ছাত্রের তথ্য সফলভাবে আপডেট হয়েছে!', 'success');
      if (onSuccess) onSuccess();
    } else {
      await addStudent(newStudent);
      showAlert('ছাত্র ভর্তি সম্পন্ন হয়েছে!', 'success');
      
      // Reset Form
      setFormData(prev => ({
        ...prev,
        id: generateDaquela(),
        name: '', dob: '', nid: '', fatherName: '', motherName: '', fatherOccupation: '',
        guardianName: '', guardianRelation: '', guardianOccupation: '', guardianMobile: '', guardianEmail: '',
        murubbiName: '', murubbiMobile: '', murubbiEmail: '', prevInstitutionName: '', prevInstitutionAddress: '', prevInstitutionStudied: '',
        admissionClass: ''
      }));
      setIdType('');
      setParentType('');
    }
  };

  // স্টাইল সাহায্যকারী (Styling Class Helper) - Dashed Border
  const inputClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 print:border-gray-400 print:text-black outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100";
  const selectClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 print:border-gray-400 print:text-black outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 [&>option]:bg-white dark:[&>option]:bg-gray-800";

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#0f2119] print:dark:bg-white print:text-black print:p-0 print:shadow-none p-6 lg:p-8 rounded-lg shadow-sm">
      <div className="mb-8 border-b-2 border-emerald-500 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 print:text-black text-center">
          {editId ? 'ছাত্রের তথ্য সম্পাদনা' : 'ছাত্র ভর্তি ফরম'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* ================= ব্যক্তিগত তথ্য (Personal Info) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">ব্যক্তিগত তথ্য</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা নাম্বার (অটোমেটিক)</label>
              <input type="text" readOnly value={formData.id} className={`${inputClass} bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed`} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">নাম</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="ছাত্রের নাম..." list="student-names" />
              {/* সাজেস্ট করার জন্য ডাটালিস্ট */}
              <datalist id="student-names">
                {students.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">জন্ম তারিখ</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="idType" value="birth_cert" checked={idType === 'birth_cert'} onChange={() => setIdType('birth_cert')} />
                    জন্ম নিবন্ধন
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="idType" value="nid" checked={idType === 'nid'} onChange={() => setIdType('nid')} />
                    আইডি কার্ড নাম্বার
                  </label>
                </div>
              </label>
              {idType && (
                <input type="tel" name="nid" value={formData.nid} onChange={handleChange} className={inputClass} placeholder={idType === 'birth_cert' ? 'জন্ম নিবন্ধন নাম্বার...' : 'আইডি কার্ড নাম্বার...'} />
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">রক্তের গ্রুপ</label>
              <CustomSelect 
                value={formData.bloodGroup} 
                onChange={(val) => handleChange({ target: { name: 'bloodGroup', value: val, type: 'select-one' } } as any)} 
                className={selectClass}
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">আপনি কি হাফেজ?</label>
              <CustomSelect 
                value={formData.isHafiz} 
                onChange={(val) => handleChange({ target: { name: 'isHafiz', value: val, type: 'select-one' } } as any)} 
                className={selectClass}
                options={[
                  { value: 'না', label: 'না' },
                  { value: 'হ্যাঁ', label: 'হ্যাঁ' }
                ]}
              />
            </div>
          </div>
        </section>

        {/* ================= পরিবার ও অভিবাবক (Family & Guardian) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">পিতামাতার তথ্য</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="parentType" value="father" checked={parentType === 'father'} onChange={() => setParentType('father')} />
                    বাবার নাম
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="parentType" value="mother" checked={parentType === 'mother'} onChange={() => setParentType('mother')} />
                    মায়ের নাম
                  </label>
                </div>
              </label>
              {parentType === 'father' && (
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="বাবার নাম..." />
              )}
              {parentType === 'mother' && (
                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className={inputClass} placeholder="মায়ের নাম..." />
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">পেশা</label>
              <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className={inputClass} placeholder={parentType === 'mother' ? 'মায়ের পেশা...' : 'বাবার পেশা...'} />
            </div>
          </div>
        </section>

        {/* ================= ঠিকানা (Address) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">ঠিকানা</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* বর্তমান ঠিকানা */}
            <AddressFields 
              title="বর্তমান ঠিকানা" 
              address={formData.presentAddress} 
              onChange={(f, v) => handleAddressChange('presentAddress', f, v)} 
            />

            {/* স্থায়ী ঠিকানা */}
            <AddressFields 
              title="স্থায়ী ঠিকানা" 
              address={formData.permanentAddress} 
              onChange={(f, v) => handleAddressChange('permanentAddress', f, v)} 
              onCopyFrom={() => setFormData(p => ({ ...p, permanentAddress: { ...p.presentAddress } }))}
            />
          </div>
        </section>

        {/* ================= অভিভাবকের বিস্তারিত (Guardian Details) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">অভিভাবকের বিস্তারিত</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">অভিভাবকের নাম</label>
              <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">সম্পর্ক</label>
              <input type="text" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">পেশা</label>
              <input type="text" name="guardianOccupation" value={formData.guardianOccupation} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">মোবাইল</label>
              <input type="tel" name="guardianMobile" value={formData.guardianMobile} onChange={handleChange} className={inputClass} />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ই-মেইল</label>
              <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>
          
        {/* ================= তা'লিমী মুরুব্বি (Talimi Murubbi) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">তা'লিমী মুরুব্বি</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">তা'লিমী মুরুব্বির নাম</label>
              <input type="text" name="murubbiName" value={formData.murubbiName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">মোবাইল</label>
              <input type="tel" name="murubbiMobile" value={formData.murubbiMobile} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ই-মেইল</label>
              <input type="email" name="murubbiEmail" value={formData.murubbiEmail} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>

        {/* ================= ভর্তি সংক্রান্ত (Admission Settings) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">ভর্তির তথ্যাবলি</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">পূর্বের প্রতিষ্ঠানের নাম</label>
              <input type="text" name="prevInstitutionName" value={formData.prevInstitutionName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ঠিকানা</label>
              <input type="text" name="prevInstitutionAddress" value={formData.prevInstitutionAddress} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">কি পড়েছেন</label>
              <input type="text" name="prevInstitutionStudied" value={formData.prevInstitutionStudied} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ভর্তিচ্ছু বিভাগ</label>
              <CustomSelect 
                value={formData.admissionSection} 
                onChange={(val) => handleChange({ target: { name: 'admissionSection', value: val, type: 'select-one' } } as any)} 
                className={selectClass}
                options={[
                  { value: 'নূরানী', label: 'নূরানী' },
                  { value: 'নাযিরা', label: 'নাযিরা' },
                  { value: 'হিফজুল কুরআন', label: 'হিফজুল কুরআন' },
                  { value: 'কিতাব', label: 'কিতাব' },
                  { value: 'তাখাসসুস', label: 'তাখাসসুস' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ভর্তিচ্ছু জামাত</label>
              <input type="text" name="admissionClass" value={formData.admissionClass} onChange={handleChange} className={inputClass} placeholder="যেমন: কাফিয়া" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ধরন</label>
              <CustomSelect 
                value={formData.studentType} 
                onChange={(val) => handleChange({ target: { name: 'studentType', value: val, type: 'select-one' } } as any)} 
                className={selectClass}
                options={[
                  { value: 'আবাসিক', label: 'আবাসিক' },
                  { value: 'অনাবাসিক', label: 'অনাবাসিক' },
                  { value: 'ডে কেয়ার', label: 'ডে কেয়ার' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">যাকাত গ্রহণে ইচ্ছুক?</label>
              <CustomSelect 
                value={formData.wantsZakat} 
                onChange={(val) => handleChange({ target: { name: 'wantsZakat', value: val, type: 'select-one' } } as any)} 
                className={selectClass}
                options={[
                  { value: 'না', label: 'না' },
                  { value: 'হ্যাঁ', label: 'হ্যাঁ' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ================= নির্ধারিত বেতন (Fees Definition) ================= */}
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">নির্ধারিত বেতন</h3>
          <div className="space-y-6 mt-4">
            {
              // Fees mapping array
              (Object.keys(feesData) as Array<keyof Fees>).map((feeKey) => {
                const labels: any = { food: 'খোরাকি', electricity: 'বিদ্যুৎ বিল', tuition: 'বেতন', development: 'উন্নয়ন ফি', library: 'পাঠাগার ফি' };
                const feeState: FeeItem = feesData[feeKey];
                
                return (
                  <div key={feeKey} className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md">
                    <div className="w-full md:w-48 font-medium">{labels[feeKey]}:</div>
                    
                    <div className="w-full md:w-48">
                      <CustomSelect 
                        value={feeState.applicable ? 'প্রযোজ্য' : 'প্রযোজ্য নয়'} 
                        onChange={(val) => handleFeeChange(feeKey, 'applicable', val === 'প্রযোজ্য')}
                        className={selectClass}
                        options={[
                          { value: 'প্রযোজ্য নয়', label: 'প্রযোজ্য নয়' },
                          { value: 'প্রযোজ্য', label: 'প্রযোজ্য' }
                        ]}
                      />
                    </div>

                    {feeState.applicable && (
                      <>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <span>পরিমাণ: </span>
                          <input 
                            type="tel" 
                            value={feeState.amount ? toBng(feeState.amount) : ''} 
                            onChange={(e) => handleFeeChange(feeKey, 'amount', Number(toEng(e.target.value)))} 
                            className={`${inputClass} w-32`}
                            placeholder="টাকা"
                          />
                        </div>
                        <div className="w-full md:w-auto">
                          <CustomSelect 
                            value={feeState.type} 
                            onChange={(val) => handleFeeChange(feeKey, 'type', val)}
                            className={selectClass}
                            options={[
                              { value: 'monthly', label: 'মাসিক' },
                              { value: 'one-time', label: 'এককালিন' },
                              { value: 'installment', label: 'তিন কিস্তি' }
                            ]}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            }
          </div>
        </section>

        <div className="pt-6 flex gap-4 print:hidden">
          {editId && (
            <button type="button" onClick={() => onSuccess && onSuccess()} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-md transition-colors">
              বাতিল করুন
            </button>
          )}
          <button type="button" onClick={() => window.print()} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md transition-colors">
            প্রিন্ট করুন
          </button>
          <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-md transition-colors">
            {editId ? 'আপডেট করুন' : 'ভর্তি সম্পন্ন করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
