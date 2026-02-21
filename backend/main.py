"""
Suraksha Sathi - NDRF Admin Backend API
FastAPI server for disaster prediction integrations
Monitors all major Indian cities hourly for all disaster types
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel

# Import monitoring system
from disaster_monitor import disaster_monitor
from indian_cities import INDIAN_CITIES, get_city_count, get_cities_by_disaster

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# LIFESPAN MANAGEMENT
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    logger.info("🚀 Starting Suraksha Sathi NDRF Backend API v2.0")
    logger.info(f"📍 Monitoring {get_city_count()} cities across India")
    
    # Initialize disaster monitoring system
    await disaster_monitor.initialize()
    
    # Start hourly background checks
    disaster_monitor.start_monitoring()
    logger.info("✅ Hourly disaster monitoring activated")
    
    yield
    
    # Shutdown
    disaster_monitor.stop_monitoring()
    logger.info("👋 Shutting down Suraksha Sathi NDRF Backend API")

# Initialize FastAPI
app = FastAPI(
    title="Suraksha Sathi NDRF API v2.0",
    description="Multi-Disaster ML Prediction API - Monitors all India cities hourly",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# MODELS
# =============================================================================

class CustomPredictionRequest(BaseModel):
    disaster_type: str  # cyclone, flood, earthquake, landslide, heatwave
    city_name: Optional[str] = None

# =============================================================================
# ROUTES
# =============================================================================

@app.get("/")
async def root():
    """API health check"""
    return {
        "service": "Suraksha Sathi NDRF API v2.0",
        "status": "operational",
        "version": "2.0.0",
        "cities_monitored": get_city_count(),
        "disaster_types": ["cyclone", "flood", "earthquake", "landslide", "heatwave"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    monitor_stats = disaster_monitor.get_stats()
    
    return {
        "status": "healthy",
        "monitoring": monitor_stats,
        "cities_monitored": get_city_count(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/predictions")
async def get_all_predictions():
    """
    Get ALL disaster predictions for ALL cities
    Returns cached results from hourly background checks
    
    This endpoint checks all 100+ Indian cities for:
    - Cyclone risk (coastal areas)
    - Flood risk (high rainfall areas)
    - Earthquake risk (seismic zones)
    - Landslide risk (hilly regions)
    - Heatwave risk (high temperature areas)
    
    Updates every hour automatically
    """
    try:
        result = disaster_monitor.get_cached_predictions()
        
        if result["total"] > 0:
            message = f"Found {result['total']} active disaster risks across India"
        else:
            message = "No disaster risks detected. All monitored cities are safe."
        
        result["message"] = message
        return result
        
    except Exception as e:
        logger.error(f"Error getting predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predictions/{disaster_type}")
async def get_predictions_by_type(disaster_type: str):
    """
    Get predictions for a specific disaster type
    
    Supported types:
    - all: All disaster types
    - cyclone: Tropical cyclone risks
    - flood: Flooding risks
    - earthquake: Seismic activity
    - landslide: Slope failure risks
    - heatwave: Extreme heat events
    """
    valid_types = ["all", "cyclone", "flood", "earthquake", "landslide", "heatwave"]
    
    if disaster_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid disaster type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        result = disaster_monitor.get_cached_predictions(disaster_type)
        
        if result["total"] > 0:
            message = f"Found {result['total']} {disaster_type} risk(s) across India"
        else:
            message = f"No {disaster_type} risks detected. All monitored areas are safe."
        
        result["message"] = message
        result["disaster_type"] = disaster_type
        return result
        
    except Exception as e:
        logger.error(f"Error getting {disaster_type} predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    """Get comprehensive API statistics"""
    monitor_stats = disaster_monitor.get_stats()
    
    return {
        "monitoring": monitor_stats,
        "cities": {
            "total": get_city_count(),
            "by_disaster_type": {
                "cyclone": len(get_cities_by_disaster("cyclone")),
                "flood": len(get_cities_by_disaster("flood")),
                "earthquake": len(get_cities_by_disaster("earthquake")),
                "landslide": len(get_cities_by_disaster("landslide")),
                "heatwave": len(get_cities_by_disaster("heatwave")),
            }
        },
        "timestamp": datetime.now().isoformat()
    }

# =============================================================================
# RUN SERVER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
