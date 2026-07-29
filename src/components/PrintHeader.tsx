import React from 'react';
import { MadrasaSettings } from '../types';
import { toBng } from '../utils/banglaHelpers';

interface PrintHeaderProps {
  settings: MadrasaSettings;
  title: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ settings, title }) => {
  const date = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  return (
    <div className="hidden print:block font-kalpurush w-full mb-4">
      <div className="flex items-start gap-3 mb-2">
        {settings.madrasaLogo && (
          <img src={settings.madrasaLogo} alt="Logo" className="w-16 h-16 object-contain" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-black leading-tight">{settings.madrasaName}</h1>
          <p className="text-sm text-gray-800">{settings.address}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-xl font-bold border-b-2 border-black inline-block pb-1">{title}</h2>
        <div className="text-base">তারিখ: {toBng(date)}</div>
      </div>
      
      <hr className="border-black mb-4" />
    </div>
  );
};
