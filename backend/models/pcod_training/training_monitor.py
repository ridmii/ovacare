"""
PCOS Training Monitor - Web Dashboard
Real-time training status monitoring
"""
import json
import os
import time
import csv
from datetime import datetime
import webbrowser
from pathlib import Path

class TrainingMonitor:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.logs_path = self.base_path / "outputs" / "logs"
        self.reports_path = self.base_path / "outputs" / "reports"
        
    def get_current_status(self):
        """Get current training status"""
        try:
            # Read latest training log
            csv_file = self.logs_path / "training_log_phase1.csv"
            if csv_file.exists():
                with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    if len(lines) > 1:
                        latest = lines[-1].strip().split(',')
                        return {
                            'epoch': latest[0],
                            'step': latest[1],
                            'loss': latest[2],
                            'accuracy': latest[3],
                            'precision': latest[4],
                            'recall': latest[5],
                            'auc': latest[6],
                            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        }
        except Exception as e:
            return {'error': str(e)}
        
        return {'status': 'No training data found'}
    
    def check_if_training(self):
        """Check if training is currently running"""
        master_log = self.logs_path / "master_pipeline.log"
        if master_log.exists():
            with open(master_log, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                # Check for recent activity
                lines = content.split('\n')
                for line in reversed(lines[-20:]):  # Check last 20 lines
                    if 'Step' in line and 'ETA' in line:
                        return True
        return False
    
    def generate_html_report(self):
        """Generate HTML monitoring dashboard"""
        status = self.get_current_status()
        is_training = self.check_if_training()
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>PCOS Training Monitor</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }}
        .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }}
        .status {{ padding: 15px; border-radius: 5px; margin: 10px 0; }}
        .running {{ background-color: #d4edda; border: 1px solid #c3e6cb; }}
        .stopped {{ background-color: #f8d7da; border: 1px solid #f5c6cb; }}
        .metric {{ display: inline-block; margin: 10px; padding: 10px; background: #e9ecef; border-radius: 5px; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #007bff; }}
        h1 {{ color: #333; text-align: center; }}
        .timestamp {{ color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 PCOS Training Monitor</h1>
        <div class="status {'running' if is_training else 'stopped'}">
            <h3>Status: {'🟢 Training Active' if is_training else '🔴 Training Stopped'}</h3>
        </div>
        
        {'<div class="timestamp">Last Updated: ' + status.get('timestamp', 'Unknown') + '</div>' if 'timestamp' in status else ''}
        
        {f'''
        <div class="metric">
            <div>Epoch</div>
            <div class="metric-value">{status.get('epoch', 'N/A')}</div>
        </div>
        <div class="metric">
            <div>Step</div>
            <div class="metric-value">{status.get('step', 'N/A')}</div>
        </div>
        <div class="metric">
            <div>Accuracy</div>
            <div class="metric-value">{float(status.get('accuracy', 0)):.2%}</div>
        </div>
        <div class="metric">
            <div>Loss</div>
            <div class="metric-value">{float(status.get('loss', 0)):.4f}</div>
        </div>
        <div class="metric">
            <div>Precision</div>
            <div class="metric-value">{float(status.get('precision', 0)):.2%}</div>
        </div>
        <div class="metric">
            <div>Recall</div>
            <div class="metric-value">{float(status.get('recall', 0)):.2%}</div>
        </div>
        <div class="metric">
            <div>AUC</div>
            <div class="metric-value">{float(status.get('auc', 0)):.4f}</div>
        </div>
        ''' if 'epoch' in status else '<p>No training metrics available</p>'}
        
        <h3>📚 Training Phases:</h3>
        <ul>
            <li>Phase 1: Basic training (Current) - Expected: 1.5 hours</li>
            <li>Phase 2: Advanced training - Expected: 2 hours</li>
            <li>Phase 3: Fine-tuning - Expected: 1 hour</li>
        </ul>
        
        <h3>📱 Remote Access Options:</h3>
        <ul>
            <li><strong>TeamViewer:</strong> Access computer remotely</li>
            <li><strong>Chrome Remote Desktop:</strong> Free remote access</li>
            <li><strong>Windows Remote Desktop:</strong> Built-in Windows solution</li>
        </ul>
    </div>
</body>
</html>
        """
        
        # Save HTML file
        html_file = self.base_path / "training_monitor.html"
        with open(html_file, 'w') as f:
            f.write(html_content)
        
        return html_file

if __name__ == "__main__":
    monitor = TrainingMonitor(r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training")
    html_file = monitor.generate_html_report()
    print(f"Monitor dashboard created: {html_file}")
    
    # Open in browser
    webbrowser.open(f"file://{html_file}")
    
    print("\\n🔄 Monitor will refresh automatically every 30 seconds")
    
    # Keep updating
    while True:
        time.sleep(30)
        monitor.generate_html_report()
        print(f"Updated at {datetime.now().strftime('%H:%M:%S')}")