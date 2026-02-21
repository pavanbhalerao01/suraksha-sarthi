# Copilot Instructions for Survive.exe - Disaster Risk Assessment & Coordination Platform

## Project Overview
**Survive.exe** is a comprehensive web-based platform for Indian disaster management authorities with dual focus:
1. **PRE-DISASTER**: ML/DL risk assessment and prediction to prepare BEFORE disasters occur
2. **DURING-DISASTER**: Real-time coordination of rescue, relief, and volunteer efforts

Target regions: India (national), Maharashtra (state), Pune (city).

**Problem Statement**: Create a digital solution to:
- Predict and assess disaster risks before they occur
- Coordinate rescue, relief, and volunteer efforts during active disasters
- Integrate seamlessly with existing NDRF/SDRF/district authorities
- Improve response efficiency and save lives through technology

## Core Principles
1. **Impact-Driven**: Every feature must solve a real disaster management problem
2. **Scalable Architecture**: Design for high load during crisis scenarios (1000+ concurrent users)
3. **Accuracy First**: ML/DL models prioritize accuracy over speed
4. **Context-Specific**: All solutions tailored to Indian disaster patterns and authority workflows
5. **Time-Constrained**: Hackathon timeline - implement MVP features first
6. **Coordination-Centric**: Eliminate duplicate efforts and information silos
7. **Offline-First**: Field teams must work WITHOUT internet connectivity
8. **Integration-Ready**: Must work WITH existing systems (NDMA, SDRF, police), not replace them

## Technology Stack
- **Full-Stack**: Next.js 14+ with TypeScript (App Router)
- **Backend API**: Next.js API Routes + Python (FastAPI) for ML models
- **Real-Time**: WebSocket/Server-Sent Events (SSE) for live coordination
- **ML/DL**: TensorFlow/PyTorch for disaster prediction models
- **Database**: PostgreSQL with Prisma ORM + PostGIS (spatial data)
- **Maps**: Leaflet.js/Mapbox GL with OpenStreetMap for Indian regions
- **Offline**: Progressive Web App (PWA) with IndexedDB and Background Sync
- **Styling**: Tailwind CSS for rapid UI development
- **Communication**: SMS gateway integration (Twilio/msg91), WhatsApp Business API
- **Deployment**: Vercel (frontend) + Railway/Render (ML backend)

## Regional Disaster Context

### Maharashtra/Pune Specific Disasters
1. **Monsoon Floods**: June-September, Western Ghats regions
2. **Urban Flooding**: Pune low-lying areas (Sinhagad Road, Deccan)
3. **Droughts**: Marathwada region cycles
4. **Earthquakes**: Zone 3 seismic activity
5. **Landslides**: Konkan, Western Ghats slopes
6. **Heatwaves**: Pre-monsoon (March-May)

### Data Sources (Indian Context)
- IMD (India Meteorological Department) APIs
- NDMA (National Disaster Management Authority) datasets
- Census data for population density
- Maharashtra Emergency Management Authority
- Pune Municipal Corporation disaster records

## Feature Development Guidelines

### Must-Have Features (MVP)

#### PRE-DISASTER (Risk Assessment)
1. **Risk Heatmap**: Real-time disaster probability maps
2. **Predictive Analytics**: 7-day disaster forecasting
3. **Vulnerability Scoring**: Population/infrastructure risk assessment
4. **Resource Dashboard**: Emergency resource availability mapping
5. **Historical Analysis**: Pattern recognition from past disasters

#### DURING-DISASTER (Coordination)
6. **Incident Command Dashboard**: Unified view of all active incidents, teams, and resources
7. **Smart Task Assignment**: Auto-prioritize and assign incidents to nearest available teams
8. **Live Team Tracking**: Real-time GPS tracking of NDRF/SDRF/volunteer teams
9. **Citizen SOS & Reporting**: One-click emergency button + crowdsourced incident validation
10. **Volunteer Portal**: Registration, verification, deployment, and geofencing safety
11. **Resource Tracking**: Supply chain management from warehouses to relief camps
12. **Offline Mobile App**: PWA for field teams to work without internet

### Feature Implementation Rules
- Each feature must have clear authority use-case
- No features without supporting Indian data availability
- UI must work on mobile (field officers use smartphones)
- All maps must show Indian administrative boundaries
- Response time < 3 seconds for dashboard loads

## ML/DL Model Requirements

### Model Accuracy Targets
- Flood prediction: >85% accuracy
- Earthquake early warning: >90% precision
- Drought forecasting: >80% F1-score
- Risk scoring: Validated against historical events

### Training Data
- Minimum 5 years historical data per disaster type
- Validate models on 2023-2025 Maharashtra events
- Include seasonal patterns (monsoon, summer, winter)
- Incorporate socio-economic vulnerability indices

## Code Conventions

### File Structure
```
/app               - Next.js app directory (App Router)
  /api             - Next.js API routes
    /risk          - Risk assessment endpoints
    /incidents     - Incident management endpoints
    /teams         - Team coordination endpoints
    /volunteers    - Volunteer management endpoints
    /resources     - Resource tracking endpoints
    /sos           - Emergency SOS endpoints
  /(dashboard)     - Dashboard routes
    /heatmap       - Risk heatmap page
    /coordination  - Live coordination dashboard
    /incidents     - Incident management page
    /volunteers    - Volunteer portal
    /resources     - Resource tracking page
  /components      - React components
    /maps          - Map components (heatmap, live tracking)
    /coordination  - Incident, team, task components
    /volunteers    - Volunteer registration, deployment
    /resources     - Resource tracking, supply chain
/lib               - Utility functions and configs
  /db.ts           - Database connection
  /ml-client.ts    - ML model client
  /realtime.ts     - WebSocket/SSE utilities
  /offline.ts      - PWA offline sync logic
/prisma            - Database schema and migrations
/ml_service        - Python FastAPI for ML models
  /models          - Trained model artifacts
  /api             - ML inference endpoints
/data              - Raw and processed datasets
/public            - Static assets (images, icons)
  /service-worker.js - PWA service worker
```

### Naming Conventions
- Components: PascalCase (e.g., `RiskHeatmap.tsx`)
- Next.js API routes: kebab-case folders (e.g., `/app/api/risk-assessment/route.ts`)
- Python ML endpoints: snake_case (e.g., `/predict_flood_risk`)
- Models: descriptive names (e.g., `flood_prediction_lstm.py`)
- Datasets: `{disaster_type}_{region}_{year_range}.csv`

### Documentation Requirements
- Every ML model: Document accuracy, data sources, limitations
- Every API: Document expected inputs, outputs, error handling
- Every UI component: Document user interaction flow

## Development Workflow

### Priority Order
1. Setup Next.js project with Tailwind CSS and TypeScript
2. Create modular component structure (Heatmap, Forecast, Alerts)
3. Setup PostgreSQL + Prisma for data persistence
4. Implement risk heatmap with sample/mock data
5. Train first ML model (floods - most common in Maharashtra)
6. Build Python ML service and connect to Next.js API
7. Add historical analysis and alert system
8. **BUILD COORDINATION SYSTEM** (Week 2-3):
   - Incident reporting and management
   - Team tracking and task assignment
   - Volunteer portal and deployment
   - Real-time updates (WebSocket/SSE)
   - Offline-first PWA for field teams
9. Polish UI/UX for authority users

### Testing Strategy
- Unit tests for all ML model functions
- Integration tests for API endpoints
- UI tests for critical user flows
- Load testing for 1000+ concurrent users

### Performance Targets
- API response: <500ms for predictions
- Map rendering: <2s for 10,000+ data points
- Model inference: <100ms per prediction
- Dashboard load: <3s on 4G mobile

## Hackathon Constraints
- **Timeline**: 1 month development time
- **Team**: 2-3 developers working in parallel
- **Focus**: Feature-rich but modular approach
- **Scope**: Maharashtra state-wide coverage, district-level granularity
- **Demo**: Prepare Maharashtra flood scenario (historical validation)
- **Data**: Use publicly available Indian datasets (IMD, NDMA)
- **Deployment**: Vercel (instant deployment) for web, no Docker complexity
- **Mobile**: Responsive web only (no native app)

## AI Agent Behavior Guidelines
- Always validate features against real disaster scenarios
- Prioritize Maharashtra/Pune data when available
- No generic solutions - tailor to Indian context
- Question unnecessary complexity
- Suggest data sources with URLs when implementing features
- Consider authority workflows (IAS officers, PMC officials, NDRF commanders)
- Remember: Lives depend on accuracy, not flashy features
- **Coordination focus**: Design for 3G/4G mobile networks (not just WiFi)
- **Field reality**: Assume internet WILL fail - offline-first is mandatory
- **Integration mindset**: Every feature should work WITH existing systems (WhatsApp, radio, SMS)
- **User roles**: Commander (strategic view) vs Field Officer (tactical tasks) vs Volunteer (limited access)
- **Scalability**: Assume 1000+ teams, 10,000+ volunteers during major disasters

## USPs to Emphasize
1. India-specific disaster models (not generic)
2. Sub-city level risk assessment (ward-level for Pune)
3. Real-time integration with IMD/NDMA
4. Resource optimization for Indian budgets
5. Multilingual support (Marathi/Hindi/English)
6. **Dual-purpose platform**: PRE-disaster prediction + DURING-disaster coordination
7. **Offline-first**: Works without internet (PWA with background sync)
8. **Eliminates duplicate efforts**: Real-time visibility prevents multiple teams at same location
9. **Volunteer force multiplier**: Organize 10,000+ volunteers safely
10. **Measurable impact**: 60% reduction in duplicate rescues, 15-30 min faster response times
11. **Integration-ready**: Works with WhatsApp, SMS, radio - doesn't replace existing tools
12. **Commander's war room**: Single dashboard replaces 10 different reports/maps
