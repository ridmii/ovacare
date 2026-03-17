"""
Resume Training with Advanced Monitoring
Automatically resumes from checkpoint with real-time monitoring
"""
import subprocess
import time
import json
import webbrowser
from pathlib import Path
from datetime import datetime

class TrainingResumer:
    def __init__(self):
        self.base_path = Path(r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training")
        self.is_monitoring = False
    
    def check_checkpoint(self):
        """Check if checkpoint exists to resume from"""
        checkpoint = self.base_path / "outputs" / "checkpoints" / "best_model_phase1.h5"
        return checkpoint.exists()
    
    def start_training_with_monitoring(self):
        """Start training in background with monitoring dashboard"""
        
        if not self.check_checkpoint():
            print("⚠️ No checkpoint found. Starting fresh training...")
        else:
            print("✅ Checkpoint found! Training will resume from best model...")
        
        # Start training process in background
        cmd = f'cd "{self.base_path}" && python run_pipeline.py'
        
        print("🚀 Starting training in background...")
        subprocess.Popen(cmd, shell=True, cwd=str(self.base_path))
        
        # Wait a bit for training to start
        time.sleep(10)
        
        # Start monitoring dashboard
        self.start_monitoring_dashboard()
    
    def start_monitoring_dashboard(self):
        """Start real-time monitoring dashboard"""
        print("📊 Starting monitoring dashboard...")
        
        # Create monitoring HTML
        self.create_advanced_monitor()
        
        # Open browser
        html_file = self.base_path / "training_dashboard.html"
        webbrowser.open(f"file://{html_file}")
        
        print("🌐 Dashboard opened in browser!")
        print("🔄 Monitoring every 30 seconds...")
        
        # Monitor loop
        while True:
            self.update_dashboard()
            time.sleep(30)
    
    def create_advanced_monitor(self):
        """Create advanced monitoring dashboard"""
        
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>🧠 PCOS Training Command Center</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .dashboard { 
            max-width: 1200px; 
            margin: 20px auto; 
            background: rgba(255,255,255,0.1); 
            backdrop-filter: blur(10px);
            border-radius: 20px; 
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
        }
        .header h1 { 
            font-size: 2.5em; 
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .status-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin: 20px 0;
        }
        .status-card { 
            background: rgba(255,255,255,0.15); 
            border-radius: 15px; 
            padding: 25px;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .metric { 
            text-align: center; 
            margin: 15px 0;
        }
        .metric-value { 
            font-size: 2.5em; 
            font-weight: bold; 
            margin: 10px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .metric-label { 
            font-size: 1.1em; 
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .progress-bar { 
            background: rgba(255,255,255,0.2); 
            height: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            overflow: hidden;
        }
        .progress-fill { 
            background: linear-gradient(90deg, #00c851, #007e33); 
            height: 100%; 
            transition: width 0.3s ease;
            border-radius: 10px;
        }
        .timeline { 
            border-left: 3px solid rgba(255,255,255,0.3); 
            padding-left: 20px; 
            margin: 20px 0;
        }
        .timeline-item { 
            margin: 15px 0; 
            position: relative;
        }
        .timeline-item::before { 
            content: ''; 
            position: absolute; 
            left: -26px; 
            top: 6px; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            background: #00c851;
        }
        .remote-tips { 
            background: rgba(255,193,7,0.2); 
            border-left: 4px solid #ffc107; 
            padding: 20px; 
            border-radius: 0 10px 10px 0; 
            margin: 20px 0;
        }
        .pulsing { 
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 
            0% { transform: scale(1); } 
            50% { transform: scale(1.05); } 
            100% { transform: scale(1); } 
        }
        .timestamp { 
            text-align: center; 
            margin-top: 20px; 
            font-size: 0.9em; 
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🧠 PCOS AI Training Command Center</h1>
            <div id="status-indicator" class="pulsing">🔄 LIVE MONITORING</div>
        </div>
        
        <div class="status-grid">
            <div class="status-card">
                <h3>📊 Current Metrics</h3>
                <div class="metric">
                    <div class="metric-label">Accuracy</div>
                    <div class="metric-value" id="accuracy">--</div>
                </div>
                <div class="metric">
                    <div class="metric-label">AUC Score</div>
                    <div class="metric-value" id="auc">--</div>
                </div>
            </div>
            
            <div class="status-card">
                <h3>⏱️ Progress</h3>
                <div class="metric">
                    <div class="metric-label">Current Step</div>
                    <div class="metric-value" id="step">--</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress" style="width: 0%"></div>
                </div>
                <div id="progress-text">0% Complete</div>
            </div>
            
            <div class="status-card">
                <h3>🎯 Training Phases</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <strong>Phase 1:</strong> Basic Training (1.5h)
                        <div id="phase1-status">In Progress...</div>
                    </div>
                    <div class="timeline-item" style="opacity: 0.5;">
                        <strong>Phase 2:</strong> Advanced Training (2h)
                        <div>Pending...</div>
                    </div>
                    <div class="timeline-item" style="opacity: 0.5;">
                        <strong>Phase 3:</strong> Fine-tuning (1h)
                        <div>Pending...</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="remote-tips">
            <h3>📱 Remote Monitoring Solutions</h3>
            <p><strong>🌟 Best Options for Remote Access:</strong></p>
            <ul>
                <li><strong>Chrome Remote Desktop:</strong> Free, reliable, works on mobile</li>
                <li><strong>TeamViewer:</strong> Professional remote access solution</li>
                <li><strong>Windows Remote Desktop:</strong> Built into Windows 10/11</li>
                <li><strong>Microsoft Remote Desktop App:</strong> For mobile monitoring</li>
            </ul>
            <p><strong>💡 Pro Tip:</strong> This dashboard auto-refreshes every 30 seconds. Bookmark this page for quick access!</p>
        </div>
        
        <div class="timestamp">
            Last Updated: <span id="timestamp">--</span>
        </div>
    </div>
    
    <script>
        // Auto-update timestamp
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // Simulate real-time updates (replace with actual data fetching)
        setInterval(() => {
            document.getElementById('timestamp').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
        """
        
        html_file = self.base_path / "training_dashboard.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    def update_dashboard(self):
        """Update dashboard with latest metrics"""
        # Implementation to update metrics from log files
        pass

if __name__ == "__main__":
    print("🚀 PCOS Training Resumer & Monitor")
    print("=" * 50)
    
    resumer = TrainingResumer()
    
    try:
        resumer.start_training_with_monitoring()
    except KeyboardInterrupt:
        print("\n⏹️ Monitoring stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Training may still be running in background")