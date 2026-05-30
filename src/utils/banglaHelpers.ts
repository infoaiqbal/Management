const bngDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBng = (num: number | string | undefined | null): string => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\d/g, (d) => bngDigits[parseInt(d)]);
};

export const toEng = (bngStr: string | undefined | null): string => {
  if (!bngStr) return '';
  const engMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return String(bngStr).replace(/[০-৯]/g, (d) => engMap[d]);
};

export const bngMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const bngInstallments = ['প্রথম', 'দ্বিতীয়', 'তৃতীয়'];
