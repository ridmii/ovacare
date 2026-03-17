"""
MongoDB Atlas service for image storage using GridFS
"""

import os
from pymongo import MongoClient
from pymongo.gridfs import GridFS
from bson import ObjectId
from flask import current_app
from typing import Optional, Dict, Any
import datetime

class MongoDBService:
    """Service class for MongoDB Atlas operations"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.fs = None
        self._init_connection()
    
    def _init_connection(self):
        """Initialize MongoDB Atlas connection"""
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            if not mongodb_uri or mongodb_uri == 'YOUR_MONGODB_ATLAS_URI_HERE':
                print("⚠️ MongoDB URI not configured. Image storage disabled.")
                return
            
            self.client = MongoClient(mongodb_uri)
            self.db = self.client['ovacare']
            self.fs = GridFS(self.db)
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ MongoDB Atlas connected successfully!")
            
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if MongoDB connection is active"""
        return self.client is not None
    
    def store_image(self, file_data: bytes, filename: str, metadata: Dict[str, Any] = None) -> Optional[str]:
        """
        Store image in MongoDB GridFS
        
        Args:
            file_data: Image file bytes
            filename: Original filename
            metadata: Additional metadata to store with image
        
        Returns:
            str: GridFS file ID if successful, None otherwise
        """
        if not self.is_connected():
            print("⚠️ MongoDB not connected. Skipping image storage.")
            return None
        
        try:
            # Prepare metadata
            file_metadata = {
                'filename': filename,
                'upload_date': datetime.datetime.utcnow(),
                'content_type': self._get_content_type(filename),
                **(metadata or {})
            }
            
            # Store file in GridFS
            file_id = self.fs.put(
                file_data,
                filename=filename,
                metadata=file_metadata
            )
            
            print(f"✅ Image stored in MongoDB: {file_id}")
            return str(file_id)
            
        except Exception as e:
            print(f"❌ Error storing image in MongoDB: {e}")
            return None
    
    def get_image(self, file_id: str) -> Optional[bytes]:
        """
        Retrieve image from MongoDB GridFS
        
        Args:
            file_id: GridFS file ID
        
        Returns:
            bytes: Image file data if found, None otherwise
        """
        if not self.is_connected():
            return None
        
        try:
            file_obj = self.fs.get(ObjectId(file_id))
            return file_obj.read()
            
        except Exception as e:
            print(f"❌ Error retrieving image from MongoDB: {e}")
            return None
    
    def get_image_metadata(self, file_id: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for stored image
        
        Args:
            file_id: GridFS file ID
        
        Returns:
            dict: Image metadata if found, None otherwise
        """
        if not self.is_connected():
            return None
        
        try:
            file_obj = self.fs.get(ObjectId(file_id))
            return file_obj.metadata
            
        except Exception as e:
            print(f"❌ Error retrieving image metadata: {e}")
            return None
    
    def store_analysis_result(self, analysis_data: Dict[str, Any]) -> Optional[str]:
        """
        Store analysis result in MongoDB
        
        Args:
            analysis_data: Complete analysis result data
        
        Returns:
            str: Document ID if successful, None otherwise
        """
        if not self.is_connected():
            return None
        
        try:
            # Add timestamp
            analysis_data['created_at'] = datetime.datetime.utcnow()
            
            # Store in analyses collection
            result = self.db.analyses.insert_one(analysis_data)
            
            print(f"✅ Analysis result stored: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"❌ Error storing analysis result: {e}")
            return None
    
    def get_analysis_result(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve analysis result from MongoDB
        
        Args:
            analysis_id: Analysis document ID
        
        Returns:
            dict: Analysis data if found, None otherwise
        """
        if not self.is_connected():
            return None
        
        try:
            result = self.db.analyses.find_one({'_id': ObjectId(analysis_id)})
            if result:
                result['_id'] = str(result['_id'])  # Convert ObjectId to string
            return result
            
        except Exception as e:
            print(f"❌ Error retrieving analysis result: {e}")
            return None
    
    def _get_content_type(self, filename: str) -> str:
        """Determine content type based on file extension"""
        ext = filename.lower().split('.')[-1]
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp'
        }
        return content_types.get(ext, 'application/octet-stream')
    
    def cleanup_old_files(self, days_old: int = 30):
        """
        Clean up old uploaded files (optional maintenance function)
        
        Args:
            days_old: Files older than this many days will be deleted
        """
        if not self.is_connected():
            return
        
        try:
            cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days_old)
            
            # Find old files
            old_files = self.fs.find({'uploadDate': {'$lt': cutoff_date}})
            
            count = 0
            for file_obj in old_files:
                self.fs.delete(file_obj._id)
                count += 1
            
            print(f"🧹 Cleaned up {count} old files")
            
        except Exception as e:
            print(f"❌ Error during cleanup: {e}")

# Global instance
mongodb_service = MongoDBService()