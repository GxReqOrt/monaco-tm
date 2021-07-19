let translation: any = null;

export const L = (key: string): string => {
  if (!translation) {
    translation = getTranslation();
  }
  
  return translation[key] ?? key;
};

const getTranslation = (): any => {
  try {
    const browserLanguage = navigator.language.split('-')[0];
    return require(`./${browserLanguage}`).translations;
  } catch (e) {
    return require('./en').translations;
  }
};
