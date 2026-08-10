from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv
from api.routes import api_bp
from utils.helpers import initialize_models
from config.email_config import get_email_config
from services.migrate_local_data import migrate_local_data_to_mongo
# from services.mongodb_service import mongodb_service  # Temporarily disabled - will re-enable once deps are fixed
import logging

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load environment variables from backend/.env regardless of cwd.
# override=True ensures .env wins over stale empty vars left from an earlier process start.
_ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(_ENV_PATH, override=True)

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
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            'CORS_ORIGINS',
            'http://localhost:3000,http://127.0.0.1:3000',
        ).split(',')
        if origin.strip()
    ]
    print(f"[CORS] Origins loaded: {cors_origins}")
    CORS(
        app,
        resources={r'/api/*': {
            'origins': cors_origins,
            'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allow_headers': ['Content-Type', 'Authorization'],
            'supports_credentials': True,
        }},
    )
    
    # Set up logging
    logging.basicConfig(level=logging.INFO)

    email_config = get_email_config()
    if email_config.is_configured:
        print(f"✉️ SMTP email enabled ({email_config.host}:{email_config.port} → {email_config.from_address})")
    elif email_config.save_locally_when_unconfigured:
        print("⚠️ SMTP not configured - emails will be saved to MongoDB (sent_emails collection)")
        print(f"   Missing: {', '.join(email_config.missing_fields()) or 'unknown'}")
    else:
        print("❌ SMTP not configured - outbound email will fail until backend/.env is updated")
        print(f"   Missing: {', '.join(email_config.missing_fields())}")
        print("   Set SMTP_PASSWORD (Gmail App Password) or SMTP_SAVE_LOCALLY=true for local dev fallback")
    
    try:
        migrate_local_data_to_mongo()
        print("✅ MongoDB storage ready (report requests, emails, newsletters, bookings)")
    except Exception as migration_error:
        print(f"⚠️ MongoDB migration skipped: {migration_error}")
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
            'version': '1.0.0',
            'email': get_email_config().public_status(),
        })
    
    @app.route('/')
    def home():
        return jsonify({
            'message': 'OvaCare AI Backend',
            'version': '1.0.0',
            'status': 'running'
        })
    
    return app

# Create the app at module level so gunicorn can find it (required for production).
# gunicorn app:app  →  imports this module and looks for `app`
app = create_app()

if __name__ == '__main__':
    flask_port = int(os.getenv('FLASK_PORT', '5001'))
    app.run(debug=True, host='0.0.0.0', port=flask_port)
