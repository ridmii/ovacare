import type { TranslationResource } from '../types'

export const taOverrides: Partial<TranslationResource> = {
  navbar: {
    home: 'முகப்பு',
    aiScan: 'AI ஸ்கேன்',
    education: 'கல்வி',
    doctors: 'மருத்துவர்கள்',
    language: 'மொழி',
    languageSelect: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    startScan: 'AI ஸ்கேன் தொடங்கு',
    mobileLanguageLabel: 'Language / භාෂාව / மொழி',
  },

  footer: {
    description:
      'சிறந்த பெண்கள் சுகாதார விளைவுகளுக்காக மேம்பட்ட AI-ஆல் இயக்கப்படும் PCOS கண்டறிதல்.',
    quickLinks: 'விரைவு இணைப்புகள்',
    contact: 'தொடர்பு',
    followUs: 'எங்களைப் பின்தொடருங்கள்',
    allRightsReserved: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    privacyPolicy: 'தனியுரிமை கொள்கை',
    termsOfService: 'சேவை விதிமுறைகள்',
    contactEmail: 'info@ovacare.com',
    supportPage: 'ஆதரவு',
    aboutUs: 'எங்களைப் பற்றி',
    careers: 'Careers',
    whatsappChannel: 'OvaCare WhatsApp',
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

  common: {
    loading: 'ஏற்றுகிறது...',
    error: 'ஏதோ தவறாகிவிட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    success: 'வெற்றி!',
    close: 'மூடு',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    back: 'பின்னால்',
    next: 'அடுத்து',
    previous: 'முந்தைய',
    learnMore: 'மேலும் அறிக',
    tryNow: 'இப்போது முயற்சிக்கவும் →',
    getStarted: 'தொடங்குங்கள்',
    download: 'பதிவிறக்க',
    upload: 'பதிவேற்ற',
    search: 'தேடு',
    filter: 'வடிகட்டி',
    sort: 'வரிசைப்படுத்த',
  },

  home: {
    hero: {
      badge: '✨ AI-ஆல் இயக்கப்படும் PCOS கண்டறிதல்',
      badgeRich: '<0>✨ AI-ஆல் இயக்கப்படும்</0> PCOS கண்டறிதல்',
      title: 'உங்கள்',
      titleHighlight: 'இனப்பெருக்க ஆரோக்கியத்தைக் கட்டுப்படுத்துங்கள்',
      subtitle:
        'உங்கள் அல்ட்ராசவுண்ட் ஸ்கேனைப் பதிவேற்றி PCOS-க்கான உடனடி AI பகுப்பாய்வைப் பெறுங்கள். தெளிவான insight, தனிப்பயன் பரிந்துரைகள் மற்றும் நிபுணர்களுடன் இணையுங்கள்.',
      primaryButton: 'இலவச பகுப்பாய்வைத் தொடங்குங்கள்',
      secondaryButton: 'மேலும் அறிக',
      demoCardStatus: 'AI பகுப்பாய்வு நடைபெறுகிறது',
      demoCardProgress: '94% முடிந்தது',
      demoCardDetected: 'PCOS கண்டறியப்பட்டது',
      demoCardConfidence: '94% நம்பிக்கை',
      demoCardFollicles: 'நுண்ணறைகள்',
      demoCardOvaryVolume: 'கருப்பை அளவு',
      demoCardSeverity: 'தீவிரத்தன்மை',
      demoCardSeverityValue: 'மிதமான',
      accuracy: '94% கண்டறிதல் துல்லியம்',
      trusted: '200+ மருத்துவர்களால் நம்பப்படுகிறது',
    },
    stats: [
      { value: '94%', label: 'துல்லிய விகிதம்' },
      { value: '2 min', label: 'பகுப்பாய்வு நேரம்' },
      { value: '12K+', label: 'பகுப்பாய்வு செய்யப்பட்ட ஸ்கேன்கள்' },
      { value: '200+', label: 'நிபுண மருத்துவர்கள்' },
    ],
    features: [
      {
        icon: '🤖',
        title: 'AI-ஆல் இயக்கப்படும் பகுப்பாய்வு',
        description:
          'ஆழமான கற்றல் மாதிரிகள் 94% துல்லியத்துடன் PCOS குறிகளுக்காக அல்ட்ராசவுண்ட் படங்களை பகுப்பாய்வு செய்கின்றன.',
      },
      {
        icon: '📊',
        title: 'காட்சி அறிக்கைகள்',
        description:
          'நுண்ணறை visualization மற்றும் புரிந்துகொள்ள எளிதான விளக்கங்களுடன் ஊடாடும் அறிக்கைகள்.',
      },
      {
        icon: '🎓',
        title: 'கல்வி மையம்',
        description:
          'PCOS அறிகுறிகள், சிகிச்சைகள் மற்றும் வாழ்க்கை முறை மேலாண்மை பற்றிய விரிவான வழிகாட்டுதல்கள்.',
      },
      {
        icon: '👩‍⚕️',
        title: 'மருத்துவர் நெட்வொர்க்',
        description:
          'உங்கள் பகுதியில் சரிபார்க்கப்பட்ட மகளிர் மருத்துவ மற்றும் ந hormone நிபுணர்களுடன் இணையுங்கள்.',
      },
    ],
    featuresSection: {
      sectionTitle: 'OvaCare ஏன் தேர்வு செய்ய வேண்டும்',
      sectionTitleRich: '<1>OvaCare</1> ஏன் தேர்வு செய்ய வேண்டும்',
      sectionSubtitle: 'எங்கள் மேம்பட்ட தளத்துடன் PCOS கண்டறிதலின் எதிர்காலத்தை அனுபவிக்கவும்',
      tryNow: 'இப்போது முயற்சிக்கவும் →',
    },
    processSection: {
      title: 'இது எப்படி வேலை செய்கிறது',
      titleRich: 'இது <1>எப்படி</1> வேலை செய்கிறது',
      subtitle: 'உங்கள் PCOS பகுப்பாய்வைப் பெற எளிய படிகள்',
      steps: [
        {
          number: '01',
          title: 'ஸ்கேனைப் பதிவேற்றவும்',
          description: 'உங்கள் கருப்பை அல்ட்ராசவுண்ட் படத்தை பாதுகாப்பாக பதிவேற்றவும்',
          icon: '📤',
        },
        {
          number: '02',
          title: 'AI பகுப்பாய்வு',
          description: 'எங்கள் AI நுண்ணறைகளை பகுப்பாய்வு செய்து PCOS குறிகளை கண்டறியும்',
          icon: '🤖',
        },
        {
          number: '03',
          title: 'முடிவுகளைப் பெறுங்கள்',
          description: 'காட்சி விளக்கங்களுடன் விரிவான அறிக்கையைப் பெறுங்கள்',
          icon: '📊',
        },
        {
          number: '04',
          title: 'நடவடிக்கை எடுக்கவும்',
          description: 'நிபுணர்களுடன் இணைந்து வழிகாட்டலைப் பெறுங்கள்',
          icon: '👩‍⚕️',
        },
      ],
    },
    ctaSection: {
      title: 'உங்கள் ஆரோக்கியத்தைக் கட்டுப்படுத்த தயாரா?',
      subtitle:
        'தங்கள் PCOS நிலையை early கண்டறிந்து நடவடிக்கை எடுத்த ஆயிரக்கணக்கான பெண்களுடன் இணையுங்கள்.',
      primaryButton: 'இலவச பகுப்பாய்வைத் தொடங்குங்கள்',
      secondaryButton: 'நிபுணர்களைக் கண்டறியுங்கள்',
    },
    compliance: {
      hipaa: 'HIPAA இணக்கம்',
      fda: 'FDA பதிவு',
      encryption: '256-bit குறியாக்கம்',
    },
    trustSection: {
      title: 'What Our Users Say',
      testimonials: [
        {
          quote: 'OvaCare helped me get diagnosed 2 years earlier than my doctors suspected.',
          author: 'Sarah, 28',
        },
        {
          quote: 'The AI analysis was spot-on and the doctor recommendations were perfect.',
          author: 'Priya, 32',
        },
        {
          quote: 'The scan report was easy to understand and gave me confidence to seek treatment sooner.',
          author: 'Amaya, 26',
        },
        {
          quote: 'I finally felt heard. OvaCare made a confusing diagnosis feel clear and manageable.',
          author: 'Nisha, 34',
        },
      ],
    },
  },

  scan: {
    pageTitle: 'ஸ்கேன் பகுப்பாய்வு',
    pageSubtitle: 'AI பகுப்பாய்விற்காக உங்கள் கருப்பை அல்ட்ராசவுண்ட் ஸ்கேனைப் பதிவேற்றவும்',
    uploadSection: {
      uploadIcon: '📤',
      uploadTitle: 'அல்ட்ராசவுண்ட் படத்தைப் பதிவேற்று',
      uploadInstruction: 'இழுத்து விடவும் அல்லது பதிவேற்ற கிளிக் செய்யவும்',
      dragInstruction: 'உங்கள் படத்தை இங்கே இழுக்கவும், அல்லது உலாவ கிளிக் செய்யவும்',
      supportedFormats: 'ஆதரவு: JPG, PNG, DICOM',
      previewLabel: 'பட முன்னோட்டம்',
      supportedFileTypes: ['JPG', 'PNG', 'DICOM', 'TIFF'],
    },
    analysisOptions: {
      title: 'பகுப்பாய்வு விருப்பங்கள்',
      standard: {
        name: 'நிலையான பகுப்பாய்வு',
        description: 'நுண்ணறை கண்டறிதல், PCOS வடிவம், நம்பிக்கை மதிப்பெண்கள்',
      },
      advanced: {
        name: 'மேம்பட்ட பகுப்பாய்வு',
        badge: 'PRO',
        description: 'ஹார்மோன் நிலை, சுழற்சி முன்னுரை, சிகிச்சை பரிந்துரைகள்',
      },
      startAnalysis: 'AI பகுப்பாய்வு தொடங்கு',
      saveForLater: 'பின்னர் சேமிக்கவும்',
    },
    analyzeButton: 'ஸ்கேனைப் பகுப்பாய்வு செய்யவும்',
    analyzingButton: 'பகுப்பாய்வு செய்கிறது...',
    resultsSection: {
      title: 'பகுப்பாய்வு முடிவுகள்',
      diagnosisLabel: 'நோய்கண்டறிதல்',
      confidenceLabel: 'நம்பிக்கை மதிப்பெண்',
      follicleCountLabel: 'நுண்ணறை எண்ணிக்கை',
      follicleCountNormal: 'சாதாரணம்: 12',
      severityLabel: 'தீவிரத்தன்மை',
      recommendationsTitle: 'பரிந்துரைகள்',
      saveReportButton: 'அறிக்கையைச் சேமிக்கவும்',
      findDoctorsButton: 'மருத்துவர்களைக் கண்டறியவும்',
      uploadNewScan: 'புதிய ஸ்கேன் பதிவேற்று',
    },
    technicalDetails: {
      title: 'AI பகுப்பாய்வு',
      follicleSize: 'நுண்ணறை அளவு:',
      ovarianVolume: 'கருப்பை அளவு:',
    },
    nextSteps: { title: 'அடுத்த படிகள்' },
    reportActions: {
      title: 'அறிக்கை நடவடிக்கைகள்',
      emailReport: '📧 மருத்துவருக்கு அறிக்கை மின்னஞ்சல் செய்யவும்',
      downloadPdf: '📄 PDF அறிக்கையைப் பதிவிறக்கவும்',
    },
    infoCards: [
      {
        icon: 'checkCircle',
        title: 'HIPAA இணக்கம்',
        description: 'உங்கள் மருத்துவ தரவு குறியாக்கம் செய்யப்பட்ட மற்றும் பாதுகாப்பான',
      },
      {
        icon: 'brain',
        title: '98.5% துல்லியம்',
        description: '50,000+ ஆய்வுச் செயல்களுக்கு எதிராக சரிபார்க்கப்பட்ட',
      },
      {
        icon: 'activity',
        title: 'உடனடி முடிவுகள்',
        description: '60 விநாடிக்குள் உங்கள் பகுப்பாய்வைப் பெறுங்கள்',
      },
    ],
    infoSection: {
      title: 'இது எப்படி வேலை செய்கிறது',
      steps: [
        { number: 1, title: 'ஸ்கேனைப் பதிவேற்றவும்', description: 'உங்கள் கருப்பை அல்ட்ராசவுண்ட் படத்தைப் பதிவேற்றவும்' },
        { number: 2, title: 'AI பகுப்பாய்வு', description: 'எங்கள் மாதிரிகள் நுண்ணறைகள் மற்றும் PCOS குறிகளை கண்டறியும்' },
        { number: 3, title: 'முடிவுகளைப் பெறுங்கள்', description: 'விளக்க விளக்கப்பட்ட விரிவான அறிக்கை' },
        { number: 4, title: 'நடவடிக்கை எடுக்கவும்', description: 'நிபுணர்களுடன் இணைந்து வழிகாட்டலைப் பெறுங்கள்' },
      ],
    },
  },

  education: {
    pageTitle: 'PCOS கல்வி மையம்',
    pageSubtitle:
      'PCOS-ஐ புரிந்துகொள்ளவும் நிர்வகிக்கவும் விரிவான வளங்கள். உங்கள் ஆரோக்கிய பயணத்தை வலுப்படுத்த நிபுணர் உள்ளடக்கம்.',
    tabs: [
      { id: 'overview', label: 'PCOS overview', icon: 'BookOpen' },
      { id: 'nutrition', label: 'ஊட்டச்சத்து', icon: 'Apple' },
      { id: 'exercise', label: 'Exercise', icon: 'Dumbbell' },
      { id: 'mental', label: 'Mental Health', icon: 'Heart' },
      { id: 'research', label: 'வலைப்பதிவுகள் & ஆராய்ச்சி', icon: 'Brain' },
    ],
    overview: {
      understandingPcos: 'PCOS-ஐ புரிந்துகொள்ளுதல்',
      introText:
        'Polycystic Ovary Syndrome (PCOS) என்பது இனப்பெருக்க வயதிலுள்ள பெண்களில் 10-ல் 1-க்கு பாதிக்கும் ஹார்மோன் கோளாறு. cysts மட்டுமல்ல — complex metabolic and hormonal condition.',
      keyStatistics: 'முக்கிய புள்ளிவிவரங்கள்:',
      stats: [
        'உலகெங்கிலும் பெண்களில் 6-12% பாதிக்கப்படுகிறார்கள்',
        'பெண்களில் மிகவும் common endocrine disorder',
        'பெண் மலட்டுத்தன்மையின் முக்கிய காரணம்',
        'பெரும்பாலும் கண்டறியப்படாமல் அல்லது தவறாக கண்டறியப்படுகிறது',
      ],
      commonSymptoms: 'பொதுவான அறிகுறிகள்:',
      symptoms: [
        'ஒழுங்கற்ற அல்லது தவறிய மாதவிடாய்',
        'அதிகப்படியான முடி வளர்ச்சி',
        'எடை அதிகரிப்பு அல்லது குறைப்பதில் சிரமம்',
        'முகப்பரு மற்றும் எண்ணெய் சருமம்',
        'முடி மெல்லியதாதல்',
        'Insulin resistance',
        'மனநிலை மாற்றங்கள் மற்றும் depression',
        'Sleep apnea',
      ],
      diagnosisCriteria: 'நோயறிதல் அளவுகோல்கள் (Rotterdam Criteria)',
      diagnosisCriteriaItems: [
        {
          title: 'Ovulatory Dysfunction',
          description: 'ஒ irregular ovulation, irregular periods',
        },
        {
          title: 'Clinical/Biochemical Signs',
          description: 'அதிக androgen levels அல்லது excess hair growth',
        },
        {
          title: 'Polycystic Ovaries',
          description: 'Ultrasound-ல் 12+ follicles அல்லது increased ovarian volume',
        },
      ],
      diagnosisNote:
        'குறிப்பு: PCOS நோயறிதலுக்கு 3-ல் 2 criteria பூர்த்தி செய்யப்பட வேண்டும்; மற்ற நிலைகள் rule out செய்யப்பட வேண்டும்.',
      educationalVideos: 'கல்வி வீடியோக்கள்',
    },
  },

  doctors: {
    pageTitle: 'PCOS நிபுணர்களைக் கண்டறியுங்கள்',
    pageSubtitle: 'சான்றளிக்கப்பட்ட மகளிர் மருத்துவ நிபுணர்கள் மற்றும் பெண்கள் சுகாதார வல்லுநர்களுடன் இணையுங்கள்',
    searchPlaceholder: 'பெயர், இடம் அல்லது சிறப்பு மூலம் தேடுங்கள்...',
    filterButton: 'வடிகட்டி',
    sortButton: 'வரிசைப்படுத்த',
    doctorCard: {
      verified: 'சரிபார்க்கப்பட்டது',
      yearsExperience: 'ஆண்டுகள் அனுபவம்',
      patientsReviews: 'நோயாளி reviews',
      availableToday: 'இன்று கிடைக்கும்',
      nextAvailable: 'அடுத்து கிடைக்கும்',
      consultationFee: 'ஆலோசனை கட்டணம்',
      acceptsInsurance: 'Insurance ஏற்றுக்கொள்கிறது',
      telemedicine: 'வீடியோ ஆலோசனை',
      bookConsultation: 'ஆலோசனை பதிவு செய்',
      viewProfile: 'சுயவிவரத்தைக் காட்டு',
    },
    profile: {
      aboutDoctor: 'பற்றி',
      credentials: 'Credentials',
      languages: 'மொழிகள்',
      officeHours: 'Office Hours',
      specializations: 'Specializations',
      experience: 'ஆண்டுகள் அனுபவம்',
      patients: 'சிகிச்சை அளித்த நோயாளிகள்',
      rating: 'மதிப்பீடு',
      location: 'இடம்',
      specialization: 'நிபுணத்துவம்',
      languagesSpoken: 'பேசும் மொழிகள்',
      initialConsultation: 'ஆரம்ப ஆலோசனை (60 நிமிடங்கள்)',
    },
    noResultsFound: 'உங்கள் criteria-க்கு பொருந்தும் மருத்துவர்கள் இல்லை',
    tryAdjustingFilters: 'உங்கள் தேடல் அல்லது வடிகட்டிகளை மாற்றவும்',
    list: {
      searchByNameOrSpecialty: 'பெயர் அல்லது சிறப்பு மூலம் தேடுங்கள்...',
      locationPlaceholder: 'நகரம், மாநிலம் அல்லது ZIP',
      searchButton: 'தேடு',
      specialistsFound: '{{count}} நிபுணர்கள் கண்டறியப்பட்டனர்',
      moreFilters: 'மேலும் வடிகட்டிகள்',
      clearFilters: 'வடிகட்டிகளை அழி',
      verified: 'சரிபார்க்கப்பட்டது',
      availableToday: 'இன்று கிடைக்கும்',
    },
    specialties: {
      all: 'அனைத்து நிபுணர்கள்',
      gynecology: 'மகளிர் மருத்துவம்',
      endocrinology: 'எண்டோகிரைனாலஜி',
      fertility: 'கருவுறுதல்',
    },
  },

  booking: {
    title: 'உங்கள் ஆலோசனையை பதிவு செய்யுங்கள்',
    subtitle: 'தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுத்து appointment details confirm செய்யுங்கள்.',
    doctorInfo: 'மருத்துவர் தகவல்',
    selectDate: 'தேதியைத் தேர்ந்தெடுக்கவும்',
    selectTime: 'நேரத்தைத் தேர்ந்தெடுக்கவும்',
    patientName: 'முழு பெயர்',
    patientEmail: 'மின்னஞ்சல் முகவரி',
    patientPhone: 'தொலைபேசி எண்',
    reasonLabel: 'வருகை காரணம்',
    reasonPlaceholder: 'உங்கள் அறிகுறிகள் அல்லது ஆலோசனை காரணத்தை describe செய்யுங்கள்...',
    confirmButton: 'Booking confirm செய்யுங்கள்',
    bookingConfirmed: 'Booking confirmed!',
    confirmationMessage:
      'உங்கள் appointment வெற்றிகரமாக பதிவு செய்யப்பட்டது. reference-க்கு booking ID save செய்யுங்கள்.',
    paymentNote: 'கட்டணம் clinic-ல் வசூலிக்கப்படும். 10 நிமிடங்கள் முன் வரவும்.',
    bookingId: 'Booking ID',
    errorSlotTaken: 'இந்த time slot ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. வேறு slot தேர்ந்தெடுக்கவும்.',
    errorGeneric: 'ஏதோ தவறாகிவிட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
  },
}
