const extractLocale = (language) => language.substr(0, 2);

const detectLanguage = () => {
  const languages = [
    ...(window.navigator.languages || []),
    window.navigator.language,
    window.navigator.browserLanguage,
    window.navigator.userLanguage,
    window.navigator.systemLanguage,
  ].filter(Boolean).map(extractLocale);

  return [...new Set(languages)];
};

export default detectLanguage;
