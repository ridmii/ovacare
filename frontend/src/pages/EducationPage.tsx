import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import html2pdf from 'html2pdf.js'
import {
  BookOpen,
  Play,
  Download,
  Clock,
  Users,
  Star,
  ChevronRight,
  Heart,
  Brain,
  Apple,
  Dumbbell,
  Calendar,
  MessageCircle,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'

interface EducationPageProps {
  setActivePage: (page: string) => void
}

const PCOS_BLOG_ARTICLES = [
  {
    title: 'PCOS and Insomnia',
    excerpt: 'Understand the link between PCOS and sleep problems, plus tips for better rest.',
    url: 'https://www.clairepettitt.com/blog/pcos-and-insomnia',
    source: 'Claire Pettitt',
    image: '/assets/blogs/insomnia.jpg',
  },
  {
    title: 'PCOS and IBS',
    excerpt: 'How digestive health connects to PCOS and what you can do to manage symptoms.',
    url: 'https://www.clairepettitt.com/blog/pcos-and-ibs',
    source: 'Claire Pettitt',
    image: '/assets/blogs/ibs.jpg',
  },
  {
    title: '15 PCOS-Friendly Vegetarian Recipes',
    excerpt: 'Nutritious vegetarian meal ideas designed to support hormonal balance.',
    url: 'https://www.clairepettitt.com/blog/15-pcos-friendly-vegetarian-recipes',
    source: 'Claire Pettitt',
    image: '/assets/blogs/vegetarian-recipes.jpg',
  },
  {
    title: 'PCOS-Friendly Soups',
    excerpt: 'Warm, nourishing soup recipes that fit a PCOS-friendly eating plan.',
    url: 'https://www.clairepettitt.com/blog/pcos-friendly-soups',
    source: 'Claire Pettitt',
    image: '/assets/blogs/soups.jpg',
  },
] as const

const PCOS_SUCCESS_STORIES = [
  {
    title: 'Olympic Athlete Beat PCOS',
    excerpt: 'How an Olympic athlete managed PCOS and continued performing at the highest level.',
    url: 'https://www.pcosnutrition.com/olympic-athlete-beat-pcos/?srsltid=AfmBOop2S90O84iIW0w4JdudLcMa3NC_VzSQISFe4rXz9UxIDRCQwY0-',
    source: 'PCOS Nutrition',
    image: '/assets/blogs/olympic-athlete.jpg',
  },
  {
    title: 'My PCOS Success Story',
    excerpt: 'A personal journey of overcoming PCOS through lifestyle changes and persistence.',
    url: 'https://thesmooco.com/blogs/blog/my-pcos-success-story?srsltid=AfmBOorvRf7NUJiB_oyG9RrP7haZUqJ1JEFWpBkdZo0VwIedwpl317IL',
    source: 'The Smooco',
    image: '/assets/blogs/success-story.jpg',
  },
] as const

function BlogCardImage({
  image,
  alt,
  source,
  variant = 'blog',
}: {
  image: string
  alt: string
  source: string
  variant?: 'blog' | 'story'
}) {
  return (
    <div className="relative aspect-video overflow-hidden bg-ovacare-purple/10">
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          variant === 'story'
            ? 'from-green-900/70 via-green-900/20 to-transparent'
            : 'from-ovacare-navy/70 via-ovacare-navy/20 to-transparent'
        }`}
      />
      <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-wide text-white/95">
        {source}
      </span>
    </div>
  )
}

// PDF generator for meal plan
const generateMealPlanPDF = () => {
  const element = document.createElement('div')
  element.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; background: white;">
      <h1 style="color: #1a365d; font-size: 32px; margin-bottom: 10px;">PCOS-Friendly 7-Day Meal Plan</h1>
      <p style="color: #4a5568; font-size: 14px; margin-bottom: 20px;">Sri Lankan Traditional Foods for Hormonal Balance</p>
      
      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
      
      <h2 style="color: #2d3748; font-size: 18px; margin-bottom: 15px;">Weekly Schedule</h2>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Monday:</strong>
          <span style="color: #4a5568;">Red rice with fish curry and gotukola sambol</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Tuesday:</strong>
          <span style="color: #4a5568;">Dhal curry with brown bread and pol sambol</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Wednesday:</strong>
          <span style="color: #4a5568;">Kohila curry with red rice and tempered vegetables</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Thursday:</strong>
          <span style="color: #4a5568;">Mung bean curry with string hoppers</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Friday:</strong>
          <span style="color: #4a5568;">Spiced fish with steamed jackfruit curry</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Saturday:</strong>
          <span style="color: #4a5568;">Bitter gourd curry with red rice and chicken</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Sunday:</strong>
          <span style="color: #4a5568;">Mixed vegetable curry with coconut roti</span>
        </div>
      </div>
      
      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
      
      <div style="background: #fffaf0; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <p style="color: #92400e; font-size: 12px; margin: 0;">
          <strong>Disclaimer:</strong> This meal plan is for informational purposes. Always consult with your healthcare provider or registered dietitian before making significant dietary changes.
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #a0aec0; font-size: 12px;">
        <p>Generated by OvaCare - Your PCOS Management Companion</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `

  const options = {
    margin: 10,
    filename: `PCOS_7Day_Meal_Plan_${new Date().getTime()}.pdf`,
    image: { type: 'png' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
  }

  html2pdf().set(options).from(element).save()
}

// PDF generator for exercise program
const generateExerciseProgramPDF = () => {
  const element = document.createElement('div')
  element.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; background: white;">
      <h1 style="color: #1a365d; font-size: 32px; margin-bottom: 10px;">PCOS-Friendly 4-Week Exercise Program</h1>
      <p style="color: #4a5568; font-size: 14px; margin-bottom: 20px;">Beginner-Friendly Workout Plan</p>
      
      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
      
      <h2 style="color: #2d3748; font-size: 18px; margin-bottom: 15px;">Weekly Breakdown</h2>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Week 1:</strong>
          <span style="color: #4a5568;">Cardio: 15 min, Strength: 2x/week, HIIT: Optional</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Week 2:</strong>
          <span style="color: #4a5568;">Cardio: 20 min, Strength: 2x/week, HIIT: Optional</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Week 3:</strong>
          <span style="color: #4a5568;">Cardio: 25 min, Strength: 2x/week, HIIT: 1x/week</span>
        </div>
        <div style="display: flex; padding: 12px; margin: 8px 0; background: #f7fafc; border-left: 4px solid #7c2d7f;">
          <strong style="color: #7c2d7f; width: 150px; min-width: 150px;">Week 4:</strong>
          <span style="color: #4a5568;">Cardio: 30 min, Strength: 2x/week, HIIT: 1x/week</span>
        </div>
      </div>

      <h2 style="color: #2d3748; font-size: 18px; margin: 25px 0 15px 0;">Exercise Types</h2>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #7c2d7f; font-size: 16px; margin: 15px 0 10px 0;">Strength Training (2-3x/week)</h3>
        <p style="color: #4a5568;">Builds muscle mass, improves metabolism, enhances insulin sensitivity</p>
        <p style="color: #4a5568; margin: 5px 0;">Examples: Weightlifting, Resistance bands, Bodyweight exercises</p>
        
        <h3 style="color: #7c2d7f; font-size: 16px; margin: 15px 0 10px 0;">Cardio Exercise (150 min/week)</h3>
        <p style="color: #4a5568;">Improves heart health, supports weight management, boosts mood</p>
        <p style="color: #4a5568; margin: 5px 0;">Examples: Brisk walking, Swimming, Cycling</p>
        
        <h3 style="color: #7c2d7f; font-size: 16px; margin: 15px 0 10px 0;">HIIT Training (1-2x/week)</h3>
        <p style="color: #4a5568;">Time efficient, metabolic boost, helps hormone balance</p>
        <p style="color: #4a5568; margin: 5px 0;">Examples: Interval running, Circuit training, Tabata</p>
      </div>
      
      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
      
      <div style="background: #fffaf0; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin-top: 30px;">
        <p style="color: #92400e; font-size: 12px; margin: 0;">
          <strong>Important Notes:</strong>
          <br/>• Start at your own pace and gradually increase intensity
          <br/>• Consult your healthcare provider before starting a new exercise program
          <br/>• Stay hydrated and listen to your body
          <br/>• Rest days are important for recovery
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #a0aec0; font-size: 12px;">
        <p>Generated by OvaCare - Your PCOS Management Companion</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `

  const options = {
    margin: 10,
    filename: `PCOS_Exercise_Program_${new Date().getTime()}.pdf`,
    image: { type: 'png' as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
  }

  html2pdf().set(options).from(element).save()
}

// Add to calendar function
const addExerciseProgramToCalendar = () => {
  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000) // 4 weeks later

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OvaCare//PCOS Exercise Program//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PCOS Exercise Program
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
DTSTAMP:${formatDateForICS(new Date())}
UID:pcos-exercise-${new Date().getTime()}@ovacare.com
CREATED:${formatDateForICS(new Date())}
DESCRIPTION:PCOS-Friendly 4-Week Beginner Exercise Program\\n\\nWeekly breakdown:\\nWeek 1: Cardio 15 min\\, Strength 2x/week\\nWeek 2: Cardio 20 min\\, Strength 2x/week\\nWeek 3: Cardio 25 min\\, Strength 2x/week\\, HIIT 1x/week\\nWeek 4: Cardio 30 min\\, Strength 2x/week\\, HIIT 1x/week
LOCATION:Home
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:PCOS 4-Week Exercise Program
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`

  const blob = new Blob([icsContent], { type: 'text/calendar' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `PCOS_Exercise_Program_${new Date().getTime()}.ics`
  link.click()
  window.URL.revokeObjectURL(url)
}

// Helper function to format date for ICS format
const formatDateForICS = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

export function EducationPage({ setActivePage }: EducationPageProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  const iconMap: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-4 h-4" />,
    Apple: <Apple className="w-4 h-4" />,
    Dumbbell: <Dumbbell className="w-4 h-4" />,
    Heart: <Heart className="w-4 h-4" />,
    Brain: <Brain className="w-4 h-4" />,
  }

  const tabs = t('education.tabs', { returnObjects: true }) as Array<{
    id: string
    label: string
    icon: string
  }>

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-ovacare-navy mb-4">
            {t('education.pageTitle')}
          </h1>
          <p className="text-lg text-ovacare-gray max-w-2xl mx-auto">
            {t('education.pageSubtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-ovacare-purple to-ovacare-deep text-white shadow-lg'
                    : 'bg-white/50 text-ovacare-navy hover:bg-white/70 border border-gray-200'
                }`}
              >
                {iconMap[tab.icon] || <BookOpen className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* What is PCOS */}
              <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-ovacare-navy mb-6">
                  {t('education.overview.understandingPcos')}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-ovacare-gray leading-relaxed">
                      {t('education.overview.introText')}
                    </p>
                    <div className="bg-ovacare-purple/10 p-4 rounded-lg">
                      <h4 className="font-bold text-ovacare-navy mb-2">
                        {t('education.overview.keyStatistics')}
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {(t('education.overview.stats', { returnObjects: true }) as string[]).map((stat, i) => (
                          <li key={i}>• {stat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-ovacare-navy">{t('education.overview.commonSymptoms')}</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {(t('education.overview.symptoms', { returnObjects: true }) as string[]).map((symptom, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-ovacare-purple" />
                          <span className="text-sm">{symptom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Diagnosis */}
              <GlassCard className="p-8">
                <h3 className="text-xl font-bold text-ovacare-navy mb-4">
                  {t('education.overview.diagnosisCriteria')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(t('education.overview.diagnosisCriteriaItems', { returnObjects: true }) as Array<{
                    title: string
                    description: string
                  }>).map((criterion, i) => (
                    <div key={i} className="p-4 bg-gradient-to-br from-ovacare-purple/5 to-ovacare-pink/5 rounded-lg border border-ovacare-purple/10">
                      <h4 className="font-bold text-ovacare-navy mb-2">{criterion.title}</h4>
                      <p className="text-sm text-ovacare-gray">{criterion.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{t('education.overview.diagnosisNote')}</p>
                </div>
              </GlassCard>

              {/* Educational Videos */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-ovacare-navy">Educational Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "What Is Polycystic Ovary Syndrome? | Ask Cleveland Clinic's Expert",
                      videoId: 'HzG-zaMYZZ8',
                      author: 'Cleveland Clinic',
                    },
                    {
                      title: 'Polycystic Ovarian Syndrome (PCOS) Symptoms Explained: Common & Uncommon Signs',
                      videoId: '88C2El_EIBw',
                      author: 'Dr. Lora Shahine, MD',
                    },
                  ].map((video, i) => (
                    <GlassCard key={i} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-ovacare-navy mb-2 line-clamp-2">{video.title}</h4>
                        <p className="text-sm text-ovacare-gray flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {video.author}
                        </p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NUTRITION TAB */}
          {activeTab === 'nutrition' && (
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Diet Plans */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-ovacare-navy mb-6">
                    PCOS-Friendly Diet Plans
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        name: 'Anti-Inflammatory Sri Lankan Diet',
                        description: 'Traditional foods that reduce inflammation',
                        foods: ['Turmeric (Kaha)', 'Gotukola', 'Fish curry', 'Coconut oil'],
                        color: 'from-green-400 to-green-600',
                      },
                      {
                        name: 'Low Glycemic Local Foods',
                        description: 'Sri Lankan foods for stable blood sugar',
                        foods: ['Red rice', 'Mung beans (Mu)', 'Kohila', 'Jackfruit'],
                        color: 'from-blue-400 to-blue-600',
                      },
                      {
                        name: 'Traditional Ayurvedic',
                        description: 'Time-tested remedies for hormonal balance',
                        foods: ['Fenugreek (Uluhaal)', 'Cinnamon (Kurundu)', 'Bitter gourd', 'Moringa (Murunga)'],
                        color: 'from-purple-400 to-purple-600',
                      },
                    ].map((diet, i) => (
                      <div key={i} className="bg-white/50 p-6 rounded-xl">
                        <div
                          className={`w-full h-2 rounded-full bg-gradient-to-r ${diet.color} mb-4`}
                        />
                        <h3 className="font-bold text-ovacare-navy mb-2">{diet.name}</h3>
                        <p className="text-sm text-ovacare-gray mb-4">{diet.description}</p>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-ovacare-purple">
                            KEY FOODS:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {diet.foods.map((food, fi) => (
                              <span
                                key={fi}
                                className="text-xs bg-white/70 px-2 py-1 rounded"
                              >
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Meal Plans */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div variants={itemVariants}>
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-ovacare-navy mb-4">
                      7-Day Meal Plan
                    </h3>
                    <div className="space-y-3">
                      {[
                        { day: 'Monday', meal: 'Red rice with fish curry and gotukola sambol' },
                        { day: 'Tuesday', meal: 'Dhal curry with brown bread and pol sambol' },
                        { day: 'Wednesday', meal: 'Kohila curry with red rice and tempered vegetables' },
                        { day: 'Thursday', meal: 'Mung bean curry with string hoppers' },
                        { day: 'Friday', meal: 'Spiced fish with steamed jackfruit curry' },
                        { day: 'Saturday', meal: 'Bitter gourd curry with red rice and chicken' },
                        { day: 'Sunday', meal: 'Mixed vegetable curry with coconut roti' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/40 rounded-lg">
                          <span className="font-medium text-ovacare-navy">{item.day}</span>
                          <span className="text-sm text-ovacare-gray">{item.meal}</span>
                        </div>
                      ))}
                    </div>
                    <GradientButton 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={generateMealPlanPDF}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Plan
                    </GradientButton>
                  </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-ovacare-navy mb-4">
                      Foods to Avoid
                    </h3>
                    <div className="space-y-3">
                      {[
                        { category: 'White Rice & Refined Carbs', examples: 'White rice, white bread, wade, kokis' },
                        { category: 'Sugary Sri Lankan Treats', examples: 'Konda kevum, aluwa, sugary drinks' },
                        { category: 'Processed Foods', examples: 'Packet noodles, biscuits, fried snacks' },
                        { category: 'Excessive Coconut Products', examples: 'Too much coconut milk, kiribath daily' },
                        { category: 'High Sugar Fruits', examples: 'Overripe bananas, dates, grapes' },
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="font-medium text-red-800">{item.category}</div>
                          <div className="text-sm text-red-600">{item.examples}</div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Supplements */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold text-ovacare-navy mb-6">
                    Evidence-Based Supplements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { name: 'Fenugreek (Uluhaal)', benefit: 'Traditional PCOS remedy', dosage: '500mg twice daily' },
                      { name: 'Cinnamon (Kurundu)', benefit: 'Blood sugar control', dosage: '1-3g daily' },
                      { name: 'Turmeric (Kaha)', benefit: 'Anti-inflammatory', dosage: '500-1000mg daily' },
                      { name: 'Moringa (Murunga)', benefit: 'Nutrient dense superfood', dosage: '1-2g daily' },
                    ].map((supp, i) => (
                      <div key={i} className="text-center p-4 bg-white/30 rounded-lg">
                        <div className="w-12 h-12 mx-auto rounded-full bg-ovacare-purple/10 flex items-center justify-center mb-3">
                          <span className="text-lg">💊</span>
                        </div>
                        <h4 className="font-bold text-ovacare-navy mb-1">{supp.name}</h4>
                        <p className="text-xs text-ovacare-gray mb-2">{supp.benefit}</p>
                        <p className="text-xs font-medium text-ovacare-purple">{supp.dosage}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Disclaimer:</strong> Always consult with your healthcare provider before
                      starting any supplement regimen. Traditional remedies listed are common in Sri Lankan Ayurvedic practice but should be used under medical supervision.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Nutrition Video */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/F6JBFWrEvFc"
                      title="PCOS: What Every Woman Needs to Know | Doctor's 11-Minute Guide"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-ovacare-navy mb-2">PCOS: What Every Woman Needs to Know | Doctor's 11-Minute Guide</h4>
                    <p className="text-sm text-ovacare-gray flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Dr Pal
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}

          {/* EXERCISE TAB */}
          {activeTab === 'exercise' && (
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-ovacare-navy mb-6">
                    PCOS Exercise Guidelines
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                        Why Exercise Matters for PCOS
                      </h3>
                      <ul className="space-y-3">
                        {[
                          'Improves insulin sensitivity by up to 25%',
                          'Helps regulate menstrual cycles',
                          'Reduces inflammation markers',
                          'Supports healthy weight management',
                          'Improves mood and reduces depression',
                          'Enhances fertility outcomes',
                        ].map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-ovacare-gray">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-ovacare-purple/10 to-ovacare-pink/10 p-6 rounded-lg">
                      <h4 className="font-bold text-ovacare-navy mb-3">Weekly Exercise Goal</h4>
                      <div className="text-3xl font-bold text-ovacare-purple mb-2">150 minutes</div>
                      <p className="text-sm text-ovacare-gray mb-4">
                        Moderate-intensity aerobic activity per week, plus 2 days of strength training
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Cardio:</span>
                          <span className="font-medium">75-150 min/week</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Strength:</span>
                          <span className="font-medium">2-3 sessions/week</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HIIT:</span>
                          <span className="font-medium">1-2 sessions/week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Exercise Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    type: 'Strength Training',
                    icon: '💪',
                    benefits: ['Builds muscle mass', 'Improves metabolism', 'Insulin sensitivity'],
                    examples: ['Weightlifting', 'Resistance bands', 'Bodyweight exercises'],
                    frequency: '2-3x/week',
                  },
                  {
                    type: 'Cardio Exercise',
                    icon: '🏃‍♀️',
                    benefits: ['Heart health', 'Weight management', 'Mood improvement'],
                    examples: ['Brisk walking', 'Swimming', 'Cycling'],
                    frequency: '150 min/week',
                  },
                  {
                    type: 'HIIT Training',
                    icon: '⚡',
                    benefits: ['Time efficient', 'Metabolic boost', 'Hormone balance'],
                    examples: ['Interval running', 'Circuit training', 'Tabata'],
                    frequency: '1-2x/week',
                  },
                ].map((exercise, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <GlassCard className="p-6 h-full">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{exercise.icon}</div>
                        <h3 className="font-bold text-ovacare-navy">{exercise.type}</h3>
                        <p className="text-sm text-ovacare-purple font-medium">{exercise.frequency}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-ovacare-gray mb-2">BENEFITS:</p>
                          {exercise.benefits.map((benefit, bi) => (
                            <div key={bi} className="text-xs bg-white/50 px-2 py-1 rounded mb-1">
                              {benefit}
                            </div>
                          ))}
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-ovacare-gray mb-2">EXAMPLES:</p>
                          {exercise.examples.map((example, ei) => (
                            <div key={ei} className="text-xs text-ovacare-gray">
                              • {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Sample Workout Plans */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold text-ovacare-navy mb-6">
                    4-Week Beginner Program
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, week) => (
                      <div key={week} className="bg-white/40 p-4 rounded-lg">
                        <h4 className="font-bold text-ovacare-navy mb-3">Week {week + 1}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Cardio:</span>
                            <span>{15 + week * 5} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Strength:</span>
                            <span>2x/week</span>
                          </div>
                          <div className="flex justify-between">
                            <span>HIIT:</span>
                            <span>{week < 2 ? 'Optional' : '1x/week'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <GradientButton onClick={generateExerciseProgramPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Program
                    </GradientButton>
                    <GradientButton variant="outline" onClick={addExerciseProgramToCalendar}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </GradientButton>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Exercise Video */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/YukpAFgNJM8"
                      title="PCOS Weight Loss Workout | Hormonal Imbalances, Irregular Periods (Beginner, Low Impact)"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-ovacare-navy mb-2 line-clamp-2">PCOS Weight Loss Workout | Hormonal Imbalances, Irregular Periods (Beginner, Low Impact)</h4>
                    <p className="text-sm text-ovacare-gray flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Akshaya Agnes
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}

          {/* MENTAL HEALTH TAB */}
          {activeTab === 'mental' && (
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-ovacare-navy mb-6">
                    PCOS and Mental Health
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                        Understanding the Connection
                      </h3>
                      <p className="text-ovacare-gray mb-4 leading-relaxed">
                        Women with PCOS are 3x more likely to experience depression and anxiety.
                        The hormonal imbalances, physical symptoms, and fertility concerns can
                        significantly impact mental well-being.
                      </p>
                      
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-red-800 mb-2">Common Mental Health Challenges:</h4>
                        <ul className="space-y-1 text-sm text-red-700">
                          <li>• Depression (rates 4-7x higher)</li>
                          <li>• Anxiety disorders</li>
                          <li>• Body image issues</li>
                          <li>• Low self-esteem</li>
                          <li>• Eating disorders</li>
                          <li>• Relationship stress</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                        Coping Strategies
                      </h3>
                      <div className="space-y-3">
                        {[
                          { strategy: 'Mindfulness & Meditation', desc: 'Reduce stress and improve mood' },
                          { strategy: 'Support Groups', desc: 'Connect with others who understand' },
                          { strategy: 'Therapy', desc: 'CBT and counseling for emotional support' },
                          { strategy: 'Stress Management', desc: 'Techniques to lower cortisol levels' },
                          { strategy: 'Sleep Hygiene', desc: 'Quality sleep for hormone regulation' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <Heart className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">{item.strategy}</div>
                              <div className="text-sm text-green-600">{item.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Mental Health Resources */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <motion.div variants={itemVariants} className="flex-1 w-full min-w-0">
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                      Crisis Resources
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-semibold text-red-800 mb-1">Crisis Text Line</div>
                        <div className="text-red-600">Text HOME or HOLA to 741741</div>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-1">National Suicide Prevention Lifeline</div>
                        <div className="text-blue-600">988 or 1333</div>
                      </div>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="font-semibold text-purple-800 mb-1">PCOS Challenge Support</div>
                        <p className="text-sm text-purple-700 mb-2">
                          Connect with Sri Lanka&apos;s PCOS community for peer support, educational
                          resources, and shared experiences.
                        </p>
                        <a
                          href="https://web.facebook.com/pcossrilanka/?_rdc=1&_rdr#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-purple-800 hover:text-purple-900 underline"
                        >
                          Combat PCOS - Sri Lanka
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <div className="font-semibold text-purple-800 mb-1">
                            Family Planning Association (FPA) of Sri Lanka
                          </div>
                          <p className="text-sm text-purple-700 mb-2">
                            FPA offers comprehensive reproductive health services, counseling, and
                            personalized care for PCOS and fertility. You can reach them directly for
                            concerns or to schedule a consultation.
                          </p>
                          <div className="text-sm text-purple-800">
                            <a href="tel:0765884881" className="hover:underline">
                              076 588 4881
                            </a>
                            <span> / </span>
                            <a href="tel:+94112555455" className="hover:underline">
                              +94 112 555 455
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants} className="w-full md:w-72 flex-shrink-0">
                  <GlassCard className="p-4">
                    <h3 className="text-lg font-bold text-ovacare-navy mb-3">
                      Recommended Apps & Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Headspace', purpose: 'Meditation', rating: 4.8, image: '/assets/headspace.jpg' },
                        { name: 'Calm', purpose: 'Mental Health', rating: 4.7, image: '/assets/calm.jpg' },
                        { name: 'BetterHelp', purpose: 'Online Therapy', rating: 4.6, image: '/assets/betterhelp.png' },
                        { name: 'Mood Meter', purpose: 'Emotion Tracking', rating: 4.5, image: '/assets/moodmeter.png' },
                      ].map((app, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center justify-center aspect-square p-2 bg-white/40 rounded-xl text-center"
                        >
                          <img
                            src={app.image}
                            alt={`${app.name} app icon`}
                            className="w-10 h-10 rounded-xl object-cover border border-white/70 shadow-sm"
                          />
                          <div className="font-medium text-xs text-ovacare-navy mt-1.5 leading-tight">
                            {app.name}
                          </div>
                          <div className="text-[10px] text-ovacare-gray leading-tight mt-0.5 line-clamp-2">
                            {app.purpose}
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{app.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Mental Health Videos */}
              <motion.div variants={itemVariants}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-ovacare-navy">Mental Health Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: 'PCOS & Mental Health',
                        videoId: 'wmJAdzobb_k',
                      },
                      {
                        title: 'Managing PCOS & Emotional Wellbeing',
                        videoId: 'IVBScaWiVy0',
                      },
                    ].map((video, i) => (
                      <GlassCard key={i} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-ovacare-navy text-sm">{video.title}</h4>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* BLOGS & RESEARCHES TAB */}
          {activeTab === 'research' && (
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-ovacare-navy mb-3">
                    Blogs & Researches
                  </h2>
                  <p className="text-ovacare-gray max-w-3xl">
                    Explore PCOS blogs, nutrition guides, and real success stories from people who
                    have managed their condition. Click any article to read the full details.
                  </p>
                </GlassCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-ovacare-navy">PCOS Blogs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PCOS_BLOG_ARTICLES.map((article) => (
                      <a
                        key={article.url}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <GlassCard className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 h-full border border-white/40 group-hover:-translate-y-1">
                          <BlogCardImage
                            image={article.image}
                            alt={article.title}
                            source={article.source}
                          />
                          <div className="p-4">
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-ovacare-purple/10 text-ovacare-purple mb-2">
                              Blog
                            </span>
                            <h4 className="font-bold text-ovacare-navy mb-2 group-hover:text-ovacare-purple transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-ovacare-gray mb-3 line-clamp-2">{article.excerpt}</p>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-ovacare-purple">
                              Read full article
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </GlassCard>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-ovacare-navy">Success Stories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PCOS_SUCCESS_STORIES.map((story) => (
                      <a
                        key={story.url}
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <GlassCard className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 h-full border border-white/40 group-hover:-translate-y-1">
                          <BlogCardImage
                            image={story.image}
                            alt={story.title}
                            source={story.source}
                            variant="story"
                          />
                          <div className="p-4">
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-2">
                              Success Story
                            </span>
                            <h4 className="font-bold text-ovacare-navy mb-2 group-hover:text-ovacare-purple transition-colors">
                              {story.title}
                            </h4>
                            <p className="text-sm text-ovacare-gray mb-3 line-clamp-2">{story.excerpt}</p>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-ovacare-purple">
                              Read full story
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </GlassCard>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
        >
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-ovacare-navy mb-4">
              Ready to Take Control of Your PCOS?
            </h3>
            <p className="text-ovacare-gray mb-6 max-w-2xl mx-auto">
              Knowledge is power. Use our AI-powered diagnostic tool to get
              personalized insights about your condition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton size="lg" onClick={() => setActivePage('scan')}>
                Start AI Scan
              </GradientButton>
              <GradientButton
                variant="outline"
                size="lg"
                onClick={() => setActivePage('doctors')}
              >
                Find a Specialist
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  )
}