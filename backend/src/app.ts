import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ScanAnalysis, Doctor, UploadResponse, ApiError } from './types';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|dicom|dcm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const errorResponse: ApiError = {
    error: 'Internal Server Error',
    message: err.message,
    statusCode: 500
  };
  
  if (err instanceof multer.MulterError) {
    errorResponse.error = 'File Upload Error';
    errorResponse.message = err.message;
    errorResponse.statusCode = 400;
  }
  
  res.status(errorResponse.statusCode).json(errorResponse);
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'OvaCare API',
    version: '1.0.0',
    endpoints: {
      '/': 'API Information',
      '/health': 'Health check',
      '/api/upload': 'Upload ultrasound image',
      '/api/doctors': 'Get doctors list'
    }
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Upload scan endpoint
app.post('/api/upload', upload.single('scan'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Mock AI analysis - Replace with actual model
    const analysis: ScanAnalysis = {
      diagnosis: 'PCOS Detected',
      confidence: 92.5,
      follicleCount: 24,
      severity: 'Moderate',
      recommendations: [
        'Consult with a gynecologist',
        'Consider lifestyle modifications',
        'Follow-up ultrasound in 6 months'
      ]
    };

    const response: UploadResponse = {
      success: true,
      filename: req.file.filename,
      message: 'File uploaded successfully',
      analysis
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
});

// Get doctors endpoint
app.get('/api/doctors', (req: Request, res: Response) => {
  try {
    const { specialty, location, limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    // Mock data - replace with database query
    const doctors: Doctor[] = [
      {
        id: 1,
        name: "Dr. Sarah Perera",
        specialty: "Gynecologist",
        hospital: "Asiri Hospitals, Colombo",
        experienceYears: 15,
        rating: 4.8,
        available: true,
        telemedicine: true
      },
      {
        id: 2,
        name: "Dr. Rajiv Fernando",
        specialty: "Endocrinologist",
        hospital: "Nawaloka Hospital, Colombo",
        experienceYears: 12,
        rating: 4.7,
        available: true,
        telemedicine: true
      }
    ];

    // Filter doctors
    let filteredDoctors = doctors;
    
    if (specialty) {
      filteredDoctors = filteredDoctors.filter(d => 
        d.specialty.toLowerCase().includes((specialty as string).toLowerCase())
      );
    }
    
    if (location) {
      filteredDoctors = filteredDoctors.filter(d => 
        d.hospital.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    // Apply limit
    filteredDoctors = filteredDoctors.slice(0, limitNum);

    res.json({
      count: filteredDoctors.length,
      doctors: filteredDoctors
    });
  } catch (error) {
    throw error;
  }
});

// Export the app for use in server.ts
export default app;