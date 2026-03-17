import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GradientButton } from './GradientButton'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavbarProps {
  activePage: string
  setActivePage: (page: string) => void
}

export function Navbar({ activePage, setActivePage }: NavbarProps) {
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    {
      name: t('navbar.home'),
      id: 'home',
    },
    {
      name: t('navbar.aiScan'),
      id: 'scan',
    },
    {
      name: t('navbar.education'),
      id: 'education',
    },
    {
      name: t('navbar.doctors'),
      id: 'doctors',
    },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => setActivePage('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ovacare-purple to-ovacare-deep flex items-center justify-center mr-3 shadow-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ovacare-navy to-ovacare-purple">
              OvaCare
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${activePage === link.id ? 'text-ovacare-purple' : 'text-ovacare-gray hover:text-ovacare-navy'}`}
              >
                {link.name}
                {activePage === link.id && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ovacare-purple rounded-full"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
            <GradientButton size="sm" onClick={() => setActivePage('scan')}>
              Start Scan
            </GradientButton>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-ovacare-gray hover:text-ovacare-navy focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActivePage(link.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${activePage === link.id ? 'bg-ovacare-purple/10 text-ovacare-purple' : 'text-ovacare-gray hover:bg-gray-50 hover:text-ovacare-navy'}`}
                >
                  {link.name}
                </button>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="pt-4 pb-2">
                <div className="text-sm font-medium text-ovacare-gray mb-2">Language / භාෂාව / மொழி</div>
                <LanguageSwitcher />
              </div>

              <div className="pt-4">
                <GradientButton
                  className="w-full"
                  onClick={() => {
                    setActivePage('scan')
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {t('hero.startScan')}
                </GradientButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}