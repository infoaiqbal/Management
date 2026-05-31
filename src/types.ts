export interface Address {
  division: string;
  district: string;
  thana: string;
  union: string;
  postOffice: string;
  village: string;
}

export type FeeType = 'monthly' | 'one-time' | 'installment';

export interface FeeItem {
  applicable: boolean;
  amount: number;
  type: FeeType;
}

export interface Fees {
  food: FeeItem; // খোরাকি
  electricity: FeeItem; // বিদ্যুৎ বিল
  tuition: FeeItem; // বেতন
  development: FeeItem; // উন্নয়ন ফি
  library: FeeItem; // পাঠাগার ফি
}

export interface ExtraInfo {
  id: string;
  name: string;
  value: string;
}

export interface Payment {
  id: string;
  date: string;
  feeCategory: keyof Fees;
  month?: string;
  installment?: string;
  amount: number;
}

export interface Student {
  id: string; // দাখেলা নাম্বার 
  name: string;
  dob: string;
  nid: string;
  bloodGroup: string;
  isHafiz: boolean;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  presentAddress: Address;
  permanentAddress: Address;
  guardianName: string;
  guardianRelation: string;
  guardianOccupation: string;
  guardianMobile: string;
  guardianEmail: string;
  murubbiName: string;
  murubbiMobile: string;
  murubbiEmail: string;
  prevInstitutionName: string;
  prevInstitutionAddress: string;
  prevInstitutionStudied: string;
  admissionSection: string;
  admissionClass: string;
  studentType: string;
  wantsZakat: boolean;
  admissionDate?: string;
  fees: Fees;
  extraInfo: ExtraInfo[];
  payments: Payment[];
}
