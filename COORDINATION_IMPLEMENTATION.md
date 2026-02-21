# Coordination Features - Implementation Guide

## 🎯 Quick Reference: Building Coordination System

This guide provides step-by-step instructions for implementing the disaster coordination features that will make Survive.exe a winning solution.

---

## Phase 1: Database Schema (Week 2, Day 1-2)

### Update Prisma Schema
Add these models to `prisma/schema.prisma`:

```prisma
// Incident Management
model Incident {
  id              String   @id @default(cuid())
  type            String   // flood, fire, collapse, medical, other
  severity        Int      // 1-5 scale (1=minor, 5=critical)
  location        Json     // {lat, lng, address, ward}
  reportedBy      String   // citizen/authority
  reporterContact String?
  reportedAt      DateTime @default(now())
  status          String   @default("reported") // reported, assigned, in-progress, resolved
  assignedTeamId  String?
  assignedTeam    Team?    @relation(fields: [assignedTeamId], references: [id])
  priority        Int      @default(0) // Auto-calculated: severity * affectedCount / timeSinceReported
  affectedCount   Int      // Number of people affected
  description     String
  photos          String[] // Array of S3/Cloudinary URLs
  updates         IncidentUpdate[]
  resolvedAt      DateTime?
  resolution      String?  // What was done to resolve
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, priority])
  @@index([assignedTeamId])
}

model IncidentUpdate {
  id          String   @id @default(cuid())
  incidentId  String
  incident    Incident @relation(fields: [incidentId], references: [id])
  message     String
  updatedBy   String   // user ID or team ID
  timestamp   DateTime @default(now())
  location    Json?    // If location changed
  photos      String[]
}

// Team Management
model Team {
  id              String   @id @default(cuid())
  name            String
  type            String   // NDRF, SDRF, Fire, Police, Medical, NGO, Volunteer
  agency          String?  // Organization name
  currentLocation Json?    // {lat, lng, lastUpdated}
  status          String   @default("available") // available, deployed, offline, en-route
  skills          String[] // rescue, medical, technical, fire, search
  equipment       String[] // boat, ambulance, firetruck, ropes, medical-kit
  contactNumber   String
  capacity        Int      @default(1) // How many incidents can handle simultaneously
  assignedIncidents Incident[]
  members         TeamMember[]
  deployments     TeamDeployment[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, type])
}

model TeamMember {
  id          String   @id @default(cuid())
  teamId      String
  team        Team     @relation(fields: [teamId], references: [id])
  name        String
  role        String   // leader, member, medic, driver
  phone       String
  verified    Boolean  @default(true)
}

model TeamDeployment {
  id          String   @id @default(cuid())
  teamId      String
  team        Team     @relation(fields: [teamId], references: [id])
  startTime   DateTime @default(now())
  endTime     DateTime?
  location    Json     // Where deployed
  purpose     String   // What they were doing
  outcome     String?  // Result of deployment
}

// Volunteer Management
model Volunteer {
  id                String   @id @default(cuid())
  name              String
  phone             String   @unique
  email             String?
  aadhaar           String?  @unique // For verification
  skills            String[] // first-aid, driving, cooking, translation, medical, engineering
  verified          Boolean  @default(false)
  verificationDate  DateTime?
  availableZones    String[] // Ward IDs where willing to work
  currentLocation   Json?
  status            String   @default("registered") // registered, available, deployed, offline
  deployments       VolunteerDeployment[]
  rating            Float?   // Average rating from past deployments
  trainingCompleted String[] // CPR, First Aid, Disaster Response
  emergencyContact  String?
  bloodGroup        String?
  languages         String[] // marathi, hindi, english
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([status, verified])
}

model VolunteerDeployment {
  id            String   @id @default(cuid())
  volunteerId   String
  volunteer     Volunteer @relation(fields: [volunteerId], references: [id])
  campId        String?
  camp          ReliefCamp? @relation(fields: [campId], references: [id])
  task          String   // distribution, registration, medical-assist, logistics
  startTime     DateTime @default(now())
  endTime       DateTime?
  checkIn       Json?    // {lat, lng, timestamp}
  checkOut      Json?    // {lat, lng, timestamp}
  hoursWorked   Float?
  rating        Float?   // Performance rating 1-5
  feedback      String?
}

// Resource & Supply Chain
model Resource {
  id            String   @id @default(cuid())
  type          String   // food, water, blanket, medicine, tent, clothing
  name          String   // "Food Packets (Veg)", "Blankets (Adult)", "ORS"
  location      String   // warehouse-id or camp-id
  locationType  String   // warehouse, camp, vehicle
  quantity      Int
  unit          String   // packets, litres, pieces, kg
  minThreshold  Int      // Reorder level
  lastUpdated   DateTime @updatedAt
  expiryDate    DateTime?
  movements     ResourceMovement[]
  createdAt     DateTime @default(now())

  @@index([location, type])
}

model ResourceMovement {
  id            String   @id @default(cuid())
  resourceId    String
  resource      Resource @relation(fields: [resourceId], references: [id])
  fromLocation  String
  toLocation    String
  quantity      Int
  movedBy       String   // User or team ID
  vehicleNumber String?
  status        String   @default("in-transit") // in-transit, delivered, cancelled
  dispatchTime  DateTime @default(now())
  deliveryTime  DateTime?
  estimatedETA  DateTime?
  gpsTrack      Json[]   // Array of {lat, lng, timestamp}
}

// Relief Camps
model ReliefCamp {
  id                String   @id @default(cuid())
  name              String
  location          Json     // {lat, lng, address, ward}
  capacity          Int      // Maximum people
  currentOccupants  Int      @default(0)
  type              String   // evacuation, medical, temporary-shelter
  facilities        String[] // medical, food, water, sanitation, electricity
  managerName       String
  managerContact    String
  status            String   @default("operational") // setup, operational, full, closed
  openedAt          DateTime @default(now())
  closedAt          DateTime?
  currentNeeds      String[] // What they're requesting
  volunteers        VolunteerDeployment[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([status])
}

// Emergency SOS
model SOSAlert {
  id            String   @id @default(cuid())
  reporterName  String?
  reporterPhone String
  location      Json     // {lat, lng, accuracy}
  message       String?
  urgency       String   @default("high") // high, critical
  status        String   @default("active") // active, responded, resolved, false-alarm
  createdAt     DateTime @default(now())
  respondedBy   String?  // Team ID
  respondedAt   DateTime?
  resolvedAt    DateTime?
  deviceInfo    Json?    // Browser/device details for tracking
  photo         String?

  @@index([status, createdAt])
}

// User Management (Authorities)
model User {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  phone       String   @unique
  password    String   // Hashed
  role        String   // commander, field-officer, admin, volunteer-coordinator
  agency      String   // NDRF, PMC, Fire Department, etc.
  permissions String[] // view-incidents, assign-teams, deploy-volunteers, etc.
  createdAt   DateTime @default(now())
  lastLogin   DateTime?
}
```

---

## Phase 2: API Routes (Week 2, Day 3-4)

### Critical Endpoints to Build

#### 1. Incident Management APIs
**File**: `app/api/incidents/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/incidents - List all incidents with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // reported, assigned, in-progress, resolved
  const type = searchParams.get('type'); // flood, fire, etc.
  const priority = searchParams.get('priority'); // high, medium, low

  const incidents = await prisma.incident.findMany({
    where: {
      ...(status && { status }),
      ...(type && { type }),
      ...(priority && { priority: { gte: priority === 'high' ? 4 : priority === 'medium' ? 2 : 0 } }),
    },
    include: {
      assignedTeam: true,
      updates: {
        orderBy: { timestamp: 'desc' },
        take: 3,
      },
    },
    orderBy: [
      { priority: 'desc' },
      { reportedAt: 'asc' },
    ],
  });

  return NextResponse.json(incidents);
}

// POST /api/incidents - Report new incident
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, location, description, affectedCount, reportedBy, photos } = body;

  // Calculate initial priority
  const severity = calculateSeverity(type, affectedCount);
  const priority = severity * affectedCount;

  const incident = await prisma.incident.create({
    data: {
      type,
      location,
      description,
      affectedCount: affectedCount || 1,
      reportedBy,
      reporterContact: body.contact,
      severity,
      priority,
      photos: photos || [],
      status: 'reported',
    },
  });

  // TODO: Trigger real-time notification to commanders
  // TODO: Auto-suggest nearest available team

  return NextResponse.json(incident, { status: 201 });
}

function calculateSeverity(type: string, affectedCount: number): number {
  // Auto-calculate severity based on type and affected count
  let baseSeverity = 3;
  
  if (type === 'fire' || type === 'collapse') baseSeverity = 5;
  if (type === 'flood') baseSeverity = 4;
  if (type === 'medical') baseSeverity = 3;
  if (type === 'other') baseSeverity = 2;

  // Increase severity if many people affected
  if (affectedCount > 50) baseSeverity = Math.min(5, baseSeverity + 1);
  if (affectedCount > 100) baseSeverity = 5;

  return baseSeverity;
}
```

**File**: `app/api/incidents/[id]/route.ts`

```typescript
// PATCH /api/incidents/:id - Update incident status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status, assignedTeamId, resolution, updateMessage } = body;

  const incident = await prisma.incident.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(assignedTeamId && { assignedTeamId }),
      ...(resolution && { resolution }),
      ...(status === 'resolved' && { resolvedAt: new Date() }),
    },
  });

  // Add update log
  if (updateMessage) {
    await prisma.incidentUpdate.create({
      data: {
        incidentId: params.id,
        message: updateMessage,
        updatedBy: body.updatedBy || 'system',
      },
    });
  }

  // TODO: Send real-time update via WebSocket

  return NextResponse.json(incident);
}
```

#### 2. Team Management APIs
**File**: `app/api/teams/route.ts`

```typescript
// GET /api/teams - List teams with availability
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const available = searchParams.get('available') === 'true';
  const type = searchParams.get('type'); // NDRF, Fire, etc.

  const teams = await prisma.team.findMany({
    where: {
      ...(available && { status: 'available' }),
      ...(type && { type }),
    },
    include: {
      members: true,
      assignedIncidents: {
        where: { status: { in: ['assigned', 'in-progress'] } },
      },
    },
  });

  return NextResponse.json(teams);
}
```

**File**: `app/api/teams/assign/route.ts`

```typescript
// POST /api/teams/assign - Assign team to incident
export async function POST(request: NextRequest) {
  const { incidentId, teamId } = await request.json();

  // Update incident
  const incident = await prisma.incident.update({
    where: { id: incidentId },
    data: {
      assignedTeamId: teamId,
      status: 'assigned',
    },
  });

  // Update team status
  await prisma.team.update({
    where: { id: teamId },
    data: { status: 'deployed' },
  });

  // Create deployment record
  await prisma.teamDeployment.create({
    data: {
      teamId,
      location: incident.location,
      purpose: `Incident: ${incident.type} - ${incident.description}`,
    },
  });

  // TODO: Send SMS/notification to team

  return NextResponse.json({ success: true, incident });
}
```

#### 3. SOS Emergency API
**File**: `app/api/sos/route.ts`

```typescript
// POST /api/sos - Emergency SOS button
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { location, phone, name, message, deviceInfo } = body;

  // Create SOS alert
  const sos = await prisma.sOSAlert.create({
    data: {
      reporterPhone: phone,
      reporterName: name,
      location,
      message: message || 'Emergency SOS triggered',
      urgency: 'critical',
      status: 'active',
      deviceInfo,
    },
  });

  // CRITICAL: Immediate notifications
  // TODO: Send SMS to nearest police/NDRF
  // TODO: Push notification to command center
  // TODO: Create high-priority incident automatically

  // Auto-create incident from SOS
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/incidents`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'emergency',
      location,
      description: `SOS from ${name || phone}: ${message}`,
      affectedCount: 1,
      reportedBy: 'sos-system',
      contact: phone,
    }),
  });

  return NextResponse.json(sos, { status: 201 });
}
```

---

## Phase 3: Real-Time Updates (Week 2, Day 5-6)

### Setup WebSocket/SSE for Live Dashboard

**File**: `lib/realtime.ts`

```typescript
// Server-Sent Events for real-time updates
export class RealtimeService {
  private clients: Map<string, ReadableStreamDefaultController> = new Map();

  // Add client to receive updates
  subscribe(clientId: string, controller: ReadableStreamDefaultController) {
    this.clients.set(clientId, controller);
    console.log(`Client ${clientId} subscribed. Total: ${this.clients.size}`);
  }

  // Remove client
  unsubscribe(clientId: string) {
    this.clients.delete(clientId);
    console.log(`Client ${clientId} unsubscribed. Total: ${this.clients.size}`);
  }

  // Broadcast update to all connected clients
  broadcast(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach((controller, clientId) => {
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    });
  }

  // Send to specific client
  send(clientId: string, event: string, data: any) {
    const controller = this.clients.get(clientId);
    if (controller) {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));
    }
  }
}

export const realtimeService = new RealtimeService();
```

**File**: `app/api/coordination/live/route.ts`

```typescript
import { realtimeService } from '@/lib/realtime';

// GET /api/coordination/live - SSE endpoint for live updates
export async function GET(request: Request) {
  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      // Register client
      realtimeService.subscribe(clientId, controller);

      // Send initial connection message
      const welcome = `event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(welcome));
    },
    cancel() {
      // Client disconnected
      realtimeService.unsubscribe(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Trigger real-time updates from other API routes:
// import { realtimeService } from '@/lib/realtime';
// realtimeService.broadcast('incident:new', newIncident);
// realtimeService.broadcast('team:assigned', { incidentId, teamId });
```

**Client-side hook**: `hooks/useRealtimeUpdates.ts`

```typescript
import { useEffect, useState } from 'react';

export function useRealtimeUpdates() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/coordination/live');

    eventSource.addEventListener('incident:new', (e) => {
      const incident = JSON.parse(e.data);
      setIncidents(prev => [incident, ...prev]);
      // Show notification
      new Notification('New Incident', { body: incident.description });
    });

    eventSource.addEventListener('incident:update', (e) => {
      const updated = JSON.parse(e.data);
      setIncidents(prev => 
        prev.map(inc => inc.id === updated.id ? updated : inc)
      );
    });

    return () => eventSource.close();
  }, []);

  return { incidents };
}
```

---

## Phase 4: UI Components (Week 2, Day 7 - Week 3)

### Coordination Dashboard
**File**: `app/(dashboard)/coordination/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { LiveCoordinationMap } from '@/components/maps/LiveCoordinationMap';
import { IncidentList } from '@/components/coordination/IncidentList';
import { TeamStatusBoard } from '@/components/coordination/TeamStatusBoard';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export default function CoordinationDashboard() {
  const { incidents } = useRealtimeUpdates();
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Fetch initial data
    fetch('/api/incidents?status=reported,assigned,in-progress')
      .then(res => res.json())
      .then(setActiveIncidents);

    fetch('/api/teams')
      .then(res => res.json())
      .then(setTeams);
  }, []);

  return (
    <div className="h-screen flex">
      {/* Main Map - 70% width */}
      <div className="w-[70%] h-full">
        <LiveCoordinationMap 
          incidents={activeIncidents}
          teams={teams}
        />
      </div>

      {/* Right Sidebar - 30% width */}
      <div className="w-[30%] h-full bg-gray-50 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              title="Active Incidents" 
              value={activeIncidents.filter(i => i.status !== 'resolved').length}
              color="red"
            />
            <StatCard 
              title="Available Teams" 
              value={teams.filter(t => t.status === 'available').length}
              color="green"
            />
          </div>

          {/* Incident List */}
          <IncidentList incidents={activeIncidents} />

          {/* Team Status */}
          <TeamStatusBoard teams={teams} />
        </div>
      </div>
    </div>
  );
}
```

### SOS Button Component
**File**: `components/citizen/SOSButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export function SOSButton() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSOS = async () => {
    setLoading(true);

    // Get user location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      // Send SOS
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          phone: prompt('Your phone number:'),
          name: prompt('Your name (optional):'),
          message: 'Emergency SOS - Need immediate help',
          deviceInfo: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setSent(true);
        alert('SOS sent! Help is on the way. We will contact you shortly.');
      }
      setLoading(false);
    }, (error) => {
      alert('Location access required for SOS');
      setLoading(false);
    });
  };

  return (
    <button
      onClick={handleSOS}
      disabled={loading || sent}
      className={`
        fixed bottom-8 right-8 z-50
        w-20 h-20 rounded-full
        flex items-center justify-center
        text-white font-bold text-lg
        shadow-2xl animate-pulse
        ${sent ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {sent ? '✓' : <AlertTriangle size={32} />}
    </button>
  );
}
```

---

## Phase 5: Offline PWA (Week 3, Final Days)

### Service Worker Setup
**File**: `public/service-worker.js`

```javascript
const CACHE_NAME = 'survive-v1';
const urlsToCache = [
  '/',
  '/coordination',
  '/heatmap',
  '/offline',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Background sync for offline incident reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncIncidents());
  }
});

async function syncIncidents() {
  const db = await openDB();
  const incidents = await db.getAll('offline-incidents');
  
  for (const incident of incidents) {
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(incident),
      });
      // Remove from offline queue
      await db.delete('offline-incidents', incident.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

**File**: `lib/offline.ts`

```typescript
// IndexedDB for offline storage
export async function saveOfflineIncident(incident: any) {
  const db = await openDB('survive-offline', 1, {
    upgrade(db) {
      db.createObjectStore('incidents', { keyPath: 'id' });
    },
  });

  await db.add('incidents', {
    ...incident,
    id: crypto.randomUUID(),
    offlineCreated: true,
    timestamp: Date.now(),
  });

  // Register background sync
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-incidents');
  }
}
```

---

## Testing Strategy

### Load Testing Script
**File**: `tests/load-test.js`

```javascript
// Simulate 1000 concurrent users
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 1000 }, // Peak load
    { duration: '2m', target: 0 }, // Ramp down
  ],
};

export default function () {
  // Test incident reporting
  const incident = http.post('http://localhost:3000/api/incidents', JSON.stringify({
    type: 'flood',
    location: { lat: 18.5204, lng: 73.8567 },
    description: 'Water logging on street',
    affectedCount: 5,
    reportedBy: 'citizen',
  }));

  check(incident, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured (SMS API keys, etc.)
- [ ] PWA manifest.json configured
- [ ] Service worker registered
- [ ] Real-time SSE endpoint tested with 100+ concurrent connections
- [ ] Load testing completed (1000 users)
- [ ] Mobile responsiveness verified
- [ ] Offline mode tested (airplane mode)
- [ ] Background sync tested
- [ ] SMS notifications working
- [ ] Permission requests (location, notifications) implemented

---

## Key Integration Points

### 1. SMS Gateway (Twilio/msg91)
```typescript
// lib/sms.ts
export async function sendSMSAlert(phone: string, message: string) {
  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_API_KEY!,
      'content-type': 'application/JSON',
    },
    body: JSON.stringify({
      flow_id: process.env.MSG91_FLOW_ID,
      mobiles: `91${phone}`,
      message,
    }),
  });
  return response.json();
}
```

### 2. WhatsApp Business API Integration
```typescript
// For situation reports to authorities
export async function sendWhatsAppReport(phone: string, incidentSummary: string) {
  // Use Twilio WhatsApp API or Meta Business Platform
}
```

---

## Success Metrics Dashboard

Add this to admin panel to track real impact:

```typescript
export async function getCoordinationMetrics() {
  const avgResponseTime = await prisma.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - reported_at))/60) as avg_minutes
    FROM incidents 
    WHERE resolved_at IS NOT NULL
  `;

  const duplicateReduction = await prisma.incident.groupBy({
    by: ['location'],
    having: {
      _count: { gt: 1 }
    },
    _count: true,
  });

  return {
    avgResponseTime: avgResponseTime[0].avg_minutes,
    duplicatesAvoided: duplicateReduction.length,
    activeVolunteers: await prisma.volunteer.count({ where: { status: 'deployed' }}),
    incidentsResolved: await prisma.incident.count({ where: { status: 'resolved' }}),
  };
}
```

---

**Next Steps**: Start with Phase 1 (Database Schema) and build incrementally. Test each phase before moving to next.
