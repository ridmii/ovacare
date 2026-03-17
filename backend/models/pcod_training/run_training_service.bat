@echo off
REM PCOS Training Service Runner
REM This allows training to continue even after restart

echo Starting PCOS Training Service...
cd /d "C:\Users\heyri\OneDrive\Desktop\ovacare\backend\models\pcod_training"

REM Activate virtual environment
call "C:\Users\heyri\OneDrive\Desktop\ovacare\.venv\Scripts\activate.bat"

REM Set environment for background running
set PYTHONUNBUFFERED=1

REM Run training with output logging
python run_pipeline.py > training_output.log 2>&1

echo Training completed or stopped.
pause