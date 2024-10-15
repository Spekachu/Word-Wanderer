import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Initialize i18next
i18n
  .use(Backend) // Load translations using http (default public/locales)
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // Fallback language if user language not available
    supportedLngs: ['en', 'de', 'fr', 'es'], // List of supported languages
    debug: true,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      convertDetectedLanguage: (lng) => lng.split('-')[0], // Convert 'en-US' to 'en'
    },
  });

export default i18n;