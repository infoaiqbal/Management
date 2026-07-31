import React, { useState, useEffect } from 'react';
import { useStudents } from '../store/StudentContext';
import { getStudentTerms } from '../utils/studentTerms';
import { toBng, toEng } from '../utils/banglaHelpers';
import { Student, Address, Fees, FeeItem } from '../types';
import AddressFields from '../components/AddressFields';
import CustomSelect from '../components/CustomSelect';
import { BookOpen } from 'lucide-react';
import PrintAdmissionForm from '../components/PrintAdmissionForm';

/**
 * ==========================================
 * ভর্তি ফরম (Admission Form)
 * ==========================================
 * এখানে ছাত্র ভর্তি করার সব অপশন রয়েছে।
 * ইনপুটগুলোতে dashed বর্ডার ব্যবহার করা হয়েছে।
 */

export default function AdmissionForm({ editId, onSuccess }: { editId?: string | null; onSuccess?: () => void }) {
  const { students, settings, addStudent, updateStudent, showAlert } = useStudents();
  
  const [studentStatus, setStudentStatus] = useState<'new' | 'old'>('new');
  const [searchOldId, setSearchOldId] = useState('');

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
    gender: '' as 'boy' | 'girl' | '',
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
  const [dobFocused, setDobFocused] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const currentGender = settings.studentGender === 'both' ? (formData.gender === 'girl' ? 'girls' : 'boys') : settings.studentGender;
  const terms = getStudentTerms(currentGender);

  const handleSearchOld = () => {
    const st = students.find(s => 
      s.id === searchOldId || 
      toEng(s.id) === toEng(searchOldId) || 
      s.guardianMobile === searchOldId || 
      toEng(s.guardianMobile || '') === toEng(searchOldId) ||
      s.murubbiMobile === searchOldId ||
      toEng(s.murubbiMobile || '') === toEng(searchOldId)
    );
    if (st) {
      setFormData({
        id: generateDaquela(), // Keep new ID
        name: st.name,
        dob: st.dob,
        nid: st.nid || '',
        gender: st.gender,
        bloodGroup: st.bloodGroup || '',
        isHafiz: st.isHafiz ? 'হ্যাঁ' : 'না',
        fatherName: st.fatherName,
        motherName: st.motherName || '',
        fatherOccupation: st.fatherOccupation || '',
        presentAddress: st.presentAddress || { ...initialAddress },
        permanentAddress: st.permanentAddress || { ...initialAddress },
        guardianName: st.guardianName || '',
        guardianRelation: st.guardianRelation || '',
        guardianOccupation: st.guardianOccupation || '',
        guardianMobile: st.guardianMobile || '',
        guardianEmail: st.guardianEmail || '',
        murubbiName: st.murubbiName || '',
        murubbiMobile: st.murubbiMobile || '',
        murubbiEmail: st.murubbiEmail || '',
        prevInstitutionName: st.prevInstitutionName || '',
        prevInstitutionAddress: st.prevInstitutionAddress || '',
        prevInstitutionStudied: st.prevInstitutionStudied || '',
        admissionSection: st.admissionSection,
        admissionClass: st.admissionClass,
        studentType: st.studentType || 'আবাসিক',
        wantsZakat: st.wantsZakat ? 'হ্যাঁ' : 'না'
      });
      showAlert(`পুরাতন ${terms.singular_er} তথ্য পাওয়া গেছে!`, 'success');
      setCurrentStep(5); // 5 steps auto filled, take them to step 5 (or 6)
    } else {
      showAlert(`এই নাম্বার বা দাখেলায় কোনো ${terms.singular} পাওয়া যায়নি!`, 'warning');
    }
  };

  const nextStep = () => {
    if (currentStep === 5) {
      showAlert('ফরম পূরণ সম্পন্ন হয়েছে। এখন বেতন সংক্রান্ত তথ্য দিন', 'success');
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const formatDob = (dobText: string) => {
    if (!dobText) return '';
    const parts = dobText.split('-');
    if (parts.length === 3) {
      return toBng(`${parts[2]}/${parts[1]}/${parts[0]}`);
    }
    return toBng(dobText);
  };

  // ফিস (Fees State)
  const buildInitialFee = (): FeeItem => ({ applicable: false, amount: 0, type: 'monthly' });
  const [feesData, setFeesData] = useState<Fees>({
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
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
      admissionDate: editId ? (students.find(s => s.id === editId)?.admissionDate || new Date().toISOString()) : new Date().toISOString(),
      extraInfo: editId ? (students.find(s => s.id === editId)?.extraInfo || []) : [],
      payments: editId ? (students.find(s => s.id === editId)?.payments || []) : [],
      status: editId ? (students.find(s => s.id === editId)?.status || 'approved') : 'pending'
    };

    const currentGender = settings.studentGender === 'both' ? (formData.gender === 'girl' ? 'girls' : 'boys') : settings.studentGender;
    const terms = getStudentTerms(currentGender);

    if (editId) {
      await updateStudent(newStudent);
      showAlert(`${terms.singular_er} তথ্য সফলভাবে আপডেট হয়েছে!`, 'success');
      if (onSuccess) onSuccess();
    } else {
      await addStudent(newStudent);
      showAlert(`তথ্য সফলভাবে সংরক্ষিত হয়েছে!`, 'success');
      
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
    <div className="relative">
    <div className={`max-w-4xl mx-auto bg-white dark:bg-[#0f2119] p-6 lg:p-8 rounded-lg shadow-sm print:hidden`}>
      <div className="mb-8 border-b-2 border-emerald-500 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
          {editId ? `${terms.singular_er} তথ্য সম্পাদনা` : `${terms.singular} ভর্তি ফরম`}
        </h2>
        
        {/* Progress Bar (Hidden in print) */}
        <div className="mt-6 print:hidden">
          <div className="flex justify-between items-center mb-2">
            {[...Array(totalSteps)].map((_, idx) => (
              <div 
                key={idx} 
                className={`flex-1 h-2 mx-1 rounded-full ${
                  idx + 1 <= currentStep ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                } transition-colors duration-300`}
              />
            ))}
          </div>
          <div className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
            ধাপ {toBng(currentStep)} / {toBng(totalSteps)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* ================= ব্যক্তিগত তথ্য (Personal Info) ================= */}
        {currentStep === 1 && (
        <section>
          {!editId && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg mb-6 border border-emerald-100 dark:border-emerald-800 print:hidden">
              <div className="flex items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200 font-medium">
                  <input type="radio" name="studentStatus" checked={studentStatus === 'new'} onChange={() => setStudentStatus('new')} className="accent-emerald-600 w-4 h-4" />
                  নতুন {terms.singular}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200 font-medium">
                  <input type="radio" name="studentStatus" checked={studentStatus === 'old'} onChange={() => setStudentStatus('old')} className="accent-emerald-600 w-4 h-4" />
                  পুরাতন {terms.singular}
                </label>
              </div>
              
              {studentStatus === 'old' && (
                <div className="flex gap-4 items-end">
                  <div className="flex-1 max-w-sm">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা বা মোবাইল নাম্বার দিয়ে খুঁজুন</label>
                    <input 
                      type="text" 
                      value={searchOldId} 
                      onChange={e => setSearchOldId(e.target.value)} 
                      className={inputClass}
                      placeholder="এখানে লিখুন..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchOld();
                        }
                      }}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleSearchOld}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-medium transition-colors h-[42px]"
                  >
                    খুঁজুন
                  </button>
                </div>
              )}
            </div>
          )}
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">ব্যক্তিগত তথ্য</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">দাখেলা নাম্বার (অটোমেটিক)</label>
              <input type="text" readOnly value={formData.id} className={`${inputClass} bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed`} />
            </div>
            
            {settings.studentGender === 'both' && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">আপনি কি</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="boy" 
                      checked={formData.gender === 'boy'} 
                      onChange={handleChange} 
                      className="accent-emerald-600"
                    />
                    <span>ছেলে</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="girl" 
                      checked={formData.gender === 'girl'} 
                      onChange={handleChange} 
                      className="accent-emerald-600"
                    />
                    <span>মেয়ে</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">নাম</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder={`${terms.singular_er} নাম...`} list="student-names" />
              {/* সাজেস্ট করার জন্য ডাটালিস্ট */}
              <datalist id="student-names">
                {students.map(s => <option key={s.id} value={s.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">জন্ম তারিখ</label>
              <input 
                type={dobFocused ? "date" : "text"} 
                name="dob" 
                value={dobFocused ? formData.dob : formatDob(formData.dob)} 
                onFocus={() => setDobFocused(true)} 
                onBlur={() => setDobFocused(false)} 
                onChange={handleChange} 
                className={inputClass} 
                placeholder={!dobFocused ? "দিন/মাস/বছর" : undefined}
              />
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
        )}

        {/* ================= পরিবার ও অভিবাবক (Family & Guardian) ================= */}
        {currentStep === 2 && (
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
        )}

        {/* ================= ঠিকানা (Address) ================= */}
        {currentStep === 3 && (
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
        )}

        {/* ================= অভিভাবকের বিস্তারিত (Guardian Details) ================= */}
        {currentStep === 4 && (
        <>
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
        </>
        )}

        {/* ================= ভর্তি সংক্রান্ত (Admission Settings) ================= */}
        {currentStep === 5 && (
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
        )}

        {/* ================= নির্ধারিত বেতন (Fees Definition) ================= */}
        {currentStep === 6 && (
        <section>
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">নির্ধারিত বেতন</h3>
          <div className="space-y-6 mt-4">
            {
              // Fees mapping array
              (Object.keys(feesData) as Array<keyof Fees>).map((feeKey) => {
                const labels: any = { admission: 'ভর্তি ফি', food: 'খোরাকি', electricity: 'বিদ্যুৎ বিল', tuition: 'বেতন', development: 'উন্নয়ন ফি', library: 'পাঠাগার ফি' };
                const feeState: FeeItem = feesData[feeKey]!;
                
                return (
                  <div key={feeKey} className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-md">
                    <div className="w-full md:w-48 font-medium">{labels[feeKey]}:</div>
                    
                    <div className="w-full md:w-auto min-w-[200px]">
                      <div className="flex gap-4 items-center h-full">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`applicable_${feeKey}`} 
                            checked={feeState.applicable} 
                            onChange={() => handleFeeChange(feeKey, 'applicable', true)}
                            className="accent-emerald-600"
                          />
                          প্রযোজ্য
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`applicable_${feeKey}`} 
                            checked={!feeState.applicable} 
                            onChange={() => handleFeeChange(feeKey, 'applicable', false)}
                            className="accent-emerald-600"
                          />
                          প্রযোজ্য নয়
                        </label>
                      </div>
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
                        <div className="w-full md:w-auto flex flex-wrap gap-4 items-center min-h-[42px]">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`type_${feeKey}`} checked={feeState.type === 'monthly'} onChange={() => handleFeeChange(feeKey, 'type', 'monthly')} className="accent-emerald-600" />
                            মাসিক
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`type_${feeKey}`} checked={feeState.type === 'one-time'} onChange={() => handleFeeChange(feeKey, 'type', 'one-time')} className="accent-emerald-600" />
                            এককালিন
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`type_${feeKey}`} checked={feeState.type === 'installment'} onChange={() => handleFeeChange(feeKey, 'type', 'installment')} className="accent-emerald-600" />
                            তিন কিস্তি
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            }
          </div>
        </section>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-6 flex justify-between gap-4 print:hidden border-t border-gray-200 dark:border-gray-800 mt-8">
          <div>
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-md transition-colors">
                পূর্ববর্তী ধাপ
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            {editId && (
              <button type="button" onClick={() => onSuccess && onSuccess()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-md transition-colors">
                বাতিল করুন
              </button>
            )}
            
            {currentStep === totalSteps && (
              <button type="button" onClick={() => setTimeout(() => window.print(), 100)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md transition-colors text-sm md:text-base">
                ফরম প্রিন্ট
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button type="button" onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-md transition-colors">
                পরবর্তী ধাপ
              </button>
            ) : (
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-md transition-colors">
                {editId ? 'আপডেট করুন' : 'ভর্তি সম্পন্ন করুন'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
    
    <div className="hidden print:block w-full bg-white text-black">
      <PrintAdmissionForm 
        student={formData as Student}
        settings={settings}
        isNew={studentStatus === 'new'}
      />
    </div>
    </div>
  );
}
