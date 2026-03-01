"""
Background Scheduler for Disaster Monitoring
Checks all Indian cities every hour for disaster risks
Caches predictions to avoid overwhelming weather API
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from weather_service import WeatherService
from disaster_predictor import DisasterPredictor
from indian_cities import INDIAN_CITIES

logger = logging.getLogger(__name__)

class DisasterMonitor:
    """
    Background monitoring system that checks all cities hourly
    Stores predictions in memory cache
    """
    
    def __init__(self):
        self.weather_service = WeatherService()
        self.disaster_predictor = DisasterPredictor()
        self.scheduler = AsyncIOScheduler()
        
        # Cache for predictions (updated hourly)
        self.cached_predictions: List[Dict] = []
        self.last_update: datetime = None
        self.cities_checked: int = 0
        self.risks_found: int = 0
        
        logger.info("Disaster Monitor initialized")
    
    async def initialize(self):
        """Initialize the monitoring system"""
        await self.disaster_predictor.load_models()
        logger.info("✅ Disaster Monitor ready")
    
    async def check_all_cities(self):
        """
        Check all Indian cities for disaster risks
        This runs every hour
        """
        logger.info("🔍 Starting hourly disaster check for all cities...")
        start_time = datetime.now()
        
        all_predictions = []
        cities_checked = 0
        risks_found = 0
        
        # If no API key, return empty results immediately
        if not self.weather_service.api_key:
            logger.warning("⚠️  No OpenWeatherMap API key. Skipping city checks.")
            self.cached_predictions = []
            self.last_update = datetime.now()
            self.cities_checked = 0
            self.risks_found = 0
            logger.info("✅ Check complete: No API key configured")
            return
        
        # Check tier-1 and tier-2 cities first (more important cities)
        # This reduces API calls from 100+ to ~35-40
        priority_cities = [city for city in INDIAN_CITIES if city.get("tier", 3) <= 2]
        logger.info(f"Checking {len(priority_cities)} priority cities (tier 1 & 2)...")
        
        # Check each city
        for city in priority_cities:
            try:
                # Fetch real weather data for this city
                weather_data = self.weather_service.get_current_weather(
                    city["lat"],
                    city["lon"],
                    city["name"]
                )
                
                if weather_data:
                    # Check all disaster types for this city
                    city_predictions = self.disaster_predictor.predict_all_disasters(
                        city,
                        weather_data
                    )
                    
                    if city_predictions:
                        all_predictions.extend(city_predictions)
                        risks_found += len(city_predictions)
                        logger.info(f"⚠️  {city['name']}: {len(city_predictions)} risk(s) detected")
                
                cities_checked += 1
                
                # Rate limiting: small delay between API calls to avoid hitting limits
                # Free tier OpenWeather allows 60 calls/minute
                if weather_data:  # Only delay if we actually made an API call
                    await asyncio.sleep(1.2)  # ~50 calls/minute to be safe
                
            except Exception as e:
                logger.error(f"Error checking {city['name']}: {e}")
                continue
        
        # Update cache
        self.cached_predictions = all_predictions
        self.last_update = datetime.now()
        self.cities_checked = cities_checked
        self.risks_found = risks_found
        
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"✅ Hourly check complete: {cities_checked} cities, {risks_found} risks found in {elapsed:.1f}s")
    
    def get_cached_predictions(self, disaster_type: str = None) -> Dict:
        """
        Get cached predictions
        If disaster_type specified, filter by that type
        Prioritizes Maharashtra cities (Mumbai, Pune first, then others)
        """
        predictions = self.cached_predictions
        
        if disaster_type and disaster_type != "all":
            predictions = [p for p in predictions if p["type"] == disaster_type]
        
        # Sort predictions: Maharashtra cities first (Mumbai #1, Pune #2, then others), then rest of India
        def get_priority(prediction):
            location = prediction.get("location", "")
            state = prediction.get("state", "")
            
            # Priority 1: Mumbai
            if location == "Mumbai":
                return 0
            # Priority 2: Pune
            elif location == "Pune":
                return 1
            # Priority 3: Other Maharashtra cities
            elif state == "Maharashtra":
                return 2
            # Priority 4: Rest of India
            else:
                return 3
        
        sorted_predictions = sorted(predictions, key=get_priority)
        
        return {
            "predictions": sorted_predictions,
            "total": len(sorted_predictions),
            "total_all_types": len(self.cached_predictions),
            "generated_at": self.last_update.isoformat() if self.last_update else None,
            "next_update": self.get_next_update_time(),
            "cities_monitored": len(INDIAN_CITIES),
            "cities_checked": self.cities_checked,
            "data_source": "OpenWeatherMap API (Real Data)" if self.weather_service.api_key else "No API configured"
        }
    
    def get_next_update_time(self) -> str:
        """Calculate when the next update will occur"""
        if self.last_update:
            from datetime import timedelta
            next_update = self.last_update + timedelta(hours=1)
            return next_update.isoformat()
        return "Pending first update"
    
    def start_monitoring(self):
        """Start the background scheduler"""
        # Run immediately on startup
        asyncio.create_task(self.check_all_cities())
        
        # Schedule hourly checks
        self.scheduler.add_job(
            self.check_all_cities,
            trigger=IntervalTrigger(hours=1),
            id='hourly_disaster_check',
            name='Hourly Disaster Check for All Cities',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("⏰ Hourly monitoring scheduler started")
    
    def stop_monitoring(self):
        """Stop the background scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("⏸️  Monitoring scheduler stopped")
    
    def get_stats(self) -> Dict:
        """Get monitoring statistics"""
        return {
            "status": "running" if self.scheduler.running else "stopped",
            "last_update": self.last_update.isoformat() if self.last_update else "Never",
            "next_update": self.get_next_update_time(),
            "cities_monitored": len(INDIAN_CITIES),
            "cities_checked": self.cities_checked,
            "active_risks": len(self.cached_predictions),
            "risks_by_type": {
                "cyclone": len([p for p in self.cached_predictions if p["type"] == "cyclone"]),
                "flood": len([p for p in self.cached_predictions if p["type"] == "flood"]),
                "earthquake": len([p for p in self.cached_predictions if p["type"] == "earthquake"]),
                "landslide": len([p for p in self.cached_predictions if p["type"] == "landslide"]),
                "heatwave": len([p for p in self.cached_predictions if p["type"] == "heatwave"]),
            }
        }

# Global instance
disaster_monitor = DisasterMonitor()
