import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export const useI18n = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  const switchLanguage = (language: 'en' | 'hi') => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const formatDate = (date: Date): string => {
    const currentLanguage = i18n.language;
    if (currentLanguage === 'hi') {
      return new Intl.DateTimeFormat('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    const currentLanguage = i18n.language;
    if (currentLanguage === 'hi') {
      return new Intl.NumberFormat('hi-IN').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    const currentLanguage = i18n.language;
    if (currentLanguage === 'hi') {
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
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
    isHindi: i18n.language === 'hi'
  };
};
