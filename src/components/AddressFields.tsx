import React from 'react';
import {
  divisions_bn,
  districts_bn,
  upazilas_bn,
  unions_bn
} from 'bangladesh-location-data/bangla';
import { Address } from '../types';
import CustomSelect from './CustomSelect';

interface AddressFieldsProps {
  title: string;
  address: Address;
  onChange: (field: keyof Address, value: string) => void;
  onCopyFrom?: () => void;
}

export default function AddressFields({ title, address, onChange, onCopyFrom }: AddressFieldsProps) {
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
    const selected = divisions_bn.find((d: any) => d.value === val);
    onChange('division', selected ? selected.title : '');
    onChange('district', '');
    onChange('thana', '');
    onChange('union', '');
  };

  // When district changes
  const handleDistChange = (val: string) => {
    const selected = availableDistricts.find((d: any) => d.value === val);
    onChange('district', selected ? selected.title : '');
    onChange('thana', '');
    onChange('union', '');
  };

  // When thana (upazila) changes
  const handleThanaChange = (val: string) => {
    const selected = availableThanas.find((t: any) => t.value === val);
    onChange('thana', selected ? selected.title : '');
    onChange('union', '');
  };

  // When union changes
  const handleUnionChange = (val: string) => {
    const selected = availableUnions.find((u: any) => u.value === val);
    onChange('union', selected ? selected.title : '');
  };

  const handleTextChange = (field: keyof Address, value: string) => {
    // English digits to Bengali conversion logic
    const bngDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const bngValue = value.replace(/\d/g, (d) => bngDigits[parseInt(d)]);
    onChange(field, bngValue);
  };

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

      {/* Show post office and village if union is selected, OR allow them any time after division? Let's show them after Thana to be safe, or just always show them? The prompt said "এভাবে গ্রাম পর্যন্ত", so one after another. */}
      {address.union && (
        <>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">ডাকঘর</label>
            <input 
              type="text" 
              value={address.postOffice} 
              onChange={(e) => handleTextChange('postOffice', e.target.value)} 
              className={inputClass} 
              placeholder="ডাকঘর লিখুন" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">গ্রাম</label>
            <input 
              type="text" 
              value={address.village} 
              onChange={(e) => handleTextChange('village', e.target.value)} 
              className={inputClass} 
              placeholder="গ্রাম লিখুন" 
            />
          </div>
        </>
      )}
    </div>
  );
}
