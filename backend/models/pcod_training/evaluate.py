"""
Model Evaluation and Metrics Analysis
Comprehensive evaluation suite for PCOS detection model
"""

import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, precision_recall_curve,
    confusion_matrix, classification_report,
    average_precision_score
)
from sklearn.calibration import calibration_curve
import json
import time
from config import config
from data_pipeline import DataPipeline

class ModelEvaluator:
    """Comprehensive model evaluation suite"""
    
    def __init__(self):
        self.config = config
        self.results = {}
        
    def load_model(self, model_path):
        """Load trained model"""
        print(f"📁 Loading model: {model_path}")
        
        try:
            if str(model_path).endswith('.h5'):
                self.model = tf.keras.models.load_model(str(model_path), compile=False)
            else:
                self.model = tf.keras.models.load_model(str(model_path))
            
            print("   ✅ Model loaded successfully")
            print(f"   📊 Model parameters: {self.model.count_params():,}")
            
            return self.model
            
        except Exception as e:
            print(f"   ❌ Error loading model: {e}")
            return None
    
    def evaluate_test_set(self, test_generator, save_predictions=True):
        """Comprehensive evaluation on test set"""
        print("🧪 Evaluating on test set...")
        
        if self.model is None:
            print("❌ No model loaded!")
            return None
        
        # Get predictions
        y_true, y_pred, y_pred_proba = self._get_predictions(test_generator)
        
        # Calculate all metrics
        metrics = self._calculate_metrics(y_true, y_pred, y_pred_proba)
        
        # Generate classification report
        class_report = classification_report(
            y_true, y_pred, 
            target_names=self.config.CLASS_NAMES,
            output_dict=True
        )
        
        # Store results
        self.results = {
            'predictions': {
                'y_true': y_true,
                'y_pred': y_pred,
                'y_pred_proba': y_pred_proba
            },
            'metrics': metrics,
            'classification_report': class_report,
            'confusion_matrix': confusion_matrix(y_true, y_pred)
        }
        
        # Print results
        self._print_results()
        
        # Save predictions if requested
        if save_predictions:
            self._save_predictions()
        
        return self.results
    
    def _get_predictions(self, test_generator):
        """Get model predictions on test set"""
        print("   🔮 Generating predictions...")
        
        y_true = []
        y_pred_proba = []
        
        # Get predictions batch by batch
        for i, (batch_x, batch_y) in enumerate(test_generator):
            print(f"      Processing batch {i+1}/{len(test_generator)}", end='\\r')
            
            # Get predictions
            batch_pred = self.model.predict(batch_x, verbose=0)
            
            # Store true labels
            y_true.extend(batch_y.flatten())
            
            # Store predicted probabilities
            if len(batch_pred.shape) == 1 or batch_pred.shape[1] == 1:
                # Binary classification
                y_pred_proba.extend(batch_pred.flatten())
            else:
                # Multi-class - take probability of positive class
                y_pred_proba.extend(batch_pred[:, 1])
        
        print("      ✅ Predictions complete!")
        
        # Convert to arrays
        y_true = np.array(y_true)
        y_pred_proba = np.array(y_pred_proba)
        y_pred = (y_pred_proba > 0.5).astype(int)
        
        print(f"   📊 Test samples: {len(y_true)}")
        print(f"   📊 Positive predictions: {np.sum(y_pred)}")
        print(f"   📊 Actual positives: {np.sum(y_true)}")
        
        return y_true, y_pred, y_pred_proba
    
    def _calculate_metrics(self, y_true, y_pred, y_pred_proba):
        """Calculate comprehensive metrics"""
        
        # Basic classification metrics
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, average='binary')
        recall = recall_score(y_true, y_pred, average='binary')
        f1 = f1_score(y_true, y_pred, average='binary')
        
        # ROC and Precision-Recall AUC
        roc_auc = roc_auc_score(y_true, y_pred_proba)
        pr_auc = average_precision_score(y_true, y_pred_proba)
        
        # Specificity (True Negative Rate)
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        
        # Sensitivity (same as recall)
        sensitivity = recall
        
        # NPV and PPV
        ppv = tp / (tp + fp) if (tp + fp) > 0 else 0  # Positive Predictive Value
        npv = tn / (tn + fn) if (tn + fn) > 0 else 0  # Negative Predictive Value
        
        # Balanced accuracy
        balanced_acc = (sensitivity + specificity) / 2
        
        # Matthews Correlation Coefficient
        mcc_num = (tp * tn) - (fp * fn)
        mcc_den = np.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn))
        mcc = mcc_num / mcc_den if mcc_den > 0 else 0
        
        # Youden's J statistic
        younden_j = sensitivity + specificity - 1
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'sensitivity': sensitivity,
            'specificity': specificity,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'pr_auc': pr_auc,
            'ppv': ppv,
            'npv': npv,
            'balanced_accuracy': balanced_acc,
            'mcc': mcc,
            'younden_j': younden_j,
            'true_positives': int(tp),
            'true_negatives': int(tn),
            'false_positives': int(fp),
            'false_negatives': int(fn)
        }
    
    def _print_results(self):
        """Print evaluation results"""
        print("\\n📊 EVALUATION RESULTS")
        print("="*50)
        
        metrics = self.results['metrics']
        
        print(f"🎯 Primary Metrics:")
        print(f"   Accuracy:     {metrics['accuracy']:.4f} ({metrics['accuracy']*100:.1f}%)")
        print(f"   Precision:    {metrics['precision']:.4f}")
        print(f"   Recall:       {metrics['recall']:.4f}")
        print(f"   F1-Score:     {metrics['f1_score']:.4f}")
        
        print(f"\\n📈 Additional Metrics:")
        print(f"   ROC AUC:      {metrics['roc_auc']:.4f}")
        print(f"   PR AUC:       {metrics['pr_auc']:.4f}")
        print(f"   Specificity:  {metrics['specificity']:.4f}")
        print(f"   Sensitivity:  {metrics['sensitivity']:.4f}")
        print(f"   Balanced Acc: {metrics['balanced_accuracy']:.4f}")
        print(f"   MCC:          {metrics['mcc']:.4f}")
        
        print(f"\\n🏥 Medical Metrics:")
        print(f"   PPV (Precision): {metrics['ppv']:.4f}")
        print(f"   NPV:             {metrics['npv']:.4f}")
        print(f"   Youden's J:      {metrics['younden_j']:.4f}")
        
        print(f"\\n📋 Confusion Matrix:")
        print(f"   True Positives:  {metrics['true_positives']}")
        print(f"   True Negatives:  {metrics['true_negatives']}")
        print(f"   False Positives: {metrics['false_positives']}")
        print(f"   False Negatives: {metrics['false_negatives']}")
        
        # Check target achievement
        print(f"\\n🎯 TARGET ANALYSIS:")
        if metrics['accuracy'] >= 0.90:
            print(f"   ✅ Target accuracy (90%) ACHIEVED! ({metrics['accuracy']*100:.1f}%)")
        else:
            print(f"   ❌ Target accuracy not reached: {metrics['accuracy']*100:.1f}%")
            
        # Medical relevance
        if metrics['sensitivity'] >= 0.95:
            print(f"   ✅ Excellent sensitivity for medical screening: {metrics['sensitivity']*100:.1f}%")
        elif metrics['sensitivity'] >= 0.90:
            print(f"   ⚠️ Good sensitivity: {metrics['sensitivity']*100:.1f}%")
        else:
            print(f"   ⚠️ Low sensitivity for medical use: {metrics['sensitivity']*100:.1f}%")
    
    def _save_predictions(self):
        """Save predictions to CSV"""
        print("\\n💾 Saving predictions...")
        
        # Create predictions DataFrame
        predictions_df = pd.DataFrame({
            'true_label': self.results['predictions']['y_true'],
            'predicted_label': self.results['predictions']['y_pred'],
            'predicted_probability': self.results['predictions']['y_pred_proba'],
            'true_class': [self.config.CLASS_NAMES[int(label)] for label in self.results['predictions']['y_true']],
            'predicted_class': [self.config.CLASS_NAMES[int(label)] for label in self.results['predictions']['y_pred']],
            'correct_prediction': (self.results['predictions']['y_true'] == self.results['predictions']['y_pred'])
        })
        
        # Save predictions
        pred_path = self.config.REPORTS_DIR / 'test_predictions.csv'
        predictions_df.to_csv(pred_path, index=False)
        print(f"   📁 Predictions saved: {pred_path}")
        
        # Save metrics
        metrics_path = self.config.REPORTS_DIR / 'evaluation_metrics.json'
        with open(metrics_path, 'w') as f:
            json.dump(self.results['metrics'], f, indent=4)
        print(f"   📁 Metrics saved: {metrics_path}")
    
    def create_visualizations(self):
        """Create comprehensive evaluation visualizations"""
        print("\\n📊 Creating evaluation visualizations...")
        
        if not self.results:
            print("❌ No results to visualize!")
            return
        
        # Create figure with multiple subplots
        fig = plt.figure(figsize=(20, 15))
        
        # 1. Confusion Matrix
        plt.subplot(3, 3, 1)
        self._plot_confusion_matrix()
        
        # 2. ROC Curve
        plt.subplot(3, 3, 2)
        self._plot_roc_curve()
        
        # 3. Precision-Recall Curve
        plt.subplot(3, 3, 3)
        self._plot_precision_recall_curve()
        
        # 4. Prediction Distribution
        plt.subplot(3, 3, 4)
        self._plot_prediction_distribution()
        
        # 5. Calibration Plot
        plt.subplot(3, 3, 5)
        self._plot_calibration_curve()
        
        # 6. Metrics Comparison
        plt.subplot(3, 3, 6)
        self._plot_metrics_radar()
        
        # 7. Classification Report Heatmap
        plt.subplot(3, 3, 7)
        self._plot_classification_report_heatmap()
        
        # 8. Probability Histogram
        plt.subplot(3, 3, 8)
        self._plot_probability_histogram()
        
        # 9. Performance by Threshold
        plt.subplot(3, 3, 9)
        self._plot_threshold_analysis()
        
        plt.tight_layout()
        
        # Save comprehensive plot
        plot_path = self.config.PLOTS_DIR / 'comprehensive_evaluation.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"   📁 Comprehensive evaluation saved: {plot_path}")
        
        plt.close()
    
    def _plot_confusion_matrix(self):
        """Plot confusion matrix"""
        cm = self.results['confusion_matrix']
        
        sns.heatmap(
            cm,
            annot=True,
            fmt='d',
            cmap='Blues',
            xticklabels=self.config.CLASS_NAMES,
            yticklabels=self.config.CLASS_NAMES,
            cbar_kws={'label': 'Count'}
        )
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
    
    def _plot_roc_curve(self):
        """Plot ROC curve"""
        y_true = self.results['predictions']['y_true']
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
        roc_auc = self.results['metrics']['roc_auc']
        
        plt.plot(fpr, tpr, color='#e74c3c', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
        plt.plot([0, 1], [0, 1], color='#7f8c8d', lw=2, linestyle='--', label='Random')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curve')
        plt.legend(loc="lower right")
        plt.grid(True, alpha=0.3)
    
    def _plot_precision_recall_curve(self):
        """Plot Precision-Recall curve"""
        y_true = self.results['predictions']['y_true']
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        precision, recall, _ = precision_recall_curve(y_true, y_pred_proba)
        pr_auc = self.results['metrics']['pr_auc']
        
        plt.plot(recall, precision, color='#3498db', lw=2, label=f'PR curve (AUC = {pr_auc:.3f})')
        
        # Baseline
        positive_ratio = np.mean(y_true)
        plt.axhline(y=positive_ratio, color='#7f8c8d', lw=2, linestyle='--', 
                   label=f'Baseline ({positive_ratio:.3f})')
        
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title('Precision-Recall Curve')
        plt.legend()
        plt.grid(True, alpha=0.3)
    
    def _plot_prediction_distribution(self):
        """Plot prediction probability distribution"""
        y_true = self.results['predictions']['y_true']
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        # Separate by true class
        proba_negative = y_pred_proba[y_true == 0]
        proba_positive = y_pred_proba[y_true == 1]
        
        plt.hist(proba_negative, bins=30, alpha=0.7, label='Non-infected', 
                color='#2ecc71', density=True)
        plt.hist(proba_positive, bins=30, alpha=0.7, label='Infected (PCOS)', 
                color='#e74c3c', density=True)
        
        plt.axvline(x=0.5, color='black', linestyle='--', alpha=0.7, label='Threshold')
        plt.xlabel('Predicted Probability')
        plt.ylabel('Density')
        plt.title('Prediction Distribution')
        plt.legend()
        plt.grid(True, alpha=0.3)
    
    def _plot_calibration_curve(self):
        """Plot calibration curve"""
        y_true = self.results['predictions']['y_true']
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        fraction_of_positives, mean_predicted_value = calibration_curve(
            y_true, y_pred_proba, n_bins=10
        )
        
        plt.plot(mean_predicted_value, fraction_of_positives, "s-", 
                color='#e74c3c', label='Model')
        plt.plot([0, 1], [0, 1], "k--", label='Perfectly calibrated')
        
        plt.xlabel('Mean Predicted Probability')
        plt.ylabel('Fraction of Positives')
        plt.title('Calibration Plot')
        plt.legend()
        plt.grid(True, alpha=0.3)
    
    def _plot_metrics_radar(self):
        """Plot radar chart of key metrics"""
        metrics = self.results['metrics']
        
        # Select key metrics for radar chart
        radar_metrics = {
            'Accuracy': metrics['accuracy'],
            'Precision': metrics['precision'],
            'Recall': metrics['recall'],
            'Specificity': metrics['specificity'],
            'F1-Score': metrics['f1_score'],
            'ROC AUC': metrics['roc_auc']
        }
        
        # Create radar chart
        angles = np.linspace(0, 2 * np.pi, len(radar_metrics), endpoint=False)
        values = list(radar_metrics.values())
        labels = list(radar_metrics.keys())
        
        # Close the plot
        angles = np.concatenate((angles, [angles[0]]))
        values = values + [values[0]]
        
        # Plot
        plt.polar(angles, values, 'o-', linewidth=2, color='#3498db')
        plt.fill(angles, values, alpha=0.25, color='#3498db')
        plt.xticks(angles[:-1], labels)
        plt.ylim(0, 1)
        plt.title('Model Performance Radar')
        plt.grid(True)
    
    def _plot_classification_report_heatmap(self):
        """Plot classification report as heatmap"""
        report = self.results['classification_report']
        
        # Extract data for heatmap
        classes = self.config.CLASS_NAMES + ['avg/total']
        metrics_names = ['precision', 'recall', 'f1-score']
        
        data = []
        for class_name in self.config.CLASS_NAMES:
            if class_name in report:
                row = [report[class_name][metric] for metric in metrics_names]
                data.append(row)
        
        # Add macro average
        if 'macro avg' in report:
            row = [report['macro avg'][metric] for metric in metrics_names]
            data.append(row)
        
        # Create heatmap
        if data:
            sns.heatmap(
                data,
                annot=True,
                fmt='.3f',
                cmap='RdYlBu_r',
                yticklabels=self.config.CLASS_NAMES + ['Macro Avg'],
                xticklabels=[m.title() for m in metrics_names],
                cbar_kws={'label': 'Score'}
            )
            plt.title('Classification Report')
            plt.tight_layout()
    
    def _plot_probability_histogram(self):
        """Plot histogram of predicted probabilities"""
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        plt.hist(y_pred_proba, bins=20, alpha=0.7, color='#3498db', edgecolor='black')
        plt.axvline(x=0.5, color='red', linestyle='--', alpha=0.7, label='Threshold')
        plt.xlabel('Predicted Probability')
        plt.ylabel('Frequency')
        plt.title('Overall Probability Distribution')
        plt.legend()
        plt.grid(True, alpha=0.3)
    
    def _plot_threshold_analysis(self):
        """Plot performance metrics vs threshold"""
        y_true = self.results['predictions']['y_true']
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        thresholds = np.arange(0.1, 1.0, 0.05)
        precision_scores = []
        recall_scores = []
        f1_scores = []
        
        for thresh in thresholds:
            y_pred_thresh = (y_pred_proba >= thresh).astype(int)
            
            if len(np.unique(y_pred_thresh)) > 1:  # Ensure both classes are predicted
                precision_scores.append(precision_score(y_true, y_pred_thresh))
                recall_scores.append(recall_score(y_true, y_pred_thresh))
                f1_scores.append(f1_score(y_true, y_pred_thresh))
            else:
                precision_scores.append(0)
                recall_scores.append(0)
                f1_scores.append(0)
        
        plt.plot(thresholds, precision_scores, label='Precision', color='#e74c3c')
        plt.plot(thresholds, recall_scores, label='Recall', color='#3498db')
        plt.plot(thresholds, f1_scores, label='F1-Score', color='#2ecc71')
        
        plt.axvline(x=0.5, color='black', linestyle='--', alpha=0.7, label='Default Threshold')
        plt.xlabel('Threshold')
        plt.ylabel('Score')
        plt.title('Performance vs Threshold')
        plt.legend()
        plt.grid(True, alpha=0.3)
    
    def analyze_errors(self, test_generator=None):
        """Analyze prediction errors in detail"""
        print("\\n🔍 Analyzing prediction errors...")
        
        if not self.results:
            print("❌ No results available for error analysis!")
            return
        
        y_true = self.results['predictions']['y_true']
        y_pred = self.results['predictions']['y_pred']
        y_pred_proba = self.results['predictions']['y_pred_proba']
        
        # Identify errors
        errors = y_true != y_pred
        false_positives = (y_true == 0) & (y_pred == 1)
        false_negatives = (y_true == 1) & (y_pred == 0)
        
        print(f"📊 Error Analysis:")
        print(f"   Total errors: {np.sum(errors)} / {len(y_true)} ({np.mean(errors)*100:.1f}%)")
        print(f"   False positives: {np.sum(false_positives)} ({np.mean(false_positives)*100:.1f}%)")
        print(f"   False negatives: {np.sum(false_negatives)} ({np.mean(false_negatives)*100:.1f}%)")
        
        # Analyze confidence of errors
        fp_confidence = y_pred_proba[false_positives]
        fn_confidence = 1 - y_pred_proba[false_negatives]  # Confidence in wrong prediction
        
        if len(fp_confidence) > 0:
            print(f"\\n   False Positive Analysis:")
            print(f"     Average confidence: {np.mean(fp_confidence):.3f}")
            print(f"     High confidence (>0.8): {np.sum(fp_confidence > 0.8)}")
        
        if len(fn_confidence) > 0:
            print(f"\\n   False Negative Analysis:")
            print(f"     Average confidence: {np.mean(fn_confidence):.3f}")
            print(f"     High confidence (>0.8): {np.sum(fn_confidence > 0.8)}")
        
        # Save error analysis
        error_analysis = {
            'total_errors': int(np.sum(errors)),
            'false_positives': int(np.sum(false_positives)),
            'false_negatives': int(np.sum(false_negatives)),
            'fp_avg_confidence': float(np.mean(fp_confidence)) if len(fp_confidence) > 0 else 0,
            'fn_avg_confidence': float(np.mean(fn_confidence)) if len(fn_confidence) > 0 else 0,
        }
        
        error_path = self.config.REPORTS_DIR / 'error_analysis.json'
        with open(error_path, 'w') as f:
            json.dump(error_analysis, f, indent=4)
        print(f"   📁 Error analysis saved: {error_path}")
    
    def generate_evaluation_report(self):
        """Generate comprehensive evaluation report"""
        print("\\n📋 Generating comprehensive evaluation report...")
        
        if not self.results:
            print("❌ No results available!")
            return
        
        # Create comprehensive report
        report = {
            'evaluation_summary': {
                'model_performance': 'Excellent' if self.results['metrics']['accuracy'] >= 0.90 else 
                                   'Good' if self.results['metrics']['accuracy'] >= 0.80 else 'Needs Improvement',
                'target_accuracy_achieved': self.results['metrics']['accuracy'] >= 0.90,
                'medical_readiness': self.results['metrics']['sensitivity'] >= 0.90,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            },
            'detailed_metrics': self.results['metrics'],
            'confusion_matrix': self.results['confusion_matrix'].tolist(),
            'classification_report': self.results['classification_report'],
            'recommendations': self._generate_recommendations()
        }
        
        # Save report
        report_path = self.config.REPORTS_DIR / 'evaluation_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=4, default=str)
        
        print(f"   📁 Evaluation report saved: {report_path}")
        
        # Print summary
        print(f"\\n🎯 EVALUATION SUMMARY:")
        print(f"   Performance level: {report['evaluation_summary']['model_performance']}")
        print(f"   Target accuracy: {'✅ Achieved' if report['evaluation_summary']['target_accuracy_achieved'] else '❌ Not achieved'}")
        print(f"   Medical readiness: {'✅ Ready' if report['evaluation_summary']['medical_readiness'] else '⚠️ Needs improvement'}")
        
        return report
    
    def _generate_recommendations(self):
        """Generate improvement recommendations"""
        metrics = self.results['metrics']
        recommendations = []
        
        if metrics['accuracy'] < 0.90:
            recommendations.append("Consider additional training epochs or data augmentation")
        
        if metrics['sensitivity'] < 0.90:
            recommendations.append("Increase sensitivity by adjusting classification threshold or using class weights")
        
        if metrics['specificity'] < 0.85:
            recommendations.append("Improve specificity by adding more negative examples or regularization")
        
        if metrics['roc_auc'] < 0.95:
            recommendations.append("Enhance model architecture or feature engineering")
        
        if abs(metrics['precision'] - metrics['recall']) > 0.1:
            recommendations.append("Address precision-recall imbalance with threshold tuning")
        
        if not recommendations:
            recommendations.append("Excellent performance! Consider ensemble methods for further improvement")
        
        return recommendations

def main():
    """Main evaluation function"""
    print("🔍 PCOS Model Evaluation Pipeline")
    print("="*50)
    
    # Initialize evaluator
    evaluator = ModelEvaluator()
    
    # Find best model
    best_model_path = config.CHECKPOINTS_DIR / 'best_model_phase3.h5'
    
    if not best_model_path.exists():
        print(f"❌ Model not found: {best_model_path}")
        return None
    
    # Load model
    model = evaluator.load_model(best_model_path)
    
    if model is None:
        return None
    
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
        
        print("\\n✅ Evaluation completed!")
        print(f"📁 Results saved in: {config.REPORTS_DIR}")
        
        return results
    
    return None

if __name__ == "__main__":
    evaluation_results = main()