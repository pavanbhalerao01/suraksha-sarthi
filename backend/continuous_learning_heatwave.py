"""
Continuous Learning System for Heatwave Prediction
Collects data, validates, and retrains model periodically
"""

import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import shutil
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import json
import time

class ContinuousLearningSystem:
    def __init__(self, 
                 base_dataset_path='../datasets/india_weather_data.csv',
                 new_data_path='../datasets/collected_weather_data.csv',
                 model_dir='models/heatwave',
                 retrain_interval_hours=168):  # 1 week
        
        self.base_dataset_path = base_dataset_path
        self.new_data_path = new_data_path
        self.model_dir = model_dir
        self.retrain_interval = retrain_interval_hours * 3600  # Convert to seconds
        
        # Create directories
        os.makedirs(model_dir, exist_ok=True)
        os.makedirs(os.path.dirname(new_data_path), exist_ok=True)
        
        # Metadata file
        self.metadata_path = os.path.join(model_dir, 'training_metadata.json')
        
        # Initialize new data collection file if doesn't exist
        if not os.path.exists(new_data_path):
            self._initialize_collection_file()
    
    def _initialize_collection_file(self):
        """Create empty CSV with correct columns"""
        columns = [
            'date', 'latitude', 'longitude', 'wind_speed', 'cloud_cover',
            'precipitation_probability', 'pressure_surface_level', 'dew_point',
            'uv_index', 'heatwave', 'visibility', 'rainfall', 'solar_radiation',
            'snowfall', 'max_temperature', 'min_temperature', 'max_humidity',
            'min_humidity', 'data_source', 'verified'
        ]
        df = pd.DataFrame(columns=columns)
        df.to_csv(self.new_data_path, index=False)
        print(f"✅ Initialized collection file: {self.new_data_path}")
    
    def collect_weather_data(self, weather_data, location_name='Unknown'):
        """
        Collect weather data with automatic labeling
        
        Parameters:
        -----------
        weather_data : dict
            Weather parameters from API/sensors
        location_name : str
            Location identifier
        
        Returns:
        --------
        bool : Success status
        """
        try:
            # Auto-label heatwave using conservative rules
            heatwave_label = self._auto_label_heatwave(weather_data)
            
            # Prepare data row
            data_row = {
                'date': weather_data.get('date', datetime.now().isoformat()),
                'latitude': weather_data.get('latitude', 0),
                'longitude': weather_data.get('longitude', 0),
                'wind_speed': weather_data.get('wind_speed', np.nan),
                'cloud_cover': weather_data.get('cloud_cover', np.nan),
                'precipitation_probability': weather_data.get('precipitation_probability', np.nan),
                'pressure_surface_level': weather_data.get('pressure', np.nan),
                'dew_point': weather_data.get('dew_point', np.nan),
                'uv_index': weather_data.get('uv_index', np.nan),
                'heatwave': heatwave_label,
                'visibility': weather_data.get('visibility', np.nan),
                'rainfall': weather_data.get('rainfall', np.nan),
                'solar_radiation': weather_data.get('solar_radiation', np.nan),
                'snowfall': 0.0,
                'max_temperature': weather_data.get('max_temperature', np.nan),
                'min_temperature': weather_data.get('min_temperature', np.nan),
                'max_humidity': weather_data.get('max_humidity', np.nan),
                'min_humidity': weather_data.get('min_humidity', np.nan),
                'data_source': f'auto_collected_{location_name}',
                'verified': False  # Manual verification pending
            }
            
            # Append to CSV
            df = pd.DataFrame([data_row])
            df.to_csv(self.new_data_path, mode='a', header=False, index=False)
            
            print(f"✅ Collected data for {location_name} - Heatwave: {heatwave_label}")
            return True
            
        except Exception as e:
            print(f"❌ Error collecting data: {e}")
            return False
    
    def _auto_label_heatwave(self, weather_data):
        """
        Conservative heatwave labeling rules
        Based on IMD (India Meteorological Department) criteria
        
        Heatwave criteria:
        - Plains: Max temp >= 40°C and 4.5-6.4°C above normal OR >= 45°C
        - Coastal: Max temp >= 37°C and 4.5-6.4°C above normal OR >= 40°C
        """
        max_temp = weather_data.get('max_temperature', 0)
        
        # Simplified rule (can be improved with location-specific normals)
        if max_temp >= 45:  # Severe heatwave
            return 1.0
        elif max_temp >= 40 and weather_data.get('humidity', 50) < 40:
            return 1.0  # Dry heat
        else:
            return 0.0
    
    def should_retrain(self):
        """Check if it's time to retrain the model"""
        if not os.path.exists(self.metadata_path):
            return True  # First time
        
        try:
            with open(self.metadata_path, 'r') as f:
                metadata = json.load(f)
            
            last_training = datetime.fromisoformat(metadata['last_training_time'])
            time_since_training = (datetime.now() - last_training).total_seconds()
            
            # Check new data count
            new_data = pd.read_csv(self.new_data_path)
            new_samples = len(new_data)
            
            print(f"📊 Time since last training: {time_since_training/3600:.1f} hours")
            print(f"📊 New samples collected: {new_samples}")
            
            # Retrain if enough time passed OR significant new data
            return (time_since_training >= self.retrain_interval) or (new_samples >= 1000)
            
        except Exception as e:
            print(f"⚠️ Error checking retrain status: {e}")
            return False
    
    def validate_new_data(self):
        """
        Validate collected data before merging
        
        Returns:
        --------
        tuple : (valid_df, invalid_count)
        """
        try:
            df = pd.read_csv(self.new_data_path)
            
            if len(df) == 0:
                print("⚠️ No new data to validate")
                return None, 0
            
            print(f"📊 Validating {len(df)} new samples...")
            
            # Validation rules
            valid_mask = (
                (df['max_temperature'].notna()) &
                (df['max_temperature'] > 0) &
                (df['max_temperature'] < 60) &  # Physically reasonable
                (df['min_temperature'].notna()) &
                (df['max_temperature'] >= df['min_temperature']) &  # Logical consistency
                (df['heatwave'].isin([0.0, 1.0]))  # Valid labels
            )
            
            valid_df = df[valid_mask].copy()
            invalid_count = len(df) - len(valid_df)
            
            print(f"✅ Valid samples: {len(valid_df)}")
            print(f"❌ Invalid samples: {invalid_count}")
            
            return valid_df, invalid_count
            
        except Exception as e:
            print(f"❌ Validation error: {e}")
            return None, 0
    
    def retrain_model(self, min_accuracy_threshold=0.90):
        """
        Retrain model with combined dataset
        Only deploy if accuracy is maintained
        
        Returns:
        --------
        dict : Training results
        """
        print("\n" + "="*60)
        print("🔄 STARTING MODEL RETRAINING")
        print("="*60)
        
        try:
            # Step 1: Load base dataset
            print("\n1️⃣ Loading base dataset...")
            base_df = pd.read_csv(self.base_dataset_path)
            print(f"   Base samples: {len(base_df)}")
            
            # Step 2: Validate and load new data
            print("\n2️⃣ Validating new data...")
            new_df, invalid_count = self.validate_new_data()
            
            if new_df is None or len(new_df) < 50:
                print("⚠️ Insufficient valid new data. Skipping retraining.")
                return {'status': 'skipped', 'reason': 'insufficient_data'}
            
            # Step 3: Merge datasets
            print("\n3️⃣ Merging datasets...")
            combined_df = pd.concat([base_df, new_df], ignore_index=True)
            print(f"   Combined samples: {len(combined_df)}")
            print(f"   Heatwave ratio: {combined_df['heatwave'].mean():.2%}")
            
            # Step 4: Train new model (using same code as train_heatwave_model.py)
            print("\n4️⃣ Training new model...")
            new_model, new_scaler, metrics = self._train_model_pipeline(combined_df)
            
            # Step 5: Validation check
            print("\n5️⃣ Validating new model performance...")
            current_accuracy = metrics['accuracy']
            
            if current_accuracy < min_accuracy_threshold:
                print(f"❌ New model accuracy ({current_accuracy:.2%}) below threshold ({min_accuracy_threshold:.2%})")
                print("   Retraining failed. Keeping old model.")
                return {'status': 'failed', 'reason': 'low_accuracy', 'accuracy': current_accuracy}
            
            # Step 6: Backup old model
            print("\n6️⃣ Backing up old model...")
            self._backup_model()
            
            # Step 7: Deploy new model
            print("\n7️⃣ Deploying new model...")
            joblib.dump(new_model, 'heatwave_model.pkl')
            joblib.dump(new_scaler, 'heatwave_scaler.pkl')
            
            # Also save to model directory
            joblib.dump(new_model, os.path.join(self.model_dir, 'heatwave_model.pkl'))
            joblib.dump(new_scaler, os.path.join(self.model_dir, 'heatwave_scaler.pkl'))
            
            # Save metadata
            existing_metadata = {}
            if os.path.exists(self.metadata_path):
                with open(self.metadata_path, 'r') as f:
                    existing_metadata = json.load(f)
            
            metadata = {
                'last_training_time': datetime.now().isoformat(),
                'total_samples': len(combined_df),
                'new_samples_added': len(new_df),
                'accuracy': current_accuracy,
                'roc_auc': metrics['roc_auc'],
                'model_version': existing_metadata.get('model_version', 0) + 1
            }
            
            with open(self.metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            # Archive new data to base dataset
            combined_df.to_csv(self.base_dataset_path, index=False)
            
            # Clear collection file
            self._initialize_collection_file()
            
            print("\n✅ MODEL RETRAINING SUCCESSFUL!")
            print(f"   Accuracy: {current_accuracy:.2%}")
            print(f"   ROC-AUC: {metrics['roc_auc']:.4f}")
            print(f"   Model Version: {metadata['model_version']}")
            
            return {'status': 'success', 'metrics': metrics, 'metadata': metadata}
            
        except Exception as e:
            print(f"\n❌ RETRAINING FAILED: {e}")
            import traceback
            traceback.print_exc()
            return {'status': 'error', 'error': str(e)}
    
    def _train_model_pipeline(self, df):
        """Core training logic (extracted from train_heatwave_model.py)"""
        # Feature engineering (same as before)
        df['avg_temperature'] = (df['max_temperature'] + df['min_temperature']) / 2
        df['temp_range'] = df['max_temperature'] - df['min_temperature']
        df['avg_humidity'] = (df['max_humidity'] + df['min_humidity']) / 2
        df['humidity_range'] = df['max_humidity'] - df['min_humidity']
        df['temp_anomaly'] = df['max_temperature'] - 32
        df['heat_index'] = df['avg_temperature'] + (0.5 * (df['avg_humidity'] - 50))
        
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df['month'] = df['date'].dt.month
        df['day_of_year'] = df['date'].dt.dayofyear
        df['hour'] = df['date'].dt.hour
        
        df['high_solar_radiation'] = (df['solar_radiation'] > 700).astype(int)
        df['wind_cooling'] = df['wind_speed'] * (df['max_temperature'] - 25)
        df['pressure_stable'] = (df['pressure_surface_level'] > 1010).astype(int)
        
        # Features
        feature_columns = [
            'max_temperature', 'min_temperature', 'avg_temperature', 'temp_range', 'temp_anomaly',
            'max_humidity', 'min_humidity', 'avg_humidity', 'humidity_range',
            'solar_radiation', 'uv_index', 'high_solar_radiation',
            'wind_speed', 'wind_cooling',
            'pressure_surface_level', 'pressure_stable', 'dew_point', 'cloud_cover',
            'rainfall', 'precipitation_probability',
            'month', 'day_of_year', 'hour',
            'visibility', 'heat_index'
        ]
        
        # Prepare data
        df_clean = df.dropna(subset=['heatwave'])
        X = df_clean[feature_columns].fillna(df_clean[feature_columns].median())
        y = df_clean['heatwave']
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Scale
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced',
            verbose=0
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        print(f"   ✅ Training complete - Accuracy: {accuracy:.2%}, ROC-AUC: {roc_auc:.4f}")
        
        # Save feature config
        feature_config = {
            'feature_columns': feature_columns,
            'feature_importance': dict(zip(feature_columns, model.feature_importances_))
        }
        joblib.dump(feature_config, 'heatwave_features.pkl')
        joblib.dump(feature_config, os.path.join(self.model_dir, 'heatwave_features.pkl'))
        
        metrics = {
            'accuracy': accuracy,
            'roc_auc': roc_auc,
            'feature_columns': feature_columns
        }
        
        return model, scaler, metrics
    
    def _backup_model(self):
        """Backup current model before replacing"""
        backup_dir = os.path.join(self.model_dir, 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Backup from current directory
        model_path = 'heatwave_model.pkl'
        if os.path.exists(model_path):
            backup_path = os.path.join(backup_dir, f'heatwave_model_{timestamp}.pkl')
            shutil.copy(model_path, backup_path)
            print(f"   Backed up model to: {backup_path}")
    
    def run_continuous_learning_loop(self, check_interval_hours=24):
        """
        Run continuous learning loop
        Check every N hours if retraining is needed
        """
        print("🔄 Starting Continuous Learning System...")
        print(f"   Check interval: {check_interval_hours} hours")
        print(f"   Retrain interval: {self.retrain_interval/3600} hours")
        
        while True:
            try:
                print(f"\n⏰ [{datetime.now()}] Checking if retraining needed...")
                
                if self.should_retrain():
                    print("✅ Retraining triggered!")
                    result = self.retrain_model()
                    
                    if result['status'] == 'success':
                        print("🎉 Model updated successfully!")
                    else:
                        print(f"⚠️ Retraining {result['status']}: {result.get('reason', 'unknown')}")
                else:
                    print("⏭️ No retraining needed yet.")
                
                # Wait before next check
                print(f"💤 Sleeping for {check_interval_hours} hours...")
                time.sleep(check_interval_hours * 3600)
                
            except KeyboardInterrupt:
                print("\n🛑 Stopping continuous learning system...")
                break
            except Exception as e:
                print(f"❌ Error in continuous learning loop: {e}")
                time.sleep(3600)  # Wait 1 hour before retry


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Continuous Learning System for Heatwave Prediction')
    parser.add_argument('--mode', choices=['collect', 'retrain', 'loop'], required=True,
                        help='Mode: collect (add data), retrain (train now), loop (continuous)')
    parser.add_argument('--location', type=str, default='Test_Location',
                        help='Location name for data collection')
    
    args = parser.parse_args()
    
    # Initialize system
    system = ContinuousLearningSystem(
        retrain_interval_hours=168  # Retrain weekly
    )
    
    if args.mode == 'collect':
        # Example: Collect weather data
        sample_weather = {
            'date': datetime.now().isoformat(),
            'latitude': 28.6139,
            'longitude': 77.2090,
            'max_temperature': 42,
            'min_temperature': 30,
            'humidity': 35,
            'max_humidity': 45,
            'min_humidity': 25,
            'wind_speed': 12,
            'pressure': 1008,
            'rainfall': 0,
            'solar_radiation': 850,
            'uv_index': 10,
            'cloud_cover': 15,
            'dew_point': 20,
            'visibility': 8,
            'precipitation_probability': 5
        }
        
        system.collect_weather_data(sample_weather, args.location)
        
    elif args.mode == 'retrain':
        # Manual retrain trigger
        result = system.retrain_model()
        print(f"\nRetrain result: {result}")
        
    elif args.mode == 'loop':
        # Run continuous learning
        system.run_continuous_learning_loop(check_interval_hours=24)
