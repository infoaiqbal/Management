import React, { useState, useRef, useEffect } from 'react';
import {
  divisions_bn,
  districts_bn,
  upazilas_bn,
  unions_bn
} from 'bangladesh-location-data/bangla';
import { Address } from '../types';
import CustomSelect from './CustomSelect';
import { useStudents } from '../store/StudentContext';

interface AddressFieldsProps {
  title: string;
  address: Address;
  onChange: (field: keyof Address, value: string) => void;
  onCopyFrom?: () => void;
}

// Reusable Search-dropdown / Autocomplete component that looks like CustomSelect but allows typing!
function AutocompleteField({ 
  label, 
  value, 
  onChange, 
  suggestions, 
  placeholder, 
  inputClass 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  suggestions: string[]; 
  placeholder: string; 
  inputClass: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const filtered = suggestions.filter(s => 
    s && s.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          value={value} 
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            // Convert numbers to Bengali numerals
            const bngDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            const val = e.target.value.replace(/\d/g, (d) => bngDigits[parseInt(d)]);
            onChange(val);
            setIsOpen(true);
          }} 
          className={inputClass} 
          placeholder={placeholder} 
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#1a2e24] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto font-sans print:hidden">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 last:border-0"
              onClick={() => {
                onChange(item);
                setIsOpen(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddressFields({ title, address, onChange, onCopyFrom }: AddressFieldsProps) {
  const { students } = useStudents();

  // Derive IDs dynamically from names so that 'Copy over' works perfectly
  const selectedDiv = divisions_bn.find((d: any) => d.title === address.division);
  const divId = selectedDiv ? String(selectedDiv.value) : '';

  const availableDistricts = divId && (districts_bn as any)[divId] ? (districts_bn as any)[divId] : [];
  const selectedDist = availableDistricts.find((d: any) => d.title === address.district);
  const distId = selectedDist ? String(selectedDist.value) : '';

  const availableThanas = distId && (upazilas_bn as any)[distId] ? (upazilas_bn as any)[distId] : [];
  const selectedThana = availableThanas.find((t: any) => t.title === address.thana);
  const thanaId = selectedThana ? String(selectedThana.value) : '';

  const availableUnions = thanaId && (unions_bn as any)[thanaId] ? (unions_bn as any)[thanaId] : [];
  const selectedUnion = availableUnions.find((u: any) => u.title === address.union);
  const unionId = selectedUnion ? String(selectedUnion.value) : '';

  const inputClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 print:border-gray-400 print:text-black outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors text-gray-900 dark:text-gray-100";
  const selectClass = "w-full p-2 bg-transparent border-2 rounded-sm border-dashed border-gray-400 dark:border-gray-600 print:border-gray-400 print:text-black outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100";

  // When division changes
  const handleDivChange = (val: string) => {
    const selected = divisions_bn.find((d: any) => String(d.value) === val);
    onChange('division', selected ? selected.title : '');
    onChange('district', '');
    onChange('thana', '');
    onChange('union', '');
  };

  // When district changes
  const handleDistChange = (val: string) => {
    const selected = availableDistricts.find((d: any) => String(d.value) === val);
    onChange('district', selected ? selected.title : '');
    onChange('thana', '');
    onChange('union', '');
  };

  // When thana (upazila) changes
  const handleThanaChange = (val: string) => {
    const selected = availableThanas.find((t: any) => String(t.value) === val);
    onChange('thana', selected ? selected.title : '');
    onChange('union', '');
  };

  // When union changes
  const handleUnionChange = (val: string) => {
    const selected = availableUnions.find((u: any) => String(u.value) === val);
    onChange('union', selected ? selected.title : '');
  };

  const handleTextChange = (field: keyof Address, value: string) => {
    // English digits to Bengali conversion logic
    const bngDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bngValue = value.replace(/\d/g, (d) => bngDigits[parseInt(d)]);
    onChange(field, bngValue);
  };

  // Pre-compiled list of common defaults for quick selector response
  const DEFAULT_VILLAGES = ['নয়াগ্রাম', 'রামপুর', 'কৃষ্ণপুর', 'হরিপুর', 'মির্জাপুর', 'গোপালপুর', 'পলাশপুর', 'ইসলামপুর', 'রসুলপুর', 'চরপাড়া', 'উত্তরপাড়া', 'দক্ষিণপাড়া', 'পূর্বপাড়া', 'পশ্চিমপাড়া'];
  const DEFAULT_POSTS = ['উপজেলা সদর', 'জেলা সদর', 'রামপুর', 'ইসলামপুর', 'রসুলপুর', 'গোপালপুর', 'মির্জাপুর'];

  const getSuggestions = (field: 'postOffice' | 'village') => {
    // Collect unique non-empty options from other student addresses
    const list = students
      .map(s => {
        const addr = title.includes('বর্তমান') ? s.presentAddress : s.permanentAddress;
        return addr?.[field];
      })
      .filter(Boolean) as string[];

    const merged = [...Array.from(new Set(list)), ...(field === 'postOffice' ? DEFAULT_POSTS : DEFAULT_VILLAGES)];
    return Array.from(new Set(merged)) as string[];
  };

  const postOfficeSuggestions = getSuggestions('postOffice');
  const villageSuggestions = getSuggestions('village');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">{title}</h4>
        {onCopyFrom && (
          <button 
            type="button" 
            onClick={onCopyFrom}
            className="print:hidden text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            বর্তমান ঠিকানার অনুরূপ
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">বিভাগ</label>
        <CustomSelect 
          className={selectClass} 
          onChange={handleDivChange} 
          value={divId || (address.division ? 'custom' : '')}
          options={[
            ...divisions_bn.map((div: any) => ({ value: String(div.value), label: div.title })),
            ...(address.division && !divId ? [{ value: 'custom', label: address.division }] : [])
          ]}
        />
      </div>

      {divId && (
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">জেলা</label>
          <CustomSelect 
            className={selectClass} 
            onChange={handleDistChange} 
            value={distId || (address.district ? 'custom' : '')}
            options={[
              ...availableDistricts.map((dist: any) => ({ value: String(dist.value), label: dist.title })),
              ...(address.district && !distId ? [{ value: 'custom', label: address.district }] : [])
            ]}
          />
        </div>
      )}

      {distId && (
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">থানা / উপজেলা</label>
          <CustomSelect 
            className={selectClass} 
            onChange={handleThanaChange} 
            value={thanaId || (address.thana ? 'custom' : '')}
            options={[
              ...availableThanas.map((th: any) => ({ value: String(th.value), label: th.title })),
              ...(address.thana && !thanaId ? [{ value: 'custom', label: address.thana }] : [])
            ]}
          />
        </div>
      )}

      {thanaId && (
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ইউনিয়ন</label>
          <CustomSelect 
            className={selectClass} 
            onChange={handleUnionChange} 
            value={unionId || (address.union ? 'custom' : '')}
            options={[
              ...availableUnions.map((un: any) => ({ value: String(un.value), label: un.title })),
              ...(address.union && !unionId ? [{ value: 'custom', label: address.union }] : [])
            ]}
          />
        </div>
      )}

      {address.union && (
        <>
          <div>
            <AutocompleteField 
              label="ডাকঘর"
              value={address.postOffice}
              onChange={(val) => onChange('postOffice', val)}
              suggestions={postOfficeSuggestions}
              placeholder="ডাকঘর নির্বাচন করুন বা লিখুন"
              inputClass={inputClass}
            />
          </div>
          <div>
            <AutocompleteField 
              label="গ্রাম"
              value={address.village}
              onChange={(val) => onChange('village', val)}
              suggestions={villageSuggestions}
              placeholder="গ্রাম নির্বাচন করুন বা লিখুন"
              inputClass={inputClass}
            />
          </div>
        </>
      )}
    </div>
  );
}
