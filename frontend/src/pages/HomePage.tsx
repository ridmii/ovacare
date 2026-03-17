import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Brain,
  FileText,
  BookOpen,
  Stethoscope,
  Upload,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react'
import { GlassCard } from '../components/GlassCard'
import { GradientButton } from '../components/GradientButton'
import { FloatingElements } from '../components/FloatingElements'
import { AnimatedCounter } from '../components/AnimatedCounter'

interface HomePageProps {
  setActivePage: (page: string) => void
}

export function HomePage({ setActivePage }: HomePageProps) {
  const { t } = useTranslation()
  
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
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-ovacare-purple/20 text-ovacare-purple text-sm font-semibold mb-6 shadow-sm">
                {t('hero.badge')}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-ovacare-navy">
                {t('hero.title')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ovacare-purple to-ovacare-deep">
                  {t('hero.subtitle')}
                </span>
              </h1>
              <p className="text-xl text-ovacare-gray mb-8 leading-relaxed max-w-lg">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <GradientButton size="lg" onClick={() => setActivePage('scan')}>
                  {t('hero.startScan')}
                </GradientButton>
                <GradientButton
                  variant="outline"
                  size="lg"
                  onClick={() => setActivePage('education')}
                >
                  {t('hero.learnMore')}
                </GradientButton>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm font-medium text-ovacare-gray">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {t('hero.accuracy')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ovacare-purple" />
                  {t('hero.trusted')}
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
                      Analysis Complete
                    </p>
                    <p className="text-sm font-bold text-ovacare-navy">
                      PCOS Detected
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
              {t('features.title')}
            </h2>
            <p className="text-lg text-ovacare-gray max-w-2xl mx-auto">
              {t('features.subtitle')}
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
              {
                icon: Brain,
                title: t('features.ai.title'),
                desc: t('features.ai.description'),
                color: 'text-ovacare-purple',
              },
              {
                icon: FileText,
                title: t('features.report.title'),
                desc: t('features.report.description'),
                color: 'text-ovacare-pink',
              },
              {
                icon: BookOpen,
                title: t('education.title'),
                desc: t('education.subtitle'),
                color: 'text-ovacare-deep',
              },
              {
                icon: Stethoscope,
                title: t('features.doctors.title'),
                desc: t('features.doctors.description'),
                color: 'text-ovacare-coral',
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants}>
                <GlassCard className="p-8 h-full" hover glow>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 ${feature.color}`}
                  >
                    <feature.icon className="w-6 h-6" />
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
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-ovacare-gray">
              {t('howItWorks.subtitle')}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: 1,
                  icon: Upload,
                  title: t('howItWorks.step1.title'),
                  desc: t('howItWorks.step1.description'),
                },
                {
                  step: 2,
                  icon: Brain,
                  title: t('howItWorks.step2.title'),
                  desc: t('howItWorks.step2.description'),
                },
                {
                  step: 3,
                  icon: CheckCircle,
                  title: t('howItWorks.step3.title'),
                  desc: t('howItWorks.step3.description'),
                },
              ].map((item, i) => (
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
                      {item.step}
                    </div>
                    <item.icon className="w-10 h-10 text-ovacare-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-ovacare-navy mb-3">
                    {item.title}
                  </h3>
                  <p className="text-ovacare-gray max-w-xs">{item.desc}</p>
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
            {[
              {
                val: 98.4,
                suffix: '%',
                label: 'Accuracy Rate (Clinical Validation)',
                decimals: 1,
              },
              {
                val: 50000,
                suffix: '+',
                label: 'Scans Analyzed',
              },
              {
                val: 500,
                suffix: '+',
                label: 'Partner Doctors',
              },
              {
                val: 4.9,
                suffix: '/5',
                label: 'User Rating',
                decimals: 1,
              },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  <AnimatedCounter
                    end={stat.val}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
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
            <h2 className="text-3xl md:text-4xl font-bold text-ovacare-navy mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg text-ovacare-gray">
              {t('testimonials.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: t('testimonials.testimonial1.author'),
                role: t('testimonials.testimonial1.position'),
                quote: t('testimonials.testimonial1.text'),
                stars: 5,
              },
              {
                name: t('testimonials.testimonial2.author'),
                role: t('testimonials.testimonial2.position'),
                quote: t('testimonials.testimonial2.text'),
                stars: 5,
              },
              {
                name: t('testimonials.testimonial3.author'),
                role: t('testimonials.testimonial3.position'),
                quote: t('testimonials.testimonial3.text'),
                stars: 5,
              },
            ].map((t, i) => (
              <GlassCard key={i} className="p-8" hover>
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < t.stars ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-ovacare-gray mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-ovacare-navy">{t.name}</div>
                    <div className="text-xs text-ovacare-purple">{t.role}</div>
                  </div>
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
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-ovacare-gray mb-10">
            Join thousands of women who have used OvaCare for early PCOS
            detection and management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <GradientButton size="lg" onClick={() => setActivePage('scan')}>
              Start Your Free Scan
            </GradientButton>
            <GradientButton
              variant="outline"
              size="lg"
              onClick={() => setActivePage('doctors')}
            >
              Find a Specialist
            </GradientButton>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-ovacare-gray opacity-70">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> HIPAA Compliant
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> FDA Registered
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> 256-bit Encryption
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}