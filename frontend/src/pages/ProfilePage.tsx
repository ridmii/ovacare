import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, User, Mail, Lock, Camera, Calendar, Clock, MapPin,
  Stethoscope, ShieldCheck, Eye, EyeOff, CheckCircle,
  AlertCircle, ChevronRight, ImageOff, Loader2, Trash2, UserCircle2, X, Edit2
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'
import { FloatingElements } from '../components/FloatingElements'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../utils/AuthContext'
import { getToken, saveSession } from '../utils/authService'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'

type Tab = 'account' | 'appointments' | 'privacy'

interface Booking {
  _id: string
  appointmentDate: string
  timeSlot: string
  reasonForVisit: string
  status: string
  doctorId?: {
    name: string
    specialty: string
    hospital: string
    location: string
    availableSlots?: { date: string, slots: string[] }[]
  }
}

interface ProfilePageProps {
  setActivePage: (page: string) => void
}

export function ProfilePage({ setActivePage }: ProfilePageProps) {
  const { user, setUser, logout } = useAuth()
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('account')

  // ── Account form state ──────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [accountMsg, setAccountMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)

  // ── Avatar state ────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Appointments state ──────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>([])
  const [apptLoading, setApptLoading] = useState(false)
  const [apptError, setApptError] = useState<string | null>(null)

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // ── Privacy / consent state ─────────────────────────────────────────────
  const [saveScans, setSaveScans] = useState(false)
  const [privacyLoading, setPrivacyLoading] = useState(false)
  const [privacyMsg, setPrivacyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) { setActivePage('login'); return }
    setName(user.name || '')
    setEmail(user.email || '')
  }, [user, setActivePage])

  // Fetch full user on mount (includes saveUltrasoundImages)
  useEffect(() => {
    async function fetchMe() {
      const token = getToken()
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setSaveScans(data.user.saveUltrasoundImages ?? false)
        } else if (res.status === 401 || res.status === 404) {
          logout()
          setActivePage('login')
        }
      } catch {}
    }
    fetchMe()
  }, [setUser])

  // Fetch appointments when tab opens
  useEffect(() => {
    if (tab !== 'appointments') return
    setApptLoading(true)
    setApptError(null)
    const token = getToken()
    fetch(`${API_BASE}/api/profile/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setBookings(d.bookings || []); setApptLoading(false) })
      .catch(() => { setApptError('Could not load appointments.'); setApptLoading(false) })
  }, [tab])

  // ── Bookings Edit & Cancel ──────────────────────────────────────────────
  async function handleCancelBooking() {
    if (!bookingToCancel) return
    setCancelLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingToCancel._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ reason: cancelReason })
      })
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b))
        setBookingToCancel(null)
        setCancelReason('')
      } else {
        alert('Failed to cancel booking')
      }
    } catch (e) {
      alert('Error cancelling booking')
    }
    setCancelLoading(false)
  }

  async function handleEditBooking() {
    if (!bookingToEdit || !editDate || !editTime) return
    setEditLoading(true)
    setEditError(null)
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingToEdit._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ appointmentDate: editDate, timeSlot: editTime })
      })
      const data = await res.json()
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === bookingToEdit._id ? { ...b, appointmentDate: data.booking.appointmentDate, timeSlot: data.booking.timeSlot } : b))
        setBookingToEdit(null)
      } else {
        setEditError(data.error || 'Failed to edit booking')
      }
    } catch (e) {
      setEditError('Network error while editing booking')
    }
    setEditLoading(false)
  }

  // ── Avatar handling ─────────────────────────────────────────────────────
  function handleAvatarClick() { fileInputRef.current?.click() }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarLoading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await fetch(`${API_BASE}/api/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        saveSession(getToken()!, data.user)
      }
    } catch {}
    setAvatarLoading(false)
  }

  // ── Avatar delete ───────────────────────────────────────────────────────
  async function handleAvatarDelete() {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/profile/avatar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (res.ok) {
        setAvatarPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setUser(data.user)
        saveSession(getToken()!, data.user)
      } else if (res.status === 401) {
        logout()
        setActivePage('login')
      }
    } catch {}
    setDeleteLoading(false)
  }

  // ── Account save ────────────────────────────────────────────────────────
  async function handleAccountSave(e: React.FormEvent) {
    e.preventDefault()
    setAccountMsg(null)
    if (newPassword && newPassword !== confirmPassword) {
      setAccountMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setAccountLoading(true)
    try {
      const body: Record<string, string> = { name, email }
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword }
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        saveSession(getToken()!, data.user)
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
        setAccountMsg({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setAccountMsg({ type: 'error', text: data.error || 'Update failed.' })
      }
    } catch {
      setAccountMsg({ type: 'error', text: 'Network error. Please try again.' })
    }
    setAccountLoading(false)
  }

  // ── Ultrasound consent toggle ───────────────────────────────────────────
  async function handleConsentToggle(value: boolean) {
    setPrivacyMsg(null)
    setSaveScans(value)
    setPrivacyLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/profile/ultrasound-consent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ saveUltrasoundImages: value }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        saveSession(getToken()!, data.user)
        setPrivacyMsg({ type: 'success', text: value ? 'Scan images will now be saved.' : 'Scan images will not be saved.' })
      } else {
        setSaveScans(!value)
        setPrivacyMsg({ type: 'error', text: data.error || 'Could not update preference.' })
      }
    } catch {
      setSaveScans(!value)
      setPrivacyMsg({ type: 'error', text: 'Network error.' })
    }
    setPrivacyLoading(false)
  }

  // ── Avatar display ──────────────────────────────────────────────────────
  const displayAvatar = avatarPreview
    || (user?.profileImage ? `${API_BASE}/${user.profileImage}` : null)
    || user?.avatar
    || null

  const hasPhoto = !!displayAvatar

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: t('profile.tabs.account', { defaultValue: 'Account' }), icon: <User className="h-4 w-4" /> },
    { id: 'appointments', label: t('profile.tabs.appointments', { defaultValue: 'Appointments' }), icon: <Calendar className="h-4 w-4" /> },
    { id: 'privacy', label: t('profile.tabs.privacy', { defaultValue: 'Privacy' }), icon: <ShieldCheck className="h-4 w-4" /> },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8f7ff] via-[#fff7fb] to-[#eef7ff] px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => setActivePage('home')}
        className="absolute left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-ovacare-navy shadow-sm backdrop-blur-md transition hover:bg-white/80 sm:left-8 sm:top-8"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <FloatingElements variant="purple" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Header ── */}
          <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-gradient-to-br from-ovacare-purple to-ovacare-deep flex items-center justify-center text-white shadow-lg ring-4 ring-white">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-14 w-14 text-white/80" />
                )}
                {(avatarLoading || deleteLoading) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={handleAvatarClick}
                disabled={avatarLoading || deleteLoading}
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-ovacare-purple shadow-md hover:bg-ovacare-purple hover:text-white text-ovacare-purple transition disabled:opacity-50"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>

              {/* Delete button — only shown when there's a photo */}
              {hasPhoto && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleAvatarDelete();
                  }}
                  disabled={avatarLoading || deleteLoading}
                  className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-red-400 shadow-md hover:bg-red-500 hover:text-white text-red-400 transition disabled:opacity-50"
                  title="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-ovacare-navy">{user?.name}</h1>
              <p className="text-ovacare-gray text-sm mt-1">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ovacare-purple/10 px-3 py-1 text-xs font-medium text-ovacare-purple">
                <ShieldCheck className="h-3 w-3" />
                {user?.provider === 'google' ? t('profile.account.googleAccount', { defaultValue: 'Google Account' }) : t('profile.account.emailAccount', { defaultValue: 'Email Account' })}
              </span>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mb-6 flex gap-1 rounded-2xl border border-white/60 bg-white/60 p-1.5 backdrop-blur-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-white shadow text-ovacare-purple'
                    : 'text-ovacare-gray hover:text-ovacare-navy'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Panels ── */}
          <AnimatePresence mode="wait">
            {/* ── ACCOUNT TAB ── */}
            {tab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <GlassCard className="p-6 sm:p-8" glow>
                  <h2 className="text-xl font-bold text-ovacare-navy mb-6">{t('profile.account.editProfile', { defaultValue: 'Edit Profile' })}</h2>

                  {accountMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className={`mb-5 flex items-start gap-2 rounded-2xl p-3 text-sm ${
                        accountMsg.type === 'success'
                          ? 'border border-green-200 bg-green-50 text-green-700'
                          : 'border border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {accountMsg.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                      {accountMsg.text}
                    </motion.div>
                  )}

                  <form onSubmit={handleAccountSave} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ovacare-navy">{t('profile.account.fullName', { defaultValue: 'Full Name' })}</label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text" value={name} onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="block w-full rounded-2xl border border-gray-200 bg-white/70 py-3 pl-12 pr-4 text-ovacare-navy outline-none transition focus:border-transparent focus:ring-2 focus:ring-ovacare-purple"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ovacare-navy">{t('profile.account.emailAddress', { defaultValue: 'Email Address' })}</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="block w-full rounded-2xl border border-gray-200 bg-white/70 py-3 pl-12 pr-4 text-ovacare-navy outline-none transition focus:border-transparent focus:ring-2 focus:ring-ovacare-purple"
                        />
                      </div>
                    </div>

                    {/* Password section */}
                    <div className="rounded-2xl border border-dashed border-gray-200 p-4 space-y-4">
                      <p className="text-sm font-medium text-ovacare-navy flex items-center gap-2">
                        <Lock className="h-4 w-4 text-ovacare-purple" />
                        {t('profile.account.changePassword', { defaultValue: 'Change Password' })} <span className="text-ovacare-gray font-normal">{t('profile.account.leaveBlank', { defaultValue: '(leave blank to keep current)' })}</span>
                      </p>

                      {/* Current password */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ovacare-gray">{t('profile.account.currentPassword', { defaultValue: 'Current Password' })}</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showCurrent ? 'text' : 'password'} value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="block w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-11 pr-11 text-sm text-ovacare-navy outline-none focus:ring-2 focus:ring-ovacare-purple"
                          />
                          <button type="button" onClick={() => setShowCurrent((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New password */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-ovacare-gray">{t('profile.account.newPassword', { defaultValue: 'New Password' })}</label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input type={showNew ? 'text' : 'password'} value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)} placeholder={t('profile.account.min8Chars', { defaultValue: 'Min. 8 characters' }) as string}
                              className="block w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-11 pr-11 text-sm text-ovacare-navy outline-none focus:ring-2 focus:ring-ovacare-purple"
                            />
                            <button type="button" onClick={() => setShowNew((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-ovacare-gray">{t('profile.account.confirmNewPassword', { defaultValue: 'Confirm New Password' })}</label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input type="password" value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                              className={`block w-full rounded-xl border bg-white/70 py-2.5 pl-11 pr-4 text-sm text-ovacare-navy outline-none focus:ring-2 focus:ring-ovacare-purple ${
                                confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-gray-200'
                              }`}
                            />
                          </div>
                          {confirmPassword && confirmPassword !== newPassword && (
                            <p className="mt-1 text-xs text-red-500">{t('profile.account.passwordsDontMatch', { defaultValue: 'Passwords don\'t match' })}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <GradientButton type="submit" disabled={accountLoading} className="px-8">
                        {accountLoading ? t('profile.account.saving', { defaultValue: 'Saving…' }) : t('profile.account.saveChanges', { defaultValue: 'Save Changes' })}
                      </GradientButton>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}

            {/* ── APPOINTMENTS TAB ── */}
            {tab === 'appointments' && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <GlassCard className="p-6 sm:p-8" glow>
                  <h2 className="text-xl font-bold text-ovacare-navy mb-6">{t('profile.appointments.myAppointments', { defaultValue: 'My Appointments' })}</h2>

                  {apptLoading && (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 text-ovacare-purple animate-spin" />
                    </div>
                  )}

                  {apptError && (
                    <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {apptError}
                    </div>
                  )}

                  {!apptLoading && !apptError && bookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-ovacare-purple/10 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-ovacare-purple" />
                      </div>
                      <p className="text-lg font-semibold text-ovacare-navy">{t('profile.appointments.noAppointmentsYet', { defaultValue: 'No appointments yet' })}</p>
                      <p className="text-sm text-ovacare-gray max-w-xs">
                        {t('profile.appointments.bookAnAppointment', { defaultValue: 'Book an appointment with one of our specialists and it will appear here.' })}
                      </p>
                      <GradientButton size="sm" onClick={() => setActivePage('doctors')}>
                        {t('profile.appointments.findDoctor', { defaultValue: 'Find a Doctor' })}
                      </GradientButton>
                    </div>
                  )}

                  {!apptLoading && bookings.length > 0 && (
                    <div className="space-y-4">
                      {bookings.map((b) => {
                        const date = new Date(b.appointmentDate)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isPast = date < today
                        return (
                          <motion.div
                            key={b._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm"
                          >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isPast ? 'bg-gray-100' : 'bg-ovacare-purple/10'}`}>
                              <Stethoscope className={`h-6 w-6 ${isPast ? 'text-gray-400' : 'text-ovacare-purple'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-ovacare-navy truncate">
                                {b.doctorId?.name || t('profile.appointments.doctor', { defaultValue: 'Doctor' })}
                              </p>
                              <p className="text-sm text-ovacare-gray truncate">{b.doctorId?.specialty}</p>
                              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-ovacare-gray">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> {b.timeSlot}
                                </span>
                                {b.doctorId?.hospital && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" /> {b.doctorId.hospital}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 items-end">
                              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                b.status === 'confirmed'
                                  ? isPast ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {b.status === 'confirmed' ? (isPast ? t('profile.appointments.completed', { defaultValue: 'Completed' }) : t('profile.appointments.confirmed', { defaultValue: 'Confirmed' })) : b.status}
                              </span>
                              {!isPast && b.status === 'confirmed' && (
                                <div className="flex gap-2 mt-1">
                                  <button onClick={() => {
                                      setBookingToEdit(b)
                                      const yyyyMmDd = new Date(b.appointmentDate).toISOString().split('T')[0]
                                      setEditDate(yyyyMmDd)
                                      setEditTime(b.timeSlot)
                                    }} className="text-xs text-ovacare-navy hover:text-ovacare-purple flex items-center gap-1 font-medium bg-white/50 px-2 py-1 rounded-md border border-white/60">
                                    <Edit2 className="h-3 w-3" /> Edit
                                  </button>
                                  <button onClick={() => setBookingToCancel(b)} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded-md border border-red-100">
                                    <Trash2 className="h-3 w-3" /> Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* ── PRIVACY TAB ── */}
            {tab === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <GlassCard className="p-6 sm:p-8" glow>
                  <h2 className="text-xl font-bold text-ovacare-navy mb-2">{t('profile.privacy.privacySettings', { defaultValue: 'Privacy Settings' })}</h2>
                  <p className="text-sm text-ovacare-gray mb-8">
                    {t('profile.privacy.controlData', { defaultValue: 'Control how your health data is used and stored on OvaCare.' })}
                  </p>

                  {privacyMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className={`mb-6 flex items-start gap-2 rounded-2xl p-3 text-sm ${
                        privacyMsg.type === 'success'
                          ? 'border border-green-200 bg-green-50 text-green-700'
                          : 'border border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {privacyMsg.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                      {privacyMsg.text}
                    </motion.div>
                  )}

                  {/* Ultrasound consent toggle */}
                  <div className="rounded-2xl border border-white/60 bg-white/60 p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex gap-4">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${saveScans ? 'bg-ovacare-purple/10' : 'bg-gray-100'}`}>
                          {saveScans ? <ShieldCheck className="h-5 w-5 text-ovacare-purple" /> : <ImageOff className="h-5 w-5 text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-ovacare-navy">{t('profile.privacy.saveUltrasound', { defaultValue: 'Save Ultrasound Scan Images' })}</p>
                          <p className="mt-1 text-sm text-ovacare-gray leading-relaxed">
                            {t('profile.privacy.allowStorage', { defaultValue: 'Allow OvaCare to store your uploaded ultrasound images in our secure database to improve AI accuracy and enable future scan comparisons. You can change this at any time.' })}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${saveScans ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {saveScans ? t('profile.privacy.imagesWillBeSaved', { defaultValue: '✓ Images will be saved' }) : t('profile.privacy.imagesWillNotBeSaved', { defaultValue: '✗ Images will not be saved' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <button
                        type="button"
                        disabled={privacyLoading}
                        onClick={() => handleConsentToggle(!saveScans)}
                        className={`relative mt-1 flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ovacare-purple focus:ring-offset-2 ${
                          saveScans ? 'bg-ovacare-purple' : 'bg-gray-300'
                        } ${privacyLoading ? 'opacity-60' : ''}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${saveScans ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {/* What we always store */}
                  <div className="mt-6 rounded-2xl border border-ovacare-purple/20 bg-ovacare-purple/5 p-5">
                    <p className="text-sm font-semibold text-ovacare-navy mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-ovacare-purple" />
                      {t('profile.privacy.whatWeAlwaysStore', { defaultValue: 'What we always store' })}
                    </p>
                    <ul className="space-y-1.5 text-sm text-ovacare-gray">
                      {[
                        t('profile.privacy.alwaysStoreName', { defaultValue: 'Your name and email address' }),
                        t('profile.privacy.alwaysStoreAppt', { defaultValue: 'Appointment booking details' }),
                        t('profile.privacy.alwaysStorePrefs', { defaultValue: 'Account preferences (like this setting)' })
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-ovacare-purple shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-semibold text-ovacare-navy mt-4 mb-3 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-gray-400" />
                      {t('profile.privacy.whatWeNeverStore', { defaultValue: 'What we never store (unless you opt in above)' })}
                    </p>
                    <ul className="space-y-1.5 text-sm text-ovacare-gray">
                      {[
                        t('profile.privacy.neverStoreScans', { defaultValue: 'Ultrasound scan images' }),
                        t('profile.privacy.neverStoreAI', { defaultValue: 'AI analysis results' })
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── CANCEL BOOKING MODAL ── */}
      <AnimatePresence>
        {bookingToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setBookingToCancel(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold text-ovacare-navy">Cancel Appointment</h3>
              <p className="text-sm text-ovacare-gray mt-2">Are you sure you want to cancel this appointment with {bookingToCancel?.doctorId?.name}? This action cannot be undone.</p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-ovacare-navy mb-1">Reason for cancellation (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-ovacare-purple focus:ring-ovacare-purple"
                  rows={3}
                  placeholder="Tell us why you are cancelling..."
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setBookingToCancel(null)}
                  className="px-4 py-2 text-sm font-medium text-ovacare-gray hover:text-ovacare-navy bg-gray-100 rounded-xl"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
                >
                  {cancelLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT BOOKING MODAL ── */}
      <AnimatePresence>
        {bookingToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setBookingToEdit(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-ovacare-navy">Edit Appointment</h3>
              {editError && <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{editError}</div>}
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ovacare-navy mb-1">Select New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={editDate}
                    onChange={(e) => {
                      setEditDate(e.target.value)
                      setEditTime('') // reset time when date changes
                    }}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-ovacare-purple focus:ring-ovacare-purple"
                  />
                </div>

                {editDate && (
                  <div>
                    <label className="block text-sm font-medium text-ovacare-navy mb-1">Select New Time</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
                      ].map((time) => (
                        <button
                          key={time}
                          onClick={() => setEditTime(time)}
                          className={`rounded-xl border p-2 text-sm transition-all ${
                            editTime === time
                              ? 'border-ovacare-purple bg-ovacare-purple/10 text-ovacare-purple font-semibold'
                              : 'border-gray-200 bg-white text-ovacare-gray hover:border-ovacare-purple/30'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setBookingToEdit(null)}
                  className="px-4 py-2 text-sm font-medium text-ovacare-gray hover:text-ovacare-navy bg-gray-100 rounded-xl"
                >
                  Discard Changes
                </button>
                <GradientButton
                  size="sm"
                  disabled={editLoading || !editDate || !editTime}
                  onClick={handleEditBooking}
                >
                  {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
