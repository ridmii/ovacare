import React, { useState } from 'react'
import { motion } from 'framer-motion'
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

export function EducationPage({ setActivePage }: EducationPageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    {
      id: 'overview',
      label: 'PCOS Overview',
      icon: BookOpen,
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      icon: Apple,
    },
    {
      id: 'exercise',
      label: 'Exercise',
      icon: Dumbbell,
    },
    {
      id: 'mental',
      label: 'Mental Health',
      icon: Heart,
    },
    {
      id: 'research',
      label: 'Latest Research',
      icon: Brain,
    },
  ]

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
            PCOS Education Hub
          </h1>
          <p className="text-lg text-ovacare-gray max-w-2xl mx-auto">
            Comprehensive resources to understand and manage PCOS. Expert-curated
            content to empower your health journey.
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
                <tab.icon className="w-4 h-4" />
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
                  Understanding PCOS
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-ovacare-gray leading-relaxed">
                      Polycystic Ovary Syndrome (PCOS) is a hormonal disorder
                      affecting 1 in 10 women of reproductive age. Despite its
                      name, PCOS isn't just about cysts on the ovaries – it's a
                      complex metabolic and hormonal condition.
                    </p>
                    <div className="bg-ovacare-purple/10 p-4 rounded-lg">
                      <h4 className="font-bold text-ovacare-navy mb-2">
                        Key Statistics:
                      </h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Affects 6-12% of women worldwide</li>
                        <li>• Most common endocrine disorder in women</li>
                        <li>• Leading cause of female infertility</li>
                        <li>• Often undiagnosed or misdiagnosed</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-ovacare-navy">Common Symptoms:</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Irregular or missed periods',
                        'Excess hair growth (hirsutism)',
                        'Weight gain or difficulty losing weight',
                        'Acne and oily skin',
                        'Hair thinning or male-pattern baldness',
                        'Insulin resistance',
                        'Mood changes and depression',
                        'Sleep apnea',
                      ].map((symptom, i) => (
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
                  Diagnosis Criteria (Rotterdam Criteria)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Ovulatory Dysfunction',
                      desc: 'Irregular or absent ovulation, often resulting in irregular periods',
                      icon: Calendar,
                    },
                    {
                      title: 'Clinical/Biochemical Signs',
                      desc: 'Elevated androgen levels or visible signs like excess hair growth',
                      icon: Brain,
                    },
                    {
                      title: 'Polycystic Ovaries',
                      desc: '12+ follicles on ultrasound or increased ovarian volume',
                      icon: CheckCircle,
                    },
                  ].map((criteria, i) => (
                    <div key={i} className="text-center p-6 bg-white/30 rounded-lg">
                      <div className="w-12 h-12 mx-auto rounded-full bg-ovacare-purple/10 flex items-center justify-center mb-4">
                        <criteria.icon className="w-6 h-6 text-ovacare-purple" />
                      </div>
                      <h4 className="font-bold text-ovacare-navy mb-2">{criteria.title}</h4>
                      <p className="text-sm text-ovacare-gray">{criteria.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> At least 2 out of 3 criteria must be met for PCOS diagnosis,
                    and other conditions must be ruled out.
                  </p>
                </div>
              </GlassCard>

              {/* Educational Videos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'What is PCOS? Complete Guide',
                    duration: '12:45',
                    thumbnail: '🎥',
                    views: '2.3M',
                  },
                  {
                    title: 'PCOS Symptoms Explained',
                    duration: '8:30',
                    thumbnail: '📚',
                    views: '1.8M',
                  },
                ].map((video, i) => (
                  <GlassCard key={i} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-16 bg-gradient-to-r from-ovacare-purple to-ovacare-pink rounded-lg flex items-center justify-center text-2xl">
                        {video.thumbnail}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-ovacare-navy mb-1">{video.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-ovacare-gray">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {video.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            {video.views} views
                          </span>
                        </div>
                      </div>
                      <Play className="w-8 h-8 text-ovacare-purple" />
                    </div>
                  </GlassCard>
                ))}
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
                    <GradientButton className="w-full mt-4" variant="outline">
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
                    <GradientButton>
                      <Download className="w-4 h-4 mr-2" />
                      Download Program
                    </GradientButton>
                    <GradientButton variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </GradientButton>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                      Recommended Apps & Tools
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Headspace', type: 'Meditation', rating: 4.8 },
                        { name: 'Calm', type: 'Sleep & Relaxation', rating: 4.7 },
                        { name: 'BetterHelp', type: 'Online Therapy', rating: 4.6 },
                        { name: 'Mood Meter', type: 'Emotion Tracking', rating: 4.5 },
                      ].map((app, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/40 rounded-lg">
                          <div>
                            <div className="font-medium text-ovacare-navy">{app.name}</div>
                            <div className="text-sm text-ovacare-gray">{app.type}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{app.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                      Crisis Resources
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-semibold text-red-800 mb-1">Crisis Text Line</div>
                        <div className="text-red-600">Text HOME to 741741</div>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-1">National Suicide Prevention Lifeline</div>
                        <div className="text-blue-600">988 or 1-800-273-8255</div>
                      </div>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="font-semibold text-purple-800 mb-1">PCOS Challenge Support</div>
                        <div className="text-purple-600">Online community & resources</div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* RESEARCH TAB */}
          {activeTab === 'research' && (
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h2 className="text-2xl font-bold text-ovacare-navy mb-6">
                    Latest PCOS Research
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                        Recent Breakthroughs
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            title: 'New Genetic Markers Discovered',
                            date: '2024',
                            summary: 'Researchers identified 19 new genetic variants associated with PCOS risk.',
                          },
                          {
                            title: 'Gut Microbiome Connection',
                            date: '2024',
                            summary: 'Studies reveal how gut bacteria influence PCOS symptoms and metabolism.',
                          },
                          {
                            title: 'AI-Powered Diagnostic Tools',
                            date: '2023',
                            summary: 'Machine learning improves ultrasound accuracy for PCOS detection.',
                          },
                        ].map((study, i) => (
                          <div key={i} className="p-4 bg-white/40 rounded-lg border-l-4 border-ovacare-purple">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-ovacare-navy">{study.title}</h4>
                                <p className="text-sm text-ovacare-gray mt-1">{study.summary}</p>
                              </div>
                              <span className="text-xs text-ovacare-purple font-medium">{study.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-ovacare-navy mb-4">
                        Clinical Trials
                      </h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">Active</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recruiting</span>
                          </div>
                          <h4 className="font-semibold text-green-900 mb-1">
                            Metformin vs. Lifestyle Intervention
                          </h4>
                          <p className="text-sm text-green-700">
                            Comparing medication versus lifestyle changes for insulin resistance.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">Phase III</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Open</span>
                          </div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            Novel Hormonal Treatment
                          </h4>
                          <p className="text-sm text-blue-700">
                            Testing new hormone therapy for ovulation induction.
                          </p>
                        </div>
                      </div>
                      
                      <GradientButton variant="outline" className="w-full mt-4">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Find Clinical Trials
                      </GradientButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Research Publications */}
              <motion.div variants={itemVariants}>
                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold text-ovacare-navy mb-6">
                    Key Publications (2024)
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Machine Learning Approaches for PCOS Diagnosis: A Systematic Review',
                        journal: 'Nature Medicine',
                        authors: 'Smith, J. et al.',
                        impact: 'High Impact',
                        summary: 'Comprehensive analysis of AI diagnostic tools shows 95%+ accuracy across multiple studies.',
                      },
                      {
                        title: 'Gut-Ovarian Axis in PCOS: Mechanistic Insights',
                        journal: 'Cell Metabolism',
                        authors: 'Chen, L. et al.',
                        impact: 'High Impact',
                        summary: 'First mechanistic study linking gut microbiome to ovarian function in PCOS patients.',
                      },
                      {
                        title: 'Inositol Supplementation in PCOS: Meta-Analysis of 15 RCTs',
                        journal: 'Fertility & Sterility',
                        authors: 'Rodriguez, M. et al.',
                        impact: 'Medium Impact',
                        summary: 'Confirmed benefits of inositol for ovulation induction and metabolic improvements.',
                      },
                    ].map((paper, i) => (
                      <div key={i} className="p-6 bg-white/40 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-ovacare-navy mb-1">{paper.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-ovacare-gray">
                              <span>{paper.journal}</span>
                              <span>•</span>
                              <span>{paper.authors}</span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  paper.impact === 'High Impact'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {paper.impact}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-ovacare-purple cursor-pointer" />
                        </div>
                        <p className="text-sm text-ovacare-gray">{paper.summary}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
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