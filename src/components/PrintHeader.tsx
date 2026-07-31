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
      {settings.headerType === 'header_photo' && settings.headerPhoto ? (
        <div className="mb-4 text-center w-full">
          <img src={settings.headerPhoto} alt="Header" className="w-full h-auto object-contain max-h-32 mx-auto" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 mb-4 max-w-full overflow-hidden">
          {settings.madrasaLogo && (
            <img src={settings.madrasaLogo} alt="Logo" className="w-16 h-16 object-cover rounded-full shrink-0" />
          )}
          <div className="text-left min-w-0">
            <h1 
              className="font-bold text-black leading-tight whitespace-nowrap"
              style={{
                fontSize: settings.madrasaName.length > 40 ? '16px' : settings.madrasaName.length > 30 ? '20px' : settings.madrasaName.length > 20 ? '24px' : '28px'
              }}
            >
              {settings.madrasaName}
            </h1>
            <p className="text-sm text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">{settings.address}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-xl font-bold border-b-2 border-black inline-block pb-1">{title}</h2>
        <div className="text-base">তারিখ: {toBng(date)}</div>
      </div>
      
      <hr className="border-black mb-4" />
    </div>
  );
};
