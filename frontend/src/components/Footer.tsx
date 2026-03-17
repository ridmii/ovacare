import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
} from 'lucide-react'

interface FooterProps {
  setActivePage: (page: string) => void
}

export function Footer({ setActivePage }: FooterProps) {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 relative overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ovacare-purple via-ovacare-pink to-ovacare-coral" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ovacare-purple to-ovacare-deep flex items-center justify-center mr-2">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-ovacare-navy">
                OvaCare
              </span>
            </div>
            <p className="text-ovacare-gray text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-gray-400 hover:text-ovacare-purple transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-ovacare-navy uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {[
                { name: t('navbar.home'), id: 'home' },
                { name: t('navbar.aiScan'), id: 'scan' },
                { name: t('navbar.education'), id: 'education' },
                { name: t('navbar.doctors'), id: 'doctors' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className="text-ovacare-gray hover:text-ovacare-purple text-sm transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ovacare-navy uppercase tracking-wider mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: '#' },
                { name: 'Careers', href: '#' },
                { name: t('footer.privacyPolicy'), href: '#' },
                { name: t('footer.termsOfService'), href: '#' },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-ovacare-gray hover:text-ovacare-purple text-sm transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-ovacare-navy uppercase tracking-wider mb-4">
              {t('footer.followUs')}
            </h3>
            <p className="text-ovacare-gray text-sm mb-4">
              Subscribe to our newsletter for the latest health tips and
              updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ovacare-purple focus:border-transparent text-sm"
              />
              <button className="bg-ovacare-purple text-white px-4 py-2 rounded-r-lg hover:bg-ovacare-deep transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} OvaCare Health Inc. {t('footer.allRightsReserved')}
          </p>
          <div className="flex space-x-6">
            <span className="text-gray-400 text-xs">HIPAA Compliant</span>
            <span className="text-gray-400 text-xs">FDA Registered</span>
            <span className="text-gray-400 text-xs">256-bit Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  )
}