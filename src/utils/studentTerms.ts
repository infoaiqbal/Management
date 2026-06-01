export const getStudentTerms = (gender: 'boys' | 'girls' | 'both') => {
  return {
    singular: gender === 'boys' ? 'ছাত্র' : gender === 'girls' ? 'ছাত্রী' : 'ছাত্র-ছাত্রী',
    singular_er: gender === 'boys' ? 'ছাত্রের' : gender === 'girls' ? 'ছাত্রীর' : 'ছাত্র-ছাত্রীর',
    singular_k: gender === 'boys' ? 'ছাত্রকে' : gender === 'girls' ? 'ছাত্রীকে' : 'ছাত্র-ছাত্রীকে',
    plural: gender === 'boys' ? 'ছাত্ররা' : gender === 'girls' ? 'ছাত্রীরা' : 'ছাত্র-ছাত্রীরা',
    plural_der: gender === 'boys' ? 'ছাত্রদের' : gender === 'girls' ? 'ছাত্রীদের' : 'ছাত্র-ছাত্রীদের',
    title: gender === 'boys' ? 'ছাত্র' : gender === 'girls' ? 'ছাত্রী' : 'ছাত্র-ছাত্রী',
  };
};
