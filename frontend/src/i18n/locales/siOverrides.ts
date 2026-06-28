import type { TranslationResource } from '../types'

export const siOverrides: Partial<TranslationResource> = {
  navbar: {
    home: 'මුල් පිටුව',
    aiScan: 'AI ස්කෑන්',
    education: 'අධ්‍යාපනය',
    doctors: 'වෛද්‍යවරු',
    language: 'භාෂාව',
    languageSelect: 'භාෂාව තෝරන්න',
    startScan: 'AI ස්කෑන් ආරම්භ කරන්න',
    mobileLanguageLabel: 'Language / භාෂාව / மொழி',
  },

  footer: {
    description: 'වඩා හොඳ කාන්තා සෞඛ්‍ය ප්‍රතිඵල සඳහා උසස් AI-බලයෙන් යුත් PCOS හඳුනාගැනීම.',
    quickLinks: 'ක්ෂණික සබැඳි',
    contact: 'සම්බන්ධතා',
    followUs: 'අපව අනුගමනය කරන්න',
    allRightsReserved: 'සියලුම හිමිකම් ඇවිරිණි.',
    privacyPolicy: 'පුද්ගලිකත්ව ප්‍රතිපත්තිය',
    termsOfService: 'සේවා කොන්දේසි',
    contactEmail: 'info@ovacare.com',
    supportPage: 'සහාය',
    aboutUs: 'අප ගැන',
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
    loading: 'පූරණය වෙමින්...',
    error: 'මොකක්හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.',
    success: 'සාර්ථකයි!',
    close: 'වසන්න',
    save: 'සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    back: 'ආපසු',
    next: 'ඊළඟ',
    previous: 'පෙර',
    learnMore: 'වැඩිදුර ඉගෙනගන්න',
    tryNow: 'දැන් උත්සාහ කරන්න →',
    getStarted: 'ආරම්භ කරන්න',
    download: 'බාගන්න',
    upload: 'උඩුගත කරන්න',
    search: 'සොයන්න',
    filter: 'පෙරහන',
    sort: 'වර්ගීකරණය',
  },

  home: {
    hero: {
      badge: '✨ AI-බලයෙන් PCOS හඳුනාගැනීම',
      badgeRich: '<0>✨ AI-බලයෙන්</0> PCOS හඳුනාගැනීම',
      title: 'ඔබගේ',
      titleHighlight: 'ප්‍රජනන සෞඛ්‍යය පාලනය කරගන්න',
      subtitle:
        'ඔබගේ අල්ට්‍රාසවුන්ඩ් ස්කෑන් උඩුගත කර PCOS සඳහා ක්ෂණික AI විශ්ලේෂණය ලබාගන්න. පැහැදිලි insight, පුද්ගලික නිර්දේශ සහ විශේෂඥයින් සමඟ සම්බන්ධ වන්න.',
      primaryButton: 'නිදහස් විශ්ලේෂණය ආරම්භ කරන්න',
      secondaryButton: 'වැඩිදුර ඉගෙනගන්න',
      demoCardStatus: 'AI විශ්ලේෂණය සිදුවෙමින්',
      demoCardProgress: '94% සම්පූර්ණයි',
      demoCardDetected: 'PCOS හඳුනාගැනිණි',
      demoCardConfidence: '94% විශ්වාසය',
      demoCardFollicles: 'පෝෂක',
      demoCardOvaryVolume: 'ඩිම්බකෝෂ පරිමාණය',
      demoCardSeverity: 'තීව්‍රතාව',
      demoCardSeverityValue: 'මධ්‍යස්ථ',
      accuracy: '94% හඳුනාගැනීමේ නිරවද්‍යතාව',
      trusted: 'වෛද්‍යවරු 200+ විසින් විශ්වාසදායක',
    },
    stats: [
      { value: '94%', label: 'නිරවද්‍යතා අනුපාතය' },
      { value: '2 min', label: 'විශ්ලේෂණ කාලය' },
      { value: '12K+', label: 'විශ්ලේෂණය කළ ස්කෑන්' },
      { value: '200+', label: 'ප්‍රවීණ වෛද්‍යවරු' },
    ],
    features: [
      {
        icon: '🤖',
        title: 'AI-බලයෙන් විශ්ලේෂණ',
        description:
          'ගැඹුරු ඉගෙනීමේ ආකෘති 94% නිරවද්‍යතාවයකින් PCOS සලකුණු සඳහා අල්ට්‍රාසවුන්ඩ් රූප විශ්ලේෂණය කරයි.',
      },
      {
        icon: '📊',
        title: 'දෘශ්‍ය වාර්තා',
        description:
          'පෝෂක දෘශ්‍යකරණය සහ තේරුම් ගත හැකි පැහැදිලි කිරීම් සහිත අන්තර්ක්‍රියාකාරී වාර්තා.',
      },
      {
        icon: '🎓',
        title: 'අධ්‍යාපනික මධ්‍යස්ථානය',
        description:
          'PCOS රෝග ලක්ෂණ, ප්‍රතිකාර සහ ජීවන රටා කළමනාකරණය පිළිබඳ සම්පූර්ණ මගපෙන්වීම්.',
      },
      {
        icon: '👩‍⚕️',
        title: 'වෛද්‍ය ජාලය',
        description:
          'ඔබගේ ප්‍රදේශයේ සත්‍යාපනය කළ නාරීරෝග සහ අන්තඃස්‍රාවී විශේෂඥයින් සමඟ සම්බන්ධ වන්න.',
      },
    ],
    featuresSection: {
      sectionTitle: 'OvaCare තෝරන්නේ ඇයි',
      sectionTitleRich: '<1>OvaCare</1> තෝරන්නේ ඇයි',
      sectionSubtitle: 'අපගේ උසස් වේදිකාව සමඟ PCOS හඳුනාගැනීමේ අනාගතය අත්විඳින්න',
      tryNow: 'දැන් උත්සාහ කරන්න →',
    },
    processSection: {
      title: 'එය ක්‍රියා කරන ආකාරය',
      titleRich: 'එය <1>ක්‍රියා කරන</1> ආකාරය',
      subtitle: 'ඔබගේ PCOS විශ්ලේෂණය ලබාගැනීමට සරල පියවර',
      steps: [
        {
          number: '01',
          title: 'ස්කෑන් උඩුගත කරන්න',
          description: 'ඔබගේ ඩිම්බකෝෂ අල්ට්‍රාසවුන්ඩ් රූපය ආරක්ෂිතව උඩුගත කරන්න',
          icon: '📤',
        },
        {
          number: '02',
          title: 'AI විශ්ලේෂණ',
          description: 'අපගේ AI පෝෂක විශ්ලේෂණය කර PCOS සලකුණු හඳුනාගනී',
          icon: '🤖',
        },
        {
          number: '03',
          title: 'ප්‍රතිඵල ලබාගන්න',
          description: 'දෘශ්‍ය පැහැදිලි කිරීම් සහිත සවිස්තර වාර්තාව ලබාගන්න',
          icon: '📊',
        },
        {
          number: '04',
          title: 'ක්‍රියා ගන්න',
          description: 'විශේෂඥයින් සමඟ සම්බන්ධ වී මාර්ගෝපදේශනය ලබාගන්න',
          icon: '👩‍⚕️',
        },
      ],
    },
    ctaSection: {
      title: 'ඔබගේ සෞඛ්‍යය පාලනය කරගැනීමට සූදානම්ද?',
      subtitle:
        'තම PCOS තත්වය early හඳුනාගෙන ක්‍රියා කළ දහස් ගණනක් කාන්තාවන් සමඟ එක්වන්න.',
      primaryButton: 'නිදහස් විශ්ලේෂණය ආරම්භ කරන්න',
      secondaryButton: 'විශේෂඥයින් සොයන්න',
    },
    compliance: {
      hipaa: 'HIPAA අනුකූල',
      fda: 'FDA ලියාපදිංචි',
      encryption: '256-bit සංකේතනය',
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
    pageTitle: 'විශ්ලේෂණ ස්කෑන්',
    pageSubtitle: 'ඔබගේ ඩිම්බකෝෂ අල්ට්‍රාසවුන්ඩ් ස්කෑන් AI විශ්ලේෂණය සඳහා උඩුගත කරන්න',
    uploadSection: {
      uploadIcon: '📤',
      uploadTitle: 'අල්ට්‍රාසවුන්ඩ් රූපය උඩුගත කරන්න',
      uploadInstruction: 'ඇද දමන්න හෝ උඩුගත කිරීමට ක්ලික් කරන්න',
      dragInstruction: 'ඔබගේ රූපය මෙතන ඇද දමන්න, නැතහොත් බ්‍රවුස් කිරීමට ක්ලික් කරන්න',
      supportedFormats: 'සහාය: JPG, PNG, DICOM',
      previewLabel: 'රූප පෙරදසුන',
      supportedFileTypes: ['JPG', 'PNG', 'DICOM', 'TIFF'],
    },
    analysisOptions: {
      title: 'විශ්ලේෂණ විකල්ප',
      standard: {
        name: 'ප්‍රමිති විශ්ලේෂණ',
        description: 'පෝෂක හඳුනාගැනීම, PCOS රටාව, විශ්වාස ලකුණු',
      },
      advanced: {
        name: 'උසස් විශ්ලේෂණ',
        badge: 'PRO',
        description: 'හෝමෝන මට්ටම්, චක්‍ර පුරෝකථන, ප්‍රතිකාර නිර්දේශ',
      },
      startAnalysis: 'AI විශ්ලේෂණ ආරම්භ කරන්න',
      saveForLater: 'පසුව සුරකින්න',
    },
    analyzeButton: 'ස්කෑන් විශ්ලේෂණ කරන්න',
    analyzingButton: 'විශ්ලේෂණ කරමින්...',
    resultsSection: {
      title: 'විශ්ලේෂණ ප්‍රතිඵල',
      diagnosisLabel: 'රෝගනිර්ණය',
      confidenceLabel: 'විශ්වාස ලකුණු',
      follicleCountLabel: 'පෝෂක ගණන',
      follicleCountNormal: 'සාමාන්‍ය: 12',
      severityLabel: 'තීව්‍රතාව',
      recommendationsTitle: 'නිර්දේශ',
      saveReportButton: 'වාර්තාව සුරකින්න',
      findDoctorsButton: 'වෛද්‍යවරු සොයන්න',
      uploadNewScan: 'නව ස්කෑන් උඩුගත කරන්න',
    },
    technicalDetails: {
      title: 'AI විශ්ලේෂණ',
      follicleSize: 'පෝෂක ප්‍රමාණය:',
      ovarianVolume: 'ඩිම්බකෝෂ පරිමාණය:',
    },
    nextSteps: { title: 'ඊළඟ පියවර' },
    reportActions: {
      title: 'වාර්තා ක්‍රියා',
      emailReport: '📧 වෛද්‍යවරුට වාර්තාව ඊමේල් කරන්න',
      downloadPdf: '📄 PDF වාර්තාව බාගන්න',
    },
    infoCards: [
      {
        icon: 'checkCircle',
        title: 'HIPAA අනුකූල',
        description: 'ඔබගේ වෛද්‍ය දත්ත සංකේතනය සහ සුරක්ෂිතයි',
      },
      {
        icon: 'brain',
        title: '98.5% නිරවද්‍යතාව',
        description: '50,000+ සක්‍රීයකරණ සිද්ධි අනුව වලංගු කරන ලද',
      },
      {
        icon: 'activity',
        title: 'ක්ෂණික ප්‍රතිඵල',
        description: '60 තත්පර ඇතුළත ඔබගේ විශ්ලේෂණය ලබාගන්න',
      },
    ],
    infoSection: {
      title: 'එය ක්‍රියා කරන ආකාරය',
      steps: [
        { number: 1, title: 'ස්කෑන් උඩුගත කරන්න', description: 'ඔබගේ ඩිම්බකෝෂ අල්ට්‍රාසවුන්ඩ් රූපය උඩුගත කරන්න' },
        { number: 2, title: 'AI විශ්ලේෂණ', description: 'අපගේ ආකෘතිය පෝෂක සහ PCOS සලකුණු හඳුනාගනී' },
        { number: 3, title: 'ප්‍රතිඵල ලබාගන්න', description: 'දෘශ්‍ය පැහැදිලි කිරීම් සහිත සවිස්තර වාර්තා' },
        { number: 4, title: 'ක්‍රියා ගන්න', description: 'විශේෂඥයින් සමඟ සම්බන්ධ වී මාර්ගෝපදේශනය ලබාගන්න' },
      ],
    },
  },

  education: {
    pageTitle: 'PCOS අධ්‍යාපන මධ්‍යස්ථානය',
    pageSubtitle:
      'PCOS තේරුම් ගැනීමට සහ කළමනාකරණය කිරීමට සම්පූර්ණ සම්පත්. ඔබගේ සෞඛ්‍ය ගමන බලගැන්වීමට විශේෂඥ අන්තර්ගතය.',
    tabs: [
      { id: 'overview', label: 'PCOS overview', icon: 'BookOpen' },
      { id: 'nutrition', label: 'පෝෂණ', icon: 'Apple' },
      { id: 'exercise', label: 'ව්‍යායාම', icon: 'Dumbbell' },
      { id: 'mental', label: 'මානසික සෞඛ්‍ය', icon: 'Heart' },
      { id: 'research', label: 'බ්ලොග් සහ පර්යේෂණ', icon: 'Brain' },
    ],
    overview: {
      understandingPcos: 'PCOS තේරුම් ගැනීම',
      introText:
        'Polycystic Ovary Syndrome (PCOS) යනු ප්‍රජනන වයසේ කාන්තාවන් 10කට 1කට බලපාන හෝමෝන ආබාධයකි. නම not just cysts — complex metabolic and hormonal condition.',
      keyStatistics: 'ප්‍රධාන සංඛ්‍යාලේඛන:',
      stats: [
        'ලොව පුරා කාන්තාවන්ගේ 6-12% කට බලපායි',
        'කාන්තාවන්ගේ වඩාත්ම common endocrine disorder',
        'කාන්තා බැඳුම්කරයේ ප්‍රධාන හේතුව',
        'බොහෝ විට නොහඳුනාගෙන හෝ වැරදි ලෙස හඳුනාගනී',
      ],
      commonSymptoms: 'සාමාන්‍ය රෝග ලක්ෂණ:',
      symptoms: [
        'අක්‍රමවත් හෝ මග හැරුණු ආර්තව',
        'අධික හිසකෙස් වර්ධනය (hirsutism)',
        'බර වැඩිවීම හෝ බර අඩු කිරීමේ අපහසුතාව',
        'කුරුලෑ සහ තෙල් සම',
        'හිසකෙස් සිහින් වීම',
        'ඉන්සුලින් ප්‍රතිරෝධය',
        'මනෝභාව වෙනස්කම් සහ depression',
        'Sleep apnea',
      ],
      diagnosisCriteria: 'රෝගනිර්ණය මිනුම් (Rotterdam Criteria)',
      diagnosisCriteriaItems: [
        {
          title: 'Ovulatory Dysfunction',
          description: 'අක්‍රමවත් ovulation, අක්‍රමවත් periods',
        },
        {
          title: 'Clinical/Biochemical Signs',
          description: 'ඉහළ androgen levels හෝ excess hair growth',
        },
        {
          title: 'Polycystic Ovaries',
          description: 'Ultrasound හි follicles 12+ හෝ increased ovarian volume',
        },
      ],
      diagnosisNote:
        'සටහන: PCOS රෝගනිර්ණය සඳහා 3කින් 2ක් තිරිසු විය යුතු අතර අනෙකුත් තත්ව rule out කළ යුතුය.',
      educationalVideos: 'අධ්‍යාපනික වීඩියෝ',
    },
  },

  doctors: {
    pageTitle: 'PCOS විශේෂඥයින් සොයන්න',
    pageSubtitle: 'සහතික කළ නාරීරෝග විශේෂඥයින් සහ කාන්තා සෞඛ්‍ය ප්‍රවීණයින් සමඟ සම්බන්ධ වන්න',
    searchPlaceholder: 'නම, ස්ථානය හෝ විශේෂඥතාව අනුව සොයන්න...',
    filterButton: 'පෙරහන',
    sortButton: 'වර්ගීකරණය',
    doctorCard: {
      verified: 'සත්‍යාපිත',
      yearsExperience: 'අවුරුදු අත්දැකීම්',
      patientsReviews: 'රෝගීන්ගේ reviews',
      availableToday: 'අද ලබාගත හැක',
      nextAvailable: 'ඊළඟ ලබාගත හැකි දිනය',
      consultationFee: 'උපදේශන ගාස්තුව',
      acceptsInsurance: 'රක්ෂණය පිළිගනී',
      telemedicine: 'වීඩියෝ උපදේශන',
      bookConsultation: 'උපදේශනය වෙන්කරවාගන්න',
      viewProfile: 'පැතිකඩ බලන්න',
    },
    profile: {
      aboutDoctor: 'ගැන',
      credentials: 'සුදුසුකම්',
      languages: 'භාෂා',
      officeHours: 'කාර්යාල වේලාව',
      specializations: 'විශේෂizations',
      experience: 'අවුරුදු අත්දැකීම්',
      patients: 'ප්‍රතිකාර කළ රෝගීන්',
      rating: 'ශ්‍රේණිගත කිරීම',
      location: 'ස්ථානය',
      specialization: 'විශේෂඥතාව',
      languagesSpoken: 'කතා කරන භාෂා',
      initialConsultation: 'ආරම්භක උපදේශනය (මිනිත්තු 60)',
    },
    noResultsFound: 'ඔබගේ criteria වලට ගැලපෙන වෛද්‍යවරු නැත',
    tryAdjustingFilters: 'ඔබගේ සෙවුම හෝ පෙරහන් වෙනස් කරන්න',
    list: {
      searchByNameOrSpecialty: 'නම හෝ විශේෂඥතාව අනුව සොයන්න...',
      locationPlaceholder: 'නගරය, පළාත හෝ ZIP',
      searchButton: 'සොයන්න',
      specialistsFound: 'විශේෂඥයින් {{count}} ක් හමු විය',
      moreFilters: 'තවත් පෙරහන්',
      clearFilters: 'පෙරහන් ඉවත් කරන්න',
      verified: 'සත්‍යාපිත',
      availableToday: 'අද ලබාගත හැක',
    },
    specialties: {
      all: 'සියලුම විශේෂඥයින්',
      gynecology: 'නාරීරෝග',
      endocrinology: 'අන්තඃස්‍රාවී',
      fertility: 'බැඳුම්කර',
    },
  },

  booking: {
    title: 'ඔබගේ උපදේශනය වෙන්කරවාගන්න',
    subtitle: 'දිනයක් සහ වේලාවක් තෝරා, appointment details confirm කරන්න.',
    doctorInfo: 'වෛද්‍ය තොරතුරු',
    selectDate: 'දිනය තෝරන්න',
    selectTime: 'වේලාව තෝරන්න',
    patientName: 'සම්පූර්ණ නම',
    patientEmail: 'ඊමේල් ලිපිනය',
    patientPhone: 'දුරකථන අංකය',
    reasonLabel: 'පැමිණීමේ හේතුව',
    reasonPlaceholder: 'ඔබගේ රෝග ලක්ෂණ හෝ උපදේශන හේතුව describe කරන්න...',
    confirmButton: 'වෙන්කිරීම confirm කරන්න',
    bookingConfirmed: 'වෙන්කිරීම confirmed!',
    confirmationMessage:
      'ඔබගේ appointment සාර්ථකව වෙන්කරන ලදී. reference සඳහා booking ID save කරගන්න.',
    paymentNote: 'ගෙවීම clinic හිදී. කරුණාකර විනාඩි 10කට පෙර ළඟා වන්න.',
    bookingId: 'Booking ID',
    errorSlotTaken: 'මෙම time slot දැනටමත් වෙන්කර ඇත. වෙනත් slot තෝරන්න.',
    errorGeneric: 'මොකක්හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.',
  },
}
