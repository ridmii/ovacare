import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Clock,
  Phone,
  Calendar,
  Filter,
  ChevronRight,
  Stethoscope,
  Heart,
  Baby,
  Award,
  GraduationCap,
  Users,
  Video,
  MessageSquare,
  CheckCircle,
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'

interface DoctorsPageProps {
  setActivePage: (page: string) => void
}

export function DoctorsPage({ setActivePage }: DoctorsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  const specialties = [
    { id: 'all', label: 'All Specialists', icon: Stethoscope },
    { id: 'gynecology', label: 'Gynecology', icon: Heart },
    { id: 'endocrinology', label: 'Endocrinology', icon: Award },
    { id: 'fertility', label: 'Fertility', icon: Baby },
  ]

  const doctors = [
    {
      id: 1,
      name: 'Dr. Priyani Soysa',
      specialty: 'Reproductive Endocrinology & Infertility',
      rating: 4.9,
      reviews: 312,
      experience: '18 years',
      location: 'Colombo 07, Sri Lanka',
      distance: '2.1 km',
      image: '👩‍⚕️',
      verified: true,
      acceptsInsurance: ['SLIMHC', 'Lanka IOC Health', 'Ceylinco Healthcare'],
      availableToday: true,
      consultationFee: 'LKR 3,500',
      about: 'Senior Consultant Obstetrician & Gynaecologist at National Hospital Sri Lanka. Specialized in PCOS management with focus on Sri Lankan women.',
      credentials: ['MBBS - University of Colombo', 'MD - University of Colombo', 'MRCOG - UK', 'Fellowship REI - Australia'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Mon-Fri: 8AM-6PM, Sat: 8AM-12PM',
      nextAvailable: 'Today, 2:30 PM',
      categories: ['gynecology', 'fertility'],
    },
    {
      id: 2,
      name: 'Dr. Chamara Ratnayake',
      specialty: 'Endocrinology & Diabetes',
      rating: 4.8,
      reviews: 245,
      experience: '15 years',
      location: 'Kandy, Sri Lanka',
      distance: '3.2 km',
      image: '👨‍⚕️',
      verified: true,
      acceptsInsurance: ['Janashakthi Insurance', 'Ceylinco General', 'AIA Insurance'],
      availableToday: false,
      consultationFee: 'LKR 2,800',
      about: 'Consultant Endocrinologist at Kandy General Hospital. Expert in hormonal disorders and PCOS with cultural sensitivity to Sri Lankan dietary habits.',
      credentials: ['MBBS - University of Peradeniya', 'MD - Postgraduate Institute', 'MRCP - UK'],
      languages: ['Sinhala', 'English'],
      officeHours: 'Tue-Sat: 9AM-5PM',
      nextAvailable: 'Tomorrow, 10:00 AM',
      categories: ['gynecology', 'endocrinology'],
    },
    {
      id: 3,
      name: 'Dr. Sanduni Fernando',
      specialty: 'Integrative Women\'s Health & Ayurveda',
      rating: 4.7,
      reviews: 189,
      experience: '12 years',
      location: 'Galle, Sri Lanka',
      distance: '4.5 km',
      image: '👩‍⚕️',
      verified: true,
      acceptsInsurance: ['Sri Lanka Insurance', 'Co-operative Insurance', 'Union Assurance'],
      availableToday: true,
      consultationFee: 'LKR 2,200',
      about: 'Combines modern gynecology with traditional Ayurvedic treatments for holistic PCOS care, specializing in Sri Lankan herbal remedies.',
      credentials: ['MBBS - University of Ruhuna', 'MD Gynecology - PGIM', 'Diploma in Ayurveda'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Mon-Sat: 8AM-4PM',
      nextAvailable: 'Today, 4:15 PM',
      categories: ['gynecology'],
    },
    {
      id: 4,
      name: 'Dr. Nimal Senanayake',
      specialty: 'Endocrinology & Metabolic Medicine',
      rating: 4.6,
      reviews: 198,
      experience: '20 years',
      location: 'Colombo 03, Sri Lanka',
      distance: '1.8 km',
      image: '👨‍⚕️',
      verified: true,
      acceptsInsurance: ['Softlogic Insurance', 'HNB Assurance', 'Allianz Insurance'],
      availableToday: false,
      consultationFee: 'LKR 4,200',
      about: 'Senior Consultant Endocrinologist at Lanka Hospitals. Research focus on insulin resistance patterns in South Asian women.',
      credentials: ['MBBS - University of Sri Jayewardenepura', 'MD - PGIM', 'Fellowship - Singapore General Hospital'],
      languages: ['Sinhala', 'English'],
      officeHours: 'Mon-Wed: 7AM-3PM, Thu-Fri: 2PM-8PM',
      nextAvailable: 'Monday, 9:30 AM',
      categories: ['endocrinology'],
    },
    {
      id: 5,
      name: 'Dr. Thilini Wickramasinghe',
      specialty: 'Nutritional Medicine & PCOS',
      rating: 4.8,
      reviews: 156,
      experience: '10 years',
      location: 'Nugegoda, Sri Lanka',
      distance: '5.1 km',
      image: '👩‍⚕️',
      verified: true,
      acceptsInsurance: ['Ceylinco Life', 'Sri Lanka Insurance', 'MBSL Insurance'],
      availableToday: true,
      consultationFee: 'LKR 2,500',
      about: 'Specialist in PCOS nutrition therapy using traditional Sri Lankan foods. Expert in managing PCOS through local dietary interventions.',
      credentials: ['MBBS - University of Kelaniya', 'MSc Nutrition - University of Colombo', 'Diploma in Dietetics'],
      languages: ['Sinhala', 'Tamil', 'English'],
      officeHours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-1PM',
      nextAvailable: 'Today, 11:30 AM',
      categories: ['gynecology', 'endocrinology'],
    },
  ]

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.categories.includes(selectedSpecialty)
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSpecialty && matchesSearch
  })

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
            onClick={() => setSelectedDoctor(null)}
            className="flex items-center gap-2 text-ovacare-purple hover:text-ovacare-deep transition-colors"
          >
            ← Back to Search
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doctor Profile */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-ovacare-purple to-ovacare-pink flex items-center justify-center text-4xl">
                    {selectedDoctor.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-ovacare-navy">{selectedDoctor.name}</h1>
                      {selectedDoctor.verified && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-lg text-ovacare-purple font-medium mb-3">{selectedDoctor.specialty}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{selectedDoctor.rating}</span>
                        <span className="text-ovacare-gray">({selectedDoctor.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-ovacare-purple" />
                        <span>{selectedDoctor.experience}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-ovacare-navy mb-3">About</h3>
                    <p className="text-ovacare-gray mb-4">{selectedDoctor.about}</p>
                    
                    <h4 className="font-medium text-ovacare-navy mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedDoctor.languages.map((lang: string, i: number) => (
                        <span key={i} className="bg-ovacare-purple/10 text-ovacare-purple px-2 py-1 rounded text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-ovacare-navy mb-3">Credentials</h3>
                    <div className="space-y-2">
                      {selectedDoctor.credentials.map((cred: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-ovacare-purple mt-0.5" />
                          <span className="text-sm text-ovacare-gray">{cred}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Insurance & Fees */}
              <GlassCard className="p-6">
                <h3 className="font-bold text-ovacare-navy mb-4">Insurance & Fees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-ovacare-navy mb-2">Accepted Insurance</h4>
                    <div className="space-y-2">
                      {selectedDoctor.acceptsInsurance.map((insurance: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{insurance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-ovacare-navy mb-2">Consultation Fee</h4>
                    <div className="text-2xl font-bold text-ovacare-purple">{selectedDoctor.consultationFee}</div>
                    <p className="text-sm text-ovacare-gray">Initial consultation (60 mins)</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-ovacare-navy mb-2">Book Appointment</h3>
                  <p className="text-sm text-ovacare-gray">Next available: {selectedDoctor.nextAvailable}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <GradientButton size="sm" className="flex-1">
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </GradientButton>
                    <GradientButton variant="outline" size="sm" className="flex-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      In-Person
                    </GradientButton>
                  </div>
                  
                  <GradientButton size="lg" className="w-full">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Now
                  </GradientButton>
                  
                  <button className="w-full p-3 text-ovacare-purple border border-ovacare-purple/20 rounded-lg hover:bg-ovacare-purple/5 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Same-Day Booking</span>
                  </div>
                  <p className="text-xs text-green-700">
                    If available today, you can book appointments up to 2 hours in advance.
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h4 className="font-bold text-ovacare-navy mb-4">Office Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-ovacare-purple mt-0.5" />
                    <div>
                      <div className="font-medium">{selectedDoctor.location}</div>
                      <div className="text-ovacare-gray">{selectedDoctor.distance} from you</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-ovacare-purple mt-0.5" />
                    <div>
                      <div className="font-medium">Office Hours</div>
                      <div className="text-ovacare-gray">{selectedDoctor.officeHours}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-ovacare-purple mt-0.5" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-ovacare-gray">(555) 123-4567</div>
                    </div>
                  </div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-ovacare-navy mb-4">
            Find PCOS Specialists
          </h1>
          <p className="text-lg text-ovacare-gray max-w-2xl mx-auto">
            Connect with verified doctors who specialize in PCOS diagnosis,
            treatment, and ongoing care management.
          </p>
        </div>

        {/* Search & Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-ovacare-gray" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
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
                placeholder="City, State or ZIP"
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
                Search
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
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedSpecialty === specialty.id
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
              {filteredDoctors.length} Specialists Found
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <button className="flex items-center gap-2 text-ovacare-purple hover:text-ovacare-deep">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: doctor.id * 0.1 }}
              >
                <GlassCard className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                           onClick={() => setSelectedDoctor(doctor)}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ovacare-purple to-ovacare-pink flex items-center justify-center text-2xl">
                      {doctor.image}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-ovacare-navy">{doctor.name}</h3>
                            {doctor.verified && (
                              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-ovacare-purple font-medium">{doctor.specialty}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-ovacare-gray" />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-medium">{doctor.rating}</span>
                          <span className="text-ovacare-gray">({doctor.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-ovacare-purple" />
                          <span>{doctor.experience}</span>
                        </div>
                      </div>

                      {/* Location & Availability */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-ovacare-gray">
                          <MapPin className="w-3 h-3" />
                          {doctor.location} • {doctor.distance}
                        </div>
                        {doctor.availableToday && (
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            Available Today
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {e.stopPropagation(); setSelectedDoctor(doctor)}}
                          className="flex-1 py-2 bg-ovacare-purple/10 text-ovacare-purple rounded-lg text-sm font-medium hover:bg-ovacare-purple/20 transition-colors"
                        >
                          Book Now
                        </button>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-ovacare-navy mb-4">
              Can't Find the Right Doctor?
            </h3>
            <p className="text-ovacare-gray mb-6 max-w-2xl mx-auto">
              We're constantly adding new specialists to our network. Let us know
              your preferences and we'll help you find the perfect PCOS specialist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton size="lg">
                <Users className="w-5 h-5 mr-2" />
                Join Our Provider Network
              </GradientButton>
              <GradientButton variant="outline" size="lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                Request Specialist Match
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  )
}