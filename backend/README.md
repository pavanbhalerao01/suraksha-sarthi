# Suraksha Sathi - NDRF Backend API

## Overview
FastAPI backend for disaster prediction ML models integrated into the NDRF Admin Portal.

## Features
- ✅ Flood prediction using ensemble ML models (Transformer, LSTM, GRU, ARIMA)
- ✅ 7-day forecast with confidence intervals
- ✅ Risk assessment (LOW, MODERATE, HIGH, CRITICAL)
- ✅ Multiple Indian river monitoring stations
- ✅ RESTful API endpoints

## Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python main.py
```

The server will start on `http://localhost:8000`

### 3. API Documentation
Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
```
GET /
GET /api/health
```

### Flood Predictions
```
GET /api/predictions/flood
```
Returns flood predictions for predefined Indian river stations.

**Response:**
```json
{
  "predictions": [
    {
      "id": 1,
      "type": "flood",
      "location": "Kaziranga",
      "state": "Assam",
      "district": "Kaziranga",
      "river": "Brahmaputra",
      "severity": "HIGH",
      "confidence": 79.3,
      "date": "2026-02-24",
      "model": "flood_predictor_v2",
      "affectedArea": "1,800 km²",
      "affectedPeople": "85,000",
      "description": "Brahmaputra river levels rising due to heavy rainfall."
    }
  ]
}
```

### Custom Flood Prediction
```
POST /api/predictions/flood/custom
```

**Request Body:**
```json
{
  "location": "Custom Location",
  "state": "State Name",
  "district": "District Name",
  "river_name": "River Name",
  "current_water_level": 65.5,
  "rainfall_24h": 120.0,
  "temperature": 30.0,
  "humidity": 85.0
}
```

### All Predictions
```
GET /api/predictions/all
```
Returns predictions for all disaster types (currently flood only).

### Statistics
```
GET /api/stats
```
Returns ML model statistics and metadata.

## ML Model Details

### Flood Predictor
- **Model Version:** `flood_predictor_v2`
- **Ensemble Models:**
  - Transformer (40% weight)
  - LSTM (30% weight)
  - GRU (20% weight)
  - ARIMA Statistical (10% weight)
- **Forecast Horizon:** 7 days
- **Output:** Risk level, confidence score, affected area, people at risk

## Integration with Frontend

The Next.js frontend calls this API through the `/api/predictions` route:

```typescript
const response = await fetch('/api/predictions');
const data = await response.json();
```

## Development Notes

- The ML models are currently using simulated predictions for demonstration
- To integrate real ML models, replace the prediction functions with trained model inference
- Model files (.pt, .pkl, .h5) should be placed in the `backend/models` directory

## Future Enhancements
- [ ] Real-time weather data integration (OpenWeatherMap API)
- [ ] Database integration for historical predictions
- [ ] WebSocket support for real-time updates
- [ ] Additional disaster types (cyclone, earthquake, landslide, heatwave)
- [ ] Model versioning and A/B testing

## License
Part of Suraksha Sathi - NDRF Admin Portal
