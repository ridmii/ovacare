import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations inline to avoid import issues
const resources = {
  en: {
    translation: {
      navbar: {
        home: "Home",
        aiScan: "AI Scan",
        education: "Education",
        doctors: "Doctors"
      },
      hero: {
        badge: "✨ Revolutionizing Women's Health",
        title: "AI-Powered",
        subtitle: "PCOS Detection",
        description: "Advanced ultrasound analysis powered by artificial intelligence. Get accurate PCOS detection results in minutes, not months.",
        startScan: "Start AI Scan",
        learnMore: "Learn More",
        accuracy: "98.4% Accuracy",
        trusted: "Trusted by 500+ Doctors"
      },
      stats: {
        scansCompleted: "Scans Completed",
        accuracy: "AI Accuracy",
        doctorsUsingPlatform: "Doctors Using Platform"
      },
      features: {
        title: "Advanced AI Healthcare",
        subtitle: "Powered by cutting-edge technology",
        upload: {
          title: "Smart Image Analysis",
          description: "Upload ultrasound images for instant AI-powered PCOS detection with medical-grade accuracy."
        },
        ai: {
          title: "Deep Learning Models", 
          description: "Our EfficientNetB4-based CNN analyzes ovarian follicles with 98.4% accuracy rate."
        },
        report: {
          title: "Comprehensive Reports",
          description: "Get detailed analysis reports with follicle count, severity assessment, and treatment recommendations."
        },
        doctors: {
          title: "Expert Consultation",
          description: "Connect with certified gynecologists for professional consultation and treatment planning."
        }
      },
      howItWorks: {
        title: "How OvaCare Works",
        subtitle: "Simple 3-step process for accurate PCOS detection",
        step1: {
          title: "Upload Ultrasound",
          description: "Upload your ultrasound image securely to our HIPAA-compliant platform"
        },
        step2: {
          title: "AI Analysis", 
          description: "Our deep learning model analyzes the image for PCOS indicators in seconds"
        },
        step3: {
          title: "Get Results",
          description: "Receive detailed analysis with confidence scores and recommendations"
        }
      },
      testimonials: {
        title: "Trusted by Healthcare Professionals",
        subtitle: "See what doctors are saying about OvaCare",
        testimonial1: {
          text: "OvaCare has transformed how I diagnose PCOS. The AI accuracy is remarkable and saves valuable time.",
          author: "Dr. Priyanka Silva",
          position: "Gynecologist, Colombo General Hospital" 
        },
        testimonial2: {
          text: "The detailed reports help me explain conditions to patients more effectively. Excellent tool!",
          author: "Dr. Ragini Sharma", 
          position: "Women's Health Specialist, Teaching Hospital Kandy"
        },
        testimonial3: {
          text: "Fast, accurate, and easy to use. OvaCare is now an essential part of our diagnostic toolkit.",
          author: "Dr. Amara Fernando",
          position: "Senior Consultant, Private Healthcare"
        }
      },
      scan: {
        title: "AI-Powered PCOS Detection",
        subtitle: "Upload your ultrasound scan for instant analysis",
        uploadArea: {
          title: "Drop your ultrasound image here",
          subtitle: "or click to browse files",
          formats: "Supports: JPG, PNG, DICOM files up to 10MB",
          dragText: "Drop your file here"
        },
        analyzing: "Analyzing your scan...",
        analysisComplete: "Analysis Complete!",
        results: {
          diagnosis: "Diagnosis",
          confidence: "Confidence Level",
          follicleCount: "Follicle Count",
          severity: "Severity",
          recommendations: "Recommendations"
        },
        newScan: "Upload New Scan",
        downloadReport: "Download Report"
      },
      education: {
        title: "PCOS Education Center",
        subtitle: "Learn everything about Polycystic Ovary Syndrome",
        whatIs: {
          title: "What is PCOS?",
          content: "Polycystic Ovary Syndrome (PCOS) is a hormonal disorder affecting women of reproductive age. It's characterized by irregular menstrual periods, excess androgen levels, and polycystic ovaries."
        },
        symptoms: {
          title: "Common Symptoms",
          list: [
            "Irregular or missed periods",
            "Excess hair growth (hirsutism)", 
            "Acne and oily skin",
            "Weight gain or difficulty losing weight",
            "Thinning hair or male-pattern baldness",
            "Skin darkening (acanthosis nigricans)"
          ]
        },
        diagnosis: {
          title: "Diagnosis Methods",
          content: "PCOS diagnosis typically involves physical examination, blood tests to check hormone levels, and ultrasound imaging to examine the ovaries. Our AI system helps accelerate the ultrasound analysis process."
        },
        treatment: {
          title: "Treatment Options", 
          content: "Treatment focuses on managing symptoms and may include lifestyle changes, medication for irregular periods, fertility treatments, and management of associated conditions like diabetes."
        }
      },
      doctors: {
        title: "Find PCOS Specialists",
        subtitle: "Connect with certified gynecologists and women's health experts",
        searchPlaceholder: "Search by name, location, or specialty...",
        bookConsultation: "Book Consultation",
        viewProfile: "View Profile", 
        experience: "Years Experience",
        patients: "Patients Treated",
        rating: "Rating",
        location: "Location",
        specialization: "Specialization",
        languages: "Languages Spoken"
      },
      footer: {
        description: "Advanced AI-powered PCOS detection for better women's healthcare outcomes.",
        quickLinks: "Quick Links", 
        contact: "Contact",
        followUs: "Follow Us",
        allRightsReserved: "All rights reserved.",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service"
      },
      common: {
        loading: "Loading...",
        error: "Something went wrong. Please try again.",
        success: "Success!",
        close: "Close",
        save: "Save",
        cancel: "Cancel",
        back: "Back",
        next: "Next",
        previous: "Previous"
      }
    }
  },
  si: {
    translation: {
      navbar: {
        home: "මුල් පිටුව",
        aiScan: "AI ස්කෑන්",
        education: "අධ්‍යාපනය", 
        doctors: "වෛද්‍යවරු"
      },
      hero: {
        badge: "✨ කාන්තා සෞඛ්‍යයේ විප්ලවය",
        title: "AI-බලයෙන්",
        subtitle: "PCOS හඳුනාගැනීම",
        description: "කෘත්‍රිම බුද්ධිමත්තාවෙන් බලගන්වන උසස් අල්ට්‍රාසවුන්ඩ් විශ්ලේෂණය. මාස ගණනක් නොව මිනිත්තු කිහිපයකින් නිරවද්‍ය PCOS හඳුනාගැනීමේ ප්‍රතිඵල ලබාගන්න.",
        startScan: "AI ස්කෑන් ආරම්භ කරන්න",
        learnMore: "වැඩි විස්තර",
        accuracy: "98.4% නිරවද්‍යතාව",
        trusted: "වෛද්‍යවරු 500+ විසින් විශ්වාසදායක"
      },
      stats: {
        scansCompleted: "සම්පූර්ණ කළ ස්කෑන්",
        accuracy: "AI නිරවද්‍යතාව",
        doctorsUsingPlatform: "වේදිකාව භාවිතා කරන වෛද්‍යවරු"
      },
      features: {
        title: "උසස් AI සෞඛ්‍ය සේවා",
        subtitle: "අති නවීන තාක්‍ෂණයෙන් බලගන්වයි",
        upload: {
          title: "බුද්ධිමත් රූප විශ්ලේෂණය",
          description: "වෛද්‍ය ශ්‍රේණියේ නිරවද්‍යතාවයකින් ක්ෂණික AI-බලයෙන් යුත් PCOS හඳුනාගැනීම සඳහා අල්ට්‍රාසවුන්ඩ් රූප උඩුගත කරන්න."
        },
        ai: {
          title: "ගැඹුරු ඉගෙනීමේ ආකෘති",
          description: "අපගේ EfficientNetB4-පාදක CNN 98.4% නිරවද්‍යතා අනුපාතයකින් ඩිම්බකෝෂ පෝෂක විශ්ලේෂණය කරයි."
        },
        report: {
          title: "සවිස්තර වාර්තා",
          description: "පෝෂක ගණන, තීව්‍රතා තක්සේරුව සහ ප්‍රතිකාර නිර්දේශ සමඟ සවිස්තර විශ්ලේෂණ වාර්තා ලබාගන්න."
        },
        doctors: {
          title: "ප්‍රවීණ උපදේශනය",
          description: "වෘත්තීය උපදේශනය සහ ප්‍රතිකාර සැලසුම් කිරීම සඳහා සහතික කළ නාරීරෝග විශේෂඥයින් සමඟ සම්බන්ධ වන්න."
        }
      },
      howItWorks: {
        title: "OvaCare ක්‍රියා කරන ආකාරය",
        subtitle: "නිරවද්‍ය PCOS හඳුනාගැනීම සඳහා සරල පියවර 3 ක ක්‍රියාවලිය",
        step1: {
          title: "අල්ට්‍රාසවුන්ඩ් උඩුගත කරන්න",
          description: "ඔබගේ අල්ට්‍රාසවුන්ඩ් රූපය අපගේ HIPAA-අනුකූල වේදිකාවට ආරක්ෂිතව උඩුගත කරන්න"
        },
        step2: {
          title: "AI විශ්ලේෂණය",
          description: "අපගේ ගැඹුරු ඉගෙනීමේ ආකෘතිය තත්පර කිහිපයකින් PCOS සලකුණු සඳහා රූපය විශ්ලේෂණය කරයි"
        },
        step3: {
          title: "ප්‍රතිඵල ලබාගන්න",
          description: "විශ්වාස ලකුණු සහ නිර්දේශ සමඟ සවිස්තර විශ්ලේෂණයක් ලබාගන්න"
        }
      },
      testimonials: {
        title: "සෞඛ්‍ය සේවා වෘත්තිකයින් විසින් විශ්වාසදායක",
        subtitle: "OvaCare ගැන වෛද්‍යවරු පවසන්නේ කුමක්ද? බලන්න",
        testimonial1: {
          text: "OvaCare මම PCOS රෝගනිර්ණය කරන ආකාරය පරිවර්තනය කර ඇත. AI නිරවද්‍යතාව කැපී පෙනෙන අතර වටිනා කාලය ඉතිරි කරයි.",
          author: "ආචාර්ය ප්‍රියංකා සිල්වා",
          position: "නාරීරෝග විශේෂඥ, කොළඹ මහ රෝහල"
        },
        testimonial2: {
          text: "සවිස්තර වාර්තා රෝගීන්ට තත්වයන් වඩාත් ඵලදායී ලෙස පැහැදිලි කිරීමට මට උපකාරී වේ. විශිෂ්ට මෙවලමක්!",
          author: "ආචාර්ය රාගිනී ශර්මා",
          position: "කාන්තා සෞඛ්‍ය විශේෂඥ, කැන්ඩි ශික්ෂණ රෝහල"
        },
        testimonial3: {
          text: "වේගවත්, නිරවද්‍ය සහ භාවිතයට පහසුයි. OvaCare දැන් අපගේ රෝගනිර්ණය මෙවලම් කට්ටලයේ අත්‍යවශ්‍ය කොටසකි.",
          author: "ආචාර්ය අමර ප්‍රනාන්දු",
          position: "ජ්‍යෙෂ්ඨ උපදේශක, පෞද්ගලික සෞඛ්‍ය සේවා"
        }
      },
      scan: {
        title: "AI-බලයෙන් යුත් PCOS හඳුනාගැනීම",
        subtitle: "ක්ෂණික විශ්ලේෂණය සඳහා ඔබගේ අල්ට්‍රාසවුන්ඩ් ස්කෑන් උඩුගත කරන්න",
        uploadArea: {
          title: "ඔබගේ අල්ට්‍රාසවුන්ඩ් රූපය මෙතන දාන්න",
          subtitle: "නැතහොත් ගොනු බ්‍රවුස් කිරීමට ක්ලික් කරන්න",
          formats: "සහාය: JPG, PNG, DICOM ගොනු 10MB දක්වා",
          dragText: "ඔබගේ ගොනුව මෙතන දාන්න"
        },
        analyzing: "ඔබගේ ස්කෑන් විශ්ලේෂණය කරමින්...",
        analysisComplete: "විශ්ලේෂණය සම්පූර්ණයි!",
        results: {
          diagnosis: "රෝගනිර්ණය",
          confidence: "විශ්වාස මට්ටම",
          follicleCount: "පෝෂක ගණන",
          severity: "තීව්‍රතාව",
          recommendations: "නිර්දේශ"
        },
        newScan: "නව ස්කෑන් උඩුගත කරන්න",
        downloadReport: "වාර්තාව බාගන්න"
      },
      education: {
        title: "PCOS අධ්‍යාපන මධ්‍යස්ථානය",
        subtitle: "බහුකෝශිය ඩිම්බකෝෂ සින්ඩ්‍රෝමය ගැන සියල්ල ඉගෙනගන්න",
        whatIs: {
          title: "PCOS කුමක්ද?",
          content: "බහුකෝශිකා ඩිම්බකෝෂ සින්ඩ්‍රෝමය (PCOS) යනු ප්‍රජනන වයසේ කාන්තාවන්ට බලපාන හෝමෝන ආබාධයකි. එය අක්‍රමවත් ඔසප් ආර්තව, අධික ඇන්ඩ්‍රොජන් මට්ටම් සහ බහුකෝශිකා ඩිම්බකෝෂ වලින් සංලක්ෂිතයි."
        },
        symptoms: {
          title: "සාමාන්‍ය රෝග ලක්ෂණ",
          list: [
            "අක්‍රමවත් හෝ මග හැරුණු ආර්තව",
            "අධික හිසකෙස් වර්ධනය (කම්මුල්)",
            "කුරුලෑ සහ තෙල් සම",
            "බර වැඩිවීම හෝ බර අඩු කිරීමේ අපහසුතාව",
            "හිසකෙස් සිහින් වීම හෝ පුරුෂ ආකාරයේ තට්ටුව",
            "සම අඳුරු වීම"
          ]
        },
        diagnosis: {
          title: "රෝගනිර්ණය ක්‍රම",
          content: "PCOS රෝගනිර්ණයට සාමාන්‍යයෙන් ශාරීරික පරීක්‍ෂණය, හෝමෝන මට්ටම් පරීක්‍ෂා කිරීමට රුධිර පරීක්ෂණ සහ ඩිම්බකෝෂ පරීක්‍ෂා කිරීමට අල්ට්‍රාසවුන්ඩ් ප්‍රතිරූපණය ඇතුළත් වේ."
        },
        treatment: {
          title: "ප්‍රතිකාර විකල්ප",
          content: "ප්‍රතිකාරය රෝග ලක්ෂණ කළමනාකරණය කෙරෙහි අවධානය යොමු කරන අතර ජීවන රටාවේ වෙනස්කම්, ඖෂධ සහ සම්බන්ධිත කළමනාකරණය ඇතුළත් විය හැකිය."
        }
      },
      doctors: {
        title: "PCOS විශේෂඥයින් සොයන්න",
        subtitle: "සහතික කළ නාරීරෝග විශේෂඥයින් සහ කාන්තා සෞඛ්‍ය ප්‍රවීණයින් සමඟ සම්බන්ධ වන්න",
        searchPlaceholder: "නම, ස්ථානය හෝ විශේෂඥතාව අනුව සොයන්න...",
        bookConsultation: "උපදේශනය වෙන්කරවාගන්න",
        viewProfile: "පැතිකඩ බලන්න",
        experience: "අවුරුදු අත්දැකීම්",
        patients: "ප්‍රතිකාර කළ රෝගීන්",
        rating: "ශ්‍රේණිගත කිරීම",
        location: "ස්ථානය",
        specialization: "විශේෂඥයන්",
        languages: "කතා කරන භාෂා"
      },
      footer: {
        description: "වඩා හොඳ කාන්තා සෞඛ්‍ය ප්‍රතිඵල සඳහා උසස් AI-බලයෙන් යුත් PCOS හඳුනාගැනීම.",
        quickLinks: "ක්ෂණික සබැඳි",
        contact: "සම්බන්ධතා",
        followUs: "අපව අනුගමනය කරන්න",
        allRightsReserved: "සියලුම හිමිකම් ඇවිරිණි.",
        privacyPolicy: "පුද්ගලිකත්ව ප්‍රතිපත්තිය",
        termsOfService: "සේවා කොන්දේසි"
      },
      common: {
        loading: "පූරණය වෙමින්...",
        error: "මොකක්හරි වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.",
        success: "සාර්ථකයි!",
        close: "වසන්න",
        save: "සුරකින්න",
        cancel: "අවලංගු කරන්න",
        back: "ආපසු",
        next: "ඊළඟ",
        previous: "පෙර"
      }
    }
  },
  ta: {
    translation: {
      navbar: {
        home: "முகப்பு",
        aiScan: "AI ஸ்கேன்",
        education: "கல்வி",
        doctors: "மருத்துவர்கள்"
      },
      hero: {
        badge: "✨ பெண்கள் ஆரோக்கியத்தில் புரட்சி",
        title: "AI-ஆல் இயக்கப்படும்",
        subtitle: "PCOS கண்டறிதல்",
        description: "செயற்கை நுண்ணறிவால் இயக்கப்படும் மேம்பட்ட அல்ட்ராசவுண்ட் பகுப்பாய்வு. மாதங்களில் அல்ல, நிமிடங்களில் துல்லியமான PCOS கண்டறிதல் முடிவுகளைப் பெறுங்கள்.",
        startScan: "AI ஸ்கேன் தொடங்கு",
        learnMore: "மேலும் அறிக",
        accuracy: "98.4% துல்லியம்",
        trusted: "500+ மருத்துவர்களால் நம்பப்படுகிறது"
      },
      stats: {
        scansCompleted: "முடிக்கப்பட்ட ஸ்கேன்கள்",
        accuracy: "AI துல்லியம்",
        doctorsUsingPlatform: "தளத்தைப் பயன்படுத்தும் மருத்துவர்கள்"
      },
      features: {
        title: "மேம்பட்ட AI சுகாதாரம்",
        subtitle: "அதிநவீன தொழில்நுட்பத்தால் இயக்கப்படுகிறது",
        upload: {
          title: "புத்திசாலி பட பகுப்பாய்வு",
          description: "மருத்துவ தர துல்லியத்துடன் உடனடி AI-ஆல் இயக்கப்படும் PCOS கண்டறிதலுக்கு அல்ட்ராசவுண்ட் படங்களைப் பதிவேற்றவும்."
        },
        ai: {
          title: "ஆழமான கற்றல் மாதிரிகள்",
          description: "எங்கள் EfficientNetB4-அடிப்படையிலான CNN கருப்பை நுண்ணறைகளை 98.4% துல்லியத்துடன் பகுப்பாய்வு செய்கிறது."
        },
        report: {
          title: "விரிவான அறிக்கைகள்",
          description: "நுண்ணறை எண்ணிக்கை, தீவிரத்தன்மை மதிப்பீடு மற்றும் சிகிச்சை பரிந்துரைகளுடன் விரிவான பகுப்பாய்வு அறிக்கைகளைப் பெறுங்கள்."
        },
        doctors: {
          title: "வல்லுநர் ஆலோசனை",
          description: "தொழில்முறை ஆலோசனை மற்றும் சிகிச்சைத் திட்டமிடலுக்காக சான்றளிக்கப்பட்ட மகளிர் மருத்துவ நிபுணர்களுடன் இணைக்கவும்."
        }
      },
      howItWorks: {
        title: "OvaCare எப்படி வேலை செய்கிறது",
        subtitle: "துல்லியமான PCOS கண்டறிதலுக்கான எளிய 3-படி செயல்முறை",
        step1: {
          title: "அல்ட்ராசவுண்ட் பதிவேற்று",
          description: "உங்கள் அல்ட்ராசவுண்ட் படத்தை எங்கள் HIPAA-இணக்கமான தளத்தில் பாதுகாப்பாகப் பதிவேற்றவும்"
        },
        step2: {
          title: "AI பகுப்பாய்வு",
          description: "எங்கள் ஆழமான கற்றல் மாதிரி நொடிகளில் PCOS குறிகாட்டிகளுக்காக படத்தை பகுப்பாய்வு செய்கிறது"
        },
        step3: {
          title: "முடிவுகளைப் பெறுங்கள்",
          description: "நம்பிக்கை மதிப்பெண்கள் மற்றும் பரிந்துரைகளுடன் விரிவான பகுப்பாய்வைப் பெறுங்கள்"
        }
      },
      testimonials: {
        title: "சுகாதார நிபுணர்களால் நம்பப்படுகிறது",
        subtitle: "OvaCare பற்றி மருத்துவர்கள் என்ன சொல்கிறார்கள் என்பதைப் பாருங்கள்",
        testimonial1: {
          text: "OvaCare நான் PCOS கண்டறியும் விதத்தை மாற்றியுள்ளது. AI துல்லியம் குறிப்பிடத்தக்கது மற்றும் மதிப்புமிக்க நேரத்தை மிச்சப்படுத்துகிறது.",
          author: "டாக்டர். பிரியங்கா சில்வா",
          position: "மகளிர் மருத்துவ நிபுணர், கொழும்பு பொது மருத்துவமனை"
        },
        testimonial2: {
          text: "விரிவான அறிக்கைகள் நோயாளிகளுக்கு நிலைமைகளை மிகவும் திறம்பட விளக்க எனக்கு உதவுகின்றன. சிறந்த கருவி!",
          author: "டாக்டர். ரகினி ஷர்மா",
          position: "பெண்கள் சுகாதார நிபுணர், கண்டி கற்பித்தல் மருத்துவமனை"
        },
        testimonial3: {
          text: "வேகமான, துல்லியமான மற்றும் பயன்படுத்த எளிதானது. OvaCare இப்போது எங்கள் நோய்கண்டறிதல் கருவித்தொகுப்பின் இன்றியமையாத பகுதியாகும்.",
          author: "டாக்டர். அமரா பெர்னாண்டோ",
          position: "மூத்த ஆலோசகர், தனியார் சுகாதாரம்"
        }
      },
      scan: {
        title: "AI-ஆல் இயக்கப்படும் PCOS கண்டறிதல்",
        subtitle: "உடனடி பகுப்பாய்விற்காக உங்கள் அல்ட்ராசவுண்ட் ஸ்கேனைப் பதிவேற்றவும்",
        uploadArea: {
          title: "உங்கள் அல்ட்ராசவுண்ட் படத்தை இங்கே விடவும்",
          subtitle: "அல்லது கோப்புகளை உலாவ கிளிக் செய்யவும்",
          formats: "ஆதரவு: JPG, PNG, DICOM கோப்புகள் 10MB வரை",
          dragText: "உங்கள் கோப்பை இங்கே விடவும்"
        },
        analyzing: "உங்கள் ஸ்கேனை பகுப்பாய்வு செய்கிறது...",
        analysisComplete: "பகுப்பாய்வு முடிந்தது!",
        results: {
          diagnosis: "நோய்கண்டறிதல்",
          confidence: "நம்பிக்கை நிலை",
          follicleCount: "நுண்ணறை எண்ணிக்கை",
          severity: "தீவிரத்தன்மை",
          recommendations: "பரிந்துரைகள்"
        },
        newScan: "புதிய ஸ்கேன் பதிவேற்று",
        downloadReport: "அறிக்கையைப் பதிவிறக்கு"
      },
      education: {
        title: "PCOS கல்வி மையம்",
        subtitle: "பாலிசிஸ்டிக் கருப்பை நோய்க்குறி பற்றி எல்லாம் அறிக",
        whatIs: {
          title: "PCOS என்றால் என்ன?",
          content: "பாலிசிஸ்டிக் கருப்பை நோய்க்குறி (PCOS) என்பது இனப்பெருக்க வயதிலுள்ள பெண்களைப் பாதிக்கும் ஹார்மோன் கோளாறு ஆகும். இது ஒழுங்கற்ற மாதவிடாய், அதிகப்படியான ஆண்ட்ரோஜன் அளவுகள் மற்றும் பாலிசிஸ்டிக் கருப்பைகளால் வகைப்படுத்தப்படுகிறது."
        },
        symptoms: {
          title: "பொதுவான அறிகுறிகள்",
          list: [
            "ஒழுங்கற்ற அல்லது தவறிய மாதவிடாய்",
            "அதிகப்படியான முடி வளர்ச்சி",
            "முகப்பரு மற்றும் எண்ணெய் சருமம்",
            "எடை அதிகரிப்பு அல்லது எடை குறைப்பதில் சிரமம்",
            "முடி மெல்லியதாதல்",
            "தோல் கருமையாதல்"
          ]
        },
        diagnosis: {
          title: "நோயறிதல் முறைகள்",
          content: "PCOS நோயறிதல் பொதுவாக உடல் பரிசோதனை, ஹார்மோன் அளவுகளைச் சரிபார்க்க இரத்த பரிசோதனைகள் மற்றும் கருப்பைகளை ஆய்வு செய்ய அல்ட்ராசவுண்ட் இமேஜிங் ஆகியவற்றை உள்ளடக்கியது."
        },
        treatment: {
          title: "சிகிச்சை விருப்பங்கள்",
          content: "சிகிச்சையானது அறிகுறிகளை நிர்வகிப்பதில் கவனம் செலுத்துகிறது மற்றும் வாழ்க்கை முறை மாற்றங்கள், மருந்துகள் மற்றும் தொடர்புடைய நிலைமைகளின் மேலாண்மை ஆகியவற்றை உள்ளடக்கியது."
        }
      },
      doctors: {
        title: "PCOS நிபுணர்களைக் கண்டறியுங்கள்",
        subtitle: "சான்றளிக்கப்பட்ட மகளிர் மருத்துவ நிபுணர்கள் மற்றும் பெண்கள் சுகாதார வல்லுநர்களுடன் இணையுங்கள்",
        searchPlaceholder: "பெயர், இடம் அல்லது சிறப்பு மூலம் தேடுங்கள்...",
        bookConsultation: "ஆலோசனை பதிவு செய்",
        viewProfile: "சுயவிவரத்தைக் காட்டு",
        experience: "ஆண்டுகள் அனுபவம்",
        patients: "சிகிச்சை அளித்த நோயாளிகள்",
        rating: "மதிப்பீடு",
        location: "இடம்",
        specialization: "நிபுணத்துவம்",
        languages: "பேசும் மொழிகள்"
      },
      footer: {
        description: "சிறந்த பெண்கள் சுகாதார விளைவுகளுக்காக மேம்பட்ட AI-ஆல் இயக்கப்படும் PCOS கண்டறிதல்.",
        quickLinks: "விரைவு இணைப்புகள்",
        contact: "தொடர்பு",
        followUs: "எங்களைப் பின்தொடருங்கள்",
        allRightsReserved: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
        privacyPolicy: "தனியுரிமை கொள்கை",
        termsOfService: "சேவை விதிமுறைகள்"
      },
      common: {
        loading: "ஏற்றுகிறது...",
        error: "ஏதோ தவறாகிவிட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
        success: "வெற்றி!",
        close: "மூடு",
        save: "சேமி",
        cancel: "ரத்து செய்",
        back: "பின்னால்",
        next: "அடுத்து",
        previous: "முந்தைய"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    lng: 'en', // Will be set by detector

    interpolation: {
      escapeValue: false,
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
const savedLanguage = localStorage.getItem('ovacare-language');
if (savedLanguage && ['en', 'si', 'ta'].includes(savedLanguage)) {
  i18n.changeLanguage(savedLanguage);
}

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ovacare-language', lng);
  document.documentElement.lang = lng;
});

export default i18n;