"""
Forest Fire Risk Prediction Module
Uses trained model to predict forest fire risk from current weather and environmental data
"""

import joblib
import numpy as np
import pandas as pd
from datetime import datetime

class ForestFirePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = []
        
    def load_model(self, 
                   model_path='fire_occurrence_model.pkl',
                   scaler_path='fire_occurrence_scaler.pkl',
                   features_path='fire_occurrence_features.pkl'):
        """Load trained model, scaler, and feature configuration"""
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            
            feature_config = joblib.load(features_path)
            self.feature_columns = feature_config['feature_columns']
            
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def prepare_features(self, weather_data):
        """
        Prepare features from raw weather data for forest fire prediction
        
        Parameters:
        -----------
        weather_data : dict
            Dictionary containing weather parameters:
            - temperature (current temp in °C)
            - max_temperature
            - min_temperature  
            - humidity (current humidity %)
            - wind_speed (km/h or m/s)
            - pressure (hPa)
            - rainfall (mm)
            - cloud_cover (%)
            - dew_point (°C)
            - visibility (km)
            - date (datetime object or string)
            - days_since_rain (optional, calculated if not provided)
        
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
        
        # Temperature features
        temp = weather_data.get('temperature', weather_data.get('max_temperature', 30))
        max_temp = weather_data.get('max_temperature', temp)
        min_temp = weather_data.get('min_temperature', temp - 8)
        avg_temp = (max_temp + min_temp) / 2
        temp_range = max_temp - min_temp
        
        # Humidity features
        humidity = weather_data.get('humidity', 50)
        
        # Wind features (convert to m/s if needed)
        wind_speed = weather_data.get('wind_speed', 5)
        # If wind speed looks like km/h (typically > 20), convert to m/s
        if wind_speed > 20:
            wind_speed = wind_speed / 3.6
        
        # Rainfall and drought index
        rainfall = weather_data.get('rainfall', 0)
        days_since_rain = weather_data.get('days_since_rain', 0 if rainfall > 0 else 5)
        
        # Dryness index (higher = drier conditions = more fire risk)
        dryness_index = (100 - humidity) * (1 + days_since_rain / 30)
        
        # Fire Weather Index (FWI) components (simplified)
        # Higher temp, lower humidity, higher wind = higher risk
        fire_weather_index = (max_temp / 50) * ((100 - humidity) / 100) * (wind_speed / 10)
        
        # Drought severity (longer without rain = worse)
        if days_since_rain > 30:
            drought_severity = 3  # Severe
        elif days_since_rain > 14:
            drought_severity = 2  # Moderate
        elif days_since_rain > 7:
            drought_severity = 1  # Mild
        else:
            drought_severity = 0  # None
        
        # Atmospheric stability
        pressure = weather_data.get('pressure', 1013)
        cloud_cover = weather_data.get('cloud_cover', 30)
        
        # Vegetation dryness (estimated from weather conditions)
        vegetation_dryness = min(100, dryness_index * (1 + max_temp / 100))
        
        # Create feature dictionary
        features = {
            'temperature': temp,
            'max_temperature': max_temp,
            'min_temperature': min_temp,
            'avg_temperature': avg_temp,
            'temp_range': temp_range,
            
            'humidity': humidity,
            'dryness_index': dryness_index,
            
            'wind_speed': wind_speed,
            
            'rainfall': rainfall,
            'days_since_rain': days_since_rain,
            'drought_severity': drought_severity,
            
            'fire_weather_index': fire_weather_index,
            'vegetation_dryness': vegetation_dryness,
            
            'pressure': pressure,
            'cloud_cover': cloud_cover,
            'dew_point': weather_data.get('dew_point', avg_temp - 5),
            'visibility': weather_data.get('visibility', 10),
            
            'month': month,
            'day_of_year': day_of_year,
            'hour': hour
        }
        
        # Convert to DataFrame
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
        Predict forest fire risk from weather data
        
        Returns:
        --------
        dict : {
            'fire_risk': bool (True/False),
            'probability': float (0-1),
            'confidence': str ('Low', 'Medium', 'High'),
            'risk_factors': list of contributing factors,
            'fire_danger_rating': str ('Low', 'Moderate', 'High', 'Very High', 'Extreme'),
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
        
        # Fire Danger Rating (based on probability and conditions)
        if probability >= 0.8:
            fire_danger_rating = 'Extreme'
        elif probability >= 0.6:
            fire_danger_rating = 'Very High'
        elif probability >= 0.4:
            fire_danger_rating = 'High'
        elif probability >= 0.2:
            fire_danger_rating = 'Moderate'
        else:
            fire_danger_rating = 'Low'
        
        # Identify risk factors
        risk_factors = []
        
        # Temperature risks
        if weather_data.get('max_temperature', 0) > 40:
            risk_factors.append("🌡️ Extreme Heat (>40°C)")
        elif weather_data.get('max_temperature', 0) > 35:
            risk_factors.append("🌡️ High Temperature (>35°C)")
        
        # Humidity risks
        if weather_data.get('humidity', 50) < 20:
            risk_factors.append("💧 Very Low Humidity (<20%)")
        elif weather_data.get('humidity', 50) < 30:
            risk_factors.append("💧 Low Humidity (<30%)")
        
        # Wind risks
        wind_speed = weather_data.get('wind_speed', 0)
        if wind_speed > 20:  # This is already in m/s if converted
            if wind_speed > 20:  # Fallback check
                wind_speed = wind_speed / 3.6 if wind_speed > 30 else wind_speed
            risk_factors.append(f"💨 High Winds ({wind_speed:.1f} m/s)")
        elif wind_speed > 10:
            risk_factors.append(f"💨 Moderate Winds ({wind_speed:.1f} m/s)")
        
        # Drought/Rainfall
        days_since_rain = weather_data.get('days_since_rain', 0)
        if days_since_rain > 30:
            risk_factors.append(f"☀️ Extreme Drought ({days_since_rain} days without rain)")
        elif days_since_rain > 14:
            risk_factors.append(f"☀️ Prolonged Dry Period ({days_since_rain} days)")
        elif days_since_rain > 7:
            risk_factors.append(f"☀️ Dry Conditions ({days_since_rain} days)")
        
        # Cloud cover
        if weather_data.get('cloud_cover', 0) < 10:
            risk_factors.append("☁️ Clear Skies (maximum sun exposure)")
        
        result = {
            'fire_risk': bool(prediction),
            'probability': float(probability),
            'confidence': confidence,
            'fire_danger_rating': fire_danger_rating,
            'risk_factors': risk_factors,
            'risk_score': int(probability * 100)
        }
        
        # Add feature values if requested
        if show_features:
            result['features'] = features.iloc[0].to_dict()
        
        return result
    
    def batch_predict(self, weather_data_list):
        """Predict forest fire risk for multiple locations"""
        results = []
        for data in weather_data_list:
            result = self.predict(data)
            result['location'] = data.get('location', 'Unknown')
            results.append(result)
        return results


# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = ForestFirePredictor()
    
    # Load trained model
    if predictor.load_model():
        print("✅ Forest Fire Model loaded successfully!")
        
        # Example weather data (dry, hot conditions)
        test_data = {
            'location': 'Nagpur Forest Area',
            'date': datetime.now(),
            'temperature': 38,
            'max_temperature': 42,
            'min_temperature': 28,
            'humidity': 25,
            'wind_speed': 18,  # km/h
            'pressure': 1010,
            'rainfall': 0,
            'days_since_rain': 21,
            'cloud_cover': 15,
            'dew_point': 12,
            'visibility': 10
        }
        
        # Predict
        result = predictor.predict(test_data, show_features=True)
        
        print("\n" + "="*50)
        print(f"🔥 FOREST FIRE RISK ASSESSMENT: {test_data['location']}")
        print("="*50)
        print(f"Fire Risk: {'🔴 YES' if result['fire_risk'] else '🟢 NO'}")
        print(f"Probability: {result['probability']:.2%}")
        print(f"Confidence: {result['confidence']}")
        print(f"Fire Danger Rating: {result['fire_danger_rating']}")
        print(f"Risk Score: {result['risk_score']}/100")
        print(f"\nRisk Factors:")
        for factor in result['risk_factors']:
            print(f"  - {factor}")
        
        # Display features
        if 'features' in result:
            print(f"\n{'='*50}")
            print("📊 FEATURES USED FOR PREDICTION")
            print(f"{'='*50}")
            
            for feature, value in result['features'].items():
                print(f"   {feature}: {value:.2f}")
            
            print(f"{'='*50}")
    else:
        print("❌ Failed to load model. Please check model files exist:")
        print("  - fire_occurrence_model.pkl")
        print("  - fire_occurrence_scaler.pkl")
        print("  - fire_occurrence_features.pkl")
