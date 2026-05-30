import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'নির্বাচন করুন', 
  className = '', 
  disabled = false 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between cursor-pointer ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? '' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : (value || placeholder)}
        </span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#1a2e24] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto font-sans print:hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 last:border-0 ${value === opt.value ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-medium' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
