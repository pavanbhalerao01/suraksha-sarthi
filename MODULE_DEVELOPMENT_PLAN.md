# Module Development Plan - Survive.exe

## Overview
This document outlines the step-by-step development plan for all modules in the Survive.exe platform, organized by priority and dependencies.

---

## Development Phases

### ✅ Phase 0: Foundation (COMPLETED)
- [x] Next.js project setup
- [x] Tailwind CSS configuration
- [x] Database schema (initial)
- [x] Dashboard layout with navigation
- [x] Risk heatmap page (basic)

### 🔄 Phase 1: PRE-DISASTER Modules (Week 1-2)
Focus: Complete risk assessment features

### 🔄 Phase 2: DURING-DISASTER Modules (Week 2-4)
Focus: Build coordination system (PRIORITY for winning)

---

## Module Priority Matrix

| Priority | Module | Impact | Complexity | Time | Status |
|----------|--------|--------|------------|------|--------|
| 🔥 P0 | Incident Management | Critical | Medium | 2 days | Not Started |
| 🔥 P0 | Live Coordination Map | Critical | High | 3 days | Not Started |
| 🔥 P0 | Team Management | Critical | Medium | 2 days | Not Started |
| ⭐ P1 | Risk Heatmap | High | Medium | 2 days | In Progress |
| ⭐ P1 | Volunteer Portal | High | Medium | 2 days | Not Started |
| ⭐ P1 | SOS Emergency System | High | Low | 1 day | Not Started |
| 📊 P2 | Resource Tracking | Medium | Medium | 2 days | Not Started |
| 📊 P2 | Citizen Reporting | Medium | Low | 1 day | Not Started |
| 📊 P2 | Relief Camps | Medium | Low | 1 day | Not Started |
| 🎯 P3 | 7-Day Forecast | Demo Value | High | 3 days | Not Started |
| 🎯 P3 | Historical Analysis | Demo Value | Medium | 2 days | Not Started |
| 🎯 P3 | Alert System | Nice to Have | Low | 1 day | Not Started |

---

## Module 1: Incident Management System 🔥 P0

**Goal**: Core incident reporting, assignment, and tracking

### Database Schema
```prisma
model Incident {
  id              String   @id @default(cuid())
  type            String   // flood, fire, collapse, medical, other
  severity        Int      // 1-5 scale
  location        Json     // {lat, lng, address, ward}
  reportedBy      String
  reporterContact String?
  reportedAt      DateTime @default(now())
  status          String   @default("reported")
  assignedTeamId  String?
  assignedTeam    Team?    @relation(fields: [assignedTeamId], references: [id])
  priority        Int      @default(0)
  affectedCount   Int
  description     String
  photos          String[]
  updates         IncidentUpdate[]
  resolvedAt      DateTime?
  resolution      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, priority])
}

model IncidentUpdate {
  id          String   @id @default(cuid())
  incidentId  String
  incident    Incident @relation(fields: [incidentId], references: [id])
  message     String
  updatedBy   String
  timestamp   DateTime @default(now())
  location    Json?
  photos      String[]
}
```

### API Endpoints
**File**: `app/api/incidents/route.ts`
- `GET /api/incidents` - List all incidents with filters
- `POST /api/incidents` - Create new incident

**File**: `app/api/incidents/[id]/route.ts`
- `GET /api/incidents/:id` - Get incident details
- `PATCH /api/incidents/:id` - Update incident status
- `DELETE /api/incidents/:id` - Delete incident

**File**: `app/api/incidents/[id]/updates/route.ts`
- `POST /api/incidents/:id/updates` - Add update to incident

### UI Components
**File**: `components/incidents/IncidentForm.tsx`
```typescript
// Form to report new incident
- Type selection (dropdown)
- Location picker (map + address input)
- Description (textarea)
- Affected count (number input)
- Photo upload
- Submit button
```

**File**: `components/incidents/IncidentList.tsx`
```typescript
// List of incidents with filters
- Filter by status, type, priority
- Sort by priority, time
- Click to view details
```

**File**: `components/incidents/IncidentCard.tsx`
```typescript
// Individual incident display
- Status badge (color-coded)
- Location on mini map
- Quick actions (assign, update, resolve)
```

**File**: `components/incidents/IncidentDetails.tsx`
```typescript
// Full incident view with timeline
- All details
- Photo gallery
- Update history
- Assignment controls
```

### Page
**File**: `app/(dashboard)/incidents/page.tsx`
```typescript
export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Incidents" value={incidents.length} />
        <StatCard title="Active" value={active} color="red" />
        <StatCard title="In Progress" value={inProgress} color="yellow" />
        <StatCard title="Resolved" value={resolved} color="green" />
      </div>

      {/* Report New Incident */}
      <IncidentForm onSubmit={handleCreate} />

      {/* Incident List */}
      <IncidentList incidents={incidents} />
    </div>
  );
}
```

### Testing Checklist
- [ ] Can create incident via form
- [ ] Can filter incidents by status
- [ ] Can assign team to incident
- [ ] Can add update to incident
- [ ] Can mark incident as resolved
- [ ] Photos upload successfully
- [ ] Real-time updates work

### Acceptance Criteria
- ✅ Incident creation takes < 30 seconds
- ✅ All fields validate properly
- ✅ Status changes reflect immediately
- ✅ Photos display in gallery

---

## Module 2: Live Coordination Map 🔥 P0

**Goal**: Unified map showing incidents, teams, resources in real-time

### Components
**File**: `components/maps/LiveCoordinationMap.tsx`
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export function LiveCoordinationMap() {
  const { incidents, teams } = useRealtimeUpdates();

  return (
    <MapContainer center={[18.5204, 73.8567]} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Incident Markers */}
      {incidents.map(incident => (
        <Marker 
          key={incident.id} 
          position={[incident.location.lat, incident.location.lng]}
          icon={getIncidentIcon(incident.status, incident.severity)}
        >
          <Popup>
            <IncidentPopup incident={incident} />
          </Popup>
        </Marker>
      ))}

      {/* Team Markers */}
      {teams.map(team => (
        <Marker 
          key={team.id} 
          position={[team.currentLocation.lat, team.currentLocation.lng]}
          icon={getTeamIcon(team.type, team.status)}
        >
          <Popup>
            <TeamPopup team={team} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Map Layers
1. **Base Layer**: OpenStreetMap tiles
2. **Incidents**: Color-coded by severity (red/yellow/green)
3. **Teams**: Different icons by type (NDRF/Fire/Medical)
4. **Resources**: Warehouses, relief camps
5. **No-Go Zones**: Hazard areas (optional)

### Real-Time Updates
**File**: `hooks/useRealtimeUpdates.ts`
```typescript
import { useEffect, useState } from 'react';

export function useRealtimeUpdates() {
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/coordination/live');

    eventSource.addEventListener('incident:new', (e) => {
      const incident = JSON.parse(e.data);
      setIncidents(prev => [incident, ...prev]);
    });

    eventSource.addEventListener('incident:update', (e) => {
      const updated = JSON.parse(e.data);
      setIncidents(prev => 
        prev.map(inc => inc.id === updated.id ? updated : inc)
      );
    });

    eventSource.addEventListener('team:location', (e) => {
      const teamUpdate = JSON.parse(e.data);
      setTeams(prev =>
        prev.map(team => team.id === teamUpdate.id ? teamUpdate : team)
      );
    });

    return () => eventSource.close();
  }, []);

  return { incidents, teams };
}
```

### Page
**File**: `app/(dashboard)/coordination/page.tsx`
```typescript
'use client';

export default function CoordinationPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Map - 70% width */}
      <div className="w-[70%] h-full">
        <LiveCoordinationMap />
      </div>

      {/* Sidebar - 30% width */}
      <div className="w-[30%] h-full bg-gray-50 overflow-y-auto p-4">
        <CoordinationSidebar />
      </div>
    </div>
  );
}
```

### Testing Checklist
- [ ] Map loads with correct center (Pune)
- [ ] All incidents display as markers
- [ ] Clicking marker shows popup
- [ ] Real-time updates reflect on map
- [ ] Map performance with 100+ markers

---

## Module 3: Team Management 🔥 P0

**Goal**: Manage rescue teams, track locations, assign tasks

### Database Schema
```prisma
model Team {
  id              String   @id @default(cuid())
  name            String
  type            String   // NDRF, SDRF, Fire, Police, Medical
  currentLocation Json?
  status          String   @default("available")
  skills          String[]
  equipment       String[]
  contactNumber   String
  capacity        Int      @default(1)
  assignedIncidents Incident[]
  members         TeamMember[]
  deployments     TeamDeployment[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model TeamMember {
  id       String @id @default(cuid())
  teamId   String
  team     Team   @relation(fields: [teamId], references: [id])
  name     String
  role     String
  phone    String
  verified Boolean @default(true)
}
```

### API Endpoints
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create new team
- `PATCH /api/teams/:id` - Update team
- `POST /api/teams/assign` - Assign team to incident
- `PATCH /api/teams/:id/location` - Update team GPS location

### Components
**File**: `components/teams/TeamList.tsx`
**File**: `components/teams/TeamCard.tsx`
**File**: `components/teams/TeamAssignmentDialog.tsx`

### Page
**File**: `app/(dashboard)/teams/page.tsx`

---

## Module 4: Volunteer Portal ⭐ P1

**Goal**: Register, verify, and deploy volunteers safely

### Database Schema
```prisma
model Volunteer {
  id                String   @id @default(cuid())
  name              String
  phone             String   @unique
  email             String?
  skills            String[]
  verified          Boolean  @default(false)
  availableZones    String[]
  status            String   @default("registered")
  deployments       VolunteerDeployment[]
  rating            Float?
  trainingCompleted String[]
  createdAt         DateTime @default(now())
}
```

### Features
1. **Registration Form**: Name, phone, skills, availability
2. **Verification**: Aadhaar + background check
3. **Deployment**: Assign to relief camps or tasks
4. **Check-in/Check-out**: Geofenced tracking
5. **Safety Alerts**: Notify if entering restricted zone

### Pages
- `app/(dashboard)/volunteers/page.tsx` - Admin view
- `app/volunteer/register/page.tsx` - Public registration
- `app/volunteer/portal/page.tsx` - Volunteer dashboard

---

## Module 5: SOS Emergency System ⭐ P1

**Goal**: One-click emergency distress signal from citizens

### Database Schema
```prisma
model SOSAlert {
  id            String   @id @default(cuid())
  reporterPhone String
  location      Json
  message       String?
  status        String   @default("active")
  createdAt     DateTime @default(now())
  respondedBy   String?
  respondedAt   DateTime?
}
```

### Component
**File**: `components/citizen/SOSButton.tsx`
```typescript
export function SOSButton() {
  const handleSOS = async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await fetch('/api/sos', {
        method: 'POST',
        body: JSON.stringify({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          phone: prompt('Your phone:'),
        }),
      });
      alert('SOS sent! Help is on the way.');
    });
  };

  return (
    <button onClick={handleSOS} className="fixed bottom-8 right-8 w-20 h-20 bg-red-600 rounded-full">
      SOS
    </button>
  );
}
```

### Integration
- Auto-create high-priority incident
- Send SMS to nearest team
- Show on coordination map immediately

---

## Module 6: Resource Tracking 📊 P2

**Goal**: Track supplies from warehouse to relief camps

### Database Schema
```prisma
model Resource {
  id           String   @id @default(cuid())
  type         String
  name         String
  location     String
  quantity     Int
  unit         String
  lastUpdated  DateTime @updatedAt
}

model ResourceMovement {
  id           String   @id @default(cuid())
  resourceId   String
  fromLocation String
  toLocation   String
  quantity     Int
  status       String   @default("in-transit")
  dispatchTime DateTime @default(now())
}
```

### Features
- Inventory dashboard
- Movement tracking with ETA
- Low stock alerts
- Distribution optimization

---

## Module 7: Relief Camps 📊 P2

**Goal**: Manage evacuation centers and shelters

### Database Schema
```prisma
model ReliefCamp {
  id               String   @id @default(cuid())
  name             String
  location         Json
  capacity         Int
  currentOccupants Int      @default(0)
  facilities       String[]
  managerContact   String
  status           String   @default("operational")
}
```

---

## Module 8: Citizen Reporting 📊 P2

**Goal**: Crowdsourced incident reports with validation

### Features
- Public incident report form
- Photo upload
- De-duplication logic (merge similar reports)
- Validation (require 3+ reports for same location)

---

## Module 9: 7-Day Forecast 🎯 P3

**Goal**: ML-powered disaster predictions

### Components
- Forecast chart (Chart.js/Recharts)
- Risk indicators
- Historical comparison

**Note**: Use mock data for MVP, integrate ML later

---

## Module 10: Historical Analysis 🎯 P3

**Goal**: Learn from past disasters

### Features
- Timeline of past events
- Pattern insights
- Comparative analysis

---

## Module 11: Alert System 🎯 P3

**Goal**: Send SMS/push notifications to citizens

### Integration
- Twilio/msg91 for SMS
- Push notifications (PWA)
- WhatsApp Business API

---

## Development Schedule

### Week 1 (Feb 21-27)
- **Day 1-2**: Module 1 (Incident Management)
- **Day 3-4**: Module 2 (Live Coordination Map)
- **Day 5-6**: Module 3 (Team Management)
- **Day 7**: Module 5 (SOS System)

### Week 2 (Feb 28-Mar 6)
- **Day 1-2**: Module 4 (Volunteer Portal)
- **Day 3**: Module 6 (Resource Tracking)
- **Day 4**: Module 7 (Relief Camps)
- **Day 5**: Module 8 (Citizen Reporting)
- **Day 6-7**: Real-time integration + testing

### Week 3 (Mar 7-13)
- **Day 1-2**: Offline PWA setup
- **Day 3-4**: Module 9 (Forecast - basic)
- **Day 5**: Module 11 (Alert System - basic)
- **Day 6-7**: Integration testing

### Week 4 (Mar 14-20)
- **Day 1-3**: UI/UX polish
- **Day 4-5**: Demo scenario + data
- **Day 6**: Documentation
- **Day 7**: Final testing + deployment

---

## Success Metrics per Module

| Module | Success Metric |
|--------|----------------|
| Incident Management | Create incident in < 30 sec |
| Live Map | < 1 sec update latency |
| Team Management | Assign team in < 10 sec |
| Volunteer Portal | Register 100 volunteers in 5 min |
| SOS System | Alert reaches team in < 30 sec |
| Resource Tracking | Track 50+ resources without lag |

---

## Next Steps

1. **TODAY**: Start Module 1 (Incident Management)
   - Update `prisma/schema.prisma`
   - Create API routes
   - Build basic UI

2. **By Week 1 End**: Have coordination core working (Modules 1-3)

3. **By Week 2 End**: Full coordination system functional

4. **By Week 3 End**: Polish + offline support

---

**Last Updated**: February 21, 2026  
**Current Focus**: Module 1 - Incident Management System
