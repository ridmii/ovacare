"""
Model Builder for PCOS Detection
EfficientNetB4-based architecture with custom classification head
"""

import tensorflow as tf
from tensorflow.keras import layers, Model, optimizers
from tensorflow.keras.applications import EfficientNetB4
from tensorflow.keras.regularizers import l2
import numpy as np
from config import config

class CustomLayers:
    """Custom layers for medical image classification"""
    
    @staticmethod
    def attention_block(inputs, filters, name=None):
        """Attention mechanism for feature refinement"""
        # Global average pooling to get channel attention weights
        gap = layers.GlobalAveragePooling2D(name=f'{name}_gap' if name else None)(inputs)
        
        # Channel attention
        channel_attention = layers.Dense(
            filters // 16, 
            activation='relu',
            name=f'{name}_ca_dense1' if name else None
        )(gap)
        channel_attention = layers.Dense(
            filters, 
            activation='sigmoid',
            name=f'{name}_ca_dense2' if name else None
        )(channel_attention)
        
        # Reshape for multiplication
        channel_attention = layers.Reshape((1, 1, filters), name=f'{name}_ca_reshape' if name else None)(channel_attention)
        
        # Apply attention
        attended = layers.Multiply(name=f'{name}_multiply' if name else None)([inputs, channel_attention])
        
        return attended
    
    @staticmethod
    def custom_head(features, num_classes=2, dropout_rate=0.3, name_prefix="head"):
        """Custom classification head with attention and regularization"""
        
        # Attention block
        x = CustomLayers.attention_block(features, features.shape[-1], name=f'{name_prefix}_attention')
        
        # Global pooling with both average and max
        gap = layers.GlobalAveragePooling2D(name=f'{name_prefix}_gap')(x)
        gmp = layers.GlobalMaxPooling2D(name=f'{name_prefix}_gmp')(x)
        
        # Concatenate pooled features
        x = layers.Concatenate(name=f'{name_prefix}_concat')([gap, gmp])
        
        # Dense layers with regularization
        x = layers.Dense(
            512,
            activation='relu',
            kernel_regularizer=l2(0.01),
            name=f'{name_prefix}_dense1'
        )(x)
        x = layers.BatchNormalization(name=f'{name_prefix}_bn1')(x)
        x = layers.Dropout(dropout_rate, name=f'{name_prefix}_dropout1')(x)
        
        x = layers.Dense(
            256,
            activation='relu',
            kernel_regularizer=l2(0.01),
            name=f'{name_prefix}_dense2'
        )(x)
        x = layers.BatchNormalization(name=f'{name_prefix}_bn2')(x)
        x = layers.Dropout(dropout_rate, name=f'{name_prefix}_dropout2')(x)
        
        # Final classification layer
        if num_classes == 2:
            outputs = layers.Dense(
                1,
                activation='sigmoid',
                kernel_regularizer=l2(0.001),
                name=f'{name_prefix}_output'
            )(x)
        else:
            outputs = layers.Dense(
                num_classes,
                activation='softmax',
                kernel_regularizer=l2(0.001),
                name=f'{name_prefix}_output'
            )(x)
        
        return outputs

class FocalLoss:
    """Focal Loss for handling class imbalance"""
    
    def __init__(self, alpha=0.25, gamma=2.0, label_smoothing=0.0):
        self.alpha = alpha
        self.gamma = gamma
        self.label_smoothing = label_smoothing
    
    def __call__(self, y_true, y_pred):
        """Calculate focal loss"""
        # Apply label smoothing
        if self.label_smoothing > 0:
            y_true = y_true * (1 - self.label_smoothing) + 0.5 * self.label_smoothing
        
        # Calculate focal loss
        epsilon = tf.keras.backend.epsilon()
        y_pred = tf.clip_by_value(y_pred, epsilon, 1.0 - epsilon)
        
        # Calculate cross entropy
        ce = -y_true * tf.math.log(y_pred) - (1 - y_true) * tf.math.log(1 - y_pred)
        
        # Calculate focal weight
        p_t = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        alpha_t = y_true * self.alpha + (1 - y_true) * (1 - self.alpha)
        focal_weight = alpha_t * tf.pow(1 - p_t, self.gamma)
        
        focal_loss = focal_weight * ce
        
        return tf.reduce_mean(focal_loss)
    
    def get_config(self):
        """Get configuration for serialization"""
        return {
            'alpha': self.alpha,
            'gamma': self.gamma,
            'label_smoothing': self.label_smoothing
        }
    
    @classmethod
    def from_config(cls, config):
        """Create instance from configuration"""
        return cls(**config)

class PCOSModel:
    """PCOS Detection Model Builder"""
    
    def __init__(self, config_obj):
        self.config = config_obj
        self.model = None
        
    def build_efficientnet_model(self, trainable_layers='custom'):
        """
        Build EfficientNetB4-based model for PCOS detection
        
        Args:
            trainable_layers: 'none', 'custom', 'top', 'all'
                             'none' - freeze all base layers
                             'custom' - freeze first N layers, unfreeze last layers
                             'top' - freeze base, train only custom head
                             'all' - train entire network
        """
        print(f"🏗️ Building EfficientNetB4 model (trainable: {trainable_layers})...")
        
        # Input layer
        inputs = layers.Input(shape=self.config.INPUT_SHAPE, name='input')
        
        # EfficientNetB4 base model
        base_model = EfficientNetB4(
            weights='imagenet',
            include_top=False,
            input_tensor=inputs,
            pooling=None
        )
        
        # Set trainability based on strategy
        self._set_trainable_layers(base_model, trainable_layers)
        
        # Get features from base model
        features = base_model.output
        
        # Add custom classification head
        outputs = CustomLayers.custom_head(
            features,
            num_classes=len(self.config.CLASS_NAMES),
            dropout_rate=self.config.DROPOUT_RATE
        )
        
        # Create model
        self.model = Model(inputs=inputs, outputs=outputs, name='PCOS_EfficientNetB4')
        
        print(f"   ✅ Model created with {self.model.count_params():,} parameters")
        print(f"   📊 Trainable parameters: {sum([tf.keras.backend.count_params(w) for w in self.model.trainable_weights]):,}")
        
        return self.model
    
    def _set_trainable_layers(self, base_model, strategy):
        """Set which layers are trainable"""
        total_layers = len(base_model.layers)
        
        if strategy == 'none':
            base_model.trainable = False
            print(f"   🔒 All base layers frozen")
            
        elif strategy == 'top':
            base_model.trainable = False
            print(f"   🔒 Base model frozen, training custom head only")
            
        elif strategy == 'custom':
            # Freeze first 80% of layers, train last 20%
            freeze_until = int(total_layers * 0.8)
            
            for i, layer in enumerate(base_model.layers):
                if i < freeze_until:
                    layer.trainable = False
                else:
                    layer.trainable = True
            
            trainable_layers = sum([1 for layer in base_model.layers if layer.trainable])
            print(f"   🔓 Last {total_layers - freeze_until} layers trainable ({trainable_layers} total)")
            
        elif strategy == 'all':
            base_model.trainable = True
            print(f"   🔓 All {total_layers} layers trainable")
    
    def compile_model(self, learning_rate=1e-4, loss_type='focal'):
        """Compile model with appropriate loss and optimizer"""
        print(f"⚙️ Compiling model (lr={learning_rate}, loss={loss_type})...")
        
        # Select optimizer
        if learning_rate <= 1e-4:
            optimizer = optimizers.Adam(
                learning_rate=learning_rate,
                beta_1=0.9,
                beta_2=0.999,
                epsilon=1e-8
            )
        else:
            optimizer = optimizers.Adam(learning_rate=learning_rate)
        
        # Select loss function
        if loss_type == 'focal':
            loss_fn = FocalLoss(
                alpha=self.config.FOCAL_ALPHA,
                gamma=self.config.FOCAL_GAMMA,
                label_smoothing=self.config.LABEL_SMOOTHING
            )
            loss = loss_fn
            print(f"   🎯 Using Focal Loss (α={self.config.FOCAL_ALPHA}, γ={self.config.FOCAL_GAMMA})")
            
        elif loss_type == 'weighted_bce':
            loss = 'binary_crossentropy'
            print(f"   ⚖️ Using Weighted Binary Crossentropy")
            
        else:
            loss = 'binary_crossentropy'
            print(f"   📊 Using Binary Crossentropy")
        
        # Metrics
        metrics = [
            'accuracy',
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
            tf.keras.metrics.AUC(name='auc'),
        ]
        
        # Compile
        self.model.compile(
            optimizer=optimizer,
            loss=loss,
            metrics=metrics
        )
        
        print("   ✅ Model compiled successfully")
        return self.model
    
    def create_callbacks(self, phase_name="phase1", monitor_metric='val_auc'):
        """Create callbacks for training"""
        print(f"📋 Creating callbacks for {phase_name}...")
        
        callbacks = []
        
        # Model checkpoint
        checkpoint_path = self.config.CHECKPOINTS_DIR / f'best_model_{phase_name}.h5'
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor=monitor_metric,
            mode='max',
            save_best_only=True,
            save_weights_only=False,
            verbose=1
        )
        callbacks.append(checkpoint)
        
        # Early stopping
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor=monitor_metric,
            mode='max',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
        callbacks.append(early_stopping)
        
        # Reduce learning rate
        lr_scheduler = tf.keras.callbacks.ReduceLROnPlateau(
            monitor=monitor_metric,
            mode='max',
            factor=0.5,
            patience=5,
            min_lr=1e-8,
            verbose=1
        )
        callbacks.append(lr_scheduler)
        
        # CSV logger
        csv_path = self.config.LOGS_DIR / f'training_log_{phase_name}.csv'
        csv_logger = tf.keras.callbacks.CSVLogger(
            str(csv_path),
            append=True
        )
        callbacks.append(csv_logger)
        
        # TensorBoard
        tensorboard = tf.keras.callbacks.TensorBoard(
            log_dir=str(self.config.LOGS_DIR / f'tensorboard_{phase_name}'),
            histogram_freq=1,
            write_graph=True,
            write_images=True,
            update_freq='epoch'
        )
        callbacks.append(tensorboard)
        
        print(f"   ✅ {len(callbacks)} callbacks created")
        return callbacks
    
    def print_model_summary(self):
        """Print detailed model summary"""
        if self.model is None:
            print("❌ No model built yet!")
            return
        
        print("\n📋 Model Summary:")
        print("="*60)
        self.model.summary()
        
        # Count parameters by trainability
        trainable_params = sum([tf.keras.backend.count_params(w) for w in self.model.trainable_weights])
        non_trainable_params = sum([tf.keras.backend.count_params(w) for w in self.model.non_trainable_weights])
        total_params = trainable_params + non_trainable_params
        
        print(f"\n📊 Parameter Summary:")
        print(f"   Total parameters: {total_params:,}")
        print(f"   Trainable parameters: {trainable_params:,} ({trainable_params/total_params*100:.1f}%)")
        print(f"   Non-trainable parameters: {non_trainable_params:,} ({non_trainable_params/total_params*100:.1f}%)")
        
        # Memory estimation (rough)
        memory_mb = (trainable_params * 4 + non_trainable_params * 4) / (1024 * 1024)
        print(f"   Estimated model size: {memory_mb:.1f} MB")
        
    def save_model_architecture(self):
        """Save model architecture diagram"""
        if self.model is None:
            print("❌ No model to save!")
            return
        
        try:
            # Create plots directory
            self.config.PLOTS_DIR.mkdir(parents=True, exist_ok=True)
            
            # Save model plot
            plot_path = self.config.PLOTS_DIR / 'model_architecture.png'
            tf.keras.utils.plot_model(
                self.model,
                to_file=str(plot_path),
                show_shapes=True,
                show_layer_names=True,
                rankdir='TB',
                dpi=150
            )
            
            print(f"   📁 Model architecture saved: {plot_path}")
            
        except Exception as e:
            print(f"   ⚠️ Could not save model architecture: {e}")
    
    def create_ensemble_model(self, model_paths):
        """Create ensemble model from multiple trained models"""
        print(f"🤝 Creating ensemble from {len(model_paths)} models...")
        
        # Load models
        models = []
        for path in model_paths:
            try:
                model = tf.keras.models.load_model(str(path))
                models.append(model)
                print(f"   ✅ Loaded: {path.name}")
            except Exception as e:
                print(f"   ❌ Failed to load {path.name}: {e}")
        
        if len(models) == 0:
            print("❌ No models loaded for ensemble!")
            return None
        
        # Create ensemble input
        ensemble_input = layers.Input(shape=self.config.INPUT_SHAPE, name='ensemble_input')
        
        # Get predictions from each model
        predictions = []
        for i, model in enumerate(models):
            # Make sure the model doesn't train
            for layer in model.layers:
                layer.trainable = False
            
            # Get prediction
            pred = model(ensemble_input)
            pred = layers.Lambda(lambda x: x, name=f'model_{i}_pred')(pred)
            predictions.append(pred)
        
        # Average predictions
        if len(predictions) > 1:
            ensemble_output = layers.Average(name='ensemble_average')(predictions)
        else:
            ensemble_output = predictions[0]
        
        # Create ensemble model
        ensemble_model = Model(
            inputs=ensemble_input,
            outputs=ensemble_output,
            name='PCOS_Ensemble'
        )
        
        print(f"   ✅ Ensemble model created with {len(models)} models")
        return ensemble_model

def build_model_for_phase(phase=1):
    """Build model for specific training phase"""
    model_builder = PCOSModel(config)
    
    # Define trainability for each phase
    trainable_strategies = {
        1: 'top',      # Phase 1: Only train custom head
        2: 'custom',   # Phase 2: Fine-tune last layers
        3: 'all'       # Phase 3: Train entire network
    }
    
    # Build model
    model = model_builder.build_efficientnet_model(
        trainable_layers=trainable_strategies[phase]
    )
    
    # Compile with phase-appropriate settings
    learning_rates = {1: 1e-3, 2: 1e-4, 3: 1e-5}
    model = model_builder.compile_model(
        learning_rate=learning_rates[phase],
        loss_type='focal'
    )
    
    # Print summary
    model_builder.print_model_summary()
    model_builder.save_model_architecture()
    
    return model_builder

def main():
    """Main function to build and test model"""
    print("🚀 Building PCOS detection model...")
    print("="*60)
    
    # Create directories
    config.create_directories()
    
    # Build model for each phase
    for phase in [1, 2, 3]:
        print(f"\n🔄 Building model for Phase {phase}...")
        model_builder = build_model_for_phase(phase)
        
        # Create callbacks
        callbacks = model_builder.create_callbacks(f"phase{phase}")
        print(f"   📋 {len(callbacks)} callbacks ready for Phase {phase}")
    
    print("\n" + "="*60)
    print("✅ Model building complete!")
    print("🎯 Ready for 3-phase training!")

if __name__ == "__main__":
    main()