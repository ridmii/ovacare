"""
Simple Training Status Checker
Quick command-line tool to check training progress
"""
import os
import csv
from pathlib import Path
from datetime import datetime

def check_training_status():
    base_path = Path(r"C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training")
    
    print("🧠 PCOS Training Status Check")
    print("=" * 40)
    
    # Check if training process is running
    import psutil
    training_running = False
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = proc.info['cmdline']
            if cmdline and any('run_pipeline.py' in str(cmd) for cmd in cmdline):
                training_running = True
                print(f"✅ Training Process: RUNNING (PID: {proc.info['pid']})")
                break
        except:
            pass
    
    if not training_running:
        print("❌ Training Process: NOT RUNNING")
    
    # Check latest metrics
    csv_file = base_path / "outputs" / "logs" / "training_log_phase1.csv"
    if csv_file.exists():
        try:
            with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                if rows:
                    latest = rows[-1]
                    print("\n📊 Latest Metrics:")
                    print(f"   Epoch: {latest.get('epoch', 'N/A')}")
                    print(f"   Step: {latest.get('step', 'N/A')}")
                    print(f"   Accuracy: {float(latest.get('accuracy', 0)):.2%}")
                    print(f"   Loss: {float(latest.get('loss', 0)):.4f}")
                    print(f"   AUC: {float(latest.get('auc', 0)):.4f}")
        except Exception as e:
            print(f"❌ Could not read metrics: {e}")
    
    # Check log file size (indicates activity)
    master_log = base_path / "outputs" / "logs" / "master_pipeline.log"
    if master_log.exists():
        size_mb = master_log.stat().st_size / 1024 / 1024
        modified = datetime.fromtimestamp(master_log.stat().st_mtime)
        print(f"\n📝 Log File: {size_mb:.1f} MB, last modified: {modified.strftime('%H:%M:%S')}")
    
    print("\n" + "=" * 40)

if __name__ == "__main__":
    check_training_status()