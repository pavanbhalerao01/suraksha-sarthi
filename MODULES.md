# Survive.exe - Module Development Roadmap

## Project Structure Overview

The project is organized into **6 core modules**, each representing a major feature. We'll develop them sequentially with some parallel work possible.

---

## Module 1: Foundation & Setup ✅ COMPLETED

**Status**: Done  
**Files Created**:
- Next.js configuration (package.json, tsconfig.json, tailwind.config.ts)
- Database schema (Prisma)
- Utility libraries (lib/utils.ts, lib/db.ts, lib/ml-client.ts)
- Basic layouts and landing page

**Next Steps**: Install dependencies and verify setup

---

## Module 2: Risk Heatmap 🎯 PRIORITY 1

**Goal**: Interactive map showing district-level risk scores for Maharashtra

### Components to Build:
```
components/maps/
├── RiskHeatmap.tsx          # Main map component
├── MapControls.tsx          # Zoom, layer controls
├── RegionPopup.tsx          # Click popup with risk details
└── MapLegend.tsx            # Risk color legend
```

### API Routes:
```
app/api/risk/
├── route.ts                 # GET current risk scores
└── [regionId]/route.ts      # GET risk for specific region
```

### Pages:
```
app/(dashboard)/heatmap/
└── page.tsx                 # Heatmap dashboard page
```

### Database Work:
- Seed Maharashtra districts data
- Add sample risk scores

### Tech Stack:
- `react-leaflet` for maps
- OpenStreetMap tiles
- GeoJSON for Maharashtra boundaries

### Acceptance Criteria:
- [ ] Map displays all 36 Maharashtra districts
- [ ] Each district color-coded by risk (green → red)
- [ ] Click district → popup with risk breakdown
- [ ] Legend showing risk levels
- [ ] Responsive on mobile
- [ ] Loads in <2 seconds

**Estimated Time**: 2-3 days  
**Priority**: HIGH (core feature for demo)

---

## Module 3: 7-Day Forecast Dashboard 🎯 PRIORITY 2

**Goal**: Display multi-hazard predictions with confidence intervals

### Components to Build:
```
components/charts/
├── ForecastChart.tsx        # Line chart for probability trends
├── HazardCard.tsx           # Individual hazard summary
├── ConfidenceInterval.tsx   # Shaded area for confidence
└── TimelineSelector.tsx     # Select date range
```

### API Routes:
```
app/api/forecast/
├── route.ts                 # GET 7-day forecast
└── [regionId]/route.ts      # GET forecast for region
```

### Pages:
```
app/(dashboard)/forecast/
├── page.tsx                 # Forecast dashboard
└── loading.tsx              # Loading skeleton
```

### ML Integration:
- Connect to Python ML service
- Call flood prediction endpoint
- Handle fallback if ML service down

### Acceptance Criteria:
- [ ] Display 7-day probability curves
- [ ] Show floods, droughts, heatwaves separately
- [ ] Confidence intervals visible
- [ ] Select region dropdown (Maharashtra districts)
- [ ] Export forecast data as CSV
- [ ] Update every 6 hours

**Estimated Time**: 3-4 days  
**Priority**: HIGH (core predictive feature)

---

## Module 4: Alert Management System 🎯 PRIORITY 3

**Goal**: Create and send disaster warnings to authorities/citizens

### Components to Build:
```
components/alerts/
├── AlertComposer.tsx        # Create new alert
├── AlertHistory.tsx         # Past alerts table
├── RegionSelector.tsx       # Multi-select regions
├── TemplateSelector.tsx     # Pre-defined templates
└── AlertPreview.tsx         # Preview before sending
```

### API Routes:
```
app/api/alerts/
├── route.ts                 # POST send alert, GET history
├── templates/route.ts       # GET alert templates
└── send-sms/route.ts        # Integration with SMS gateway
```

### Pages:
```
app/(dashboard)/alerts/
├── page.tsx                 # Alert management
├── new/page.tsx             # Create new alert
└── [alertId]/page.tsx       # View alert details
```

### Third-Party Integration:
- TextLocal or MSG91 SMS API
- Firebase Cloud Messaging (push notifications)

### Acceptance Criteria:
- [ ] Select multiple regions (districts/talukas)
- [ ] Choose severity (watch/advisory/warning/critical)
- [ ] Multi-language support (English, Marathi, Hindi)
- [ ] SMS gateway integration working
- [ ] Track delivery status
- [ ] Alert history with search/filter

**Estimated Time**: 4-5 days  
**Priority**: HIGH (impact for authorities)

---

## Module 5: Historical Analysis Dashboard 🎯 PRIORITY 4

**Goal**: Visualize patterns from 50+ years of Maharashtra disasters

### Components to Build:
```
components/history/
├── DisasterTimeline.tsx     # Timeline of past events
├── PatternInsights.tsx      # AI-generated insights
├── ComparisonView.tsx       # Compare current with past
├── DisasterDetails.tsx      # Modal with full details
└── FilterPanel.tsx          # Filter by type, year, region
```

### API Routes:
```
app/api/history/
├── disasters/route.ts       # GET all disasters
├── patterns/route.ts        # GET pattern analysis
└── similar/route.ts         # Find similar scenarios
```

### Pages:
```
app/(dashboard)/history/
├── page.tsx                 # Historical dashboard
└── [disasterId]/page.tsx    # Individual disaster details
```

### Database Work:
- Seed historical disaster data (NDMA)
- Add pattern recognition logic

### Acceptance Criteria:
- [ ] Timeline view of disasters (filterable)
- [ ] Show casualties, economic loss, severity
- [ ] Pattern insights (e.g., "Floods occur after >200mm rain")
- [ ] Compare current conditions with past disasters
- [ ] Export data for reports

**Estimated Time**: 3-4 days  
**Priority**: MEDIUM (good for demo, shows depth)

---

## Module 6: Infrastructure Vulnerability Assessment 🎯 PRIORITY 5

**Goal**: Identify high-risk buildings/bridges for evacuation planning

### Components to Build:
```
components/infrastructure/
├── VulnerabilityMap.tsx     # Map with building markers
├── InfraList.tsx            # Sortable table
├── RiskScoreCard.tsx        # Individual infrastructure
└── EvacuationPriority.tsx   # Priority evacuation list
```

### API Routes:
```
app/api/infrastructure/
├── route.ts                 # GET all infrastructure
├── vulnerable/route.ts      # GET high-risk only
└── [infraId]/route.ts       # GET details
```

### Pages:
```
app/(dashboard)/vulnerability/
├── page.tsx                 # Vulnerability dashboard
└── [infraId]/page.tsx       # Infrastructure details
```

### ML Component:
- Train vulnerability scoring model (XGBoost)
- Factors: age, construction type, past damage, location

### Acceptance Criteria:
- [ ] Map showing hospitals, schools, bridges
- [ ] Color-coded by vulnerability (green → red)
- [ ] Sortable table by risk score
- [ ] Filter by type (hospital, school, bridge)
- [ ] Generate evacuation priority list

**Estimated Time**: 4-5 days  
**Priority**: MEDIUM (valuable but not essential for MVP)

---

## Module 7: Resource Mapping (Simplified) 🎯 PRIORITY 6

**Goal**: Show emergency resource locations overlaid with risk zones

### Components to Build:
```
components/resources/
├── ResourceMap.tsx          # Map with resource markers
├── ResourceList.tsx         # Fire stations, hospitals
├── GapAnalysis.tsx          # Identify coverage gaps
└── ResourceDetails.tsx      # Details modal
```

### API Routes:
```
app/api/resources/
├── route.ts                 # GET all resources
└── gaps/route.ts            # GET coverage gaps
```

### Pages:
```
app/(dashboard)/resources/
└── page.tsx                 # Resource mapping
```

### Database Work:
- Seed resource data (fire stations, hospitals, NDRF)
- Calculate distance to high-risk zones

### Acceptance Criteria:
- [ ] Map showing resources and risk zones together
- [ ] Filter by resource type
- [ ] Identify gaps in coverage
- [ ] Calculate response times

**Estimated Time**: 2-3 days  
**Priority**: LOW (nice-to-have, can defer)

---

## Development Sequence (1 Month Timeline)

### Week 1: Foundation + Heatmap
- **Day 1-2**: Setup complete, install deps, test basic Next.js
- **Day 3-5**: Module 2 (Risk Heatmap) - map working with sample data
- **Day 6-7**: Acquire real Maharashtra GeoJSON, seed database

### Week 2: ML Model + Forecast
- **Day 8-10**: Train flood prediction LSTM model
- **Day 11-12**: Setup Python ML service (FastAPI)
- **Day 13-14**: Module 3 (Forecast Dashboard) - integrate ML

### Week 3: Alerts + History
- **Day 15-17**: Module 4 (Alert System) - SMS integration
- **Day 18-21**: Module 5 (Historical Analysis) - seed NDMA data

### Week 4: Polish + Optional Modules
- **Day 22-24**: Module 6 (Vulnerability) OR skip if tight
- **Day 25-26**: UI/UX polish, performance optimization
- **Day 27-28**: Demo scenario prep (Maharashtra flood)
- **Day 29-30**: Deployment, final testing, presentation

---

## Parallel Work (2-3 Person Team)

### Person 1: Frontend Lead
- Build all UI components
- Dashboard layouts
- Responsive design

### Person 2: Backend + ML Lead
- API routes
- ML model training
- ML service setup
- Database seeding

### Person 3: Integration + Data Lead
- Third-party integrations (SMS, IMD API)
- Data acquisition (NDMA, OpenStreetMap)
- Testing and bug fixes

---

## Critical Path Dependencies

```
Setup (Week 1)
    ↓
Heatmap (Week 1) ← Database schema needed
    ↓
ML Model (Week 2) ← Training data needed
    ↓
Forecast (Week 2) ← ML service needed
    ↓
Alerts (Week 3) ← API routes needed
    ↓
History (Week 3) ← Historical data needed
    ↓
Polish (Week 4)
```

---

## Next Immediate Steps

1. ✅ Install npm dependencies
2. ✅ Setup Prisma and run migrations
3. ✅ Create .env.local file
4. ✅ Test Next.js dev server
5. ⬜ Start Module 2: Risk Heatmap

**Ready to proceed?** Type "yes" to install dependencies and start Module 2!
