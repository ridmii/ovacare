import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeLabel: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeLabel: 'English',
    flag: '🇱🇰'
  },
  {
    code: 'si',
    name: 'Sinhala',
    nativeLabel: 'සිංහල',
    flag: '🇱🇰'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeLabel: 'தமிழ்',
    flag: '🇱🇰'
  }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-200 text-ovacare-navy hover:text-ovacare-purple"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage.nativeLabel}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl z-50 overflow-hidden"
            >
              <div className="py-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-ovacare-purple/10 transition-colors duration-200 ${
                      currentLanguage.code === language.code 
                        ? 'bg-ovacare-purple/5 text-ovacare-purple' 
                        : 'text-ovacare-navy'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language.flag}</span>
                      <div>
                        <div className="font-medium text-sm">{language.nativeLabel}</div>
                        <div className="text-xs text-ovacare-gray">{language.name}</div>
                      </div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="w-4 h-4 text-ovacare-purple" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Sri Lankan Cultural Info */}
              <div className="border-t border-white/20 px-4 py-3 bg-gradient-to-r from-ovacare-purple/5 to-ovacare-deep/5">
                <div className="text-xs text-ovacare-gray text-center">
                  🇱🇰 Serving Sri Lankan Healthcare
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}