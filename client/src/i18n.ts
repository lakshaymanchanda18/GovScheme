import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import bnTranslations from './locales/bn.json';
import taTranslations from './locales/ta.json';
import teTranslations from './locales/te.json';
import mrTranslations from './locales/mr.json';
import guTranslations from './locales/gu.json';
import paTranslations from './locales/pa.json';
import mlTranslations from './locales/ml.json';
import knTranslations from './locales/kn.json';
import urTranslations from './locales/ur.json';
import asTranslations from './locales/as.json';
import orTranslations from './locales/or.json';

const savedLang = localStorage.getItem('language') || 'en';

// Set initial document language & direction (RTL for Urdu)
if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ur' ? 'rtl' : 'ltr';
}

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      bn: { translation: bnTranslations },
      ta: { translation: taTranslations },
      te: { translation: teTranslations },
      mr: { translation: mrTranslations },
      gu: { translation: guTranslations },
      pa: { translation: paTranslations },
      ml: { translation: mlTranslations },
      kn: { translation: knTranslations },
      ur: { translation: urTranslations },
      as: { translation: asTranslations },
      or: { translation: orTranslations }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
