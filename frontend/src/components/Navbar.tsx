import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Activity, User, LogOut, ChevronDown, UserCircle2, ChevronRight, Home, Sparkles, BookOpen, Stethoscope } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GradientButton } from './GradientButton'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAuth } from '../utils/AuthContext'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'

interface NavbarProps {
  activePage: string
  setActivePage: (page: string) => void
}

export function Navbar({ activePage, setActivePage }: NavbarProps) {
  const { t } = useTranslation()
  const { user, isLoggedIn, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Apply actual CSS blur to the rest of the page for guaranteed effect
  useEffect(() => {
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')
    if (isMobileMenuOpen) {
      if (main) { main.style.filter = 'blur(8px)'; main.style.transition = 'filter 0.3s' }
      if (footer) { footer.style.filter = 'blur(8px)'; footer.style.transition = 'filter 0.3s' }
    } else {
      if (main) main.style.filter = 'none'
      if (footer) footer.style.filter = 'none'
    }
    return () => {
      if (main) main.style.filter = 'none'
      if (footer) footer.style.filter = 'none'
    }
  }, [isMobileMenuOpen])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLinks = [
    { name: t('navbar.home'), id: 'home', icon: <Home className="w-5 h-5" /> },
    { name: t('navbar.aiScan'), id: 'scan', icon: <Sparkles className="w-5 h-5" /> },
    { name: t('navbar.education'), id: 'education', icon: <BookOpen className="w-5 h-5" /> },
    { name: t('navbar.doctors'), id: 'doctors', icon: <Stethoscope className="w-5 h-5" /> },
  ]

  // Build avatar URL: prefer uploaded profileImage, then Google avatar, else null
  const avatarUrl = user?.profileImage
    ? `${API_BASE}/${user.profileImage}`
    : user?.avatar || null

  // Initials fallback (kept for accessibility title only)
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : ''

  function handleSignOut() {
    logout()
    setIsProfileOpen(false)
    setActivePage('home')
  }

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
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  activePage === link.id ? 'text-ovacare-purple' : 'text-ovacare-gray hover:text-ovacare-navy'
                }`}
              >
                {link.name}
                {activePage === link.id && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-ovacare-purple rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}

            <LanguageSwitcher />

            {/* Auth section */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 pl-1 pr-3 py-1 shadow-sm hover:shadow-md transition group"
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-ovacare-purple to-ovacare-deep flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-6 w-6 text-white/90" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-ovacare-navy max-w-[120px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-ovacare-gray transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-ovacare-navy truncate">{user?.name}</p>
                        <p className="text-xs text-ovacare-gray truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => { setActivePage('profile'); setIsProfileOpen(false) }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ovacare-navy hover:bg-ovacare-purple/10 hover:text-ovacare-purple transition"
                        >
                          <User className="h-4 w-4" />
                          My Profile
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <GradientButton size="sm" onClick={() => setActivePage('signup')}>
                Sign up
              </GradientButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {isLoggedIn && (
              <div
                className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-ovacare-purple to-ovacare-deep flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                onClick={() => { setActivePage('profile'); setIsMobileMenuOpen(false) }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-6 w-6 text-white/90" />
                )}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-ovacare-gray hover:text-ovacare-navy focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <React.Fragment key="mobile-menu-wrapper">
            {/* Backdrop */}
            {/* Invisible Backdrop (just for clicking to close) */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-[80px] bg-transparent z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 w-full bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-xl z-50"
            >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { setActivePage(link.id); setIsMobileMenuOpen(false) }}
                  className={`group flex items-center justify-between w-full text-left px-4 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
                    activePage === link.id
                      ? 'bg-ovacare-purple/10 text-ovacare-purple shadow-sm'
                      : 'text-ovacare-gray hover:bg-white/40 hover:text-ovacare-navy hover:shadow-sm hover:translate-x-2'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${activePage === link.id ? 'text-ovacare-purple' : 'text-ovacare-gray group-hover:text-ovacare-purple'} transition-colors duration-300`}>
                      {link.icon}
                    </span>
                    {link.name}
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activePage === link.id ? 'translate-x-1' : 'group-hover:translate-x-1 opacity-50 group-hover:opacity-100'}`} />
                </button>
              ))}

              <div className="py-1">
                <LanguageSwitcher />
              </div>

              <div className="pt-3 mt-2 border-t border-white/20 space-y-3">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => { setActivePage('profile'); setIsMobileMenuOpen(false) }}
                      className="group flex w-full justify-between items-center px-4 py-4 rounded-2xl text-base font-semibold text-ovacare-navy hover:bg-white/40 transition-all duration-300 hover:shadow-sm hover:translate-x-2"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-ovacare-purple group-hover:scale-110 transition-transform duration-300" />
                        My Profile
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                    <button
                      onClick={() => { handleSignOut(); setIsMobileMenuOpen(false) }}
                      className="group flex w-full justify-between items-center px-4 py-4 rounded-2xl text-base font-semibold text-red-600 hover:bg-red-500/10 transition-all duration-300 hover:shadow-sm hover:translate-x-2"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        Sign Out
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </>
                ) : (
                  <GradientButton
                    className="w-full py-4 text-lg rounded-2xl shadow-lg shadow-ovacare-purple/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    onClick={() => { setActivePage('signup'); setIsMobileMenuOpen(false) }}
                  >
                    Sign up
                  </GradientButton>
                )}
              </div>

            </div>
          </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </nav>
  )
}