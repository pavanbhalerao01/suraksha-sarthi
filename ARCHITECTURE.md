# System Architecture - Survive.exe

## Overview
Survive.exe is a distributed, microservices-based platform for pre-disaster risk assessment. The architecture prioritizes:
- **Scalability**: Handle 10,000+ concurrent users during crisis
- **Reliability**: 99.9% uptime for critical alerts
- **Accuracy**: ML models validated against historical data
- **Performance**: Sub-second response times for predictions

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Web Dashboard│  │ Mobile App   │  │ SMS Gateway  │          │
│  │  (React)     │  │ (React Native│  │ (TextLocal)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Nginx Proxy   │
                    │  (Load Balancer)│
                    └────────┬────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend Services                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │  │
│  │  │ Risk API    │ │ Forecast API│ │ Alert API   │         │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌────────────────┐  ┌──────▼──────┐  ┌────────────────┐       │
│  │ Celery Workers │  │    Redis    │  │ TensorFlow     │       │
│  │ (Background)   │  │   (Cache)   │  │ Serving        │       │
│  └────────────────┘  └─────────────┘  └────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐    │
│  │   PostgreSQL    │  │    MongoDB      │  │  S3/Storage  │    │
│  │   (PostGIS)     │  │ (Unstructured)  │  │  (Raw Data)  │    │
│  └─────────────────┘  └─────────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   IMD API   │  │  NDMA Data  │  │ OpenStreetMap│            │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend (React + TypeScript)

#### Key Components
```typescript
// RiskHeatmap.tsx - Main map visualization
- Uses React Leaflet for map rendering
- Fetches risk data every 60 seconds
- Color codes: Green (0-30), Yellow (31-60), Orange (61-80), Red (81-100)
- Click ward → Show detailed breakdown

// ForecastDashboard.tsx - 7-day predictions
- Line charts for probability trends
- Confidence intervals (25th, 75th percentile)
- Alert threshold indicators

// HistoricalAnalysis.tsx - Pattern insights
- Timeline visualization of past disasters
- Similarity scoring with current conditions
- Export data for reports

// AlertManager.tsx - Send warnings
- Define alert zones (wards/districts)
- SMS/Push notification composition
- Multi-language templates
```

#### State Management (Redux)
```typescript
store/
├── slices/
│   ├── riskSlice.ts      // Current risk data
│   ├── forecastSlice.ts  // Predictions
│   ├── alertSlice.ts     // Alert status
│   └── authSlice.ts      // User authentication
└── store.ts
```

#### API Integration
```typescript
services/
├── riskAPI.ts       // axios instance for risk endpoints
├── forecastAPI.ts   // Forecast fetching with retry logic
└── alertAPI.ts      // Send alerts
```

---

### 2. Backend (FastAPI)

#### API Endpoints

**Risk Assessment API**
```python
# api/risk_assessment.py

@router.get("/api/risk/current")
async def get_current_risk(region: str, granularity: str = "ward"):
    """
    Returns current risk scores for specified region
    
    Args:
        region: "pune", "maharashtra", "india"
        granularity: "ward", "taluka", "district"
    
    Returns:
        {
            "region": "pune",
            "timestamp": "2026-02-21T10:00:00Z",
            "risks": [
                {"ward_id": "PMC_001", "risk_score": 75, "primary_hazard": "flood"},
                ...
            ]
        }
    """
    
@router.get("/api/risk/historical")
async def get_historical_risk(start_date: str, end_date: str):
    """Historical risk trends for analysis"""
```

**Forecasting API**
```python
# api/forecasting.py

@router.get("/api/forecast/multi-hazard")
async def get_forecast(region: str, days: int = 7):
    """
    Multi-hazard 7-day forecast
    
    Returns:
        {
            "flood": [
                {"date": "2026-02-22", "probability": 0.15, "confidence": 0.85},
                ...
            ],
            "heatwave": [...],
            "drought": [...]
        }
    """

@router.post("/api/forecast/scenario")
async def scenario_analysis(scenario: dict):
    """What-if analysis (e.g., "What if 300mm rain in 24hrs?")"""
```

**Alert API**
```python
# api/alerts.py

@router.post("/api/alerts/send")
async def send_alert(alert: AlertRequest):
    """
    Send SMS/Push notifications
    
    Args:
        alert: {
            "zones": ["PMC_001", "PMC_002"],
            "severity": "warning",  # watch/advisory/warning/critical
            "message_template": "flood_warning_marathi",
            "channels": ["sms", "push"]
        }
    """

@router.get("/api/alerts/history")
async def get_alert_history():
    """Past alerts sent"""
```

#### ML Model Wrappers
```python
# models/flood_predictor.py

class FloodPredictor:
    def __init__(self, model_path: str):
        self.model = tf.keras.models.load_model(model_path)
        self.scaler = joblib.load(f"{model_path}/scaler.pkl")
    
    def predict(self, features: np.ndarray) -> dict:
        """
        Predict flood probability
        
        Args:
            features: [rainfall, soil_moisture, river_level, dam_capacity, ...]
        
        Returns:
            {
                "probability": 0.78,
                "confidence": 0.92,
                "risk_score": 85,
                "factors": ["heavy_rainfall", "saturated_soil"]
            }
        """
        scaled = self.scaler.transform(features)
        prob = self.model.predict(scaled)
        return self._format_output(prob, features)
```

#### Data Ingestion Pipeline
```python
# data/ingestion/imd_fetcher.py

class IMDDataFetcher:
    """Fetch real-time weather from IMD"""
    
    async def fetch_latest(self, station_id: str):
        # Call IMD API
        # Parse XML/JSON
        # Validate data
        # Save to PostgreSQL
        
# data/ingestion/ndma_scraper.py
class NDMADataScraper:
    """Scrape NDMA disaster database"""
    # Web scraping logic for historical disasters
```

---

### 3. Database Schema

#### PostgreSQL (PostGIS)

**Regions Table**
```sql
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(20),  -- 'ward', 'taluka', 'district', 'state'
    parent_id INT REFERENCES regions(id),
    geometry GEOMETRY(POLYGON, 4326),  -- PostGIS
    population INT,
    area_sqkm FLOAT
);

CREATE INDEX idx_regions_geom ON regions USING GIST(geometry);
```

**Risk Scores Table**
```sql
CREATE TABLE risk_scores (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id),
    timestamp TIMESTAMP,
    risk_score FLOAT,  -- 0-100
    primary_hazard VARCHAR(50),
    contributing_factors JSONB,
    model_version VARCHAR(20)
);

CREATE INDEX idx_risk_timestamp ON risk_scores(timestamp DESC);
```

**Disasters Table**
```sql
CREATE TABLE disasters (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50),  -- 'flood', 'drought', 'earthquake'
    start_date DATE,
    end_date DATE,
    region_id INT REFERENCES regions(id),
    severity VARCHAR(20),  -- 'minor', 'moderate', 'severe', 'catastrophic'
    casualties INT,
    economic_loss_crores FLOAT,
    description TEXT,
    source VARCHAR(100)  -- 'NDMA', 'PMC', 'News'
);
```

**Infrastructure Table**
```sql
CREATE TABLE infrastructure (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    type VARCHAR(50),  -- 'bridge', 'hospital', 'school', 'dam'
    location GEOMETRY(POINT, 4326),
    construction_year INT,
    vulnerability_score FLOAT,
    last_assessment_date DATE
);
```

#### MongoDB (Unstructured Data)

**Weather Data Collection**
```javascript
// weather_records
{
    _id: ObjectId("..."),
    station_id: "IMD_PUNE_001",
    timestamp: ISODate("2026-02-21T10:00:00Z"),
    temperature: 28.5,
    humidity: 75,
    rainfall_mm: 15.2,
    wind_speed_kmh: 12,
    raw_data: {/* original IMD response */}
}
```

**Disaster Reports Collection**
```javascript
// disaster_reports
{
    _id: ObjectId("..."),
    date: ISODate("2019-07-24"),
    type: "flood",
    region: "Pune",
    description: "Heavy rainfall caused flooding in Sinhagad Road...",
    casualties: 17,
    affected_population: 50000,
    news_sources: ["Times of India", "Indian Express"],
    images: ["s3://..."]
}
```

---

### 4. ML/DL Pipeline

#### Training Workflow
```python
# ml/training/flood_model.py

import tensorflow as tf
from sklearn.model_selection import train_test_split

def train_flood_model():
    # 1. Load data
    data = load_pune_flood_data(years=range(2014, 2025))
    
    # 2. Feature engineering
    features = engineer_features(data)
    # Features: rainfall_24hr, rainfall_7day, soil_moisture, 
    #           river_level, dam_capacity, elevation, population_density
    
    # 3. Create sequences for LSTM
    X, y = create_sequences(features, target='flood_occurred', 
                             lookback=7, horizon=1)
    
    # 4. Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, 
                                                          test_size=0.2,
                                                          shuffle=False)  # Time series
    
    # 5. Build model
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(128, return_sequences=True, input_shape=(7, 10)),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.LSTM(64),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')  # Probability
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), 
                 tf.keras.metrics.Recall()]
    )
    
    # 6. Train with early stopping
    history = model.fit(
        X_train, y_train,
        validation_split=0.2,
        epochs=100,
        batch_size=32,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
            tf.keras.callbacks.ModelCheckpoint('models/flood_best.h5')
        ]
    )
    
    # 7. Evaluate
    evaluate_model(model, X_test, y_test)
    
    # 8. Save
    model.save('ml/saved_models/flood_lstm_v1')
    
    return model
```

#### Model Serving
```python
# backend/models/model_server.py

from fastapi import FastAPI
import tensorflow as tf

app = FastAPI()

# Load models at startup
flood_model = tf.keras.models.load_model('ml/saved_models/flood_lstm_v1')
drought_model = tf.keras.models.load_model('ml/saved_models/drought_rf_v1')

@app.on_event("startup")
async def load_models():
    global flood_model, drought_model
    # Models already loaded above
    print("Models ready for inference")

@app.post("/predict/flood")
async def predict_flood(data: dict):
    # Preprocess input
    features = preprocess(data)
    # Inference
    prediction = flood_model.predict(features)
    return {"probability": float(prediction[0][0])}
```

---

### 5. Caching Strategy (Redis)

**Cache Keys**
```
risk:current:{region}:{granularity}  TTL: 5 minutes
forecast:{region}:7day               TTL: 1 hour
historical:{region}:{start}:{end}    TTL: 1 day
model:version                        TTL: infinite
```

**Cache Invalidation**
- On new IMD data: Invalidate `risk:current:*`
- On model update: Invalidate all predictions
- On historical data import: Invalidate `historical:*`

---

### 6. Background Tasks (Celery)

**Periodic Tasks**
```python
# backend/tasks.py

from celery import Celery
from celery.schedules import crontab

app = Celery('survive', broker='redis://localhost:6379/0')

@app.task
def fetch_imd_data():
    """Run every hour"""
    fetcher = IMDDataFetcher()
    data = fetcher.fetch_latest('PUNE')
    save_to_db(data)
    invalidate_cache('risk:current:*')

@app.task
def compute_daily_risk():
    """Run at midnight"""
    regions = Region.query.all()
    for region in regions:
        score = calculate_risk(region)
        RiskScore.create(region=region, score=score)

@app.task
def check_alert_thresholds():
    """Run every 15 minutes"""
    high_risk_regions = get_regions_above_threshold(70)
    for region in high_risk_regions:
        send_alert_if_not_sent(region)

app.conf.beat_schedule = {
    'fetch-imd': {'task': 'tasks.fetch_imd_data', 'schedule': 3600.0},  # 1 hour
    'daily-risk': {'task': 'tasks.compute_daily_risk', 'schedule': crontab(hour=0)},
    'check-alerts': {'task': 'tasks.check_alert_thresholds', 'schedule': 900.0}  # 15 min
}
```

---

### 7. Deployment Architecture

#### Docker Compose (Development)
```yaml
# deployment/docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: survive
      POSTGRES_PASSWORD: dev_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  mongodb:
    image: mongo:6
    volumes:
      - mongodata:/data/db
    ports:
      - "27017:27017"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    command: uvicorn main:app --host 0.0.0.0 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - mongodb
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:dev_password@postgres/survive
      MONGO_URL: mongodb://mongodb:27017
      REDIS_URL: redis://redis:6379
  
  celery:
    build: ./backend
    command: celery -A tasks worker --loglevel=info
    volumes:
      - ./backend:/app
    depends_on:
      - redis
      - postgres
  
  frontend:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000

volumes:
  pgdata:
  mongodata:
```

#### Kubernetes (Production)
```yaml
# deployment/kubernetes/backend-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: survive-backend
spec:
  replicas: 3  # Horizontal scaling
  selector:
    matchLabels:
      app: survive-backend
  template:
    metadata:
      labels:
        app: survive-backend
    spec:
      containers:
      - name: backend
        image: survive/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

### 8. Security Considerations

#### Authentication
- **JWT tokens** for API access
- **Role-based access**: Admin (IAS officers), Viewer (citizens)
- **API rate limiting**: 100 requests/minute per IP

#### Data Protection
- **Encryption at rest**: Database encrypted
- **HTTPS only**: SSL/TLS certificates
- **Input validation**: Pydantic models in FastAPI
- **SQL injection prevention**: ORM (SQLAlchemy)

#### Compliance
- **Data residency**: All data stored in India (MeghRaj cloud)
- **Privacy**: No personal data collection without consent
- **Disaster Act compliance**: Align with NDMA guidelines

---

### 9. Monitoring & Observability

#### Metrics (Prometheus)
- API response times (p50, p95, p99)
- Model inference latency
- Cache hit rate
- Database query performance
- Alert delivery success rate

#### Logs (ELK Stack)
- Application logs (FastAPI)
- ML model predictions (audit trail)
- User actions (for security)

#### Alerts (PagerDuty/Slack)
- API downtime > 1 minute
- Model accuracy drop > 5%
- Database connection failures
- High error rate (>1% of requests)

---

### 10. Scalability Plan

#### Current Capacity (MVP)
- 1,000 concurrent users
- 100 risk predictions/second
- 10,000 alerts/hour

#### Scale to Production
- **Horizontal scaling**: Add more backend pods
- **Database sharding**: Partition by region (North/South/East/West India)
- **CDN**: Serve static assets via CloudFront
- **Read replicas**: PostgreSQL read-only instances for historical queries
- **Caching layer**: Increase Redis cluster size

#### Load Testing Plan
```bash
# Using Locust.io
locust -f tests/load_test.py --host=http://localhost:8000 \
       --users=1000 --spawn-rate=100
```

---

## Data Flow Examples

### Example 1: User Views Risk Heatmap

```
User (Browser)
    │
    ├─> GET /api/risk/current?region=pune&granularity=ward
    │
    ▼
Nginx (Load Balancer)
    │
    ▼
FastAPI Backend
    │
    ├─> Check Redis cache: risk:current:pune:ward
    │   ├─> Cache HIT → Return cached data (50ms)
    │   └─> Cache MISS ↓
    │
    ├─> Query PostgreSQL: risk_scores table (150ms)
    │
    ├─> Run ML inference for missing wards (200ms)
    │   └─> TensorFlow Serving: flood_model.predict()
    │
    ├─> Store in Redis (TTL: 5 min)
    │
    ├─> Return JSON response
    │
    ▼
Frontend (React)
    │
    ├─> Parse JSON
    ├─> Render Leaflet map
    └─> Color-code wards by risk_score
```

**Total latency**: 400ms (first request), 50ms (cached)

---

### Example 2: Scheduled Task Updates Risk Scores

```
Celery Beat (Scheduler)
    │
    ├─> Trigger: Hourly (0:00, 1:00, ...)
    │
    ▼
Celery Worker: fetch_imd_data()
    │
    ├─> Call IMD API: Latest weather for Pune stations
    │   └─> Response: Rainfall, temp, humidity
    │
    ├─> Parse XML/JSON
    │
    ├─> Validate data (check for anomalies)
    │
    ├─> Save to PostgreSQL: weather_data table
    │
    ▼
Celery Worker: compute_daily_risk()
    │
    ├─> Fetch last 7 days of weather data
    │
    ├─> Feature engineering (rolling averages, etc.)
    │
    ├─> Load flood_model from TensorFlow Serving
    │
    ├─> For each ward in Pune:
    │   ├─> Predict flood probability
    │   ├─> Calculate composite risk_score
    │   └─> Save to risk_scores table
    │
    ├─> Invalidate Redis cache: risk:current:*
    │
    ▼
Celery Worker: check_alert_thresholds()
    │
    ├─> Query risk_scores WHERE score > 70
    │
    ├─> For high-risk wards:
    │   ├─> Check if alert already sent (last 6 hours)
    │   ├─> If not:
    │   │   ├─> Fetch contact lists
    │   │   ├─> Call SMS API (TextLocal)
    │   │   └─> Send push notifications (Firebase)
    │   └─> Log alert in alerts table
    │
    └─> Done
```

---

## Performance Benchmarks

### Target Metrics (Hackathon Demo)
- **Risk Heatmap Load**: <2s (10,000 data points)
- **7-Day Forecast**: <1s (cached), <3s (fresh)
- **Model Inference**: <100ms per prediction
- **Alert Delivery**: <5s (SMS sent)
- **Concurrent Users**: 1,000 without degradation

### Optimization Strategies
1. **Database Indexing**: GiST index on geometry columns
2. **Query Optimization**: Use `EXPLAIN ANALYZE` for slow queries
3. **Connection Pooling**: SQLAlchemy with pool_size=20
4. **Async I/O**: FastAPI async endpoints
5. **CDN**: Serve map tiles from CDN
6. **Lazy Loading**: Load historical data on-demand

---

## Disaster Recovery

### Backup Strategy
- **Database**: Daily backups to S3 (7-day retention)
- **ML Models**: Version-controlled in S3 (MLflow)
- **Config**: Git repository

### Recovery Plan
- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 24 hours (daily backups)

### Failover
- **Multi-region deployment**: Primary (Mumbai), Secondary (Bangalore)
- **Database replication**: Streaming replication (PostgreSQL)
- **Service mesh**: Istio for traffic management

---

## Future Enhancements (Post-Hackathon)

1. **AI-Driven Resource Optimizer**: RL model for optimal resource allocation
2. **Satellite Imagery Analysis**: CNN for flood extent mapping
3. **Social Media Integration**: Sentiment analysis for ground reports
4. **Offline Mode**: PWA with local caching for field officers
5. **Blockchain Audit Trail**: Immutable disaster response logs
6. **3D Flood Visualization**: Cesium.js for terrain modeling

---

**Document Version**: 1.0  
**Last Updated**: February 21, 2026  
**Maintained By**: Survive.exe Development Team
