"""
Real Weather Data Service
Fetches actual weather data from OpenWeatherMap API
Only generates flood predictions when real meteorological risk exists
"""

import os
import requests
import logging
from typing import Dict, Optional, List
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class WeatherService:
    """
    Fetches REAL weather data from OpenWeatherMap
    Returns None if no API key or no data available
    """
    
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY', '')
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
        if not self.api_key:
            logger.warning("⚠️  No OpenWeatherMap API key found. Set OPENWEATHER_API_KEY in .env")
            logger.warning("⚠️  Get free API key: https://openweathermap.org/api")
        else:
            logger.info("✅ OpenWeatherMap API configured")
    
    def get_current_weather(self, lat: float, lon: float, location_name: str) -> Optional[Dict]:
        """
        Fetch REAL current weather data
        Returns None if API not configured or request fails
        """
        if not self.api_key:
            return None
        
        try:
            url = f"{self.base_url}/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract real data
                weather = {
                    "location": location_name,
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "rainfall_1h": data.get("rain", {}).get("1h", 0),  # mm in last hour
                    "rainfall_3h": data.get("rain", {}).get("3h", 0),  # mm in last 3 hours
                    "weather_main": data["weather"][0]["main"],
                    "weather_description": data["weather"][0]["description"],
                    "clouds": data["clouds"]["all"],
                    "wind_speed": data["wind"]["speed"],
                    "timestamp": datetime.now().isoformat(),
                    "source": "OpenWeatherMap (Real Data)"
                }
                
                logger.info(f"✅ Real weather data fetched for {location_name}")
                return weather
                
            else:
                logger.warning(f"⚠️  Weather API returned {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error fetching weather: {e}")
            return None
    
    def get_forecast(self, lat: float, lon: float) -> Optional[Dict]:
        """
        Fetch 5-day weather forecast (REAL data)
        Returns None if API not configured
        """
        if not self.api_key:
            return None
        
        try:
            url = f"{self.base_url}/forecast"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Forecast data fetched")
                return data
            else:
                return None
                
        except Exception as e:
            logger.error(f"❌ Error fetching forecast: {e}")
            return None
    
    def assess_flood_risk(self, weather_data: Dict) -> Dict:
        """
        Assess if there's ACTUAL flood risk based on REAL weather data
        Uses meteorological thresholds
        """
        if not weather_data:
            return {
                "has_risk": False,
                "reason": "No real weather data available"
            }
        
        rainfall_1h = weather_data.get("rainfall_1h", 0)
        rainfall_3h = weather_data.get("rainfall_3h", 0)
        weather_main = weather_data.get("weather_main", "")
        
        # Real meteorological thresholds for flood risk
        # Based on IMD (India Meteorological Department) guidelines
        heavy_rain_threshold = 64.5  # mm in 24h (Heavy rain)
        very_heavy_rain_threshold = 115.6  # mm in 24h (Very heavy rain)
        extremely_heavy_rain_threshold = 204.4  # mm in 24h (Extremely heavy rain)
        
        # Estimate 24h rainfall from current data
        estimated_24h_rainfall = rainfall_3h * 8  # Rough estimate
        
        # Check for flood risk
        if estimated_24h_rainfall >= extremely_heavy_rain_threshold:
            return {
                "has_risk": True,
                "severity": "CRITICAL",
                "reason": f"Extremely heavy rainfall detected: {estimated_24h_rainfall:.1f}mm/24h",
                "rainfall_24h": estimated_24h_rainfall
            }
        elif estimated_24h_rainfall >= very_heavy_rain_threshold:
            return {
                "has_risk": True,
                "severity": "HIGH",
                "reason": f"Very heavy rainfall detected: {estimated_24h_rainfall:.1f}mm/24h",
                "rainfall_24h": estimated_24h_rainfall
            }
        elif estimated_24h_rainfall >= heavy_rain_threshold:
            return {
                "has_risk": True,
                "severity": "MODERATE",
                "reason": f"Heavy rainfall detected: {estimated_24h_rainfall:.1f}mm/24h",
                "rainfall_24h": estimated_24h_rainfall
            }
        elif "Rain" in weather_main or "Thunderstorm" in weather_main:
            return {
                "has_risk": True,
                "severity": "LOW",
                "reason": f"Active rainfall: {weather_main}",
                "rainfall_24h": estimated_24h_rainfall
            }
        else:
            return {
                "has_risk": False,
                "reason": f"No significant rainfall. Current: {rainfall_3h}mm/3h",
                "rainfall_24h": estimated_24h_rainfall
            }

# Monitoring stations with coordinates (for real API calls)
MONITORING_STATIONS = [
    {
        "location": "Kaziranga",
        "state": "Assam",
        "district": "Kaziranga",
        "river_name": "Brahmaputra",
        "lat": 26.5775,
        "lon": 93.1711
    },
    {
        "location": "Patna",
        "state": "Bihar",
        "district": "Patna",
        "river_name": "Ganges",
        "lat": 25.5941,
        "lon": 85.1376
    },
    {
        "location": "Varanasi",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "river_name": "Ganges",
        "lat": 25.3176,
        "lon": 82.9739
    },
    {
        "location": "Cuttack",
        "state": "Odisha",
        "district": "Cuttack",
        "river_name": "Mahanadi",
        "lat": 20.5000,
        "lon": 85.8833
    },
    {
        "location": "Guwahati",
        "state": "Assam",
        "district": "Guwahati",
        "river_name": "Brahmaputra",
        "lat": 26.1445,
        "lon": 91.7362
    }
]
