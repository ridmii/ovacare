import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Star, Brain, BarChart3, GraduationCap, Stethoscope, UploadCloud, FileSearch } from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'
import { FloatingElements } from '../components/FloatingElements'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { Emoji } from '../components/Emoji'

const FEATURE_COLORS = [
  'text-ovacare-purple',
  'text-ovacare-pink',
  'text-ovacare-deep',
  'text-ovacare-coral',
]

const FEATURE_ICONS = [Brain, BarChart3, GraduationCap, Stethoscope]
const PROCESS_ICONS = [UploadCloud, Brain, FileSearch, Stethoscope]

interface HomePageProps {
  setActivePage: (page: string) => void
}

export function HomePage({ setActivePage }: HomePageProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage || i18n.language

  const features = useMemo(
    () =>
      (
        t('home.features', { returnObjects: true }) as Array<{
          icon: string
          title: string
          description: string
        }>
      ).map((feature, index) => ({
        icon: feature.icon,
        title: feature.title,
        desc: feature.description,
        color: FEATURE_COLORS[index] || FEATURE_COLORS[0],
      })),
    [t, language]
  )

  const processSteps = useMemo(
    () =>
      t('home.processSection.steps', { returnObjects: true }) as Array<{
        number: string
        title: string
        description: string
        icon: string
      }>,
    [t, language]
  )

  const stats = useMemo(
    () =>
      t('home.stats', { returnObjects: true }) as Array<{
        value: string
        label: string
      }>,
    [t, language]
  )

  const testimonials = useMemo(
    () =>
      t('home.trustSection.testimonials', { returnObjects: true }) as Array<{
        quote: string
        author: string
      }>,
    [t, language]
  )
  
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
    <div className="w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden">
        <FloatingElements variant="mixed" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{
                opacity: 0,
                x: -50,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
              }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-ovacare-purple/20 text-ovacare-purple text-sm font-semibold mb-6 shadow-sm">
                <Emoji text="✨" size={16} />
                <span>{t('home.hero.badge').replace(/^✨\s*/, '')}</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-ovacare-navy">
                {t('home.hero.title')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ovacare-purple to-ovacare-deep">
                  {t('home.hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-xl text-ovacare-gray mb-8 leading-relaxed max-w-lg">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <GradientButton size="lg" onClick={() => setActivePage('scan')}>
                  {t('home.hero.primaryButton')}
                </GradientButton>
                <GradientButton
                  variant="outline"
                  size="lg"
                  onClick={() => setActivePage('education')}
                >
                  {t('home.hero.secondaryButton')}
                </GradientButton>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm font-medium text-ovacare-gray">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {t('home.hero.accuracy')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ovacare-purple" />
                  {t('home.hero.trusted')}
                </div>
              </div>
            </motion.div>

            {/* Right Visualization */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
              }}
              className="relative flex justify-center"
            >
              <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px]">
                {/* Outer pulsing rings */}
                <div className="absolute inset-0 rounded-full border border-ovacare-purple/20 animate-pulse-slow" />
                <div
                  className="absolute inset-4 rounded-full border border-ovacare-purple/30 animate-pulse-slow"
                  style={{
                    animationDelay: '1s',
                  }}
                />

                {/* Main Ultrasound Container */}
                <div className="absolute inset-8 rounded-full bg-ovacare-navy shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-md">
                  {/* Simulated Ultrasound Content */}
                  <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />

                  {/* Follicles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-white/80 blur-[1px]"
                      style={{
                        width: Math.random() * 20 + 10,
                        height: Math.random() * 20 + 10,
                        top: `${Math.random() * 60 + 20}%`,
                        left: `${Math.random() * 60 + 20}%`,
                      }}
                      animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}

                  {/* Scanning Line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-ovacare-purple to-transparent opacity-70 shadow-[0_0_15px_rgba(102,126,234,0.8)] animate-[scan_4s_linear_infinite]"
                    style={{
                      left: '50%',
                      transformOrigin: 'center',
                    }}
                  >
                    <style>{`
                      @keyframes scan {
                        0% { transform: rotate(0deg) translateX(-150px); }
                        50% { transform: rotate(0deg) translateX(150px); }
                        100% { transform: rotate(0deg) translateX(-150px); }
                      }
                    `}</style>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {t('home.hero.demoCardStatus')}
                    </p>
                    <p className="text-sm font-bold text-ovacare-navy">
                      {t('home.hero.demoCardDetected')}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-white/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ovacare-navy mb-4">
              {t('home.featuresSection.sectionTitle')}
            </h2>
            <p className="text-lg text-ovacare-gray max-w-2xl mx-auto">
              {t('home.featuresSection.sectionSubtitle')}
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: '-100px',
            }}
          >
            {[
              ...features,
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants}>
                <GlassCard className="p-8 h-full" hover glow>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 ${feature.color}`}
                  >
                    {(() => {
                      const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                      return <Icon className="w-7 h-7" />;
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-ovacare-navy mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-ovacare-gray leading-relaxed">
                    {feature.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ovacare-purple/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-ovacare-navy mb-4">
              {t('home.processSection.title')}
            </h2>
            <p className="text-lg text-ovacare-gray">
              {t('home.processSection.subtitle')}
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ovacare-purple to-ovacare-pink"
                initial={{
                  width: 0,
                }}
                whileInView={{
                  width: '100%',
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                }}
                viewport={{
                  once: true,
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {processSteps.map((step, i) => (
                <motion.div
                  key={i}
                  className="relative flex flex-col items-center text-center"
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.3,
                  }}
                  viewport={{
                    once: true,
                  }}
                >
                  <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 relative z-10 border-4 border-white">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-ovacare-purple to-ovacare-deep flex items-center justify-center text-white font-bold shadow-md">
                      {step.number}
                    </div>
                    {(() => {
                      const Icon = PROCESS_ICONS[i % PROCESS_ICONS.length];
                      return <Icon className="w-10 h-10 text-ovacare-navy" />;
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-ovacare-navy mb-3">
                    {step.title}
                  </h3>
                  <p className="text-ovacare-gray max-w-xs">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-ovacare-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  <AnimatedCounter
                    end={parseFloat(stat.value.replace(/[^0-9.]/g, ''))}
                    suffix={stat.value.replace(/[0-9.]/g, '')}
                    decimals={stat.value.includes('.') ? 1 : 0}
                  />
                </div>
                <div className="text-ovacare-purple font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ovacare-navy">
              {t('home.trustSection.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, i) => (
              <GlassCard
                key={i}
                className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-shadow"
                hover
              >
                <div>
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-ovacare-gray text-sm leading-relaxed italic line-clamp-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ovacare-purple/20 to-ovacare-pink/20 flex items-center justify-center text-ovacare-navy font-bold text-sm shrink-0">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="font-bold text-ovacare-navy text-sm">{testimonial.author}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ovacare-purple/10 to-ovacare-pink/10" />
        <FloatingElements variant="purple" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-ovacare-navy mb-6">
            {t('home.ctaSection.title')}
          </h2>
          <p className="text-xl text-ovacare-gray mb-10">
            {t('home.ctaSection.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <GradientButton size="lg" onClick={() => setActivePage('scan')}>
              {t('home.ctaSection.primaryButton')}
            </GradientButton>
            <GradientButton
              variant="outline"
              size="lg"
              onClick={() => setActivePage('doctors')}
            >
              {t('home.ctaSection.secondaryButton')}
            </GradientButton>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-ovacare-gray opacity-70">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {t('home.compliance.hipaa')}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {t('home.compliance.fda')}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {t('home.compliance.encryption')}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}