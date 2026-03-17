"""
API Schema definitions for request/response validation.
"""

from typing import Dict, Any, List, Optional

# Request schemas
UPLOAD_REQUEST_SCHEMA = {
    "type": "object",
    "properties": {
        "scan": {
            "type": "string",
            "description": "Base64 encoded image or file upload"
        }
    },
    "required": ["scan"]
}

ANALYZE_REQUEST_SCHEMA = {
    "type": "object", 
    "properties": {
        "filename": {
            "type": "string",
            "description": "Name of the uploaded file to analyze"
        }
    },
    "required": ["filename"]
}

DOCTORS_REQUEST_SCHEMA = {
    "type": "object",
    "properties": {
        "specialty": {
            "type": "string",
            "description": "Medical specialty filter"
        },
        "location": {
            "type": "string", 
            "description": "Location filter"
        },
        "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "description": "Number of results to return"
        }
    }
}

# Response schemas
ANALYSIS_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "diagnosis": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0, "maximum": 100},
        "follicleCount": {"type": "integer", "minimum": 0},
        "severity": {"type": "string", "enum": ["Mild", "Moderate", "Severe", "None", "Unknown"]},
        "recommendations": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["diagnosis", "confidence", "follicleCount", "severity", "recommendations"]
}

UPLOAD_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "success": {"type": "boolean"},
        "filename": {"type": "string"},
        "message": {"type": "string"},
        "analysis": ANALYSIS_RESPONSE_SCHEMA
    },
    "required": ["success", "filename", "message", "analysis"]
}

DOCTOR_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"},
        "specialty": {"type": "string"},
        "hospital": {"type": "string"},
        "experienceYears": {"type": "integer", "minimum": 0},
        "rating": {"type": "number", "minimum": 0, "maximum": 5},
        "available": {"type": "boolean"},
        "telemedicine": {"type": "boolean"}
    },
    "required": ["id", "name", "specialty", "hospital", "experienceYears", "rating", "available", "telemedicine"]
}

DOCTORS_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "count": {"type": "integer", "minimum": 0},
        "doctors": {"type": "array", "items": DOCTOR_SCHEMA}
    },
    "required": ["count", "doctors"]
}

ERROR_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "error": {"type": "string"},
        "message": {"type": "string"},
        "status_code": {"type": "integer"}
    },
    "required": ["error", "message"]
}

def validate_request(data: Dict[Any, Any], schema: Dict[str, Any]) -> bool:
    """
    Basic schema validation for incoming requests.
    In production, use a proper validation library like jsonschema.
    """
    try:
        # Basic validation - check required fields exist
        required_fields = schema.get("required", [])
        for field in required_fields:
            if field not in data:
                return False
        
        return True
    except Exception:
        return False

def format_response(data: Dict[Any, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
    """Format response according to schema."""
    try:
        # In production, this would properly validate and format the response
        return data
    except Exception:
        return {"error": "Response formatting failed"}
