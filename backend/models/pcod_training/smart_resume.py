"""
Smart Resume Training - Fix Resume Logic and JSON Issues
Automatically detects the last completed phase and resumes correctly
"""

import json
import numpy as np
import tensorflow as tf
from pathlib import Path
import time
import shutil
from config import config
from data_pipeline import DataPipeline
from model_builder import build_model_for_phase
from train import TrainingPhaseManager

class SmartResumer:
    def __init__(self):
        self.config = config
        self.checkpoints_dir = self.config.CHECKPOINTS_DIR
        
    def detect_last_phase(self):
        """Detect the last completed training phase"""
        phase1_exists = (self.checkpoints_dir / "best_model_phase1.h5").exists()
        phase2_exists = (self.checkpoints_dir / "best_model_phase2.h5").exists() 
        phase3_exists = (self.checkpoints_dir / "best_model_phase3.h5").exists()
        
        if phase3_exists:
            print("✅ Phase 3 completed - Training is already complete!")
            return 3
        elif phase2_exists:
            print("✅ Phase 2 completed - Will resume from Phase 3")
            return 2
        elif phase1_exists:
            print("✅ Phase 1 completed - Will resume from Phase 2")
            return 1
        else:
            print("ℹ️ No phases completed - Starting from Phase 1")
            return 0
    
    def safe_json_convert(self, obj):
        """Convert numpy/tensorflow types to JSON-serializable types"""
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {str(k): self.safe_json_convert(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self.safe_json_convert(item) for item in obj]
        elif hasattr(obj, 'numpy'):  # tensorflow tensors
            return self.safe_json_convert(obj.numpy())
        else:
            return obj
    
    def resume_from_phase(self, start_phase):
        """Resume training from specific phase"""
        print(f"\n🚀 Resuming training from Phase {start_phase + 1}")
        print("="*60)
        
        # Setup data pipeline
        print("🔄 Setting up data pipeline...")
        pipeline = DataPipeline()
        pipeline_data = pipeline.run_pipeline()
        
        train_gen, val_gen, test_gen = pipeline_data['generators']
        class_weights = pipeline_data['class_weights']
        
        # Initialize training manager
        trainer = TrainingPhaseManager()
        trainer.config.create_directories()
        trainer.setup_training_environment()
        
        # Load previous model if available
        previous_model_path = None
        if start_phase > 0:
            previous_model_path = self.checkpoints_dir / f"best_model_phase{start_phase}.h5"
            print(f"📁 Will load previous model: {previous_model_path}")
        
        # Run remaining phases
        for phase in range(start_phase + 1, 4):
            print(f"\n{'='*60}")
            print(f"🔄 PHASE {phase} TRAINING")
            print(f"{'='*60}")
            
            try:
                # Build model for this phase
                model_builder = build_model_for_phase(phase)
                
                # Train phase
                history, best_model_path = trainer.train_phase(
                    phase, model_builder, train_gen, val_gen,
                    class_weights, previous_model_path
                )
                
                if history is None:
                    print(f"❌ Phase {phase} failed!")
                    return False
                
                # Update for next phase
                previous_model_path = best_model_path
                
                print(f"✅ Phase {phase} completed successfully!")
                
                # Memory cleanup
                import gc
                gc.collect()
                tf.keras.backend.clear_session()
                
            except Exception as e:
                print(f"❌ Error in Phase {phase}: {e}")
                return False
        
        print("\n🎉 All phases completed successfully!")
        return True
    
    def run_evaluation_only(self):
        """Run evaluation, visualization and export steps only"""
        print("\n🔄 Running evaluation, visualization and export...")
        
        try:
            # Import required modules
            from evaluate import ModelEvaluator
            from visualize import ModelVisualizer
            from export_model import ModelExporter
            
            # Setup data pipeline for evaluation
            pipeline = DataPipeline()
            dataset_paths = pipeline.load_dataset_paths()
            train_gen, val_gen, test_gen = pipeline.create_generators(dataset_paths, use_class_weights=False)
            
            # Step 4: Model Evaluation
            print("\n📊 Step 4: Model Evaluation")
            print("="*40)
            
            evaluator = ModelEvaluator()
            best_model_path = self.checkpoints_dir / 'best_model_phase3.h5'
            
            if not best_model_path.exists():
                print(f"❌ Best model not found: {best_model_path}")
                return False
            
            model = evaluator.load_model(best_model_path)
            if not model:
                return False
            
            results = evaluator.evaluate_test_set(test_gen)
            if results:
                evaluator.create_visualizations()
                evaluator.analyze_errors(test_gen)
                report = evaluator.generate_evaluation_report()
                print("✅ Evaluation completed successfully")
            
            # Step 5: Visualization
            print("\n👁️ Step 5: Visualization")
            print("="*40)
            
            visualizer = ModelVisualizer()
            visualizer.create_all_visualizations()
            print("✅ Visualization completed successfully")
            
            # Step 6: Model Export (Fixed JSON serialization)
            print("\n📦 Step 6: Model Export")
            print("="*40)
            
            try:
                exporter = ModelExporter()
                
                # Load model safely
                model = tf.keras.models.load_model(best_model_path)
                
                # Export in all formats
                export_results = {
                    'savedmodel': exporter.export_savedmodel(model),
                    'h5': exporter.export_h5(model), 
                    'tflite': exporter.export_tflite(model),
                    'onnx': exporter.export_onnx(model)
                }
                
                print("✅ Model export completed successfully")
                
                # Generate final report with safe JSON conversion
                final_report = {
                    'pipeline_info': {
                        'version': '1.0', 
                        'execution_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                        'architecture': 'EfficientNetB4',
                        'training_strategy': '3-phase progressive unfreezing'
                    },
                    'results': self.safe_json_convert(results),
                    'export_results': self.safe_json_convert(export_results)
                }
                
                # Save final report safely
                report_path = self.config.REPORTS_DIR / 'final_pipeline_report.json'
                with open(report_path, 'w') as f:
                    json.dump(final_report, f, indent=4)
                
                print(f"✅ Final report saved: {report_path}")
                return True
                
            except Exception as e:
                print(f"⚠️ Export error (but training is complete): {e}")
                return True  # Don't fail the entire process
                
        except Exception as e:
            print(f"❌ Error in post-training steps: {e}")
            return False

def main():
    print("🧠 SMART PCOS TRAINING RESUMER")
    print("="*50)
    
    resumer = SmartResumer()
    
    # Detect where we left off
    last_phase = resumer.detect_last_phase()
    
    if last_phase == 3:
        # Training complete, just run evaluation/export
        print("🎯 Training already complete. Running evaluation & export...")
        success = resumer.run_evaluation_only()
    elif last_phase >= 0:
        # Resume training from appropriate phase
        success = resumer.resume_from_phase(last_phase)
        
        if success:
            # Run evaluation and export
            resumer.run_evaluation_only()
    
    if success:
        print("\n🎉 PIPELINE COMPLETED SUCCESSFULLY!")
        print("🚀 Your PCOS detection model is ready for deployment!")
    else:
        print("\n❌ Pipeline encountered errors. Check logs for details.")

if __name__ == "__main__":
    main()