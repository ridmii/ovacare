# OvaCare Installation Guide

This project includes both a TypeScript/Node.js backend and a Python Flask backend, along with a React frontend.

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Installation Steps

### 1. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

### 2. TypeScript Backend Setup (Node.js)

```bash
cd backend
npm install
npm run dev
```

The TypeScript backend will run on http://localhost:8000

### 3. Python Backend Setup (Flask)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Python backend
python app.py
```

The Python backend will run on http://localhost:5000

## Project Structure

```
ovacare/
├── frontend/           # React TypeScript frontend
├── backend/           # Dual backend setup
│   ├── src/          # TypeScript/Node.js backend
│   ├── api/          # Python Flask API
│   ├── models/       # AI/ML models
│   └── utils/        # Utility functions
└── models/           # ML model storage
```

## Available Scripts

### Frontend
- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests

### TypeScript Backend
- `npm run dev` - Run development server with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Run compiled JavaScript

### Python Backend
- `python app.py` - Run Flask development server

## API Endpoints

### TypeScript Backend (Port 8000)
- `GET /` - API information
- `GET /health` - Health check
- `POST /api/upload` - Upload ultrasound scan
- `GET /api/doctors` - Get doctors list

### Python Backend (Port 5000)
- `GET /health` - Health check
- `POST /api/upload` - Upload and analyze scan
- `GET /api/doctors` - Get doctors list
- `POST /api/analyze` - Analyze existing upload

## Troubleshooting

### Python Dependencies
If you encounter import errors for packages like `cv2`, `flask`, etc., ensure you have installed the requirements:

```bash
pip install opencv-python pillow flask flask-cors numpy scikit-learn tensorflow
```

### Node Dependencies
If you encounter Node.js dependency issues:

```bash
cd frontend
npm install --legacy-peer-deps

cd ../backend
npm install
```

### Common Issues
1. **Port conflicts**: Make sure ports 3000, 5000, and 8000 are available
2. **Virtual environment**: Always activate your Python virtual environment before running Flask
3. **Path issues**: Ensure you're in the correct directory when running commands

## Development Notes

- The AI models are currently mock implementations for demo purposes
- Replace mock data with actual database connections in production
- Add proper authentication and security measures before deployment
- Consider using environment variables for configuration