import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { api } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  ChevronRight,
  Stethoscope,
  Heart,
  Baby,
  Award,
  Users,
  Video,
  MessageSquare,
  CheckCircle,
  X,
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'

type ActiveForm = 'specialist' | 'provider' | null

interface SpecialistMatchForm {
  submitterName: string
  submitterEmail: string
  doctorName: string
  specialty: string
  location: string
  details: string
}

interface ProviderApplicationForm {
  name: string
  specialty: string
  description: string
  email: string
  phone: string
}

const emptySpecialistForm: SpecialistMatchForm = {
  submitterName: '',
  submitterEmail: '',
  doctorName: '',
  specialty: '',
  location: '',
  details: '',
}

const emptyProviderForm: ProviderApplicationForm = {
  name: '',
  specialty: '',
  description: '',
  email: '',
  phone: '',
}

interface DoctorsPageProps {
  setActivePage: (page: string) => void
}

interface ApiDoctor {
  _id?: string
  id?: number | string
  name: string
  specialty: string
  hospital?: string
  location: string
  experience: number | string
  rating: number
  languages?: string[]
  reviews?: number
  distance?: string
  image?: string
  verified?: boolean
  availableToday?: boolean
  consultationFee?: string
  about?: string
  credentials?: string[]
  acceptsInsurance?: string[]
  officeHours?: string
  nextAvailable?: string
  categories?: string[]
}

function doctorKey(doctor: ApiDoctor): string {
  return String(doctor._id || doctor.id)
}

export function DoctorsPage({ setActivePage }: DoctorsPageProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState<ApiDoctor | null>(null)
  const [doctors, setDoctors] = useState<ApiDoctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [doctorsLoadError, setDoctorsLoadError] = useState(false)
  const [bookingType, setBookingType] = useState<'video' | 'in_person' | null>(null)
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [filterCity, setFilterCity] = useState('all')
  const [activeForm, setActiveForm] = useState<ActiveForm>(null)
  const [specialistForm, setSpecialistForm] = useState<SpecialistMatchForm>(emptySpecialistForm)
  const [providerForm, setProviderForm] = useState<ProviderApplicationForm>(emptyProviderForm)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')

  const cityOptions = [
    { id: 'all', label: t('doctors.filters.allCities') },
    { id: 'colombo', label: 'Colombo' },
    { id: 'kandy', label: 'Kandy' },
    { id: 'chilaw', label: 'Chilaw' },
  ]

  const openDoctorProfile = (doctor: ApiDoctor) => {
    setSelectedDoctor(doctor)
    setBookingType(null)
  }

  const closeDoctorProfile = () => {
    setSelectedDoctor(null)
    setBookingType(null)
  }

  const specialties = [
    { id: 'all', label: t('doctors.specialties.all'), icon: Stethoscope },
    { id: 'gynecology', label: t('doctors.specialties.gynecology'), icon: Heart },
    { id: 'endocrinology', label: t('doctors.specialties.endocrinology'), icon: Award },
    { id: 'fertility', label: t('doctors.specialties.fertility'), icon: Baby },
  ]

  const fallbackDoctors: ApiDoctor[] = [
    {
      id: 1,
      name: 'Dr. Suranga Hettipathirana',
      specialty: 'Obstetrics & Gynaecology (VOG)',
      rating: 4.9,
      reviews: 324,
      experience: '20 years',
      location: 'Colombo 07, Sri Lanka',
      distance: '2.1 km',
      image: '👨‍⚕️',
      verified: true,
      acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
      availableToday: true,
      consultationFee: 'LKR 4,500',
      about: 'Highly experienced Consultant Obstetrician & Gynaecologist. Expert in PCOS management, hormonal disorders, and gynaecological health in Sri Lankan women.',
      credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'MRCOG - UK', 'Fellowship - Reproductive Medicine'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM',
      nextAvailable: 'Today, 2:30 PM',
      categories: ['gynecology'],
    },
    {
      id: 2,
      name: 'Dr. Nalinda Rodrigo',
      specialty: 'Obstetrics & Gynaecology',
      rating: 4.8,
      reviews: 289,
      experience: '18 years',
      location: 'Colombo 05, Sri Lanka',
      distance: '2.8 km',
      image: '👩‍⚕️',
      verified: true,
      acceptsInsurance: ['Janashakthi Insurance', 'Ceylinco General', 'AIA Insurance'],
      availableToday: true,
      consultationFee: 'LKR 4,000',
      about: 'Consultant Obstetrician & Gynaecologist specializing in PCOS, reproductive health, and women\'s wellness. Known for patient-centered approach.',
      credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'MRCOG - UK'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Tue-Sat: 9AM-5PM',
      nextAvailable: 'Today, 3:00 PM',
      categories: ['gynecology'],
    },
    {
      id: 4,
      name: 'Dr. D Maruthini',
      specialty: 'Fertility & IVF Specialist',
      rating: 4.9,
      reviews: 312,
      experience: '19 years',
      location: 'Colombo 07, Sri Lanka',
      distance: '2.3 km',
      image: '👩‍⚕️',
      verified: true,
      acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
      availableToday: true,
      consultationFee: 'LKR 5,500',
      about: 'Consultant Gynaecologist, Fertility Specialist, and IVF Expert. Specializes in PCOS management, subfertility, and assisted reproductive techniques.',
      credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'Fellowship - Reproductive Medicine & IVF', 'MRCOG - UK'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-12PM',
      nextAvailable: 'Today, 4:00 PM',
      categories: ['gynecology', 'fertility'],
    },
    {
      id: 10,
      name: 'Prof. M Champika Gihan',
      specialty: 'Obstetrics & Gynaecology with Scanning',
      rating: 4.8,
      reviews: 312,
      experience: '22 years',
      location: 'Kandy, Sri Lanka',
      distance: '3.0 km',
      image: '👩‍⚕️',
      verified: true,
      acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
      availableToday: true,
      consultationFee: 'LKR 4,500',
      about: 'Professor and Senior Consultant Obstetrician & Gynaecologist. Specialist in gynaecological ultrasound and PCOS diagnosis.',
      credentials: ['MBBS - University of Peradeniya', 'MD - Obstetrics & Gynaecology', 'Diploma - Advanced Ultrasound', 'Fellowship - Reproductive Medicine'],
      languages: ['Sinhala', 'English'],
      officeHours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-12PM',
      nextAvailable: 'Today, 3:30 PM',
      categories: ['gynecology'],
    },
    {
      id: 7,
      name: 'Prof. A.K. Probhodana Ranaweera',
      specialty: 'Obstetrics & Gynaecology (VOG)',
      rating: 4.9,
      reviews: 401,
      experience: '25 years',
      location: 'Colombo 07, Sri Lanka',
      distance: '2.0 km',
      image: '👨‍⚕️',
      verified: true,
      acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
      availableToday: true,
      consultationFee: 'LKR 6,000',
      about: 'Professor and Senior Consultant Obstetrician & Gynaecologist. Leading expert in PCOS, reproductive medicine, and women\'s endocrine health.',
      credentials: ['MBBS - University of Colombo', 'MD - Obstetrics & Gynaecology', 'MRCOG - UK', 'Fellowship - Reproductive Endocrinology'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Mon-Fri: 8AM-6PM',
      nextAvailable: 'Today, 5:00 PM',
      categories: ['gynecology'],
    },
  ]

  useEffect(() => {
    let cancelled = false

    const loadDoctors = async () => {
      setLoadingDoctors(true)
      setDoctorsLoadError(false)
      try {
        const { data } = await api.get('/api/doctors')
        const list = Array.isArray(data?.doctors) ? data.doctors : []
        if (!cancelled) setDoctors(list)
      } catch {
        if (!cancelled) {
          setDoctors([])
          setDoctorsLoadError(true)
        }
      } finally {
        if (!cancelled) setLoadingDoctors(false)
      }
    }

    loadDoctors()
    return () => {
      cancelled = true
    }
  }, [])

  const sourceDoctors: ApiDoctor[] = doctors.length ? doctors : (doctorsLoadError ? [] : fallbackDoctors)

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const locationQuery = location.trim().toLowerCase()

    return sourceDoctors.filter((doctor: ApiDoctor) => {
      const categories = doctor.categories || []
      const specialtyLower = doctor.specialty.toLowerCase()
      const normalizedSpecialty = specialtyLower.replace(/gynaecology/g, 'gynecology')

      const matchesSpecialty =
        selectedSpecialty === 'all' ||
        categories.includes(selectedSpecialty) ||
        normalizedSpecialty.includes(selectedSpecialty)

      const searchText = [
        doctor.name,
        doctor.specialty,
        doctor.location,
        doctor.hospital,
        doctor.about,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = query === '' || searchText.includes(query)

      const locationText = [doctor.location, doctor.hospital, doctor.distance]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesLocation = locationQuery === '' || locationText.includes(locationQuery)

      const matchesCity =
        filterCity === 'all' || locationText.includes(filterCity)

      return (
        matchesSpecialty &&
        matchesSearch &&
        matchesLocation &&
        matchesCity
      )
    })
  }, [sourceDoctors, selectedSpecialty, searchQuery, location, filterCity])

  const activeFilterCount = filterCity !== 'all' ? 1 : 0

  const clearMoreFilters = () => {
    setFilterCity('all')
  }

  const openForm = (form: ActiveForm) => {
    setActiveForm(form)
    setFormMessage('')
    setFormError('')
  }

  const closeForm = () => {
    setActiveForm(null)
    setFormMessage('')
    setFormError('')
    setFormSubmitting(false)
  }

  const submitSpecialistMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormMessage('')
    setFormError('')
    try {
      const { data } = await api.post('/api/doctors/specialist-match', specialistForm)
      setFormMessage(data.message || t('doctors.forms.specialistMatch.success'))
      setSpecialistForm(emptySpecialistForm)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error as string) || t('doctors.forms.specialistMatch.error')
        : t('doctors.forms.specialistMatch.error')
      setFormError(message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const submitProviderApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormMessage('')
    setFormError('')
    try {
      const { data } = await api.post('/api/doctors/provider-application', providerForm)
      setFormMessage(data.message || t('doctors.forms.providerNetwork.success'))
      setProviderForm(emptyProviderForm)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error as string) || t('doctors.forms.providerNetwork.error')
        : t('doctors.forms.providerNetwork.error')
      setFormError(message)
    } finally {
      setFormSubmitting(false)
    }
  }

  const renderFormModal = () => {
    const isSpecialist = activeForm === 'specialist'

    return (
      <AnimatePresence>
        {activeForm && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg"
            >
              <GlassCard className="w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-ovacare-navy">
                      {isSpecialist
                        ? t('doctors.forms.specialistMatch.title')
                        : t('doctors.forms.providerNetwork.title')}
                    </h3>
                    <p className="text-sm text-ovacare-gray mt-1">
                      {isSpecialist
                        ? t('doctors.forms.specialistMatch.subtitle')
                        : t('doctors.forms.providerNetwork.subtitle')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-ovacare-gray hover:text-ovacare-navy"
                    aria-label={t('common.close')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formMessage ? (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    {formMessage}
                  </div>
                ) : (
                  <form onSubmit={isSpecialist ? submitSpecialistMatch : submitProviderApplication} className="space-y-4">
                    {isSpecialist ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.specialistMatch.yourName')}
                          </label>
                          <input
                            type="text"
                            value={specialistForm.submitterName}
                            onChange={(e) => setSpecialistForm({ ...specialistForm, submitterName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.specialistMatch.yourEmail')}
                          </label>
                          <input
                            type="email"
                            value={specialistForm.submitterEmail}
                            onChange={(e) => setSpecialistForm({ ...specialistForm, submitterEmail: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.specialistMatch.doctorName')} *
                          </label>
                          <input
                            type="text"
                            required
                            value={specialistForm.doctorName}
                            onChange={(e) => setSpecialistForm({ ...specialistForm, doctorName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.specialistMatch.specialty')} *
                          </label>
                          <input
                            type="text"
                            required
                            value={specialistForm.specialty}
                            onChange={(e) => setSpecialistForm({ ...specialistForm, specialty: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.specialistMatch.location')} *
                          </label>
                          <input
                            type="text"
                            required
                            value={specialistForm.location}
                            onChange={(e) => setSpecialistForm({ ...specialistForm, location: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.specialistMatch.details')}
                          </label>
                          <textarea
                            rows={4}
                            value={specialistForm.details}
                            onChange={(e) => setSpecialistForm({ ...specialistForm, details: e.target.value })}
                            placeholder={t('doctors.forms.specialistMatch.detailsPlaceholder')}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.providerNetwork.name')} *
                          </label>
                          <input
                            type="text"
                            required
                            value={providerForm.name}
                            onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.providerNetwork.specialty')} *
                          </label>
                          <input
                            type="text"
                            required
                            value={providerForm.specialty}
                            onChange={(e) => setProviderForm({ ...providerForm, specialty: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.providerNetwork.description')} *
                          </label>
                          <textarea
                            rows={4}
                            required
                            value={providerForm.description}
                            onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                            placeholder={t('doctors.forms.providerNetwork.descriptionPlaceholder')}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.providerNetwork.email')}
                          </label>
                          <input
                            type="email"
                            value={providerForm.email}
                            onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ovacare-navy mb-1">
                            {t('doctors.forms.providerNetwork.phone')}
                          </label>
                          <input
                            type="tel"
                            value={providerForm.phone}
                            onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                          />
                        </div>
                      </>
                    )}

                    {formError && (
                      <p className="text-sm text-red-600">{formError}</p>
                    )}

                    <GradientButton type="submit" size="lg" className="w-full" disabled={formSubmitting}>
                      {formSubmitting
                        ? t('common.loading')
                        : isSpecialist
                          ? t('doctors.forms.specialistMatch.submit')
                          : t('doctors.forms.providerNetwork.submit')}
                    </GradientButton>
                  </form>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const specialtyLabel = (id: string) =>
    specialties.find((s) => s.id === id)?.label ?? id

  if (selectedDoctor) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Back Button */}
          <button
            onClick={closeDoctorProfile}
            className="flex items-center gap-2 text-ovacare-purple hover:text-ovacare-deep transition-colors"
          >
            ← {t('common.back')}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doctor Profile */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-ovacare-purple to-ovacare-pink flex items-center justify-center text-4xl">
                    {selectedDoctor.image || '👩‍⚕️'}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-ovacare-navy mb-2">{selectedDoctor.name}</h1>
                    <p className="text-lg text-ovacare-purple font-medium mb-3">{selectedDoctor.specialty}</p>
                    {selectedDoctor.location && (
                      <div className="flex items-center gap-1 text-sm text-ovacare-gray">
                        <MapPin className="w-4 h-4 text-ovacare-purple" />
                        <span>{selectedDoctor.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedDoctor.categories?.length ?? 0) > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-ovacare-navy mb-3">{t('doctors.profile.specializations')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoctor.categories!.map((category) => (
                        <span
                          key={category}
                          className="bg-ovacare-purple/10 text-ovacare-purple px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialtyLabel(category)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoctor.about && (
                  <div>
                    <h3 className="font-bold text-ovacare-navy mb-3">{t('doctors.profile.aboutDoctor')}</h3>
                    <p className="text-ovacare-gray leading-relaxed">{selectedDoctor.about}</p>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-ovacare-navy mb-2">{t('doctors.doctorCard.bookConsultation')}</h3>
                  <p className="text-sm text-ovacare-gray">{t('doctors.booking.nextAvailable', { defaultValue: 'Next available:' })} {selectedDoctor.nextAvailable}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-ovacare-navy">{t('doctors.booking.selectConsultationType')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingType('video')}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${bookingType === 'video'
                        ? 'border-ovacare-purple bg-ovacare-purple/10 text-ovacare-purple'
                        : 'border-gray-200 text-ovacare-gray hover:border-ovacare-purple/40 hover:text-ovacare-navy'
                        }`}
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      {t('doctors.booking.videoConsultation')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType('in_person')}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${bookingType === 'in_person'
                        ? 'border-ovacare-purple bg-ovacare-purple/10 text-ovacare-purple'
                        : 'border-gray-200 text-ovacare-gray hover:border-ovacare-purple/40 hover:text-ovacare-navy'
                        }`}
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                      {t('doctors.booking.inPersonAppointment')}
                    </button>
                  </div>

                  {bookingType ? (
                    <Link
                      to={`/booking/${doctorKey(selectedDoctor)}`}
                      state={{ consultationType: bookingType }}
                      className="block w-full"
                    >
                      <GradientButton size="lg" className="w-full">
                        <Calendar className="w-5 h-5 mr-2" />
                        {t('doctors.doctorCard.bookConsultation')}
                      </GradientButton>
                    </Link>
                  ) : (
                    <GradientButton size="lg" className="w-full" disabled>
                      <Calendar className="w-5 h-5 mr-2" />
                      {t('doctors.doctorCard.bookConsultation')}
                    </GradientButton>
                  )}
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{t('doctors.booking.sameDayBooking', { defaultValue: 'Same-Day Booking' })}</span>
                  </div>
                  <p className="text-xs text-green-700">
                    {t('doctors.booking.sameDayNote', { defaultValue: 'If available today, you can book appointments up to 2 hours in advance.' })}
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {renderFormModal()}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-ovacare-navy mb-4">
            {t('doctors.pageTitle')}
          </h1>
          <p className="text-lg text-ovacare-gray max-w-2xl mx-auto">
            {t('doctors.pageSubtitle')}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-amber-800 text-sm text-center">
          <strong>Note:</strong>This website was developed as part of my Undergraduate Research Project. The doctor availability, dates, and appointment times shown are mocked for research and demonstration purposes and will be updated in a future version. However, the doctor details are accurate and can be verified through Doc990, where you can also search for the doctors and make bookings.

        </div>

        {/* Search & Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-ovacare-gray" />
              <input
                type="text"
                placeholder={t('doctors.list.searchByNameOrSpecialty')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
              />
            </div>

            {/* Location */}
            <div className="lg:col-span-3 relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-ovacare-gray" />
              <input
                type="text"
                placeholder={t('doctors.list.locationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
              />
            </div>

            {/* Specialty Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
              >
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-2">
              <GradientButton size="lg" className="w-full">
                <Search className="w-5 h-5 mr-2" />
                {t('doctors.list.searchButton')}
              </GradientButton>
            </div>
          </div>
        </GlassCard>

        {/* Specialty Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => setSelectedSpecialty(specialty.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${selectedSpecialty === specialty.id
                ? 'bg-gradient-to-r from-ovacare-purple to-ovacare-deep text-white shadow-lg'
                : 'bg-white/50 text-ovacare-navy hover:bg-white/70 border border-gray-200'
                }`}
            >
              <specialty.icon className="w-4 h-4" />
              {specialty.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ovacare-navy">
              {t('doctors.list.specialistsFound', { count: filteredDoctors.length })}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              {loadingDoctors && (
                <span className="text-ovacare-gray">{t('common.loading')}</span>
              )}
              {doctorsLoadError && (
                <span className="text-red-600">{t('common.error')}</span>
              )}
              <button
                type="button"
                onClick={() => setShowMoreFilters((prev) => !prev)}
                className={`flex items-center gap-2 transition-colors ${showMoreFilters || activeFilterCount > 0
                  ? 'text-ovacare-deep font-medium'
                  : 'text-ovacare-purple hover:text-ovacare-deep'
                  }`}
              >
                <Filter className="w-4 h-4" />
                {t('doctors.list.moreFilters')}
                {activeFilterCount > 0 && (
                  <span className="bg-ovacare-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showMoreFilters && (
            <GlassCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-ovacare-navy">{t('doctors.list.moreFilters')}</h3>
                <button
                  type="button"
                  onClick={() => setShowMoreFilters(false)}
                  className="text-ovacare-gray hover:text-ovacare-navy"
                  aria-label={t('common.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ovacare-navy mb-2">
                    {t('doctors.filters.location')}
                  </label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:border-ovacare-purple"
                  >
                    {cityOptions.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>
                {activeFilterCount > 0 && (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearMoreFilters}
                      className="text-sm text-ovacare-purple hover:text-ovacare-deep font-medium"
                    >
                      {t('doctors.list.clearFilters')}
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {filteredDoctors.length === 0 && !loadingDoctors && (
            <p className="text-center text-ovacare-gray py-8">{t('doctors.noResultsFound')}</p>
          )}

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor, i) => (
              <motion.div
                key={doctorKey(doctor)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => openDoctorProfile(doctor)}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ovacare-purple to-ovacare-pink flex items-center justify-center text-2xl">
                      {doctor.image || '👩‍⚕️'}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-ovacare-navy">{doctor.name}</h3>
                          <p className="text-sm text-ovacare-purple font-medium">{doctor.specialty}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-ovacare-gray" />
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-ovacare-gray mb-3">
                        <MapPin className="w-3 h-3" />
                        {doctor.location}{doctor.distance ? ` • ${doctor.distance}` : ''}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/booking/${doctorKey(doctor)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <span className="flex w-full justify-center py-2 bg-ovacare-purple/10 text-ovacare-purple rounded-lg text-sm font-medium hover:bg-ovacare-purple/20 transition-colors">
                            {t('doctors.doctorCard.bookConsultation')}
                          </span>
                        </Link>
                        <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <MessageSquare className="w-4 h-4 text-ovacare-gray" />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-ovacare-navy mb-4">
              {t('doctors.cta.title')}
            </h3>
            <p className="text-ovacare-gray mb-6 max-w-2xl mx-auto">
              {t('doctors.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton size="lg" onClick={() => openForm('provider')}>
                <Users className="w-5 h-5 mr-2" />
                {t('doctors.forms.providerNetwork.title')}
              </GradientButton>
              <GradientButton variant="outline" size="lg" onClick={() => openForm('specialist')}>
                <MessageSquare className="w-5 h-5 mr-2" />
                {t('doctors.forms.specialistMatch.title')}
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  )
}