"""
Simple Training Monitor (No Dependencies)
Quick training status without external libraries
"""
import os
import csv
import subprocess
from pathlib import Path
from datetime import datetime

def check_training_status():
    base_path = Path(r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training")
    
    print("🧠 PCOS Training Status Check")
    print("=" * 50)
    
    # Check if training is running via tasklist
    try:
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                               capture_output=True, text=True, shell=True)
        if 'python.exe' in result.stdout:
            print("✅ Python processes detected (likely training)")
        else:
            print("❌ No Python processes found")
    except:
        print("⚠️ Could not check processes")
    
    # Check latest training metrics
    csv_file = base_path / "outputs" / "logs" / "training_log_phase1.csv"
    if csv_file.exists():
        try:
            with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                if len(lines) > 1:
                    # Get last line with data
                    last_line = lines[-1].strip()
                    if last_line:
                        parts = last_line.split(',')
                        if len(parts) >= 7:
                            print("\n📊 Latest Training Metrics:")
                            print(f"   Epoch: {parts[0]}")
                            print(f"   Step: {parts[1]}")
                            print(f"   Accuracy: {float(parts[3]):.2%}")
                            print(f"   Loss: {float(parts[2]):.4f}")
                            if len(parts) > 6:
                                print(f"   AUC: {float(parts[6]):.4f}")
                            
                            # Calculate progress
                            try:
                                step = int(parts[1])
                                total_steps = 1031  # From previous logs
                                progress = (step / total_steps) * 100
                                print(f"   Progress: {progress:.1f}% ({step}/{total_steps})")
                            except:
                                pass
        except Exception as e:
            print(f"❌ Could not read metrics: {e}")
    else:
        print("❌ No training log found")
    
    # Check master log for recent activity
    master_log = base_path / "outputs" / "logs" / "master_pipeline.log"
    if master_log.exists():
        try:
            size_mb = master_log.stat().st_size / 1024 / 1024
            modified = datetime.fromtimestamp(master_log.stat().st_mtime)
            time_diff = datetime.now() - modified
            
            print(f"\n📝 Training Log:")
            print(f"   Size: {size_mb:.1f} MB")
            print(f"   Last Updated: {modified.strftime('%H:%M:%S')}")
            print(f"   Time Since Update: {time_diff.total_seconds():.0f} seconds ago")
            
            if time_diff.total_seconds() < 120:  # Less than 2 minutes
                print("   Status: 🟢 Recently Active")
            else:
                print("   Status: 🔴 No Recent Activity")
                
        except Exception as e:
            print(f"❌ Could not check log: {e}")
    
    # Training phases info
    print(f"\n🎯 Expected Training Timeline:")
    print(f"   Phase 1: 1.5 hours (Basic training)")
    print(f"   Phase 2: 2.0 hours (Advanced training)") 
    print(f"   Phase 3: 1.0 hours (Fine-tuning)")
    print(f"   Total: ~4.5 hours")
    
    print("\n" + "=" * 50)
    print("💡 Tips:")
    print("   - Run this script anytime to check progress")
    print("   - Training saves checkpoints automatically")
    print("   - Use Chrome Remote Desktop for remote access")

if __name__ == "__main__":
    check_training_status()