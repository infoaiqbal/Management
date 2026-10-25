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

const numbersBng = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 
  'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ', 
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ', 
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ', 
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট', 
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর', 
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি', 
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টাশি', 'উননব্বই', 
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

export const bngShortMonths = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

export const formatBanglaDateTime = (dateInput?: string | Date): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return '';
  
  const day = toBng(date.getDate());
  const monthName = bngShortMonths[date.getMonth()];
  const year = toBng(date.getFullYear());
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12
  
  const formattedHours = toBng(hours);
  const formattedMinutes = toBng(minutes < 10 ? '0' + minutes : minutes);
  
  return `${day} ${monthName}, ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const generateMemoNumber = (seed?: string | number, prefix = 'MAD-POS'): string => {
  if (seed) {
    const cleanSeed = String(seed).replace(/\D/g, '').slice(-6);
    return `${prefix}-${toBng(cleanSeed || '১২৩৪৫৬')}`;
  }
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${toBng(randomNum)}`;
};

export const numberToBanglaWords = (num: number): string => {
  if (num === 0) return 'শূন্য';
  let str = '';
  
  if (num >= 10000000) {
    str += numberToBanglaWords(Math.floor(num / 10000000)) + ' কোটি ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToBanglaWords(Math.floor(num / 100000)) + ' লক্ষ ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToBanglaWords(Math.floor(num / 1000)) + ' হাজার ';
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToBanglaWords(Math.floor(num / 100)) + ' শত ';
    num %= 100;
  }
  if (num > 0 && num < 100) {
    str += numbersBng[num] + ' ';
  }
  return str.trim();
};

