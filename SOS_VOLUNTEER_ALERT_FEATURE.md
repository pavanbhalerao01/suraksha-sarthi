# SOS Volunteer Alert Feature - Implementation Summary

## 🚨 Feature Overview

The **SOS Volunteer Alert** feature allows NDRF Admin to send emergency alerts to all verified and available volunteers with a single click. When an admin presses the "📢 Alert Volunteers" button from any disaster complaint in the SOS & Alerts tab, the system:

1. **Sends SOS alert** to all verified, available volunteers
2. **Shares disaster details** (type, severity, description)
3. **Provides victim location** with GPS coordinates
4. **Includes reporter contact** (name, phone number)
5. **Auto-matches required skills** based on disaster type
6. **Prioritizes volunteers** with matching skills first

---

## 🎯 Implementation Details

### 1. Database Schema (`prisma/schema.prisma`)

Added new `SosAlert` model to track all SOS broadcasts:

```prisma
model SosAlert {
  id                String      @id @default(cuid())
  
  // Incident details
  incidentId        String
  disasterType      String      // 'flood', 'fire', 'building_collapse', etc.
  title             String
  description       String
  severity          String      // 'low', 'medium', 'high', 'critical'
  
  // Location details
  location          String      // GeoJSON point { lat, lng }
  address           String
  
  // Complainant/Reporter details
  reporterName      String
  reporterPhone     String
  
  // Required skills for this disaster
  requiredSkills    String      // JSON array: ["diver", "swimmer", "boat_operator"]
  
  // Alert metadata
  sentBy            String      // Admin user ID who triggered the SOS
  sentAt            DateTime    @default(now())
  
  // Volunteers notified (stored as JSON array of volunteer IDs)
  volunteersNotified String     // ["vol-id-1", "vol-id-2", "vol-id-3"]
  totalVolunteersNotified Int   @default(0)
  
  // Response tracking
  volunteersResponded  String?  // JSON array of volunteer IDs who responded
  totalVolunteersResponded Int  @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([incidentId])
  @@index([sentAt])
  @@index([disasterType])
}
```

### 2. API Endpoint (`app/api/sos-alert/route.ts`)

Created RESTful API for SOS alerts:

#### POST `/api/sos-alert` - Send SOS to volunteers

**Request Body:**
```json
{
  "incidentId": "sos-001",
  "disasterType": "flood",
  "title": "Flooding in residential colony",
  "description": "Water level rising rapidly. Multiple families trapped.",
  "severity": "CRITICAL",
  "location": { "lat": 20.2961, "lng": 85.8245 },
  "address": "Sector 5, Near Water Tank, Bhubaneswar",
  "reporterName": "Priya Patel",
  "reporterPhone": "+91-9812345678",
  "sentBy": "NDRF_ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS alert sent to 45 volunteers",
  "data": {
    "sosAlertId": "sos-alert-xyz",
    "totalVolunteersNotified": 45,
    "requiredSkills": ["diver", "swimmer", "boat_operator", "rescue_expert"],
    "notifications": [...] // First 5 volunteers for preview
  }
}
```

#### GET `/api/sos-alert?incidentId=xxx` - Get SOS alerts for incident

Returns all SOS alerts sent for a specific incident.

#### GET `/api/sos-alert` - Get all recent SOS alerts

Returns last 100 SOS alerts across all incidents.

### 3. Skill Mapping Based on Disaster Type

The API automatically determines required skills based on disaster type:

| Disaster Type | Required Skills |
|--------------|----------------|
| **Flood** | diver, swimmer, boat_operator, rescue_expert |
| **Building Collapse** | first_aid, rescue_expert, structural_engineer, heavy_equipment_operator |
| **Fire** | firefighter, first_aid, rescue_expert |
| **Medical Emergency** | doctor, paramedic, first_aid, nurse |
| **Earthquake** | search_rescue, first_aid, structural_engineer, heavy_equipment_operator |
| **Landslide** | search_rescue, earth_moving_operator, first_aid, geologist |
| **Heatwave** | first_aid, medical_assistant, paramedic |
| **Drought** | logistics, water_distribution, driver |
| **Cyclone** | rescue_expert, first_aid, boat_operator, driver |
| **Road Accident** | first_aid, paramedic, tow_truck_operator |
| **Water Contamination** | water_quality_expert, logistics, driver |
| **Default** | first_aid, rescue_expert |

### 4. Volunteer Prioritization Logic

Volunteers are sorted by skill match score:
1. **First priority**: Volunteers with matching skills for the disaster type
2. **Second priority**: Volunteers with general rescue/first-aid skills
3. All volunteers receive the alert, but those with matching skills are notified first

### 5. UI Implementation (`app/ndrf-admin/page.tsx`)

#### Added "📢 Alert Volunteers" Button

Located in SOS Tab, beside the "⛔ Mark as False" button for each disaster:

```tsx
<button 
  onClick={() => handleSendSOS(sos)}
  disabled={sendingSOSId === sos.id}
  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
>
  {sendingSOSId === sos.id ? '⏳ Sending...' : '📢 Alert Volunteers'}
</button>
```

#### Confirmation Modal

Before sending, admin sees a detailed confirmation modal with:
- Incident details (type, severity, description)
- Location and address
- Reporter contact information
- What volunteers will receive
- Confirmation buttons

#### Success Response Modal

After sending, admin sees:
- ✅ Success confirmation
- Total volunteers notified
- Required skills sent
- Preview of first 5 volunteer notifications (name, phone, skills)

---

## 📱 What Volunteers Receive

Volunteers receive a formatted SOS message via SMS/Push/WhatsApp:

```
🚨 URGENT SOS ALERT 🚨

Hello [Volunteer Name],

DISASTER TYPE: FLOOD
SEVERITY: CRITICAL

INCIDENT: Flooding in residential colony
Water level rising rapidly. Multiple families trapped on rooftops.

📍 LOCATION: Sector 5, Near Water Tank, Bhubaneswar

👤 REPORTER: Priya Patel
📞 CONTACT: +91-9812345678

🔧 REQUIRED SKILLS: diver, swimmer, boat_operator, rescue_expert

⏰ IMMEDIATE ACTION NEEDED
If you have the required skills and can help, please respond immediately.

Stay safe and coordinate with NDRF team on-site.

- Survive.exe Disaster Management System
```

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

Ensure your `.env` file has the correct `DATABASE_URL`:

```bash
# .env file
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

Then run:

```bash
# Generate Prisma Client
npx prisma generate

# Run migration to create SOSAlert table
npx prisma migrate dev --name add_sos_alert_model

# Or push schema directly to database
npx prisma db push
```

### Step 2: Test in Development

1. Start the development server:
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/ndrf-admin`

3. Click on the **SOS / Alerts** tab

4. You'll see mock disaster data with the new "📢 Alert Volunteers" button

5. Click the button on any disaster to test the flow

### Step 3: Integration with SMS/Push Services (Production)

Currently, the API LOGS notifications to console. For production, integrate with:

#### SMS Gateway (Twilio/msg91)
```typescript
// In app/api/sos-alert/route.ts, add after creating SOSAlert:

import twilio from 'twilio';
const client = twilio(accountSid, authToken);

for (const volunteer of sortedVolunteers) {
  await client.messages.create({
    to: volunteer.user.phone,
    from: twilioPhoneNumber,
    body: generateSOSMessage({...})
  });
}
```

#### Push Notifications (Firebase FCM)
```typescript
import admin from 'firebase-admin';

const message = {
  notification: {
    title: '🚨 URGENT SOS ALERT',
    body: `${disasterType.toUpperCase()} - ${title}`
  },
  data: {
    incidentId,
    severity,
    location: JSON.stringify(location),
    reporterPhone
  },
  tokens: volunteerFCMTokens
};

await admin.messaging().sendEachForMulticast(message);
```

#### WhatsApp Business API
```typescript
// Use WhatsApp Business API to send rich messages with location
const whatsappMessage = {
  to: volunteer.user.phone,
  type: 'template',
  template: {
    name: 'sos_alert',
    language: { code: 'en' },
    components: [...]
  }
};
```

---

## ✅ Testing Checklist

- [ ] Database migration completed successfully
- [ ] SOSAlert table exists in database
- [ ] API endpoint `/api/sos-alert` returns 200 on POST
- [ ] "📢 Alert Volunteers" button appears on all disasters in SOS tab
- [ ] Clicking button opens confirmation modal
- [ ] Modal shows correct disaster details and reporter info
- [ ] "Confirm & Send SOS" button triggers API call
- [ ] Success modal shows volunteer count and skills
- [ ] Database contains new SOSAlert record after sending
- [ ] Required skills match disaster type correctly

---

## 🔐 Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent spam SOS alerts
```typescript
// Consider: Max 3 SOS alerts per incident
// Consider: Max 50 SOS alerts per admin per hour
```

2. **Authentication**: Ensure only NDRF Admin can send SOS
```typescript
// Add middleware to verify admin role
if (userRole !== 'NDRF_ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

3. **Data Privacy**: Mask sensitive reporter phone numbers in logs

4. **Audit Trail**: All SOS alerts are logged in database with timestamp and admin who sent them

---

## 📊 Future Enhancements

1. **Response Tracking**: Track which volunteers responded and accepted the task
2. **Geofencing**: Send SOS only to volunteers within X km radius
3. **Skill Verification**: Require volunteers to verify their skills before receiving specialized alerts
4. **Multi-Language Support**: Send alerts in volunteer's preferred language (Marathi, Hindi, English)
5. **Voice Calls**: Trigger automated voice calls to volunteers for critical disasters
6. **ETA Tracking**: Show estimated arrival time of volunteers on map
7. **Feedback Loop**: Collect volunteer feedback after incident resolution

---

## 🐛 Troubleshooting

### Button doesn't appear
- Check if `SOSTab` component is rendered correctly
- Verify button is inside the `.map()` loop for disaster list

### API returns 500 error
- Check Prisma Client is generated: `npx prisma generate`
- Verify DATABASE_URL in `.env` is correct
- Check server logs for detailed error message

### No volunteers notified
- Ensure Volunteer table has records with `status: "VERIFIED"` and `isAvailable: true`
- Check volunteer skills are stored as JSON array in database
- Verify volunteers have valid phone/email addresses

### Modal doesn't close
- Clear state: `setShowSOSModal(false); setSelectedSOS(null); setSOSResponse(null);`
- Check for JavaScript errors in browser console

---

## 📝 Credits

**Developed by:** [Your Team]  
**Feature Request:** SOS Alert to Volunteers  
**Date Implemented:** February 21, 2026  
**Database:** PostgreSQL (Neon)  
**Framework:** Next.js 14 + Prisma ORM  
**UI Library:** Tailwind CSS + Lucide Icons  

---

## 📞 Support

For issues or questions about this feature:
- Check browser console for errors
- Verify database schema: `npx prisma studio`
- Review API logs in terminal
- Test with mock data first before production deployment

---

**Status:** ✅ IMPLEMENTED & READY FOR TESTING

**Next Steps:**
1. Set up DATABASE_URL in `.env`
2. Run database migration
3. Test with development server
4. Integrate SMS/Push services for production
5. Deploy to Vercel/production environment
