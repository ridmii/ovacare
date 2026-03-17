export interface ScanAnalysis {
  diagnosis: string;
  confidence: number;
  follicleCount: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  recommendations: string[];
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
}

export interface UploadResponse {
  success: boolean;
  filename: string;
  message: string;
  analysis: ScanAnalysis;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}