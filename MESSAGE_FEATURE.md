# Message Feature Implementation

## Overview
Relief Camp Incharge can now send messages with image attachments to NDRF Admin and action team POCs through the Command Center.

## Features Implemented

### 1. Message Modal UI ✅
- **Location**: Relief camp dashboard (`/team/relief-camp`)
- **Trigger**: "Send Message" button in purple Command Center card
- **Features**:
  - Multi-select checkboxes for 6 action teams:
    - 🔵 NDRF Team
    - 🔷 SDRF Team
    - 🔴 Fire Services
    - ⚫ Police Team
    - 🟢 Medical Team
    - 🟡 Civil Defense
  - Required message text area (5 rows)
  - Multiple image upload support (optional)
  - Displays sender info (camp name, location, coordinates)
  - Send/Cancel buttons

### 2. Message Handler Function ✅
- **Function**: `handleSendMessage(formData: FormData)`
- **Validation**:
  - Requires at least 1 recipient selected
  - Requires message text
- **Process**:
  - Extracts recipients, message, and images from FormData
  - Creates new FormData with sender metadata
  - POSTs to `/api/messages/send`
  - Shows success alert with recipient count
  - Closes modal on success
  - Shows error alert on failure

### 3. API Endpoint ✅
- **Path**: `/app/api/messages/send/route.ts`
- **Method**: POST
- **Accepts**: FormData with:
  - `sender`: Camp incharge name
  - `senderCamp`: Relief camp name
  - `recipients`: JSON array of selected teams
  - `message`: Message text
  - `images`: Multiple image files (optional)
- **Validation**:
  - Required: sender, senderCamp, recipients (at least 1), message
  - Validates recipients is valid JSON array
- **Returns**:
  - Success: `{ success: true, messageId, recipients, imageCount, sentAt }`
  - Error: `{ error: "error message" }` with 400/500 status

## User Flow

1. Relief Camp Incharge clicks **"Send Message"** in Command Center card
2. Modal opens with recipient checkboxes
3. Incharge selects 1+ teams (e.g., NDRF + Medical Team)
4. Types urgent message (e.g., "Need medical supplies urgently")
5. (Optional) Attaches 1-3 images showing situation
6. Clicks **Send Message**
7. API processes request
8. Success alert shows: "Message sent to X recipients"
9. Modal closes automatically

## Implementation Details

### State Management
```typescript
const [showMessageModal, setShowMessageModal] = useState(false);
```

### Button Trigger (Line 494)
```typescript
<button 
  onClick={() => setShowMessageModal(true)}
  className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
>
  Send Message
</button>
```

### Form Submission (Line 775)
```typescript
<form onSubmit={(e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  handleSendMessage(formData);
}}>
```

## Future Enhancements (Not Yet Implemented)

### Database Storage
Add Message model to `schema.prisma`:
```prisma
model Message {
  id            String   @id @default(cuid())
  sender        String
  senderCamp    String
  recipients    String   // JSON array
  message       String
  imageUrls     String?  // JSON array
  sentAt        DateTime @default(now())
  readBy        String?  // JSON array of who read it
}
```

### Image Upload to Cloud
- Integrate Cloudinary/AWS S3 for image storage
- Return image URLs in API response
- Display images in recipient dashboards

### Real-Time Notifications
- WebSocket/SSE to notify recipients instantly
- SMS notifications for critical messages
- WhatsApp Business API integration

### Message Threads
- Group messages by conversation
- Reply functionality
- Message read receipts

### Message History
- View sent messages in dashboard
- Track delivery and read status
- Archive/delete messages

## Testing

### Manual Test Steps
1. Navigate to `/team/relief-camp`
2. Click "Send Message" in Command Center
3. Select NDRF Team + Fire Services
4. Enter message: "Need 100 blankets and medical supplies"
5. Upload 2 images
6. Click Send
7. Verify success alert shows "Message sent to 2 recipients"
8. Check browser console for API response

### Expected Console Output
```
Message sent: {
  from: "Relief Camp Manager",
  camp: "Shivaji Nagar Emergency Camp",
  to: ["NDRF Team", "Fire Services"],
  message: "Need 100 blankets and medical supplies",
  imageCount: 2
}
```

## Files Modified

1. **app/team/[teamType]/page.tsx** (Lines 60, 145-205, 494, 770-920)
   - Added `showMessageModal` state
   - Added `handleSendMessage` function
   - Connected Command Center button
   - Added message modal UI

2. **app/api/messages/send/route.ts** (NEW FILE)
   - Created POST endpoint
   - Validates FormData
   - Processes images
   - Returns success/error response

## Status: ✅ COMPLETE

All requested features implemented:
- ✅ Multi-recipient selection (6 action teams)
- ✅ Message text area
- ✅ Multiple image upload
- ✅ API endpoint with validation
- ✅ Success/error handling
- ✅ Modal UI with proper styling

**Ready for testing and deployment!**
