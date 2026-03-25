import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { SUPPORTED_LANGUAGES } from '../locales/languages';

// Map i18next language codes to BCP 47 / Intl locale tags
const LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  ur: 'ur-IN',
  as: 'as-IN',
  or: 'or-IN',
};

const getIntlLocale = (): string => LOCALE_MAP[i18n.language] || 'en-IN';

export const useI18n = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  const switchLanguage = (language: string) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === language)) {
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
      // Set document direction for RTL languages
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === language);
      document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(getIntlLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(getIntlLocale()).format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return {
    t,
    i18n: i18nInstance,
    switchLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    currentLanguage: i18n.language,
    isHindi: i18n.language === 'hi',
  };
};
