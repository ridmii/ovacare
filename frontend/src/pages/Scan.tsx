import React, { useState, useRef, DragEvent } from 'react';
import '../styles/pages/Scan.css';
import { ScanResult } from '../types';

const Scan: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!image) return;
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('scan', image);

      // Call the Flask backend API
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Use real AI results from trained model
        const realResult: ScanResult = {
          diagnosis: data.analysis.diagnosis,
          confidence: data.analysis.confidence,
          follicleCount: data.analysis.follicleCount, 
          severity: data.analysis.severity,
          recommendations: data.analysis.recommendations || [
            'Consult with a gynecologist for proper diagnosis',
            'Follow medical professional guidance',
            'Consider follow-up imaging if recommended',
          ],
          filename: image.name
        };
        setResult(realResult);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Show error result
      const errorResult: ScanResult = {
        diagnosis: 'Analysis Failed',
        confidence: 0,
        follicleCount: 0,
        severity: 'Mild',
        recommendations: [
          'Analysis could not be completed',
          'Please try again with a clear image',
          'Contact support if the issue persists',
        ],
        filename: image.name
      };
      setResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(syntheticEvent);
    }
  };

  const steps = [
    { number: 1, title: 'Upload Scan', description: 'Upload your ovarian ultrasound image' },
    { number: 2, title: 'AI Analysis', description: 'Our models detect follicles and PCOS markers' },
    { number: 3, title: 'Get Results', description: 'Receive detailed report with visual explanations' },
    { number: 4, title: 'Take Action', description: 'Connect with specialists and get guidance' }
  ];

  return (
    <div className="scan-page">
      <h1>Scan Analysis</h1>
      <p className="page-subtitle">Upload your ovarian ultrasound scan for AI analysis</p>

      <div className="scan-container">
        {/* Upload Section */}
        <div className="upload-section">
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📤</div>
            <h3>Upload Ultrasound Scan</h3>
            <p>Drag & drop or click to upload</p>
            <p className="upload-formats">Supported: JPG, PNG, DICOM</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.dcm"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {preview && (
            <div className="preview-section">
              <h4>Preview</h4>
              <img src={preview} alt="Preview" className="preview-image" />
              <button 
                className="btn btn-primary analyze-btn"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Scan'}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="results-section">
            <h2>Analysis Results</h2>
            
            <div className="result-card">
              <div className="result-header">
                <h3>Diagnosis: {result.diagnosis}</h3>
                <div className="confidence-badge">
                  Confidence: {result.confidence}%
                </div>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">Follicle Count</span>
                  <span className="detail-value">{result.follicleCount} (Normal: 12)</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Severity</span>
                  <span className={`detail-value severity-${result.severity.toLowerCase()}`}>
                    {result.severity}
                  </span>
                </div>
              </div>

              <div className="recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="action-buttons">
                <button className="btn btn-secondary">Save Report</button>
                <button className="btn btn-primary">Find Doctors</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="info-section">
        <h3>How It Works</h3>
        <div className="steps">
          {steps.map((step: any) => (
            <div key={step.number} className="step">
              <div className="step-number">{step.number}</div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scan;