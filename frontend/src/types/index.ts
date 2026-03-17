export interface ScanResult {
  diagnosis: string;
  confidence: number;
  follicleCount: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  recommendations: string[];
  filename: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  available: boolean;
  telemedicine: boolean;
  image?: string;
  experience?: string;
}

export interface EducationContent {
  id: string;
  title: string;
  content: string[];
  category: 'symptoms' | 'causes' | 'treatment' | 'prevention';
  icon?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
