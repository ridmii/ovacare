import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Loader2,
} from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'

const FLASK_API = process.env.REACT_APP_FLASK_API || 'http://127.0.0.1:5001'
const WHATSAPP_CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbCcXTL9MF9AlZa1Rf1X'
const NEWSLETTER_MESSAGE_MS = 4000

interface FooterProps {
  setActivePage: (page: string) => void
}

export function Footer({ setActivePage }: FooterProps) {
  const { t } = useTranslation()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  useEffect(() => {
    if (!subscribeMessage) return

    const timer = window.setTimeout(() => {
      setSubscribeMessage(null)
    }, NEWSLETTER_MESSAGE_MS)

    return () => window.clearTimeout(timer)
  }, [subscribeMessage])

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const email = newsletterEmail.trim()

    if (!email) {
      setSubscribeError(t('footer.newsletterInvalidEmail'))
      setSubscribeMessage(null)
      return
    }

    setSubscribing(true)
    setSubscribeError(null)
    setSubscribeMessage(null)

    try {
      const response = await fetch(`${FLASK_API}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('footer.newsletterError'))
      }

      setSubscribeMessage(
        data.alreadySubscribed
          ? t('footer.newsletterAlreadySubscribed')
          : t('footer.newsletterSuccess')
      )
      setNewsletterEmail('')
    } catch (error) {
      setSubscribeError(
        error instanceof Error ? error.message : t('footer.newsletterError')
      )
    } finally {
      setSubscribing(false)
    }
  }

  const socialLinks = [
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
    {
      Icon: WhatsAppIcon,
      href: WHATSAPP_CHANNEL_URL,
      label: t('footer.whatsappChannel'),
      external: true,
    },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ovacare-purple via-ovacare-pink to-ovacare-coral" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ovacare-purple to-ovacare-deep flex items-center justify-center mr-2">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-ovacare-navy">OvaCare</span>
            </div>
            <p className="text-ovacare-gray text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ Icon, href, label, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="text-gray-400 hover:text-ovacare-purple transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

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
                { name: t('footer.aboutUs'), href: '#' },
                { name: t('footer.careers'), href: '#' },
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

          <div>
            <h3 className="text-sm font-bold text-ovacare-navy uppercase tracking-wider mb-4">
              {t('footer.followUs')}
            </h3>
            <p className="text-ovacare-gray text-sm mb-4">
              {t('footer.newsletterDescription')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  disabled={subscribing}
                  className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ovacare-purple focus:border-transparent text-sm disabled:opacity-60"
                  aria-label={t('footer.newsletterPlaceholder')}
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-ovacare-purple text-white px-4 py-2 rounded-r-lg hover:bg-ovacare-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label={t('footer.newsletterSubscribe')}
                >
                  {subscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </button>
              </div>
              {subscribeMessage && (
                <p className="text-sm text-green-600">{subscribeMessage}</p>
              )}
              {subscribeError && (
                <p className="text-sm text-red-600">{subscribeError}</p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} OvaCare Health Inc. {t('footer.allRightsReserved')}
          </p>
          <div className="flex space-x-6">
            <span className="text-gray-400 text-xs">{t('home.compliance.hipaa')}</span>
            <span className="text-gray-400 text-xs">{t('home.compliance.fda')}</span>
            <span className="text-gray-400 text-xs">{t('home.compliance.encryption')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
