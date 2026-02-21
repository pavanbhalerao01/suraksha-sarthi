"""
Heatwave Risk Prediction Model Trainer
Trains a machine learning model to predict heatwave risk using historical weather data
Dataset: india_weather_data.csv with 131,055+ rows
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    accuracy_score,
    precision_recall_fscore_support
)
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

class HeatwaveModelTrainer:
    def __init__(self, data_path):
        self.data_path = data_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.feature_importance = {}
        
    def load_and_prepare_data(self):
        """Load CSV data and prepare features"""
        print("📂 Loading dataset...")
        df = pd.read_csv(self.data_path)
        
        print(f"✅ Loaded {len(df):,} rows")
        print(f"📊 Columns: {list(df.columns)}")
        
        # Convert date to datetime first to avoid type errors
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        
        print(f"\n🔍 Dataset Info:")
        print(f"   - Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"   - Missing values: {df.isnull().sum().sum()} total")
        
        # Check heatwave distribution
        heatwave_counts = df['heatwave'].value_counts()
        print(f"\n🌡️ Heatwave Distribution:")
        print(f"   - No Heatwave (0): {heatwave_counts.get(0.0, 0):,} rows ({heatwave_counts.get(0.0, 0)/len(df)*100:.2f}%)")
        print(f"   - Heatwave (1): {heatwave_counts.get(1.0, 0):,} rows ({heatwave_counts.get(1.0, 0)/len(df)*100:.2f}%)")
        
        return df
    
    def engineer_features(self, df):
        """Create additional features for better prediction"""
        print("\n🔧 Engineering features...")
        
        # Convert date to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Extract temporal features
        df['month'] = df['date'].dt.month
        df['day_of_year'] = df['date'].dt.dayofyear
        df['hour'] = df['date'].dt.hour
        
        # Temperature-related features
        df['temp_range'] = df['max_temperature'] - df['min_temperature']
        df['avg_temperature'] = (df['max_temperature'] + df['min_temperature']) / 2
        df['temp_anomaly'] = df['max_temperature'] - df['max_temperature'].rolling(window=24, min_periods=1).mean()
        
        # Humidity-related features
        df['humidity_range'] = df['max_humidity'] - df['min_humidity']
        df['avg_humidity'] = (df['max_humidity'] + df['min_humidity']) / 2
        
        # Heat index approximation (simplified formula)
        df['heat_index'] = df['avg_temperature'] + (0.5 * (df['avg_humidity'] - 50))
        
        # Solar radiation intensity
        df['high_solar_radiation'] = (df['solar_radiation'] > df['solar_radiation'].quantile(0.75)).astype(int)
        
        # Wind cooling effect
        df['wind_cooling'] = df['wind_speed'] * (df['max_temperature'] - 25)  # cooling effect
        
        # Pressure stability
        df['pressure_stable'] = (df['pressure_surface_level'] > 1010).astype(int)
        
        print(f"✅ Added {9} engineered features")
        
        return df
    
    def select_features(self, df):
        """Select relevant features for heatwave prediction"""
        
        # Core weather features
        self.feature_columns = [
            # Temperature features (most important for heatwave)
            'max_temperature',
            'min_temperature',
            'avg_temperature',
            'temp_range',
            'temp_anomaly',
            
            # Humidity features (affects heat perception)
            'max_humidity',
            'min_humidity',
            'avg_humidity',
            'humidity_range',
            
            # Solar and radiation
            'solar_radiation',
            'uv_index',
            'high_solar_radiation',
            
            # Wind (cooling effect)
            'wind_speed',
            'wind_cooling',
            
            # Atmospheric conditions
            'pressure_surface_level',
            'pressure_stable',
            'dew_point',
            'cloud_cover',
            
            # Precipitation (inversely related to heatwave)
            'rainfall',
            'precipitation_probability',
            
            # Temporal features
            'month',
            'day_of_year',
            'hour',
            
            # Other
            'visibility',
            'heat_index'
        ]
        
        # Remove columns with too many missing values or not in df
        self.feature_columns = [col for col in self.feature_columns if col in df.columns]
        
        print(f"\n📋 Selected {len(self.feature_columns)} features:")
        for i, col in enumerate(self.feature_columns, 1):
            print(f"   {i}. {col}")
        
        return self.feature_columns
    
    def prepare_train_test_split(self, df):
        """Prepare training and testing datasets"""
        print("\n📊 Preparing train/test split...")
        
        # Drop rows with missing target
        df_clean = df.dropna(subset=['heatwave'])
        
        # Handle missing values in features
        for col in self.feature_columns:
            if df_clean[col].isnull().sum() > 0:
                # Fill with median for numerical columns
                df_clean[col].fillna(df_clean[col].median(), inplace=True)
        
        # Separate features and target
        X = df_clean[self.feature_columns]
        y = df_clean['heatwave']
        
        print(f"   - Total samples: {len(X):,}")
        print(f"   - Features: {X.shape[1]}")
        print(f"   - Heatwave cases: {(y == 1.0).sum():,}")
        print(f"   - Non-heatwave cases: {(y == 0.0).sum():,}")
        
        # Stratified split to maintain heatwave ratio
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=0.2, 
            random_state=42, 
            stratify=y
        )
        
        print(f"   - Training set: {len(X_train):,} samples")
        print(f"   - Test set: {len(X_test):,} samples")
        
        return X_train, X_test, y_train, y_test
    
    def train_model(self, X_train, y_train, model_type='random_forest'):
        """Train the heatwave prediction model"""
        print(f"\n🤖 Training {model_type.upper()} model...")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        if model_type == 'random_forest':
            # Random Forest with optimized parameters
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=10,
                min_samples_leaf=5,
                max_features='sqrt',
                class_weight='balanced',  # Handle imbalanced data
                random_state=42,
                n_jobs=-1,
                verbose=1
            )
        elif model_type == 'gradient_boosting':
            # Gradient Boosting
            self.model = GradientBoostingClassifier(
                n_estimators=150,
                max_depth=10,
                learning_rate=0.1,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=42,
                verbose=1
            )
        
        # Train the model
        print("   Training in progress...")
        self.model.fit(X_train_scaled, y_train)
        
        # Feature importance
        self.feature_importance = dict(zip(
            self.feature_columns, 
            self.model.feature_importances_
        ))
        
        # Sort by importance
        sorted_importance = sorted(
            self.feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        print("\n⭐ Top 10 Most Important Features:")
        for i, (feature, importance) in enumerate(sorted_importance[:10], 1):
            print(f"   {i}. {feature}: {importance:.4f}")
        
        return self.model
    
    def evaluate_model(self, X_test, y_test):
        """Evaluate model performance"""
        print("\n📈 Evaluating model performance...")
        
        # Scale test data
        X_test_scaled = self.scaler.transform(X_test)
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"\n✅ Model Performance:")
        print(f"   - Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"   - ROC-AUC Score: {roc_auc:.4f}")
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"\n📊 Confusion Matrix:")
        print(f"   True Negatives:  {cm[0][0]:,}")
        print(f"   False Positives: {cm[0][1]:,}")
        print(f"   False Negatives: {cm[1][0]:,}")
        print(f"   True Positives:  {cm[1][1]:,}")
        
        # Classification Report
        print(f"\n📋 Classification Report:")
        print(classification_report(y_test, y_pred, 
                                   target_names=['No Heatwave', 'Heatwave'],
                                   digits=4))
        
        # Precision, Recall, F1 for each class
        precision, recall, f1, support = precision_recall_fscore_support(
            y_test, y_pred, average=None
        )
        
        print(f"   Heatwave Detection:")
        print(f"      - Precision: {precision[1]:.4f} (of predicted heatwaves, {precision[1]*100:.2f}% were correct)")
        print(f"      - Recall: {recall[1]:.4f} (detected {recall[1]*100:.2f}% of actual heatwaves)")
        print(f"      - F1-Score: {f1[1]:.4f}")
        
        return accuracy, roc_auc
    
    def save_model(self, model_path='heatwave_model.pkl', scaler_path='heatwave_scaler.pkl'):
        """Save trained model and scaler"""
        print(f"\n💾 Saving model...")
        
        # Save model
        joblib.dump(self.model, model_path)
        print(f"   ✅ Model saved: {model_path}")
        
        # Save scaler
        joblib.dump(self.scaler, scaler_path)
        print(f"   ✅ Scaler saved: {scaler_path}")
        
        # Save feature list
        feature_config = {
            'feature_columns': self.feature_columns,
            'feature_importance': self.feature_importance
        }
        joblib.dump(feature_config, 'heatwave_features.pkl')
        print(f"   ✅ Feature config saved: heatwave_features.pkl")
        
        # Print file sizes
        model_size = os.path.getsize(model_path) / (1024 * 1024)
        print(f"   📦 Model size: {model_size:.2f} MB")


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("🌡️  HEATWAVE RISK PREDICTION MODEL TRAINER")
    print("=" * 60)
    
    # Path to your dataset
    data_path = '../datasets/india_weather_data.csv'
    
    if not os.path.exists(data_path):
        print(f"❌ Error: Dataset not found at {data_path}")
        print("   Please ensure the CSV file is in the correct location.")
        return
    
    # Initialize trainer
    trainer = HeatwaveModelTrainer(data_path)
    
    # Step 1: Load data
    df = trainer.load_and_prepare_data()
    
    # Step 2: Engineer features
    df = trainer.engineer_features(df)
    
    # Step 3: Select features
    trainer.select_features(df)
    
    # Step 4: Prepare train/test split
    X_train, X_test, y_train, y_test = trainer.prepare_train_test_split(df)
    
    # Step 5: Train model (try both and compare)
    print("\n" + "=" * 60)
    print("TRAINING RANDOM FOREST MODEL")
    print("=" * 60)
    trainer.train_model(X_train, y_train, model_type='random_forest')
    
    # Step 6: Evaluate model
    accuracy, roc_auc = trainer.evaluate_model(X_test, y_test)
    
    # Step 7: Save model
    trainer.save_model(
        model_path='heatwave_model.pkl',
        scaler_path='heatwave_scaler.pkl'
    )
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\n📊 Final Results:")
    print(f"   - Accuracy: {accuracy*100:.2f}%")
    print(f"   - ROC-AUC: {roc_auc:.4f}")
    print(f"\n💡 Model files created:")
    print(f"   1. heatwave_model.pkl - Trained classifier")
    print(f"   2. heatwave_scaler.pkl - Feature scaler")
    print(f"   3. heatwave_features.pkl - Feature configuration")
    print(f"\n🚀 You can now use this model for real-time heatwave prediction!")


if __name__ == "__main__":
    main()
