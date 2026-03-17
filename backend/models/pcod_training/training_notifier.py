"""
PCOS Training Notifier
Sends email/SMS notifications about training progress
"""
import smtplib
import requests
import json
from email.mime.text import MimeText
from pathlib import Path
import time

class TrainingNotifier:
    def __init__(self):
        self.last_notification = None
    
    def send_email(self, subject, message, to_email="your_email@gmail.com"):
        """Send email notification (configure with your Gmail)"""
        try:
            # Configure your Gmail settings
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            from_email = "your_gmail@gmail.com"  # SET YOUR EMAIL
            app_password = "your_app_password"    # SET YOUR APP PASSWORD
            
            msg = MimeText(message)
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = to_email
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(from_email, app_password)
                server.send_message(msg)
            
            print(f"✅ Email sent: {subject}")
            return True
        except Exception as e:
            print(f"❌ Email failed: {e}")
            return False
    
    def send_discord_webhook(self, message, webhook_url=None):
        """Send Discord notification via webhook"""
        if not webhook_url:
            print("❌ Discord webhook URL not configured")
            return False
            
        try:
            payload = {
                "content": f"🧠 **PCOS Training Update**\n{message}",
                "username": "Training Bot"
            }
            response = requests.post(webhook_url, json=payload)
            if response.status_code == 204:
                print("✅ Discord notification sent")
                return True
        except Exception as e:
            print(f"❌ Discord failed: {e}")
        return False
    
    def check_and_notify(self, base_path):
        """Check training status and send notifications"""
        from training_monitor import TrainingMonitor
        
        monitor = TrainingMonitor(base_path)
        status = monitor.get_current_status()
        is_training = monitor.check_if_training()
        
        # Determine notification type
        current_state = None
        if is_training and 'epoch' in status:
            accuracy = float(status.get('accuracy', 0))
            if accuracy > 0.90:
                current_state = f"🎯 MILESTONE: {accuracy:.2%} accuracy achieved!"
            elif accuracy > 0.85:
                current_state = f"🚀 Great progress: {accuracy:.2%} accuracy"
            else:
                current_state = f"📊 Training: Epoch {status['epoch']}, {accuracy:.2%} accuracy"
        elif not is_training:
            current_state = "⚠️ Training has stopped"
        
        # Send notification if state changed
        if current_state and current_state != self.last_notification:
            message = f"{current_state}\nStep: {status.get('step', 'N/A')}\nLoss: {status.get('loss', 'N/A')}"
            
            # Send to multiple channels
            self.send_email("PCOS Training Update", message)
            # self.send_discord_webhook(message, "YOUR_DISCORD_WEBHOOK_URL")
            
            self.last_notification = current_state

if __name__ == "__main__":
    notifier = TrainingNotifier()
    base_path = r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training"
    
    print("🔔 Training notifier started")
    print("Configure email settings in the script to receive notifications")
    
    while True:
        notifier.check_and_notify(base_path)
        time.sleep(300)  # Check every 5 minutes