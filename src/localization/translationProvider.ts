type Dictionary = {[id: string]: string};

const basePath = 'src/localization';

let translation: Dictionary = {};

export const L = async (key: string): Promise<string> => {
  if (!Object.keys(translation).length) {
    await setTranslation();
  }

  return translation[key] ?? key;
};

const setTranslation = async (): Promise<void> => {
  translation = await getTranslation();
};

const getTranslation = async (): Promise<Dictionary> => {
  let translation = {}
  try {
    const [browserLanguage] = navigator.language.split('-');
    const response = await fetch(`${basePath}/${browserLanguage}.json`);
    translation = await response.json();
  } catch (e) {
    const response = await fetch(`${basePath}/en.json`);
    translation = await response.json();
  } finally {
    return translation;
  }
};
