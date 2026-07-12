import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, Stethoscope, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'
import { FloatingElements } from '../components/FloatingElements'
import { login, saveSession } from '../utils/authService'
import { useAuth } from '../utils/AuthContext'
import { useTranslation } from 'react-i18next'

interface LoginPageProps {
  setActivePage: (page: string) => void
}

export function LoginPage({ setActivePage }: LoginPageProps) {
  const { t } = useTranslation()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.email || !form.password) {
      setError(t('auth.login.errorFillFields'))
      return
    }
    setLoading(true)
    try {
      const res = await login({ email: form.email, password: form.password })
      setUser(res.user)
      setSuccess(true)
      setTimeout(() => setActivePage('home'), 1500)
    } catch (err: any) {
      setError(err?.response?.data?.error || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null)
      setLoading(true)
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        if (!userInfoRes.ok) throw new Error('Failed to fetch Google user info')
        const userInfo = await userInfoRes.json()
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'
        const res = await fetch(`${apiUrl}/api/auth/google-access-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            name: userInfo.name,
            email: userInfo.email,
            sub: userInfo.sub,
            picture: userInfo.picture,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Google sign-in failed')
        }
        const data = await res.json()
        saveSession(data.token, data.user)
        setUser(data.user)
        setSuccess(true)
        setTimeout(() => setActivePage('home'), 1500)
      } catch (err: any) {
        setError(err?.message || t('common.error'))
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError(t('auth.signup.errorGoogle'))
    },
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8f7ff] via-[#fff7fb] to-[#eef7ff] px-4 py-12 sm:px-6 lg:px-8">
      <FloatingElements variant="purple" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center"
        >
          {/* Left: hero panel */}
          <div className="hidden lg:flex lg:flex-col lg:justify-between lg:rounded-[2rem] lg:border lg:border-white/40 lg:bg-white/40 lg:p-10 lg:backdrop-blur-xl lg:shadow-[0_20px_80px_rgba(110,86,207,0.14)]">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-ovacare-purple shadow-sm">
                <Sparkles className="h-4 w-4" />
                {t('auth.login.badge')}
              </div>
              <h1 className="max-w-xl text-5xl font-bold leading-tight text-ovacare-navy">
                {t('auth.login.heroTitle')}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-ovacare-gray">
                {t('auth.login.heroTitle')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {(Array.isArray(t('auth.login.features', { returnObjects: true })) 
                ? (t('auth.login.features', { returnObjects: true }) as any[]) 
                : [
                    { title: 'Secure & Private', text: 'Your data is encrypted and protected' },
                    { title: 'Expert Doctors', text: 'Connect with verified specialists' },
                    { title: 'Fast Results', text: 'Get your analysis in minutes' }
                  ]
              ).map((item, i) => {
                const icons = [ShieldCheck, Stethoscope, Sparkles]
                const Icon = icons[i] || Sparkles
                return (
                  <div key={item.title} className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm">
                    <Icon className="h-5 w-5 text-ovacare-purple" />
                    <h2 className="mt-3 text-sm font-semibold text-ovacare-navy">{item.title}</h2>
                    <p className="mt-1 text-sm text-ovacare-gray">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: login form */}
          <GlassCard className="relative mx-auto w-full max-w-[400px] p-8" glow>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ovacare-purple to-ovacare-deep text-white shadow-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-ovacare-navy">{t('auth.login.title')}</h2>
              <p className="mt-1 text-sm text-ovacare-gray">
                {t('auth.login.subtitle')}
              </p>
            </div>

            {/* Google Login */}
            <div className="mt-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleGoogleLogin()}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-2.5 px-4 text-sm font-medium text-ovacare-navy shadow-sm transition hover:bg-gray-50 hover:shadow-md disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z" />
                </svg>
                {t('auth.login.googleButton')}
              </button>
            </div>

            <div className="relative my-4 flex items-center">
              <div className="flex-1 border-t border-gray-200" />
              <span className="mx-4 text-xs font-medium text-ovacare-gray">{t('auth.login.orEmail')}</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Error / Success */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {t('auth.login.success')}
              </motion.div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-ovacare-navy">{t('auth.login.emailLabel')}</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t('auth.login.emailPlaceholder')}
                    className="block w-full rounded-2xl border border-gray-200 bg-white/70 py-2 pl-12 pr-4 text-ovacare-navy outline-none transition focus:border-transparent focus:ring-2 focus:ring-ovacare-purple"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-ovacare-navy">{t('auth.login.passwordLabel')}</label>
                  <button type="button" className="text-sm font-medium text-ovacare-purple transition hover:text-ovacare-deep">
                    {t('auth.login.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    className="block w-full rounded-2xl border border-gray-200 bg-white/70 py-2 pl-12 pr-12 text-ovacare-navy outline-none transition focus:border-transparent focus:ring-2 focus:ring-ovacare-purple"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-ovacare-gray">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-ovacare-purple focus:ring-ovacare-purple"
                  />
                  {t('auth.login.rememberMe')}
                </label>
              </div>

              <GradientButton className="mt-2 w-full justify-center py-2.5" type="submit" disabled={loading}>
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t('auth.login.submitButton')}
              </GradientButton>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-ovacare-gray">
                {t('auth.login.noAccount')}{' '}
                <button
                  onClick={() => setActivePage('signup')}
                  className="inline-flex items-center gap-1 font-medium text-ovacare-purple transition hover:text-ovacare-deep"
                >
                  {t('auth.login.signupLink')} <ArrowRight className="h-4 w-4" />
                </button>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}