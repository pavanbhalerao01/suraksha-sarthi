# Quick Setup Guide - SOS Volunteer Alert Feature

## ✅ What's Been Done

1. ✅ Added `SosAlert` model to Prisma schema
2. ✅ Created API endpoint: `/api/sos-alert`
3. ✅ Added "📢 Alert Volunteers" button to NDRF Admin SOS tab
4. ✅ Created confirmation modal with incident details
5. ✅ Created success modal showing volunteer notification summary
6. ✅ Implemented skill-based volunteer prioritization
7. ✅ Generated Prisma Client

## ⚠️ What You Need to Do

### Step 1: Set Up Database Connection

Create or update your `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

**For Neon DB:**
```env
DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/[database]?sslmode=require"
```

### Step 2: Run Database Migration

Open terminal and run:

```bash
# Option 1: Create migration (development)
npx prisma migrate dev --name add_sos_alert_feature

# Option 2: Push schema directly (quick test)
npx prisma db push
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test the Feature

1. Open `http://localhost:3000/ndrf-admin`
2. Click on **SOS / Alerts** tab
3. You'll see 3 mock disaster incidents
4. Click **"📢 Alert Volunteers"** button on any incident
5. Review the confirmation modal
6. Click **"Confirm & Send SOS"**
7. See success modal with volunteer notification summary

## 🔍 What Happens When Admin Clicks the Button

1. **Confirmation Modal Opens** - Shows incident details, location, reporter info
2. **Admin Confirms** - Clicks "Confirm & Send SOS"
3. **API Call** - POST request to `/api/sos-alert`
4. **System Determines Required Skills** based on disaster type:
   - Flood → diver, swimmer, boat_operator
   - Fire → firefighter, first_aid
   - Earthquake → search_rescue, structural_engineer
5. **Finds All Available Volunteers** - Status: VERIFIED, Available: true
6. **Prioritizes by Skill Match** - Volunteers with matching skills first
7. **Creates SosAlert Record** - Saves to database with all details
8. **Sends Notifications** - SMS/WhatsApp/Push (console log for now)
9. **Shows Success Modal** - Displays count of volunteers notified

## 📱 Sample SOS Message (Sent to Volunteers)

```
🚨 URGENT SOS ALERT 🚨

Hello [Volunteer Name],

DISASTER TYPE: FLOOD
SEVERITY: CRITICAL

INCIDENT: Flooding in residential colony
Water level rising rapidly. Multiple families trapped.

📍 LOCATION: Sector 5, Near Water Tank, Bhubaneswar

👤 REPORTER: Priya Patel
📞 CONTACT: +91-9812345678

🔧 REQUIRED SKILLS: diver, swimmer, boat_operator, rescue_expert

⏰ IMMEDIATE ACTION NEEDED
If you have the required skills and can help, please respond immediately.

- Survive.exe Disaster Management System
```

## 🗄️ Database Table Created

The `SosAlert` table stores:
- Incident ID and details (type, severity, description)
- Location and address
- Reporter name and phone
- Required skills (auto-determined)
- List of volunteers notified
- Timestamp and admin who sent it
- Response tracking (for future enhancement)

## 🎨 UI Changes

**In NDRF Admin → SOS / Alerts Tab:**

Before:
```
[✅ Verify] [🚁 Dispatch Team] [⛔ Mark as False]
```

After:
```
[✅ Verify] [🚁 Dispatch Team] [📢 Alert Volunteers] [⛔ Mark as False]
```

**New Orange Button:**
- Color: Orange/Red gradient (emergency color)
- Icon: 📢 (megaphone/broadcast)
- Label: "Alert Volunteers"
- Disabled state while sending: "⏳ Sending..."
- Responsive: Wraps on mobile screens

## 🐛 Known Issues (TypeScript Errors)

You may see TypeScript errors like:
```
Property 'sosAlert' does not exist on type 'PrismaClient'
```

**This is normal!** These errors will disappear after:
1. Running the database migration
2. Restarting the development server
3. Reloading the TypeScript language server (Cmd/Ctrl + Shift + P → "Reload Window")

## 📊 Database Schema

```sql
CREATE TABLE "SosAlert" (
  id TEXT PRIMARY KEY,
  incidentId TEXT NOT NULL,
  disasterType TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT NOT NULL,            -- JSON: {"lat": 20.29, "lng": 85.82}
  address TEXT NOT NULL,
  reporterName TEXT NOT NULL,
  reporterPhone TEXT NOT NULL,
  requiredSkills TEXT NOT NULL,      -- JSON: ["diver", "swimmer"]
  sentBy TEXT NOT NULL,              -- Admin user ID
  sentAt TIMESTAMP DEFAULT NOW(),
  volunteersNotified TEXT NOT NULL,  -- JSON: ["vol-id-1", "vol-id-2"]
  totalVolunteersNotified INTEGER DEFAULT 0,
  volunteersResponded TEXT,          -- JSON: ["vol-id-3"]
  totalVolunteersResponded INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sosalert_incident ON "SosAlert"(incidentId);
CREATE INDEX idx_sosalert_sent ON "SosAlert"(sentAt);
CREATE INDEX idx_sosalert_type ON "SosAlert"(disasterType);
```

## 🚀 Production Deployment

For production, you need to integrate actual SMS/Push services:

### 1. Twilio (SMS)
```bash
npm install twilio
```

Add to `/api/sos-alert/route.ts`:
```typescript
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

for (const volunteer of sortedVolunteers) {
  await client.messages.create({
    to: volunteer.user.phone,
    from: process.env.TWILIO_PHONE,
    body: message
  });
}
```

### 2. Firebase Cloud Messaging (Push)
```bash
npm install firebase-admin
```

### 3. WhatsApp Business API
```bash
npm install whatsapp-web.js
```

## ✅ Testing Checklist

- [ ] DATABASE_URL is set in `.env`
- [ ] Migration ran successfully
- [ ] `SosAlert` table exists in database
- [ ] Dev server is running
- [ ] Can access `/ndrf-admin` page
- [ ] SOS / Alerts tab loads without errors
- [ ] "📢 Alert Volunteers" button is visible
- [ ] Clicking button opens confirmation modal
- [ ] Modal shows incident details correctly
- [ ] "Confirm & Send SOS" creates database record
- [ ] Success modal shows volunteer count

## 📞 Support

If you encounter issues:
1. Check terminal for error messages
2. Verify DATABASE_URL is correct
3. Ensure Prisma Client is generated: `npx prisma generate`
4. Check browser console (F12) for client-side errors
5. Test API directly: `POST http://localhost:3000/api/sos-alert`

---

**Status:** ✅ Feature Complete - Ready to Test After Database Setup

**Full Documentation:** See `SOS_VOLUNTEER_ALERT_FEATURE.md`
