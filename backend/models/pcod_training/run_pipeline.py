"""
Master PCOS Detection Training Pipeline
Complete end-to-end training pipeline orchestrator
"""

import sys
import time
import traceback
from pathlib import Path
import argparse
import json
import tensorflow as tf

# Import all pipeline modules
from config import config
from organize_data import DatasetOrganizer
from data_pipeline import DataPipeline
from model_builder import PCOSModel, build_model_for_phase
from train import TrainingPhaseManager
from evaluate import ModelEvaluator
from visualize import ModelVisualizer
from export_model import ModelExporter

class MasterPipeline:
    """Master pipeline orchestrator"""
    
    def __init__(self, args=None):
        """Initialize master pipeline"""
        print("🚀 PCOS Detection ML Pipeline v1.0")
        print("="*60)
        print("🎯 Target: >90% accuracy ultrasound PCOS detection")
        print("🏗️ Architecture: EfficientNetB4 with 3-phase training")
        print("📊 Dataset: 11,784 organized PCOS ultrasound images")
        print("="*60)
        
        self.config = config
        self.args = args if args else self._parse_arguments()
        self.pipeline_start_time = time.time()
        self.results = {}
        
        # Create all directories
        self.config.create_directories()
        
        # Setup logging
        self.setup_logging()
    
    def _parse_arguments(self):
        """Parse command line arguments"""
        parser = argparse.ArgumentParser(description='PCOS Detection Training Pipeline')
        
        parser.add_argument('--skip-data-check', action='store_true',
                          help='Skip dataset verification')
        parser.add_argument('--skip-training', action='store_true',
                          help='Skip model training (use existing model)')
        parser.add_argument('--skip-evaluation', action='store_true',
                          help='Skip model evaluation')
        parser.add_argument('--skip-visualization', action='store_true',
                          help='Skip model visualization')
        parser.add_argument('--skip-export', action='store_true',
                          help='Skip model export')
        parser.add_argument('--use-kfold', action='store_true',
                          help='Use K-fold cross-validation')
        parser.add_argument('--quick-mode', action='store_true',
                          help='Quick mode - minimal epochs for testing')
        parser.add_argument('--export-name', type=str, default='pcos_efficientnetb4_final',
                          help='Name for exported model')
        
        return parser.parse_args([])  # Empty list for default args
    
    def setup_logging(self):
        """Setup pipeline logging"""
        log_file = self.config.LOGS_DIR / 'master_pipeline.log'
        
        # Simple logging to file
        self.log_entries = []
        self.log_file = log_file
        
        self.log("Master Pipeline initialized")
        self.log(f"Configuration: {self.config.__dict__}")
    
    def log(self, message, level="INFO"):
        """Log message with timestamp"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] [{level}] {message}"
        
        print(log_entry)
        self.log_entries.append(log_entry)
        
        # Write to file
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + "\\n")
        except:
            pass  # Continue even if logging fails
    
    def step_1_verify_dataset(self):
        """Step 1: Verify dataset structure and statistics"""
        if self.args.skip_data_check:
            self.log("⏭️ Skipping dataset verification")
            return True
        
        self.log("🔍 Step 1: Dataset Verification")
        print("\\n" + "="*60)
        print("📊 STEP 1: DATASET VERIFICATION")
        print("="*60)
        
        try:
            organizer = DatasetOrganizer()
            success = organizer.run_full_analysis()
            
            if success:
                self.log("✅ Dataset verification completed successfully")
                self.results['dataset_verification'] = {
                    'status': 'success',
                    'total_images': organizer.total_images
                }
                return True
            else:
                self.log("❌ Dataset verification failed", "ERROR")
                self.results['dataset_verification'] = {'status': 'failed'}
                return False
                
        except Exception as e:
            self.log(f"❌ Dataset verification error: {e}", "ERROR")
            traceback.print_exc()
            return False
    
    def step_2_setup_data_pipeline(self):
        """Step 2: Setup data pipeline and augmentation"""
        self.log("🔄 Step 2: Data Pipeline Setup")
        print("\\n" + "="*60)
        print("🔄 STEP 2: DATA PIPELINE SETUP")
        print("="*60)
        
        try:
            pipeline = DataPipeline()
            pipeline_data = pipeline.run_pipeline()
            
            self.log("✅ Data pipeline setup completed")
            self.results['data_pipeline'] = {
                'status': 'success',
                'class_weights': pipeline_data['class_weights']
            }
            
            # Store for later use
            self.pipeline_data = pipeline_data
            return True
            
        except Exception as e:
            self.log(f"❌ Data pipeline error: {e}", "ERROR")
            traceback.print_exc()
            return False
    
    def step_3_train_model(self):
        """Step 3: 3-Phase model training"""
        if self.args.skip_training:
            self.log("⏭️ Skipping model training")
            return True
        
        self.log("🏋️ Step 3: Model Training")
        print("\\n" + "="*60)
        print("🏋️ STEP 3: 3-PHASE MODEL TRAINING")
        print("="*60)
        
        try:
            # Modify epochs for quick mode
            if self.args.quick_mode:
                self.log("⚡ Quick mode enabled - reducing epochs")
                original_epochs = [
                    self.config.PHASE_1_EPOCHS,
                    self.config.PHASE_2_EPOCHS,
                    self.config.PHASE_3_EPOCHS
                ]
                
                # Reduce to minimal epochs
                self.config.PHASE_1_EPOCHS = 3
                self.config.PHASE_2_EPOCHS = 5
                self.config.PHASE_3_EPOCHS = 3
                
                self.log(f"Epochs reduced: {original_epochs} -> [{self.config.PHASE_1_EPOCHS}, {self.config.PHASE_2_EPOCHS}, {self.config.PHASE_3_EPOCHS}]")
            
            # Initialize training manager
            trainer = TrainingPhaseManager()
            
            # Run training
            history, best_models = trainer.run_full_training(
                self.pipeline_data, 
                use_kfold=self.args.use_kfold
            )
            
            if history:
                self.log("✅ Model training completed successfully")
                self.results['training'] = {
                    'status': 'success',
                    'phases_completed': len(history),
                    'best_models': {k: str(v) for k, v in best_models.items()}
                }
                
                # Store for later use
                self.training_history = history
                self.best_models = best_models
                return True
            else:
                self.log("❌ Model training failed", "ERROR")
                self.results['training'] = {'status': 'failed'}
                return False
                
        except Exception as e:
            self.log(f"❌ Training error: {e}", "ERROR")
            traceback.print_exc()
            return False
    
    def step_4_evaluate_model(self):
        """Step 4: Model evaluation and metrics"""
        if self.args.skip_evaluation:
            self.log("⏭️ Skipping model evaluation")
            return True
        
        self.log("📊 Step 4: Model Evaluation")
        print("\\n" + "="*60)
        print("📊 STEP 4: MODEL EVALUATION")
        print("="*60)
        
        try:
            evaluator = ModelEvaluator()
            
            # Find best model
            best_model_path = self.config.CHECKPOINTS_DIR / 'best_model_phase3.h5'
            
            if not best_model_path.exists():
                self.log(f"❌ Best model not found: {best_model_path}", "ERROR")
                return False
            
            # Load model
            model = evaluator.load_model(best_model_path)
            if not model:
                return False
            
            # Load test data
            pipeline = DataPipeline()
            dataset_paths = pipeline.load_dataset_paths()
            train_gen, val_gen, test_gen = pipeline.create_generators(dataset_paths, use_class_weights=False)
            
            # Evaluate model
            results = evaluator.evaluate_test_set(test_gen)
            
            if results:
                # Create visualizations
                evaluator.create_visualizations()
                
                # Analyze errors
                evaluator.analyze_errors(test_gen)
                
                # Generate report
                report = evaluator.generate_evaluation_report()
                
                # Check target achievement
                accuracy = results['metrics']['accuracy']
                target_achieved = accuracy >= 0.90
                
                self.log(f"✅ Evaluation completed - Accuracy: {accuracy*100:.1f}%")
                self.log(f"🎯 Target (90%) {'ACHIEVED' if target_achieved else 'NOT ACHIEVED'}")
                
                self.results['evaluation'] = {
                    'status': 'success',
                    'accuracy': accuracy,
                    'target_achieved': target_achieved,
                    'all_metrics': results['metrics']
                }
                
                # Store for later use
                self.evaluation_results = results
                return True
            else:
                self.log("❌ Model evaluation failed", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Evaluation error: {e}", "ERROR")
            traceback.print_exc()
            return False
    
    def step_5_visualize_model(self):
        """Step 5: Model visualization and explainability"""
        if self.args.skip_visualization:
            self.log("⏭️ Skipping model visualization")
            return True
        
        self.log("👁️ Step 5: Model Visualization")
        print("\\n" + "="*60)
        print("👁️ STEP 5: MODEL VISUALIZATION & EXPLAINABILITY")
        print("="*60)
        
        try:
            visualizer = ModelVisualizer()
            
            # Find best model
            best_model_path = self.config.CHECKPOINTS_DIR / 'best_model_phase3.h5'
            
            if not best_model_path.exists():
                self.log(f"❌ Best model not found: {best_model_path}", "ERROR")
                return False
            
            # Load model
            model = visualizer.load_model(best_model_path)
            if not model:
                return False
            
            # Load test data
            pipeline = DataPipeline()
            dataset_paths = pipeline.load_dataset_paths()
            train_gen, val_gen, test_gen = pipeline.create_generators(dataset_paths, use_class_weights=False)
            
            # Generate comprehensive visualization report
            visualizer.generate_comprehensive_visualization_report(test_gen)
            
            self.log("✅ Model visualization completed")
            self.results['visualization'] = {
                'status': 'success',
                'grad_cam_generated': True,
                'feature_maps_analyzed': True
            }
            
            return True
            
        except Exception as e:
            self.log(f"❌ Visualization error: {e}", "ERROR")
            traceback.print_exc()
            return False
    
    def step_6_export_model(self):
        """Step 6: Model export for production"""
        if self.args.skip_export:
            self.log("⏭️ Skipping model export")
            return True
        
        self.log("📦 Step 6: Model Export")
        print("\\n" + "="*60)
        print("📦 STEP 6: MODEL EXPORT FOR PRODUCTION")
        print("="*60)
        
        try:
            exporter = ModelExporter()
            
            # Find best model
            best_model_path = self.config.CHECKPOINTS_DIR / 'best_model_phase3.h5'
            
            if not best_model_path.exists():
                self.log(f"❌ Best model not found: {best_model_path}", "ERROR")
                return False
            
            # Load model
            model = exporter.load_model(best_model_path)
            if not model:
                return False
            
            # Export in all formats
            export_results = exporter.export_all_formats(self.args.export_name)
            
            if export_results:
                self.log("✅ Model export completed")
                self.results['export'] = {
                    'status': 'success',
                    'formats_exported': list(export_results.keys()),
                    'export_dir': str(self.config.EXPORTS_DIR)
                }
                
                return True
            else:
                self.log("❌ Model export failed", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Export error: {e}", "ERROR")
            traceback.print_exc()
            return False
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        self.log("📋 Generating final pipeline report")
        print("\\n" + "="*60)
        print("📋 FINAL PIPELINE REPORT")
        print("="*60)
        
        # Calculate total time
        total_time = time.time() - self.pipeline_start_time
        
        # Compile final report
        final_report = {
            'pipeline_info': {
                'version': '1.0',
                'execution_time': time.strftime('%Y-%m-%d %H:%M:%S'),
                'total_duration_hours': total_time / 3600,
                'configuration': {
                    'target_accuracy': 0.90,
                    'architecture': 'EfficientNetB4',
                    'training_strategy': '3-phase progressive unfreezing',
                    'dataset_size': getattr(self, 'pipeline_data', {}).get('paths', {}).get('train', [None, []])[1].__len__() if hasattr(self, 'pipeline_data') else 'unknown'
                }
            },
            'pipeline_results': self.results,
            'success_rate': self._calculate_success_rate(),
            'recommendations': self._generate_recommendations()
        }
        
        # Save report
        report_path = self.config.REPORTS_DIR / 'final_pipeline_report.json'
        with open(report_path, 'w') as f:
            json.dump(final_report, f, indent=4, default=str)
        
        # Print summary
        print("\\n🎯 PIPELINE EXECUTION SUMMARY:")
        print(f"   Total time: {total_time/3600:.1f} hours")
        print(f"   Success rate: {self._calculate_success_rate():.1f}%")
        
        # Print step results
        print("\\n📊 STEP RESULTS:")
        for step_name, result in self.results.items():
            status = result.get('status', 'unknown')
            emoji = "✅" if status == 'success' else "❌" if status == 'failed' else "⚠️"
            print(f"   {emoji} {step_name.replace('_', ' ').title()}: {status}")
        
        # Check target achievement
        if 'evaluation' in self.results:
            accuracy = self.results['evaluation'].get('accuracy', 0)
            target_achieved = self.results['evaluation'].get('target_achieved', False)
            
            print(f"\\n🎯 TARGET ANALYSIS:")
            print(f"   Final Accuracy: {accuracy*100:.1f}%")
            print(f"   Target (90%): {'✅ ACHIEVED' if target_achieved else '❌ NOT ACHIEVED'}")
            
            if target_achieved:
                print("   🎉 CONGRATULATIONS! Model ready for deployment!")
            else:
                print("   🔧 Consider additional training or hyperparameter tuning")
        
        # Print next steps
        print("\\n🚀 NEXT STEPS:")
        if self._calculate_success_rate() == 100:
            print("   1. ✅ Deploy model to production environment")
            print("   2. ✅ Set up monitoring and logging")
            print("   3. ✅ Plan for regular model updates")
            print("   4. ✅ Integrate with medical workflow")
        else:
            print("   1. 🔧 Address failed pipeline steps")
            print("   2. 📊 Review error logs and diagnostics")
            print("   3. 🔄 Re-run pipeline with fixes")
        
        print(f"\\n📁 Complete report saved: {report_path}")
        print(f"📁 All outputs available in: {self.config.PROJECT_ROOT}")
        
        self.log(f"Final report generated: {report_path}")
        
        return final_report
    
    def _calculate_success_rate(self):
        """Calculate pipeline success rate"""
        total_steps = len(self.results)
        successful_steps = sum([1 for result in self.results.values() if result.get('status') == 'success'])
        
        return (successful_steps / total_steps * 100) if total_steps > 0 else 0
    
    def _generate_recommendations(self):
        """Generate recommendations based on results"""
        recommendations = []
        
        # Dataset recommendations
        if 'dataset_verification' in self.results:
            if self.results['dataset_verification'].get('status') != 'success':
                recommendations.append("Fix dataset structure and organization before proceeding")
        
        # Training recommendations
        if 'training' in self.results:
            if self.results['training'].get('status') != 'success':
                recommendations.append("Review training configuration and ensure adequate computational resources")
        
        # Accuracy recommendations
        if 'evaluation' in self.results:
            accuracy = self.results['evaluation'].get('accuracy', 0)
            if accuracy < 0.90:
                recommendations.append(f"Accuracy {accuracy*100:.1f}% below target - consider data augmentation or architecture changes")
            elif accuracy >= 0.95:
                recommendations.append("Excellent accuracy achieved - ready for production deployment")
        
        # General recommendations
        if not recommendations:
            recommendations.extend([
                "Pipeline executed successfully - proceed with production deployment",
                "Set up model monitoring and performance tracking",
                "Plan for regular model retraining with new data"
            ])
        
        return recommendations
    
    def run_complete_pipeline(self):
        """Run the complete ML pipeline"""
        self.log("🚀 Starting complete PCOS detection pipeline")
        
        # Pipeline steps
        steps = [
            ("Dataset Verification", self.step_1_verify_dataset),
            ("Data Pipeline Setup", self.step_2_setup_data_pipeline),
            ("Model Training", self.step_3_train_model),
            ("Model Evaluation", self.step_4_evaluate_model),
            ("Model Visualization", self.step_5_visualize_model),
            ("Model Export", self.step_6_export_model)
        ]
        
        # Execute each step
        for step_name, step_function in steps:
            self.log(f"🔄 Starting: {step_name}")
            
            try:
                success = step_function()
                
                if success:
                    self.log(f"✅ Completed: {step_name}")
                else:
                    self.log(f"❌ Failed: {step_name}", "ERROR")
                    
                    # Ask user if they want to continue
                    print(f"\\n⚠️ {step_name} failed. Continue with remaining steps? (y/n): ", end='')
                    try:
                        response = input().strip().lower()
                        if response not in ['y', 'yes']:
                            self.log("Pipeline stopped by user", "WARNING")
                            break
                    except:
                        # Default to continuing in automated mode
                        self.log("Continuing despite error (automated mode)", "WARNING")
            
            except KeyboardInterrupt:
                self.log("Pipeline interrupted by user", "WARNING")
                break
            except Exception as e:
                self.log(f"Unexpected error in {step_name}: {e}", "ERROR")
                traceback.print_exc()
        
        # Generate final report
        final_report = self.generate_final_report()
        
        self.log("🎉 Pipeline execution completed")
        
        return final_report

def main():
    """Main function"""
    # Parse arguments
    parser = argparse.ArgumentParser(description='PCOS Detection Training Pipeline')
    parser.add_argument('--skip-data-check', action='store_true',
                      help='Skip dataset verification')
    parser.add_argument('--skip-training', action='store_true',
                      help='Skip model training (use existing model)')
    parser.add_argument('--skip-evaluation', action='store_true',
                      help='Skip model evaluation')
    parser.add_argument('--skip-visualization', action='store_true',
                      help='Skip model visualization')
    parser.add_argument('--skip-export', action='store_true',
                      help='Skip model export')
    parser.add_argument('--use-kfold', action='store_true',
                      help='Use K-fold cross-validation')
    parser.add_argument('--quick-mode', action='store_true',
                      help='Quick mode - minimal epochs for testing')
    parser.add_argument('--export-name', type=str, default='pcos_efficientnetb4_final',
                      help='Name for exported model')
    
    args = parser.parse_args()
    
    # Initialize and run pipeline
    pipeline = MasterPipeline(args)
    
    try:
        final_report = pipeline.run_complete_pipeline()
        
        # Print final status
        print("\\n" + "="*60)
        if pipeline._calculate_success_rate() == 100:
            print("🎉 PIPELINE COMPLETED SUCCESSFULLY!")
            print("🚀 Model ready for production deployment!")
        else:
            print("⚠️ PIPELINE COMPLETED WITH ERRORS")
            print("🔧 Review logs and address issues before deployment")
        print("="*60)
        
        return final_report
        
    except Exception as e:
        print(f"\\n❌ Pipeline failed with error: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Ensure TensorFlow is properly configured
    try:
        # Enable memory growth for GPU
        gpus = tf.config.experimental.list_physical_devices('GPU')
        if gpus:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        
        # Enable mixed precision
        tf.config.optimizer.set_jit(True)
    except:
        pass
    
    # Run the pipeline
    result = main()
    
    if result:
        print("\\n✅ Master pipeline execution completed!")
    else:
        print("\\n❌ Master pipeline failed!")
        sys.exit(1)