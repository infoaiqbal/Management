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

const onesBng = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
const tensBng = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

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
  if (num > 0) {
    if (num < 20) {
      str += onesBng[num] + ' ';
    } else {
      str += tensBng[Math.floor(num / 10)] + ' ';
      if (num % 10 > 0) {
        str += onesBng[num % 10] + ' ';
      }
    }
  }
  return str.trim();
};
