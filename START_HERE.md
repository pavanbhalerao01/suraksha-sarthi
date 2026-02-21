# Quick Start: Building Modules

## What Just Happened

### ✅ Dashboard Updated
**Changes Made**:
1. **Navigation** (`app/(dashboard)/layout.tsx`):
   - Added: Coordination, Incidents, Volunteers links
   - Kept: Risk Heatmap, Forecast (existing PRE-disaster features)

2. **Dashboard Overview** (`app/(dashboard)/page.tsx`):
   - Split metrics into two sections:
     - **Pre-Disaster Monitoring** (existing: Districts, Alerts, Risk Score, Model Accuracy)
     - **Active Disaster Coordination** (new: Incidents, Teams, Volunteers, Response Time)
   - Split quick links:
     - **Pre-Disaster Tools** (4 cards): Heatmap, Forecast, Alerts, History
     - **Emergency Coordination** (8 cards): Live Map, Incidents, Teams, Volunteers, Resources, Camps, SOS, Reports

### 📋 What You'll See
Navigate to http://localhost:3000/dashboard

You'll see:
- **Header** with PRE-DISASTER and DURING-DISASTER badges
- **Two metric sections** showing 0s for coordination (no data yet)
- **12 quick link cards** (4 existing + 8 new)
- All existing features still functional

---

## Next Step: Build Module 1 (Incident Management)

### Step 1: Update Database Schema
**File**: `prisma/schema.prisma`

Add these models:

```prisma
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
  priority        Int      @default(0) // Auto-calculated
  affectedCount   Int      // Number of people affected
  description     String
  photos          String[] // Array of image URLs
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
  incident    Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  message     String
  updatedBy   String   // user ID or team ID
  timestamp   DateTime @default(now())
  location    Json?    // If location changed
  photos      String[]
}

model Team {
  id              String   @id @default(cuid())
  name            String
  type            String   // NDRF, SDRF, Fire, Police, Medical, NGO
  agency          String?  // Organization name
  currentLocation Json?    // {lat, lng, lastUpdated}
  status          String   @default("available") // available, deployed, offline
  skills          String[] // rescue, medical, technical, fire
  equipment       String[] // boat, ambulance, firetruck, ropes
  contactNumber   String
  capacity        Int      @default(1)
  assignedIncidents Incident[]
  members         TeamMember[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, type])
}

model TeamMember {
  id       String  @id @default(cuid())
  teamId   String
  team     Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)
  name     String
  role     String  // leader, member, medic, driver
  phone    String
  verified Boolean @default(true)
}
```

### Step 2: Run Migration
```bash
npx prisma db push
```

Or create a migration:
```bash
npx prisma migrate dev --name add_coordination_models
```

### Step 3: Seed Sample Data
**File**: `prisma/seed.ts`

Add to existing seed file:

```typescript
async function seedCoordinationData() {
  // Create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'NDRF Team Alpha',
        type: 'NDRF',
        agency: 'National Disaster Response Force',
        currentLocation: { lat: 18.5204, lng: 73.8567 },
        status: 'available',
        skills: ['rescue', 'medical', 'technical'],
        equipment: ['boat', 'ropes', 'medical-kit'],
        contactNumber: '+91-9876543210',
        capacity: 3,
        members: {
          create: [
            { name: 'Rajesh Kumar', role: 'leader', phone: '+91-9876543210' },
            { name: 'Amit Sharma', role: 'medic', phone: '+91-9876543211' },
            { name: 'Vijay Patil', role: 'member', phone: '+91-9876543212' },
          ],
        },
      },
    }),
    prisma.team.create({
      data: {
        name: 'Fire Brigade Station 3',
        type: 'Fire',
        agency: 'Pune Municipal Corporation',
        currentLocation: { lat: 18.5314, lng: 73.8446 },
        status: 'available',
        skills: ['fire', 'rescue'],
        equipment: ['firetruck', 'hoses', 'breathing-apparatus'],
        contactNumber: '+91-9876543220',
        capacity: 2,
        members: {
          create: [
            { name: 'Suresh Pawar', role: 'leader', phone: '+91-9876543220' },
            { name: 'Ganesh More', role: 'member', phone: '+91-9876543221' },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created teams:', teams.length);

  // Create sample incidents
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        type: 'flood',
        severity: 4,
        location: {
          lat: 18.5074,
          lng: 73.8077,
          address: 'Sinhagad Road, Pune',
          ward: 'Ward 23',
        },
        reportedBy: 'citizen',
        reporterContact: '+91-9876543230',
        status: 'reported',
        affectedCount: 15,
        description: 'Water logging on main road, 15 people stranded',
        priority: 60, // severity * affectedCount
        photos: [],
      },
    }),
  ]);

  console.log('✅ Created incidents:', incidents.length);
}

// Add to main seed function
async function main() {
  // ... existing seed code ...
  
  await seedCoordinationData();
}
```

Run seed:
```bash
npx prisma db seed
```

### Step 4: Create API Routes
**File**: `app/api/incidents/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/incidents - List all incidents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const incidents = await prisma.incident.findMany({
      where: {
        ...(status && { status: { in: status.split(',') } }),
        ...(type && { type }),
      },
      include: {
        assignedTeam: {
          include: {
            members: true,
          },
        },
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
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create new incident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, location, description, affectedCount, reportedBy, reporterContact, photos } = body;

    // Calculate severity based on type
    const severity = calculateSeverity(type, affectedCount);
    const priority = severity * affectedCount;

    const incident = await prisma.incident.create({
      data: {
        type,
        location,
        description,
        affectedCount: affectedCount || 1,
        reportedBy,
        reporterContact,
        severity,
        priority,
        photos: photos || [],
        status: 'reported',
      },
    });

    // TODO: Trigger real-time notification
    // TODO: Auto-suggest nearest team

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}

function calculateSeverity(type: string, affectedCount: number): number {
  let baseSeverity = 3;
  
  if (type === 'fire' || type === 'collapse') baseSeverity = 5;
  if (type === 'flood') baseSeverity = 4;
  if (type === 'medical') baseSeverity = 3;
  if (type === 'other') baseSeverity = 2;

  if (affectedCount > 50) baseSeverity = Math.min(5, baseSeverity + 1);
  if (affectedCount > 100) baseSeverity = 5;

  return baseSeverity;
}
```

**File**: `app/api/incidents/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/incidents/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        assignedTeam: {
          include: { members: true },
        },
        updates: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

// PATCH /api/incidents/:id - Update incident
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Add update log if message provided
    if (updateMessage) {
      await prisma.incidentUpdate.create({
        data: {
          incidentId: params.id,
          message: updateMessage,
          updatedBy: body.updatedBy || 'system',
        },
      });
    }

    // TODO: Send real-time update via SSE

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Incidents Page
**File**: `app/(dashboard)/incidents/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Incident {
  id: string;
  type: string;
  severity: number;
  location: any;
  status: string;
  affectedCount: number;
  description: string;
  reportedAt: string;
  priority: number;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const statusFilter = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/incidents${statusFilter}`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: incidents.length,
    reported: incidents.filter(i => i.status === 'reported').length,
    assigned: incidents.filter(i => i.status === 'assigned').length,
    inProgress: incidents.filter(i => i.status === 'in-progress').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Incident Management
        </h1>
        <p className="text-gray-600">
          Track and manage all reported incidents across Maharashtra
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} color="blue" />
        <StatCard title="Reported" value={stats.reported} color="red" />
        <StatCard title="Assigned" value={stats.assigned} color="yellow" />
        <StatCard title="In Progress" value={stats.inProgress} color="orange" />
        <StatCard title="Resolved" value={stats.resolved} color="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <FilterButton
            label="All"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterButton
            label="Reported"
            active={filter === 'reported'}
            onClick={() => setFilter('reported')}
          />
          <FilterButton
            label="Assigned"
            active={filter === 'assigned'}
            onClick={() => setFilter('assigned')}
          />
          <FilterButton
            label="In Progress"
            active={filter === 'in-progress'}
            onClick={() => setFilter('in-progress')}
          />
          <FilterButton
            label="Resolved"
            active={filter === 'resolved'}
            onClick={() => setFilter('resolved')}
          />
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-700">No incidents found</p>
          </div>
        ) : (
          incidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const severityColors: any = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-orange-100 text-orange-800',
    5: 'bg-red-100 text-red-800',
  };

  const statusColors: any = {
    reported: 'bg-red-100 text-red-800',
    assigned: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColors[incident.severity]}`}>
              Severity {incident.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[incident.status]}`}>
              {incident.status}
            </span>
            <span className="text-xs text-gray-700 uppercase">{incident.type}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {incident.description}
          </h3>
          <p className="text-sm text-gray-600">
            📍 {incident.location.address || `${incident.location.lat}, ${incident.location.lng}`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            👥 {incident.affectedCount} people affected
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">#{incident.priority}</div>
          <div className="text-xs text-gray-700">Priority</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-700">
          Reported: {new Date(incident.reportedAt).toLocaleString()}
        </span>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          View Details
        </button>
      </div>
    </div>
  );
}
```

### Step 6: Test
1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3000/dashboard/incidents
3. Should see sample incidents from seed data
4. Test API: http://localhost:3000/api/incidents

---

## Quick Commands

```bash
# Update database schema
npx prisma db push

# Seed data
npx prisma db seed

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio

# Run dev server
npm run dev
```

---

## File Checklist for Module 1

- [ ] Update `prisma/schema.prisma` with Incident, Team models
- [ ] Run migration: `npx prisma db push`
- [ ] Update `prisma/seed.ts` with sample data
- [ ] Run seed: `npx prisma db seed`
- [ ] Create `app/api/incidents/route.ts`
- [ ] Create `app/api/incidents/[id]/route.ts`
- [ ] Create `app/(dashboard)/incidents/page.tsx`
- [ ] Test in browser

---

## What's Next

After Module 1 works:
1. **Module 2**: Live Coordination Map (real-time display)
2. **Module 3**: Team Management (assign teams to incidents)
3. **Module 5**: SOS Button (emergency alerts)

**Track Progress**: See [MODULE_DEVELOPMENT_PLAN.md](MODULE_DEVELOPMENT_PLAN.md) for complete roadmap
