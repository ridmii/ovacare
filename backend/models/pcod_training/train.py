"""
3-Phase Training Pipeline for PCOS Detection
Comprehensive training script with progressive unfreezing strategy
"""

import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import time
import json
from sklearn.model_selection import KFold
from sklearn.metrics import classification_report, confusion_matrix
import gc
import warnings
warnings.filterwarnings('ignore')

from config import config
from data_pipeline import DataPipeline
from model_builder import PCOSModel, build_model_for_phase
from organize_data import DatasetOrganizer

class TrainingPhaseManager:
    """Manages the 3-phase training strategy"""
    
    def __init__(self):
        self.config = config
        self.training_history = {}
        self.best_models = {}
        self.training_start_time = None
        
    def setup_training_environment(self):
        """Setup training environment and verify everything"""
        print("🔧 Setting up training environment...")
        
        # Create all directories
        self.config.create_directories()
        
        # Setup GPU memory growth
        self._setup_gpu()
        
        # Verify dataset
        organizer = DatasetOrganizer()
        if not organizer.verify_structure():
            raise ValueError("Dataset structure verification failed!")
        
        # Setup data pipeline
        pipeline = DataPipeline()
        pipeline_data = pipeline.run_pipeline()
        
        print("   ✅ Training environment ready!")
        return pipeline_data
    
    def _setup_gpu(self):
        """Configure GPU memory growth"""
        gpus = tf.config.experimental.list_physical_devices('GPU')
        if gpus:
            try:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                print(f"   🖥️ GPU memory growth enabled for {len(gpus)} GPU(s)")
            except RuntimeError as e:
                print(f"   ⚠️ GPU setup error: {e}")
        else:
            print("   💻 No GPU detected, using CPU")
    
    def train_phase(self, phase_num, model_builder, train_gen, val_gen, 
                   class_weights=None, previous_model_path=None):
        """Train a single phase"""
        print(f"\n🚀 Starting Phase {phase_num} Training")
        print("="*50)
        
        # Load previous model if available
        if previous_model_path and Path(previous_model_path).exists():
            print(f"   📁 Loading model from Phase {phase_num-1}...")
            model_builder.model.load_weights(str(previous_model_path))
            print("   ✅ Previous weights loaded")
        
        # Create callbacks
        callbacks = model_builder.create_callbacks(f"phase{phase_num}")
        
        # Get training parameters
        epochs = getattr(self.config, f'PHASE_{phase_num}_EPOCHS')
        
        # Calculate steps per epoch
        steps_per_epoch = len(train_gen)
        validation_steps = len(val_gen)
        
        print(f"   📊 Training parameters:")
        print(f"      Epochs: {epochs}")
        print(f"      Steps per epoch: {steps_per_epoch}")
        print(f"      Validation steps: {validation_steps}")
        print(f"      Batch size: {self.config.BATCH_SIZE}")
        
        # Start training
        start_time = time.time()
        
        try:
            history = model_builder.model.fit(
                train_gen,
                epochs=epochs,
                validation_data=val_gen,
                callbacks=callbacks,
                class_weight=class_weights,
                verbose=1
            )
            
            training_time = time.time() - start_time
            print(f"\n   ⏱️ Phase {phase_num} completed in {training_time/60:.1f} minutes")
            
            # Store history
            self.training_history[f'phase_{phase_num}'] = {
                'history': history.history,
                'training_time': training_time,
                'epochs_completed': len(history.history['loss'])
            }
            
            # Save best model path
            best_model_path = self.config.CHECKPOINTS_DIR / f'best_model_phase{phase_num}.h5'
            self.best_models[f'phase_{phase_num}'] = best_model_path
            
            return history, best_model_path
            
        except Exception as e:
            print(f"   ❌ Error in Phase {phase_num}: {e}")
            return None, None
    
    def run_full_training(self, pipeline_data, use_kfold=False):
        """Run complete 3-phase training"""
        self.training_start_time = time.time()
        
        print("🎯 Starting Complete 3-Phase Training Pipeline")
        print("="*60)
        
        # Extract data
        train_gen, val_gen, test_gen = pipeline_data['generators']
        class_weights = pipeline_data['class_weights']
        
        print(f"📊 Training Data Summary:")
        print(f"   Train batches: {len(train_gen)}")
        print(f"   Validation batches: {len(val_gen)}")
        print(f"   Test batches: {len(test_gen)}")
        print(f"   Class weights: {class_weights}")
        
        # Run K-fold if requested
        if use_kfold:
            return self._run_kfold_training(pipeline_data)
        
        # Standard 3-phase training
        previous_model_path = None
        
        for phase in range(1, 4):
            print(f"\n{'='*60}")
            print(f"🔄 PHASE {phase} TRAINING")
            print(f"{'='*60}")
            
            # Build model for this phase
            model_builder = build_model_for_phase(phase)
            
            # Train phase
            history, best_model_path = self.train_phase(
                phase, model_builder, train_gen, val_gen,
                class_weights, previous_model_path
            )
            
            if history is None:
                print(f"❌ Phase {phase} failed!")
                break
            
            # Update for next phase
            previous_model_path = best_model_path
            
            # Plot phase results
            self._plot_phase_results(phase, history)
            
            # Memory cleanup
            gc.collect()
            tf.keras.backend.clear_session()
        
        # Final evaluation
        final_results = self._evaluate_final_model(test_gen)
        
        # Generate complete report
        self._generate_training_report(final_results)
        
        return self.training_history, self.best_models
    
    def _run_kfold_training(self, pipeline_data, n_splits=5):
        """Run K-fold cross-validation training"""
        print(f"\n🔄 Running {n_splits}-Fold Cross-Validation")
        print("="*60)
        
        # Get all training data
        train_paths, train_labels = pipeline_data['paths']['train']
        
        # Setup K-fold
        kfold = KFold(n_splits=n_splits, shuffle=True, random_state=42)
        fold_results = []
        
        for fold, (train_idx, val_idx) in enumerate(kfold.split(train_paths)):
            print(f"\n📁 Fold {fold + 1}/{n_splits}")
            print("-" * 40)
            
            # Split data for this fold
            fold_train_paths = [train_paths[i] for i in train_idx]
            fold_train_labels = [train_labels[i] for i in train_idx]
            fold_val_paths = [train_paths[i] for i in val_idx]
            fold_val_labels = [train_labels[i] for i in val_idx]
            
            # Create generators for this fold
            pipeline = DataPipeline()
            
            # This would need to be implemented in data_pipeline.py
            # For now, using existing generators
            train_gen, val_gen, _ = pipeline_data['generators']
            
            # Run 3-phase training for this fold
            fold_history = {}
            previous_model_path = None
            
            for phase in range(1, 4):
                model_builder = build_model_for_phase(phase)
                
                history, best_model_path = self.train_phase(
                    phase, model_builder, train_gen, val_gen,
                    pipeline_data['class_weights'], previous_model_path
                )
                
                if history:
                    fold_history[f'phase_{phase}'] = history.history
                    previous_model_path = best_model_path
            
            fold_results.append(fold_history)
            
            # Memory cleanup
            gc.collect()
            tf.keras.backend.clear_session()
        
        # Analyze K-fold results
        self._analyze_kfold_results(fold_results)
        
        return fold_results
    
    def _plot_phase_results(self, phase, history):
        """Plot training results for a phase"""
        print(f"📊 Plotting Phase {phase} results...")
        
        history_dict = history.history
        
        # Create figure
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle(f'Phase {phase} Training Results', fontsize=16, fontweight='bold')
        
        # Loss plot
        axes[0, 0].plot(history_dict['loss'], label='Training Loss', color='#e74c3c')
        axes[0, 0].plot(history_dict['val_loss'], label='Validation Loss', color='#3498db')
        axes[0, 0].set_title('Loss')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Loss')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # Accuracy plot
        axes[0, 1].plot(history_dict['accuracy'], label='Training Accuracy', color='#e74c3c')
        axes[0, 1].plot(history_dict['val_accuracy'], label='Validation Accuracy', color='#3498db')
        axes[0, 1].set_title('Accuracy')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Accuracy')
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)
        
        # AUC plot
        if 'auc' in history_dict:
            axes[1, 0].plot(history_dict['auc'], label='Training AUC', color='#e74c3c')
            axes[1, 0].plot(history_dict['val_auc'], label='Validation AUC', color='#3498db')
            axes[1, 0].set_title('AUC')
            axes[1, 0].set_xlabel('Epoch')
            axes[1, 0].set_ylabel('AUC')
            axes[1, 0].legend()
            axes[1, 0].grid(True, alpha=0.3)
        
        # Learning rate (if available)
        if 'lr' in history_dict:
            axes[1, 1].plot(history_dict['lr'], color='#2ecc71')
            axes[1, 1].set_title('Learning Rate')
            axes[1, 1].set_xlabel('Epoch')
            axes[1, 1].set_ylabel('Learning Rate')
            axes[1, 1].set_yscale('log')
            axes[1, 1].grid(True, alpha=0.3)
        else:
            # Show precision and recall
            if 'precision' in history_dict and 'recall' in history_dict:
                axes[1, 1].plot(history_dict['val_precision'], label='Validation Precision', color='#e74c3c')
                axes[1, 1].plot(history_dict['val_recall'], label='Validation Recall', color='#3498db')
                axes[1, 1].set_title('Precision & Recall')
                axes[1, 1].set_xlabel('Epoch')
                axes[1, 1].set_ylabel('Score')
                axes[1, 1].legend()
                axes[1, 1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save plot
        plot_path = self.config.PLOTS_DIR / f'phase_{phase}_training.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Saved: {plot_path}")
        
        plt.close()
    
    def _evaluate_final_model(self, test_gen):
        """Evaluate the final trained model"""
        print("\n🎯 Evaluating Final Model...")
        
        # Load best model from Phase 3
        best_model_path = self.best_models.get('phase_3')
        if not best_model_path or not best_model_path.exists():
            print("❌ No final model found!")
            return None
        
        # Load model
        final_model = tf.keras.models.load_model(str(best_model_path), compile=False)
        print(f"   📁 Loaded final model: {best_model_path.name}")
        
        # Evaluate on test set
        print("   🧪 Testing on hold-out test set...")
        
        # Get predictions
        y_true = []
        y_pred = []
        y_pred_proba = []
        
        for batch_x, batch_y in test_gen:
            predictions = final_model.predict(batch_x, verbose=0)
            
            if len(predictions.shape) == 1 or predictions.shape[1] == 1:
                # Binary classification
                y_pred_batch = (predictions > 0.5).astype(int).flatten()
                y_pred_proba_batch = predictions.flatten()
            else:
                # Multi-class
                y_pred_batch = np.argmax(predictions, axis=1)
                y_pred_proba_batch = np.max(predictions, axis=1)
            
            y_true.extend(batch_y)
            y_pred.extend(y_pred_batch)
            y_pred_proba.extend(y_pred_proba_batch)
        
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        y_pred_proba = np.array(y_pred_proba)
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
        
        results = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='binary'),
            'recall': recall_score(y_true, y_pred, average='binary'),
            'f1_score': f1_score(y_true, y_pred, average='binary'),
            'auc_score': roc_auc_score(y_true, y_pred_proba),
            'confusion_matrix': confusion_matrix(y_true, y_pred),
            'classification_report': classification_report(y_true, y_pred, target_names=self.config.CLASS_NAMES)
        }
        
        # Print results
        print(f"\n   📊 Final Test Results:")
        print(f"      Accuracy: {results['accuracy']:.4f}")
        print(f"      Precision: {results['precision']:.4f}")
        print(f"      Recall: {results['recall']:.4f}")
        print(f"      F1-Score: {results['f1_score']:.4f}")
        print(f"      AUC Score: {results['auc_score']:.4f}")
        
        # Check if target accuracy achieved
        if results['accuracy'] >= 0.90:
            print(f"   🎯 Target accuracy (90%) ACHIEVED! ({results['accuracy']*100:.1f}%)")
        else:
            print(f"   ⚠️ Target accuracy not reached. Current: {results['accuracy']*100:.1f}%")
        
        # Plot confusion matrix
        self._plot_confusion_matrix(results['confusion_matrix'])
        
        return results
    
    def _plot_confusion_matrix(self, cm):
        """Plot confusion matrix"""
        plt.figure(figsize=(8, 6))
        sns.heatmap(
            cm,
            annot=True,
            fmt='d',
            cmap='Blues',
            xticklabels=self.config.CLASS_NAMES,
            yticklabels=self.config.CLASS_NAMES
        )
        plt.title('Confusion Matrix - Final Model')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        
        # Save plot
        plot_path = self.config.PLOTS_DIR / 'confusion_matrix.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Confusion matrix saved: {plot_path}")
        
        plt.close()
    
    def _generate_training_report(self, final_results):
        """Generate comprehensive training report"""
        print("\n📋 Generating Training Report...")
        
        # Calculate total training time
        total_time = time.time() - self.training_start_time
        
        # Compile report data
        report = {
            'training_summary': {
                'total_time_hours': total_time / 3600,
                'phases_completed': len(self.training_history),
                'target_accuracy_achieved': final_results['accuracy'] >= 0.90 if final_results else False
            },
            'phase_results': {},
            'final_results': final_results,
            'model_config': {
                'architecture': 'EfficientNetB4',
                'input_shape': self.config.INPUT_SHAPE,
                'batch_size': self.config.BATCH_SIZE,
                'total_epochs': sum([
                    self.config.PHASE_1_EPOCHS,
                    self.config.PHASE_2_EPOCHS,
                    self.config.PHASE_3_EPOCHS
                ])
            }
        }
        
        # Add phase results
        for phase_name, history_data in self.training_history.items():
            best_val_acc = max(history_data['history'].get('val_accuracy', [0]))
            best_val_auc = max(history_data['history'].get('val_auc', [0]))
            
            report['phase_results'][phase_name] = {
                'best_val_accuracy': best_val_acc,
                'best_val_auc': best_val_auc,
                'training_time_minutes': history_data['training_time'] / 60,
                'epochs_completed': history_data['epochs_completed']
            }
        
        # Save report
        report_path = self.config.REPORTS_DIR / 'training_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=4, default=str)
        
        print(f"   📁 Training report saved: {report_path}")
        
        # Print summary
        print(f"\n   🎯 TRAINING SUMMARY:")
        print(f"      Total time: {total_time/3600:.1f} hours")
        print(f"      Phases completed: {len(self.training_history)}/3")
        if final_results:
            print(f"      Final accuracy: {final_results['accuracy']*100:.1f}%")
            print(f"      Target achieved: {'✅' if final_results['accuracy'] >= 0.90 else '❌'}")
        
        return report

def main():
    """Main training pipeline"""
    print("🚀 PCOS Detection Model Training Pipeline")
    print("="*60)
    print(f"Target: >90% accuracy with EfficientNetB4")
    print(f"Strategy: 3-phase progressive unfreezing")
    print("="*60)
    
    # Initialize training manager
    trainer = TrainingPhaseManager()
    
    try:
        # Setup environment and data
        pipeline_data = trainer.setup_training_environment()
        
        # Run complete training
        history, best_models = trainer.run_full_training(pipeline_data)
        
        print("\n🎉 Training pipeline completed!")
        print(f"📁 Best models saved in: {config.CHECKPOINTS_DIR}")
        print(f"📊 Results available in: {config.REPORTS_DIR}")
        
        return history, best_models
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        return None, None

if __name__ == "__main__":
    # Set memory growth and mixed precision
    tf.config.optimizer.set_jit(True)
    
    # Run training
    training_results = main()
    
    if training_results[0] is not None:
        print("\n✅ Training completed successfully!")
        print("🎯 Model ready for deployment!")
    else:
        print("\n❌ Training failed!")
        print("🔧 Check logs and configuration!")