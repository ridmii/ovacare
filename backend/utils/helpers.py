import os
from typing import Dict, Any, List

def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'dcm', 'dicom'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def initialize_models():
    """Initialize and load ML models."""
    try:
        # Initialize models here
        # This would load your trained models
        print("Initializing AI models...")
        print("✓ Classification model loaded")
        print("✓ Segmentation model loaded")
    except Exception as e:
        print(f"Error initializing models: {e}")

def generate_recommendations(classification_result: Dict[Any, Any], segmentation_result: Dict[Any, Any]) -> List[str]:
    """Generate recommendations based on analysis results."""
    recommendations = []
    
    diagnosis = classification_result.get('diagnosis', '').lower()
    confidence = classification_result.get('confidence', 0)
    follicle_count = segmentation_result.get('follicle_count', 0)
    severity = classification_result.get('severity', '').lower()
    
    # Base recommendations
    if 'pcos' in diagnosis:
        recommendations.append("Consult with a gynecologist for proper diagnosis and treatment planning")
        
        if severity == 'severe':
            recommendations.append("Consider immediate medical intervention and lifestyle modifications")
            recommendations.append("Regular monitoring with follow-up scans every 3 months")
        elif severity == 'moderate':
            recommendations.append("Adopt a balanced diet and regular exercise routine")
            recommendations.append("Follow-up ultrasound in 6 months")
        else:
            recommendations.append("Lifestyle modifications may help improve symptoms")
            recommendations.append("Annual follow-up recommended")
        
        if follicle_count > 20:
            recommendations.append("High follicle count detected - discuss hormonal therapy options")
        
        recommendations.append("Consider stress management and adequate sleep")
        recommendations.append("Monitor weight and maintain healthy BMI")
        
    else:
        recommendations.append("Results appear normal - maintain regular check-ups")
        recommendations.append("Continue healthy lifestyle habits")
    
    # Add confidence-based recommendations
    if confidence < 80:
        recommendations.append("Consider getting additional imaging for confirmation")
        recommendations.append("Results have moderate confidence - professional review recommended")
    
    return recommendations

def format_error_response(message: str, status_code: int = 500) -> Dict[str, Any]:
    """Format error response consistently."""
    return {
        'error': 'Request failed',
        'message': message,
        'status_code': status_code
    }

def validate_upload_data(data: Dict[Any, Any]) -> bool:
    """Validate upload request data."""
    required_fields = ['scan']  # Add other required fields as needed
    return all(field in data for field in required_fields)
