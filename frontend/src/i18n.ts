import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { deepMerge, cloneTranslation } from './i18n/deepMerge';
import { siOverrides } from './i18n/locales/siOverrides';
import { taOverrides } from './i18n/locales/taOverrides';

// Define translations inline to avoid import issues
const enTranslation = {
      // Navbar
      navbar: {
        home: 'Home',
        aiScan: 'AI Scan',
        education: 'Education',
        doctors: 'Doctors',
        language: 'Language',
        languageSelect: 'Select Language',
        startScan: 'Start Scan',
        mobileLanguageLabel: 'Language / භාෂාව / மொழி',
      },

      // Footer
      footer: {
        description: 'Advanced AI-powered PCOS detection for better women\'s healthcare outcomes.',
        quickLinks: 'Quick Links',
        contact: 'Contact',
        followUs: 'Follow Us',
        allRightsReserved: 'All rights reserved.',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        contactEmail: 'info@ovacare.com',
        supportPage: 'Support',
        aboutUs: 'About Us',
        careers: 'Careers',
        whatsappChannel: 'OvaCare on WhatsApp',
        newsletterDescription:
          'Subscribe to our newsletter for the latest health tips and updates.',
        newsletterPlaceholder: 'Enter your email',
        newsletterSubscribe: 'Subscribe to newsletter',
        newsletterSuccess:
          "You're subscribed! Check your inbox for a confirmation email.",
    newsletterAlreadySubscribed: "You're already subscribed to our newsletter.",
        newsletterError: 'Could not subscribe right now. Please try again.',
        newsletterInvalidEmail: 'Please enter a valid email address.',
      },

      // Common buttons and labels
      common: {
        loading: 'Loading...',
        error: 'Something went wrong. Please try again.',
        success: 'Success!',
        close: 'Close',
        save: 'Save',
        cancel: 'Cancel',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        learnMore: 'Learn More',
        tryNow: 'Try it now →',
        getStarted: 'Get Started',
        download: 'Download',
        upload: 'Upload',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
      },

      // HOME PAGE
      home: {
        // Hero section
        hero: {
          badge: '✨ AI-Powered PCOS Detection',
          badgeRich: '<0>✨ AI-Powered</0> PCOS Detection',
          title: 'Take Control of Your',
          titleHighlight: 'Reproductive Health',
          subtitle: 'Upload your ultrasound scan and get instant AI analysis for PCOS. Get clear insights, personalized recommendations, and connect with specialists.',
          primaryButton: 'Start Free Analysis',
          secondaryButton: 'Learn More',
          demoCardStatus: 'AI Analysis in Progress',
          demoCardProgress: '94% Complete',
          demoCardDetected: 'PCOS Detected',
          demoCardConfidence: '94% Confidence',
          demoCardFollicles: 'Follicles',
          demoCardOvaryVolume: 'Ovary Volume',
          demoCardSeverity: 'Severity',
          demoCardSeverityValue: 'Moderate',
          accuracy: '94% Detection Accuracy',
          trusted: 'Trusted by 200+ Doctors',
        },

        // Stats section
        stats: [
          {
            value: '98.5%',
            label: 'Accuracy Rate',
          },
          {
            value: '1 min',
            label: 'Analysis Time',
          },
          {
            value: '5K+',
            label: 'Scans Analyzed',
          },
          {
            value: '15+',
            label: 'Expert Doctors',
          },
        ],

        // Features section
        features: [
          {
            icon: '🤖',
            title: 'AI-Powered Analysis',
            description: 'Deep learning models analyze ultrasound images for PCOS markers with 94% accuracy.',
          },
          {
            icon: '📊',
            title: 'Visual Reports',
            description: 'Interactive reports with follicle visualization and easy-to-understand explanations.',
          },
          {
            icon: '🎓',
            title: 'Educational Hub',
            description: 'Comprehensive guides about PCOS symptoms, treatments, and lifestyle management.',
          },
          {
            icon: '👩‍⚕️',
            title: 'Doctor Network',
            description: 'Connect with verified gynecologists and endocrinologists in your area.',
          },
        ],

        featuresSection: {
          sectionTitle: 'Why Choose OvaCare',
          sectionTitleRich: 'Why Choose <1>OvaCare</1>',
          sectionSubtitle: 'Experience the future of PCOS detection with our advanced platform',
          tryNow: 'Try it now →',
        },

        // Process/How it works section
        processSection: {
          title: 'How It Works',
          titleRich: 'How It <1>Works</1>',
          subtitle: 'Simple steps to get your PCOS analysis',
          steps: [
            {
              number: '01',
              title: 'Upload Scan',
              description: 'Upload your ovarian ultrasound image securely',
              icon: '📤',
            },
            {
              number: '02',
              title: 'AI Analysis',
              description: 'Our AI analyzes follicles and detects PCOS markers',
              icon: '🤖',
            },
            {
              number: '03',
              title: 'Get Results',
              description: 'Receive detailed report with visual explanations',
              icon: '📊',
            },
            {
              number: '04',
              title: 'Take Action',
              description: 'Connect with specialists and get guidance',
              icon: '👩‍⚕️',
            },
          ],
        },

        // CTA section
        ctaSection: {
          title: 'Ready to take control of your health?',
          subtitle: 'Join thousands of women who\'ve discovered their PCOS status early and taken action.',
          primaryButton: 'Start Free Analysis',
          secondaryButton: 'Find Specialists',
        },

        compliance: {
          hipaa: 'HIPAA Compliant',
          fda: 'FDA Registered',
          encryption: '256-bit Encryption',
        },

        // Trust section
        trustSection: {
          title: 'What Our Users Say',
          testimonials: [
            {
              quote: 'Thank you for adding healthcare tips, articles and videos to the website. It has been very helpful. Specially thank you for doing this.',
              author: 'Nathasha Alwis',
            },
            {
              quote: 'The AI analysis was spot-on and the doctor recommendations were perfect.',
              author: 'Supuli Dibera',
            },
            {
              quote: 'The scan report was easy to understand and gave me confidence to seek treatment sooner.',
              author: 'Amaya Weerasingha',
            },
            {
              quote: 'I finally felt heard. OvaCare made a confusing diagnosis feel clear and manageable.',
              author: 'Nayomi Perera',
            },
          ],
        },
      },

      // SCAN PAGE
      scan: {
        pageTitle: 'Scan Analysis',
        pageSubtitle: 'Upload your ovarian ultrasound scan for AI analysis',

        // Upload section
        uploadSection: {
          uploadIcon: '📤',
          uploadTitle: 'Upload Ultrasound Image',
          uploadInstruction: 'Drag & drop or click to upload',
          dragInstruction: 'Drag and drop your image here, or click to browse',
          supportedFormats: 'Supported: JPG, PNG, DICOM',
          previewLabel: 'Image Preview',
          supportedFileTypes: ['JPG', 'PNG', 'DICOM', 'TIFF'],
        },

        analysisOptions: {
          title: 'Analysis Options',
          standard: {
            name: 'Standard Analysis',
            description: 'Follicle detection, PCOS pattern recognition, confidence scoring',
          },
          advanced: {
            name: 'Advanced Analysis',
            badge: 'PRO',
            description: 'Hormone level estimation, cycle prediction, treatment recommendations',
          },
          startAnalysis: 'Start AI Analysis',
          saveForLater: 'Save for Later Analysis',
        },

        analyzeButton: 'Analyze Scan',
        analyzingButton: 'Analyzing...',

        // Results section
        resultsSection: {
          title: 'Analysis Results',
          diagnosisLabel: 'Diagnosis',
          confidenceLabel: 'Confidence',
          follicleCountLabel: 'Follicle Count',
          follicleCountNormal: 'Normal: 12',
          severityLabel: 'Severity',
          recommendationsTitle: 'Recommendations',
          saveReportButton: 'Save Report',
          findDoctorsButton: 'Find Doctors',
          uploadNewScan: 'Upload New Scan',
        },

        // Technical details section
        technicalDetails: {
          title: 'AI Analysis',
          follicleSize: 'Follicle Size:',
          ovarianVolume: 'Ovarian Volume:',
        },

        // Next steps section
        nextSteps: {
          title: 'Next Steps',
        },

        // Report actions section
        reportActions: {
          title: 'Report Actions',
          emailReport: '📧 Email Report to Doctor',
          downloadPdf: '📄 Download PDF Report',
        },

        // Info Cards
        infoCards: [
          {
            icon: 'checkCircle',
            title: 'HIPAA Compliant',
            description: 'Your medical data is encrypted and secure',
          },
          {
            icon: 'brain',
            title: '98.5% Accuracy',
            description: 'Validated against 50,000+ clinical cases',
          },
          {
            icon: 'activity',
            title: 'Instant Results',
            description: 'Get your analysis in under 60 seconds',
          },
        ],

        // Info section
        infoSection: {
          title: 'How It Works',
          steps: [
            {
              number: 1,
              title: 'Upload Scan',
              description: 'Upload your ovarian ultrasound image',
            },
            {
              number: 2,
              title: 'AI Analysis',
              description: 'Our models detect follicles and PCOS markers',
            },
            {
              number: 3,
              title: 'Get Results',
              description: 'Receive detailed report with visual explanations',
            },
            {
              number: 4,
              title: 'Take Action',
              description: 'Connect with specialists and get guidance',
            },
          ],
        },
      },

      // EDUCATION PAGE
      education: {
        pageTitle: 'PCOS Education Hub',
        pageSubtitle: 'Comprehensive resources to understand and manage PCOS. Expert-curated content to empower your health journey.',

        // Tab labels
        tabs: [
          { id: 'overview', label: 'PCOS Overview', icon: 'BookOpen' },
          { id: 'nutrition', label: 'Nutrition', icon: 'Apple' },
          { id: 'exercise', label: 'Exercise', icon: 'Dumbbell' },
          { id: 'mental', label: 'Mental Health', icon: 'Heart' },
          { id: 'research', label: 'Blogs & Researches', icon: 'Brain' },
        ],

        // Overview tab
        overview: {
          understandingPcos: 'Understanding PCOS',
          introText: 'Polycystic Ovary Syndrome (PCOS) is a hormonal disorder affecting 1 in 10 women of reproductive age. Despite its name, PCOS isn\'t just about cysts on the ovaries – it\'s a complex metabolic and hormonal condition.',
          keyStatistics: 'Key Statistics:',
          stats: [
            'Affects 6-12% of women worldwide',
            'Most common endocrine disorder in women',
            'Leading cause of female infertility',
            'Often undiagnosed or misdiagnosed',
          ],
          commonSymptoms: 'Common Symptoms:',
          symptoms: [
            'Irregular or missed periods',
            'Excess hair growth (hirsutism)',
            'Weight gain or difficulty losing weight',
            'Acne and oily skin',
            'Hair thinning or male-pattern baldness',
            'Insulin resistance',
            'Mood changes and depression',
            'Sleep apnea',
          ],
          diagnosisCriteria: 'Diagnosis Criteria (Rotterdam Criteria)',
          diagnosisCriteriaItems: [
            {
              title: 'Ovulatory Dysfunction',
              description: 'Irregular or absent ovulation, often resulting in irregular periods',
            },
            {
              title: 'Clinical/Biochemical Signs',
              description: 'Elevated androgen levels or visible signs like excess hair growth',
            },
            {
              title: 'Polycystic Ovaries',
              description: '12+ follicles on ultrasound or increased ovarian volume',
            },
          ],
          diagnosisNote: 'Note: At least 2 out of 3 criteria must be met for PCOS diagnosis, and other conditions must be ruled out.',
          educationalVideos: 'Educational Videos',
        },

        // Nutrition tab
        nutrition: {
          dietPlans: 'PCOS-Friendly Diet Plans',
          diets: [
            {
              name: 'Anti-Inflammatory Sri Lankan Diet',
              description: 'Traditional foods that reduce inflammation',
              keyFoods: ['Turmeric (Kaha)', 'Gotukola', 'Fish curry', 'Coconut oil'],
            },
            {
              name: 'Low Glycemic Local Foods',
              description: 'Sri Lankan foods for stable blood sugar',
              keyFoods: ['Red rice', 'Mung beans (Mu)', 'Kohila', 'Jackfruit'],
            },
            {
              name: 'Traditional Ayurvedic',
              description: 'Time-tested remedies for hormonal balance',
              keyFoods: ['Fenugreek (Uluhaal)', 'Cinnamon (Kurundu)', 'Bitter gourd', 'Moringa (Murunga)'],
            },
          ],
          keyFoods: 'KEY FOODS:',
          mealPlan: '7-Day Meal Plan',
          mealPlanDays: [
            { day: 'Monday', meal: 'Red rice with fish curry and gotukola sambol' },
            { day: 'Tuesday', meal: 'Dhal curry with brown bread and pol sambol' },
            { day: 'Wednesday', meal: 'Kohila curry with red rice and tempered vegetables' },
            { day: 'Thursday', meal: 'Mung bean curry with string hoppers' },
            { day: 'Friday', meal: 'Spiced fish with steamed jackfruit curry' },
            { day: 'Saturday', meal: 'Bitter gourd curry with red rice and chicken' },
            { day: 'Sunday', meal: 'Mixed vegetable curry with coconut roti' },
          ],
          downloadFullPlan: 'Download Full Plan',
          foodsToAvoid: 'Foods to Avoid',
          foodsToAvoidList: [
            { category: 'White Rice & Refined Carbs', examples: 'White rice, white bread, wade, kokis' },
            { category: 'Sugary Sri Lankan Treats', examples: 'Konda kevum, aluwa, sugary drinks' },
            { category: 'Processed Foods', examples: 'Packet noodles, biscuits, fried snacks' },
            { category: 'Excessive Coconut Products', examples: 'Too much coconut milk, kiribath daily' },
            { category: 'High Sugar Fruits', examples: 'Overripe bananas, dates, grapes' },
          ],
          supplements: 'Evidence-Based Supplements',
          supplementsList: [
            { name: 'Fenugreek (Uluhaal)', benefit: 'Traditional PCOS remedy', dosage: '500mg twice daily' },
            { name: 'Cinnamon (Kurundu)', benefit: 'Blood sugar control', dosage: '1-3g daily' },
            { name: 'Turmeric (Kaha)', benefit: 'Anti-inflammatory', dosage: '500-1000mg daily' },
            { name: 'Moringa (Murunga)', benefit: 'Nutrient dense superfood', dosage: '1-2g daily' },
          ],
          supplementsDisclaimer: 'Disclaimer: Always consult with your healthcare provider before starting any supplement regimen. Traditional remedies listed are common in Sri Lankan Ayurvedic practice but should be used under medical supervision.',
        },

        // Exercise tab
        exercise: {
          exerciseGuidelines: 'PCOS Exercise Guidelines',
          whyExerciseMatters: 'Why Exercise Matters for PCOS',
          benefits: [
            'Improves insulin sensitivity by up to 25%',
            'Helps regulate menstrual cycles',
            'Reduces inflammation markers',
            'Supports healthy weight management',
            'Improves mood and reduces depression',
            'Enhances fertility outcomes',
          ],
          weeklyGoal: 'Weekly Exercise Goal',
          weeklyGoalMinutes: '150 minutes',
          weeklyGoalDescription: 'Moderate-intensity aerobic activity per week, plus 2 days of strength training',
          exerciseBreakdown: [
            { type: 'Cardio', range: '75-150 min/week' },
            { type: 'Strength', range: '2-3 sessions/week' },
            { type: 'HIIT', range: '1-2 sessions/week' },
          ],
          exerciseTypes: [
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
          ],
          benefitsLabel: 'BENEFITS:',
          examplesLabel: 'EXAMPLES:',
          fourWeekProgram: '4-Week Beginner Program',
          programWeeks: [
            { week: 'Week 1', cardio: '15 min', strength: '2x/week', hiit: 'Optional' },
            { week: 'Week 2', cardio: '20 min', strength: '2x/week', hiit: 'Optional' },
            { week: 'Week 3', cardio: '25 min', strength: '2x/week', hiit: '1x/week' },
            { week: 'Week 4', cardio: '30 min', strength: '2x/week', hiit: '1x/week' },
          ],
          downloadProgram: 'Download Program',
          addToCalendar: 'Add to Calendar',
        },

        // Mental Health tab
        mental: {
          mentalHealthTitle: 'PCOS and Mental Health',
          understandingConnection: 'Understanding the Connection',
          connectionText: 'Women with PCOS are 3x more likely to experience depression and anxiety. The hormonal imbalances, physical symptoms, and fertility concerns can significantly impact mental well-being.',
          mentalHealthChallenges: 'Common Mental Health Challenges:',
          challenges: [
            'Depression (rates 4-7x higher)',
            'Anxiety disorders',
            'Body image issues',
            'Low self-esteem',
            'Eating disorders',
            'Relationship stress',
          ],
          copingStrategies: 'Coping Strategies',
          strategies: [
            { strategy: 'Mindfulness & Meditation', description: 'Reduce stress and improve mood' },
            { strategy: 'Support Groups', description: 'Connect with others who understand' },
            { strategy: 'Therapy', description: 'CBT and counseling for emotional support' },
            { strategy: 'Stress Management', description: 'Techniques to lower cortisol levels' },
            { strategy: 'Lifestyle Changes', description: 'Diet and exercise for hormone balance' },
            { strategy: 'Professional Help', description: 'Consult with psychologists or counselors' },
          ],
        },

        // Research tab
        research: {
          latestResearch: 'Latest PCOS Research',
          subtitle: 'Stay updated with cutting-edge scientific discoveries',
          researchAreas: [
            {
              title: 'Genetic Factors',
              description: 'New genetic markers linked to PCOS susceptibility',
            },
            {
              title: 'Gut Health',
              description: 'How microbiome affects PCOS development and severity',
            },
            {
              title: 'Inflammation',
              description: 'Role of chronic inflammation in PCOS pathogenesis',
            },
            {
              title: 'New Treatments',
              description: 'Emerging therapies and clinical trial updates',
            },
          ],
        },
      },

      // DOCTORS PAGE
      doctors: {
        pageTitle: 'Find PCOS Specialists',
        pageSubtitle: 'Connect with certified gynecologists and women\'s health experts',
        searchPlaceholder: 'Search by name, location, or specialty...',
        filterButton: 'Filter',
        sortButton: 'Sort',

        // Filter options
        filters: {
          specialty: 'Specialty',
          location: 'Location',
          availability: 'Availability',
          ratings: 'Ratings',
          language: 'Language',
          insurance: 'Insurance',
          allCities: 'All Cities',
        },

        // Doctor card fields
        doctorCard: {
          verified: 'Verified',
          yearsExperience: 'years experience',
          patientsReviews: 'patient reviews',
          availableToday: 'Available Today',
          nextAvailable: 'Next Available',
          consultationFee: 'Consultation Fee',
          acceptsInsurance: 'Accepts Insurance',
          telemedicine: 'Video Consultation',
          bookConsultation: 'Book Consultation',
          viewProfile: 'View Profile',
        },

        // Doctor profile
        profile: {
          aboutDoctor: 'About',
          credentials: 'Credentials',
          languages: 'Languages',
          officeHours: 'Office Hours',
          specializations: 'Specializations',
          experience: 'Years Experience',
          patients: 'Patients Treated',
          rating: 'Rating',
          location: 'Location',
          specialization: 'Specialization',
          languagesSpoken: 'Languages Spoken',
          initialConsultation: 'Initial consultation (60 mins)',
        },

        // Booking
        booking: {
          selectConsultationType: 'Select Consultation Type',
          videoConsultation: 'Video Consultation',
          inPersonAppointment: 'In-Person Appointment',
          selectTime: 'Select Preferred Time',
          bookNow: 'Book Now',
          congratulations: 'Congratulations!',
          bookingConfirmed: 'Your appointment has been confirmed',
        },

        // Empty states
        noResultsFound: 'No doctors found matching your criteria',
        tryAdjustingFilters: 'Try adjusting your search or filters',

        list: {
          searchByNameOrSpecialty: 'Search by name or specialty...',
          locationPlaceholder: 'City, State or ZIP',
          searchButton: 'Search',
          specialistsFound: '{{count}} Specialists Found',
          moreFilters: 'More Filters',
          clearFilters: 'Clear filters',
          verified: 'Verified',
          availableToday: 'Available Today',
        },

        specialties: {
          all: 'All Specialists',
          gynecology: 'Gynecology',
          endocrinology: 'Endocrinology',
          fertility: 'Fertility',
        },

        cta: {
          title: "Can't Find the Right Doctor?",
          subtitle:
            "We're constantly adding new specialists to our network. Suggest a doctor you trust or apply to join as a provider.",
        },

        forms: {
          specialistMatch: {
            title: 'Request Specialist Match',
            subtitle:
              'Know a great gynaecologist we should list? Tell us about them and we will review your suggestion.',
            yourName: 'Your Name',
            yourEmail: 'Your Email',
            doctorName: 'Doctor Name',
            specialty: 'Specialty',
            location: 'City / Location',
            details: 'Why do you recommend this doctor?',
            detailsPlaceholder: 'e.g. Specialises in PCOS, friendly bedside manner, good scanning...',
            submit: 'Submit Suggestion',
            success: 'Thank you! Your specialist suggestion has been received.',
            error: 'Could not submit your suggestion. Please try again.',
          },
          providerNetwork: {
            title: 'Join Our Provider Network',
            subtitle: 'We would love to have you join OvaCare as a doctor. Tell us a little about yourself.',
            name: 'Your Name',
            specialty: 'Specialty',
            description: 'About You',
            descriptionPlaceholder: 'Brief background, qualifications, and areas of focus...',
            email: 'Email (optional)',
            phone: 'Phone (optional)',
            submit: 'Submit Application',
            success: 'Thank you for applying! Our team will review your application and get in touch.',
            error: 'Could not submit your application. Please try again.',
          },
        },
      },

      // BOOKING
      booking: {
        title: 'Book Your Consultation',
        subtitle: 'Select a date and time, then confirm your appointment details.',
        doctorInfo: 'Doctor Information',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        patientName: 'Full Name',
        patientEmail: 'Email Address',
        patientPhone: 'Phone Number',
        reasonLabel: 'Reason for Visit',
        reasonPlaceholder: 'Describe your symptoms or reason for consultation...',
        confirmButton: 'Confirm Booking',
        bookingConfirmed: 'Booking Confirmed!',
        confirmationMessage: 'Your appointment has been successfully booked. Please save your booking ID for reference.',
        confirmationEmailSent: 'A confirmation email has been sent to {{email}}.',
        confirmationEmailPending: 'Your booking is confirmed. A confirmation email will be sent to {{email}} shortly.',
        paymentNote: 'Payment will be collected at the clinic. Please arrive 10 minutes early.',
        bookingId: 'Booking ID',
        errorSlotTaken: 'This time slot has already been booked. Please choose another slot.',
        errorGeneric: 'Something went wrong. Please try again.',
      },
};

const resources = {
  en: { translation: enTranslation },
  si: { translation: deepMerge(cloneTranslation(enTranslation), siOverrides) },
  ta: { translation: deepMerge(cloneTranslation(enTranslation), taOverrides) },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'si', 'ta'],
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },

    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'ovacare-language',
      lookupSessionStorage: 'ovacare-language',
      caches: ['localStorage', 'sessionStorage'],
    },

    resources
  });

// Save language changes to localStorage and load saved language on init
const savedLanguage = localStorage.getItem('ovacare-language')?.split('-')[0];
if (savedLanguage && ['en', 'si', 'ta'].includes(savedLanguage)) {
  i18n.changeLanguage(savedLanguage);
}

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  const code = lng.split('-')[0];
  localStorage.setItem('ovacare-language', code);
  document.documentElement.lang = code;
});

export default i18n;