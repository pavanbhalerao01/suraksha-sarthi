"""
Heatwave Risk Prediction Module
Uses trained model to predict heatwave risk from current weather data
"""

import joblib
import numpy as np
import pandas as pd
from datetime import datetime

class HeatwavePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = []
        self.feature_importance = {}
        
    def load_model(self, 
                   model_path='heatwave_model.pkl',
                   scaler_path='heatwave_scaler.pkl',
                   features_path='heatwave_features.pkl'):
        """Load trained model, scaler, and feature configuration"""
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            
            feature_config = joblib.load(features_path)
            self.feature_columns = feature_config['feature_columns']
            self.feature_importance = feature_config['feature_importance']
            
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def prepare_features(self, weather_data):
        """
        Prepare features from raw weather data
        
        Parameters:
        -----------
        weather_data : dict
            Dictionary containing weather parameters:
            - temperature (current temp in °C)
            - max_temperature
            - min_temperature  
            - humidity (current humidity %)
            - max_humidity
            - min_humidity
            - wind_speed (km/h)
            - pressure (hPa)
            - rainfall (mm)
            - solar_radiation (W/m²)
            - uv_index
            - cloud_cover (%)
            - dew_point (°C)
            - visibility (km)
            - precipitation_probability (%)
            - date (datetime object or string)
        
        Returns:
        --------
        pandas.DataFrame : Feature vector ready for prediction
        """
        
        # Handle date
        if isinstance(weather_data.get('date'), str):
            date = pd.to_datetime(weather_data['date'])
        else:
            date = weather_data.get('date', datetime.now())
        
        # Extract temporal features
        month = date.month
        day_of_year = date.timetuple().tm_yday
        hour = date.hour
        
        # Calculate temperature features
        max_temp = weather_data.get('max_temperature', weather_data.get('temperature', 30))
        min_temp = weather_data.get('min_temperature', weather_data.get('temperature', 25))
        avg_temp = (max_temp + min_temp) / 2
        temp_range = max_temp - min_temp
        temp_anomaly = max_temp - 32  # Assume normal max is 32°C (can be improved)
        
        # Calculate humidity features
        max_hum = weather_data.get('max_humidity', weather_data.get('humidity', 70))
        min_hum = weather_data.get('min_humidity', weather_data.get('humidity', 50))
        avg_hum = (max_hum + min_hum) / 2
        humidity_range = max_hum - min_hum
        
        # Heat index (simplified)
        heat_index = avg_temp + (0.5 * (avg_hum - 50))
        
        # Solar radiation threshold (75th percentile ~ 700 W/m²)
        solar_rad = weather_data.get('solar_radiation', 500)
        high_solar_radiation = 1 if solar_rad > 700 else 0
        
        # Wind cooling effect
        wind = weather_data.get('wind_speed', 10)
        wind_cooling = wind * (max_temp - 25)
        
        # Pressure stability
        pressure = weather_data.get('pressure', 1013)
        pressure_stable = 1 if pressure > 1010 else 0
        
        # Create feature dictionary
        features = {
            'max_temperature': max_temp,
            'min_temperature': min_temp,
            'avg_temperature': avg_temp,
            'temp_range': temp_range,
            'temp_anomaly': temp_anomaly,
            
            'max_humidity': max_hum,
            'min_humidity': min_hum,
            'avg_humidity': avg_hum,
            'humidity_range': humidity_range,
            
            'solar_radiation': solar_rad,
            'uv_index': weather_data.get('uv_index', 5),
            'high_solar_radiation': high_solar_radiation,
            
            'wind_speed': wind,
            'wind_cooling': wind_cooling,
            
            'pressure_surface_level': pressure,
            'pressure_stable': pressure_stable,
            'dew_point': weather_data.get('dew_point', avg_temp - 5),
            'cloud_cover': weather_data.get('cloud_cover', 30),
            
            'rainfall': weather_data.get('rainfall', 0),
            'precipitation_probability': weather_data.get('precipitation_probability', 20),
            
            'month': month,
            'day_of_year': day_of_year,
            'hour': hour,
            
            'visibility': weather_data.get('visibility', 10),
            'heat_index': heat_index
        }
        
        # Convert to DataFrame with correct feature order
        df = pd.DataFrame([features])
        
        # Ensure all required features are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0  # Default value
        
        # Select only required features in correct order
        df = df[self.feature_columns]
        
        return df
    
    def predict(self, weather_data, show_features=False):
        """
        Predict heatwave risk from weather data
        
        Returns:
        --------
        dict : {
            'heatwave_risk': bool (True/False),
            'probability': float (0-1),
            'confidence': str ('Low', 'Medium', 'High'),
            'risk_factors': list of contributing factors,
            'features': dict (optional, if show_features=True)
        }
        """
        
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        # Prepare features
        features = self.prepare_features(weather_data)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        probability = self.model.predict_proba(features_scaled)[0][1]
        
        # Confidence level
        if probability < 0.3:
            confidence = 'Low'
        elif probability < 0.7:
            confidence = 'Medium'
        else:
            confidence = 'High'
        
        # Identify risk factors
        risk_factors = []
        
        # Temperature risks
        if weather_data.get('max_temperature', 0) > 40:
            risk_factors.append("🌡️ Extreme Temperature (>40°C)")
        elif weather_data.get('max_temperature', 0) > 35:
            risk_factors.append("🌡️ High Temperature (>35°C)")
        
        # Humidity risks
        if weather_data.get('humidity', 50) < 30:
            risk_factors.append("💧 Low Humidity (<30%)")
        elif weather_data.get('humidity', 50) > 70:
            risk_factors.append("💧 High Humidity (>70% - increases heat index)")
        
        # Solar radiation
        if weather_data.get('solar_radiation', 0) > 800:
            risk_factors.append("☀️ Intense Solar Radiation")
        
        # UV Index
        if weather_data.get('uv_index', 0) > 8:
            risk_factors.append("☀️ Very High UV Index")
        
        # Wind
        if weather_data.get('wind_speed', 0) < 5:
            risk_factors.append("💨 Low Wind (reduced cooling)")
        
        # Cloud cover
        if weather_data.get('cloud_cover', 0) < 20:
            risk_factors.append("☁️ Clear Skies (maximum sun exposure)")
        
        result = {
            'heatwave_risk': bool(prediction),
            'probability': float(probability),
            'confidence': confidence,
            'risk_factors': risk_factors,
            'risk_score': int(probability * 100)
        }
        
        # Add feature values if requested
        if show_features:
            result['features'] = features.iloc[0].to_dict()
        
        return result
    
    def batch_predict(self, weather_data_list):
        """Predict heatwave risk for multiple locations"""
        results = []
        for data in weather_data_list:
            result = self.predict(data)
            result['location'] = data.get('location', 'Unknown')
            results.append(result)
        return results


# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = HeatwavePredictor()
    
    # Load trained model
    if predictor.load_model():
        print("✅ Model loaded successfully!")
        
        # Example weather data
        test_data = {
            'location': 'Pune',
            'date': datetime.now(),  # Current date and time
            'temperature': 32,
            'max_temperature': 34,
            'min_temperature': 22,
            'humidity': 45,
            'max_humidity': 60,
            'min_humidity': 30,
            'wind_speed': 15,
            'pressure': 1012,
            'rainfall': 0,
            'solar_radiation': 720,
            'uv_index': 8,
            'cloud_cover': 25,
            'dew_point': 18,
            'visibility': 10,
            'precipitation_probability': 10
        }
        
        # Predict
        result = predictor.predict(test_data, show_features=True)
        
        print("\n" + "="*50)
        print(f"🌡️ HEATWAVE RISK ASSESSMENT: {test_data['location']}")
        print("="*50)
        print(f"Heatwave Risk: {'🔴 YES' if result['heatwave_risk'] else '🟢 NO'}")
        print(f"Probability: {result['probability']:.2%}")
        print(f"Confidence: {result['confidence']}")
        print(f"Risk Score: {result['risk_score']}/100")
        print(f"\nRisk Factors:")
        for factor in result['risk_factors']:
            print(f"  - {factor}")
        
        # Display features used for prediction
        if 'features' in result:
            print(f"\n{'='*50}")
            print("📊 FEATURES USED FOR PREDICTION")
            print(f"{'='*50}")
            
            # Group features by category
            temp_features = {}
            humidity_features = {}
            solar_features = {}
            wind_features = {}
            pressure_features = {}
            temporal_features = {}
            other_features = {}
            
            for feature, value in result['features'].items():
                if 'temp' in feature.lower():
                    temp_features[feature] = value
                elif 'humid' in feature.lower():
                    humidity_features[feature] = value
                elif 'solar' in feature.lower() or 'uv' in feature.lower():
                    solar_features[feature] = value
                elif 'wind' in feature.lower():
                    wind_features[feature] = value
                elif 'pressure' in feature.lower():
                    pressure_features[feature] = value
                elif feature in ['month', 'day_of_year', 'hour']:
                    temporal_features[feature] = value
                else:
                    other_features[feature] = value
            
            # Display by category
            if temp_features:
                print("\n🌡️ Temperature Features:")
                for feature, value in temp_features.items():
                    print(f"   {feature}: {value:.2f}")
            
            if humidity_features:
                print("\n💧 Humidity Features:")
                for feature, value in humidity_features.items():
                    print(f"   {feature}: {value:.2f}")
            
            if solar_features:
                print("\n☀️ Solar/UV Features:")
                for feature, value in solar_features.items():
                    print(f"   {feature}: {value:.2f}")
            
            if wind_features:
                print("\n💨 Wind Features:")
                for feature, value in wind_features.items():
                    print(f"   {feature}: {value:.2f}")
            
            if pressure_features:
                print("\n🌀 Pressure Features:")
                for feature, value in pressure_features.items():
                    print(f"   {feature}: {value:.2f}")
            
            if temporal_features:
                print("\n📅 Temporal Features:")
                for feature, value in temporal_features.items():
                    print(f"   {feature}: {value:.0f}")
            
            if other_features:
                print("\n📋 Other Features:")
                for feature, value in other_features.items():
                    print(f"   {feature}: {value:.2f}")
            
            print(f"{'='*50}")
    else:
        print("❌ Failed to load model. Please train the model first.")
