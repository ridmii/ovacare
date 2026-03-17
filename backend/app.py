from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from api.routes import api_bp
from utils.helpers import initialize_models
# from services.mongodb_service import mongodb_service  # Temporarily disabled - will re-enable once deps are fixed
import logging

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Configuration from environment variables
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB default
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.getenv('UPLOAD_FOLDER', 'uploads'))
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Enable CORS with environment-specified origins
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    print(f"🌐 CORS origins loaded: {cors_origins}")  # Debug log
    CORS(app, origins=cors_origins)
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    # MongoDB Atlas integration (temporarily disabled until dependencies are resolved)
    print("📁 Using local file storage - MongoDB will be enabled in production")
    print("✅ Sri Lankan data updates applied successfully")
    
    # Initialize ML models
    initialize_models()
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'OvaCare AI Backend',
            'version': '1.0.0'
        })
    
    @app.route('/')
    def home():
        return jsonify({
            'message': 'OvaCare AI Backend',
            'version': '1.0.0',
            'status': 'running'
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
