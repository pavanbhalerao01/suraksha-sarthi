# Authentication & User Management Architecture
## Survive.exe - Multi-Role Disaster Management Platform

---

## Overview

This document outlines the complete authentication and role-based access control (RBAC) system for Survive.exe, enabling secure, personalized access for different user types while maintaining open citizen access.

---

## User Roles & Access Levels

### 1. **Citizen** (Login Required - OTP Verified)
- **Access**: Login required with OTP verification
- **Purpose**: Collect name, phone, email for automatic SOS alerts and emergency communication
- **Registration Flow**:
  - Enter: Name, Phone Number, Email
  - OTP sent to phone via Twilio
  - Verify OTP
  - Instant access (no NDRF validation needed)
- **Features**: 
  - Emergency SOS (General + Medical) - auto-sends name/number to authorities
  - Incident reporting
  - Track own reports
  - SMS/WhatsApp emergency notifications
- **Portal**: `/citizen`
- **Validation**: OTP verification only (instant approval)

### 2. **Action Team Members** (Field Teams)
- **Types**:
  - NDRF Field Team
  - SDRF Field Team
  - Fire Services
  - Police Team
  - Medical Emergency Team
  - Ambulance Driver
  - Civil Defense Team
  - Relief Camp Incharge
- **Access**: Login required, pending validation
- **Features**:
  - Team-specific dashboard
  - Live GPS tracking
  - Incident assignment
  - Resource requests
  - Inter-team messaging
- **Portal**: `/team/[teamType]`
- **Validation**: Requires NDRF/Admin approval

### 3. **NDRF Admin** (National Disaster Response Force)
- **Access**: Login required, pre-approved accounts
- **Features**:
  - Command center dashboard
  - Validate new team registrations
  - Monitor all teams and incidents
  - Resource allocation
  - Analytics and reporting
- **Portal**: `/admin/ndrf`

### 4. **Super Admin** (System Administrator)
- **Access**: Login required, highest privilege
- **Features**:
  - Create all user types
  - Manage demo accounts
  - System configuration
  - User management (activate/deactivate)
  - Audit logs
  - Database management
- **Portal**: `/admin/super`

---

## Authentication Flow

### Registration Workflow

```
┌─────────────┐
│   CITIZEN   │ ──► Register (Name, Phone, Email) ──► OTP Verification ──► Instant Access (No Validation)
└─────────────┘     Uses Twilio for SMS OTP

┌─────────────┐
│ ACTION TEAM │ ──► Self-register ──► Pending Validation ──► NDRF Approves ──► Access Granted
└─────────────┘

┌─────────────┐
│  NDRF ADMIN │ ──► Created by Super Admin ──► Pre-approved ──► Access Granted
└─────────────┘

┌─────────────┐
│ SUPER ADMIN │ ──► Manual database entry (Initial) ──► Full Access
└─────────────┘
```

### Login Flow

1. **Portal Selection** (`/portal`)
   - User sees 8 portal options (NDRF, Collector, Citizen, Volunteer, NGO, Action Teams, etc.)
   - **Citizen**: Click → Redirect to `/login?portal=citizen` (requires login for name/phone for SOS)
   - **All Others**: Click → Redirect to `/login?portal=[type]`

2. **Login Page** (`/login`)
   - **For Citizens**: Phone Number + OTP (simpler, faster)
   - **For Teams/Admins**: Username/Email + Password
   - "Register" link available for all
   - Forgot Password flow (for non-citizen users)
   - OAuth options (Google, Microsoft - future)

3. **Post-Login**
   - Check user role
   - Redirect to authorized portal
   - Show personalized name/details
   - Grey out unauthorized portals

4. **Session Management**
   - JWT tokens (stored in httpOnly cookies)
   - Session expiry: 8 hours (configurable)
   - Auto-logout on inactivity: 2 hours
   - Remember Me option: 30 days

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255), -- Only for action teams/admins, NULL for citizens
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'citizen', 'ndrf', 'sdrf', 'fire', 'police', 'medical', 'ambulance', 'civil-defense', 'relief-camp', 'ndrf-admin', 'super-admin'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'rejected'
  is_demo BOOLEAN DEFAULT false,
  
  -- OTP verification (for citizens and volunteers)
  phone_verified BOOLEAN DEFAULT false,
  otp_code VARCHAR(6),
  otp_expires_at TIMESTAMP,
  otp_attempts INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  validated_by UUID REFERENCES users(id), -- NDRF admin who validated (for action teams only)
  validated_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(role, status);
```

### Team Profiles Table (Action Teams)
```sql
CREATE TABLE team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_type VARCHAR(50) NOT NULL, -- 'ndrf', 'sdrf', 'fire', etc.
  team_id VARCHAR(100), -- Official team ID (e.g., "NDRF-MH-PUNE-001")
  badge_number VARCHAR(100),
  department VARCHAR(255),
  district VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Maharashtra',
  specializations TEXT[], -- ['Water Rescue', 'High Angle', etc.]
  verification_document_url TEXT, -- ID proof, certificate
  current_location GEOGRAPHY(POINT),
  on_duty BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Validation Queue Table
```sql
CREATE TABLE validation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  requested_role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  documents JSONB, -- Verification documents
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
```

---

## Demo Accounts (Pre-created)

### Super Admin
```
Email: admin@survive.exe
Password: SuperAdmin@2026! (change on first login)
Role: super-admin
Status: active
```

### Citizens (OTP Verified)
```
1. Phone: +91-9876543210 | Name: Ramesh Patil | Email: ramesh.citizen@example.com
2. Phone: +91-9876543211 | Name: Sunita Desai | Email: sunita.citizen@example.com
3. Phone: +91-9876543212 | Name: Akash Sharma | Email: akash.citizen@example.com
Note: Use OTP: 123456 for demo testing (bypasses Twilio in demo mode)
```

### NDRF Admin (2 accounts)
```
1. Email: ndrf.command@survive.exe
   Password: NDRF@Command2026
   Role: ndrf-admin
   Name: Commander Rajesh Sharma
   
2. Email: ndrf.ops@survive.exe
   Password: NDRF@Ops2026
   Role: ndrf-admin
   Name: Officer Priya Deshmukh
```

### Action Team Members (2-3 per type)

**NDRF Field Team**
```
1. Email: ndrf.field1@survive.exe | Password: NDRF@Field123 | Name: Vikram Singh | Team ID: NDRF-MH-001
2. Email: ndrf.field2@survive.exe | Password: NDRF@Field456 | Name: Amit Patil | Team ID: NDRF-MH-002
3. Email: ndrf.field3@survive.exe | Password: NDRF@Field789 | Name: Suresh Kumar | Team ID: NDRF-MH-003
```

**SDRF Field Team**
```
1. Email: sdrf.field1@survive.exe | Password: SDRF@Field123 | Name: Rahul Desai
2. Email: sdrf.field2@survive.exe | Password: SDRF@Field456 | Name: Kiran Bhosale
```

**Fire Services**
```
1. Email: fire.team1@survive.exe | Password: Fire@Team123 | Name: Fireman Ganesh Rao
2. Email: fire.team2@survive.exe | Password: Fire@Team456 | Name: Fireman Sanjay Malik
```

**Police Team**
```
1. Email: police.team1@survive.exe | Password: Police@Team123 | Name: Inspector Anil Kulkarni
2. Email: police.team2@survive.exe | Password: Police@Team456 | Name: Constable Deepak More
```

**Medical Emergency Team**
```
1. Email: medical.team1@survive.exe | Password: Medical@Team123 | Name: Dr. Sneha Joshi
2. Email: medical.team2@survive.exe | Password: Medical@Team456 | Name: Paramedic Ravi Sharma
```

**Ambulance Drivers**
```
1. Email: ambulance.driver1@survive.exe | Password: Ambulance@123 | Name: Driver Mahesh Pawar | Vehicle: AMB-101
2. Email: ambulance.driver2@survive.exe | Password: Ambulance@456 | Name: Driver Sunil Kadam | Vehicle: AMB-102
3. Email: ambulance.driver3@survive.exe | Password: Ambulance@789 | Name: Driver Rajesh Bhoir | Vehicle: AMB-103
```

**Civil Defense Team**
```
1. Email: civil.defense1@survive.exe | Password: CivilDefense@123 | Name: Coordinator Ashok Patil
2. Email: civil.defense2@survive.exe | Password: CivilDefense@456 | Name: Volunteer Priya Nair
```

**Relief Camp Incharge**
```
1. Email: relief.camp1@survive.exe | Password: ReliefCamp@123 | Name: Camp Manager Vijay Deshmukh
2. Email: relief.camp2@survive.exe | Password: ReliefCamp@456 | Name: Camp Manager Kavita Kulkarni
```

---

## UI/UX Changes

### 1. Portal Selection Page (`/portal`)

**BEFORE:**
- Simple grid of portal cards
- Direct access to all portals

**AFTER:**
```tsx
// Unauthenticated user sees:
[CITIZEN] ──► 🔒 Login Required (shows login/register buttons - needs phone for SOS)
[NDRF Command] ──► 🔒 Login Required (grey, shows login button)
[Action Teams] ──► 🔒 Login Required (grey, shows login/register buttons)
[Others] ──► 🔒 Login Required (grey)

// Authenticated citizen sees:
[CITIZEN] ──► ✓ MY PORTAL (highlighted, enabled)
[Other Portals] ──► 🔒 Unauthorized (greyed out)

// Authenticated user (e.g., NDRF Field Team member) sees:
[CITIZEN] ──► Enabled (can access)
[Action Teams - NDRF] ──► ✓ MY PORTAL (highlighted, enabled)
[NDRF Command] ──► 🔒 Unauthorized (greyed out)
[Other Teams] ──► 🔒 Unauthorized (greyed out)

// Super Admin sees:
ALL PORTALS ──► Enabled (can access everything for testing)
```

### 2. Login Page (`/login`)

**Layout:**
```
┌────────────────────────────────────────┐
│      Survive.exe - Disaster Mgmt      │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Login to [Portal Name]           │ │
│  │                                  │ │
│  │ Email/Username: [______________] │ │
│  │ Password:       [______________] │ │
│  │                                  │ │
│  │ [ ] Remember Me                  │ │
│  │                                  │ │
│  │ [      Login      ]              │ │
│  │                                  │ │
│  │ Forgot Password? | Register      │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Demo Accounts (Testing Only):        │
│  Super Admin: admin@survive.exe       │
│  NDRF: ndrf.field1@survive.exe        │
│  [Show all demo accounts]             │
└────────────────────────────────────────┘
```

### 3. Registration Page (`/register`)

**For Citizens (OTP-based, Instant Access):**
```
┌──────────────────────────────────────┐
│  Citizen Registration (Emergency)   │
│                                      │
│  Full Name: [___________________]   │
│  Phone:     [+91-______________]    │
│  Email:     [___________________]   │
│                                      │
│  [Send OTP to Phone]                │
│                                      │
│  OTP Code:  [_] [_] [_] [_] [_] [_] │
│                                      │
│  [Verify & Register]                │
│                                      │
│  ⏱️ Resend OTP in 60 seconds        │
└──────────────────────────────────────┘

Flow:
1. Enter Name, Phone, Email
2. Click "Send OTP" → Twilio sends 6-digit OTP to phone
3. Enter OTP code (6 digits)
4. Click "Verify & Register"
5. ✓ Account created instantly (status: active)
6. Redirect to citizen portal
7. Name & phone now auto-sent with SOS alerts

Twilio Integration:
- Uses same credentials as volunteer panel
- SMS format: "Your Survive.exe OTP is: 123456. Valid for 5 minutes."
- OTP expires in 5 minutes
- Max 3 attempts per phone number
- Resend available after 60 seconds
```

**For Action Teams (Document-based, NDRF Validation):**
```
Step 1: Personal Details
- Full Name *
- Email *
- Phone *
- Password *
- Confirm Password *

Step 2: Team Details
- Team Type * (dropdown: NDRF, SDRF, Fire, etc.)
- Official Team ID
- Badge Number
- Department
- District *
- State * (default: Maharashtra)
- Specializations (multi-select)

Step 3: Verification
- Upload ID Proof * (Aadhar, PAN, Employee ID)
- Upload Certificate/Badge Photo *
- Upload Department Letter (optional)

Step 4: Confirmation
- Review details
- Submit for validation

After Submission:
"✓ Registration submitted successfully!
Your account is pending validation by NDRF command center.
You will receive an email once approved.
Ticket ID: REG-2026-ABC123"
```

### 4. NDRF Admin Panel - Validation Tab

**New Tab: "Validate Teams"**
```
┌─────────────────────────────────────────────────────────┐
│ NDRF Command Center - Team Validation Queue            │
│                                                         │
│ [Pending: 12] [Approved: 45] [Rejected: 3]            │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ REG-2026-ABC123 | Vikram Singh | NDRF Field Team   ││
│ │ Submitted: 2 hours ago                              ││
│ │ Email: vikram.field@gmail.com | Phone: +91-9876... ││
│ │ Team ID: NDRF-MH-PUNE-045 | Badge: NDRF-12345     ││
│ │ District: Pune | Specialization: Water Rescue      ││
│ │ Documents: [ID Proof ✓] [Badge Photo ✓] [Letter ✓]││
│ │                                                     ││
│ │ [View Documents] [Approve ✓] [Reject ✗]           ││
│ └─────────────────────────────────────────────────────┘│
│ ... (more pending registrations)                       │
└─────────────────────────────────────────────────────────┘
```

### 5. Super Admin Panel (`/admin/super`)

**Features:**
```
┌─────────────────────────────────────┐
│ Super Admin Control Panel          │
│                                     │
│ [User Management]                   │
│ - Create New User (any role)       │
│ - View All Users                    │
│ - Activate/Suspend Accounts         │
│ - Reset Passwords                   │
│                                     │
│ [Demo Account Management]           │
│ - View Demo Accounts                │
│ - Reset Demo Passwords              │
│ - Create New Demo Account           │
│                                     │
│ [System Configuration]              │
│ - Session Settings                  │
│ - Email Templates                   │
│ - Role Permissions                  │
│                                     │
│ [Audit Logs]                        │
│ - Login History                     │
│ - User Actions                      │
│ - System Events                     │
└─────────────────────────────────────┘
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new action team member
POST   /api/auth/register-citizen  - Register citizen with OTP (Step 1: Send OTP)
POST   /api/auth/verify-otp        - Verify OTP and complete citizen registration
POST   /api/auth/resend-otp        - Resend OTP to phone
POST   /api/auth/login             - Login (returns JWT token)
POST   /api/auth/login-citizen     - Citizen login with phone + OTP
POST   /api/auth/logout            - Logout (invalidate token)
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset (for action teams/admins)
POST   /api/auth/reset-password    - Reset password with token
GET    /api/auth/me                - Get current user details
```

### User Management (Super Admin)
```
GET    /api/admin/users            - List all users (paginated)
POST   /api/admin/users            - Create new user
PUT    /api/admin/users/:id        - Update user
DELETE /api/admin/users/:id        - Delete user
POST   /api/admin/users/:id/suspend - Suspend user
POST   /api/admin/users/:id/activate - Activate user
```

### Team Validation (NDRF Admin)
```
GET    /api/admin/validation-queue       - Get pending validations
GET    /api/admin/validation-queue/:id   - Get validation details
POST   /api/admin/validation-queue/:id/approve - Approve registration
POST   /api/admin/validation-queue/:id/reject  - Reject registration
```

### Demo Accounts
```
GET    /api/admin/demo-accounts    - List all demo accounts
POST   /api/admin/demo-accounts    - Create demo account
POST   /api/admin/demo-accounts/reset - Reset demo passwords
```

---

## Security Measures

1. **Password Requirements** (Action Teams/Admins only)
   - Minimum 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number, 1 special character
   - Not same as username/email
   - Hashed with bcrypt (salt rounds: 10)

2. **OTP Verification** (Citizens)
   - 6-digit numeric code
   - Expires in 5 minutes
   - Max 3 verification attempts per OTP
   - Max 5 OTP requests per phone per hour
   - Resend cooldown: 60 seconds

3. **Rate Limiting**
   - Login attempts: 5 per 15 minutes per IP
   - Registration: 3 per hour per IP
   - OTP requests: 5 per hour per phone number
   - Password reset: 3 per hour per email

4. **Twilio Configuration** (OTP SMS)
   - Account SID: [Use same as volunteer panel]
   - Auth Token: [Use same as volunteer panel]
   - From Number: [Use same as volunteer panel]
   - SMS Template: "Your Survive.exe emergency OTP is: {code}. Valid for 5 minutes. Do not share."
   - Demo Mode: If TWILIO_DEMO=true, accept OTP 123456 for all numbers (testing only)

5. **JWT Token Security**
   - Signed with HS256 algorithm
   - Short expiry (8 hours)
   - Stored in httpOnly cookies (XSS protection)
   - CSRF token for state-changing requests

6. **Role-Based Authorization**
   - Middleware checks on every protected route
   - API endpoints validate user role
   - Frontend hides unauthorized UI

7. **Audit Logging**
   - All login attempts (success/failure)
   - User creation/modification
   - Team validations
   - OTP send/verify events
   - Critical actions

---

## Implementation Phases

### Phase 1: Core Authentication (Week 1)
- [ ] Setup database schema
- [ ] Implement JWT authentication
- [ ] Create login/register pages
- [ ] Add middleware for protected routes
- [ ] Seed demo accounts

### Phase 2: Role-Based Access Control (Week 2)
- [ ] Implement role checking middleware
- [ ] Update portal selection page (show/hide based on role)
- [ ] Add personalized headers (user name, role)
- [ ] Create logout functionality

### Phase 3: Team Validation Workflow (Week 3)
- [ ] Build registration flow for action teams
- [ ] Create NDRF validation queue UI
- [ ] Implement approve/reject functionality
- [ ] Email notifications (registration, approval, rejection)

### Phase 4: Super Admin Panel (Week 4)
- [ ] Create super admin dashboard
- [ ] User management interface
- [ ] Demo account management
- [ ] Audit log viewer
- [ ] System configuration

### Phase 5: Polish & Testing (Week 5)
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation
- [ ] Demo preparation

---

## Migration Strategy

### Backward Compatibility
- Current open-access portals continue to work
- Add `/login` redirect for protected portals
- Gradual rollout: First enable for Action Teams, then others
- Citizen portal remains always open

### Data Migration
- No existing user data (fresh deployment)
- Seed script creates all demo accounts
- Import real team data from CSV (if available)

---

## Testing Scenarios

### Scenario 1: Citizen Registration & SOS with OTP
1. Visit `/portal`
2. Click "Citizen Portal" → Redirect to `/login?portal=citizen`
3. Click "Register"
4. Enter: Name "Ramesh Patil", Phone "+91-9876543210", Email "ramesh@example.com"
5. Click "Send OTP" → Twilio sends SMS with 6-digit code
6. Enter OTP code (or use 123456 in demo mode)
7. Click "Verify & Register" → Account created instantly
8. Redirected to citizen portal
9. Click "Medical SOS" → Auto-sends "Ramesh Patil (+91-9876543210)" to medical team
10. Medical team sees caller name and phone in SOS alert

### Scenario 2: New NDRF Team Member Registration
1. Visit `/portal`
2. Click "Action Teams" → "Login/Register"
3. Click "Register"
4. Fill registration form with NDRF details
5. Upload verification documents
6. Submit → See "Pending validation" message
7. NDRF Admin logs in → Sees validation queue
8. Admin approves registration
9. User receives email notification
10. User can now login and access NDRF portal

### Scenario 2: Super Admin Creates Demo Accounts
1. Login as Super Admin
2. Navigate to `/admin/super`
3. Click "Create New User"
4. Fill form: Email, Name, Role (SDRF), Password
5. Check "Mark as demo account"
6. Click "Create" → Account created instantly (no validation needed)
7. User can login immediately

### Scenario 3: Role-Based Portal Access
1. Login as Ambulance Driver (ambulance.driver1@survive.exe)
2. Redirected to portal selection
3. See:
   - ✓ Ambulance Portal (highlighted, enabled)
   - ✓ Citizen Portal (enabled)
   - 🔒 Medical Team (greyed out)
   - 🔒 NDRF Command (greyed out)
   - 🔒 Other portals (greyed out)
4. Click "Ambulance Portal" → Access granted
5. Header shows: "Welcome, Driver Mahesh Pawar (AMB-101)"

---

## Next Steps

1. **Review this architecture** with stakeholders
2. **Approve database schema** and make modifications if needed
3. **Prioritize features** based on hackathon timeline
4. **Begin implementation** starting with Phase 1
5. **Create seed data script** for demo accounts

---

## Questions to Consider

1. **Twilio Credentials**: Use same Twilio account as volunteer panel (same SID, Auth Token, From Number)
2. **Email Service**: Which email provider for notifications? (Nodemailer + Gmail, SendGrid, AWS SES)
3. **OAuth**: Should we add Google/Microsoft login for citizens for faster registration?
4. **Multi-factor Authentication**: Required for NDRF Admin and Super Admin?
5. **Mobile App**: Does authentication need to work on mobile app too?
6. **Data Retention**: How long to keep rejected registrations? Audit logs?
7. **Demo Mode**: Should OTP 123456 always work in development environment?

---

## Important Notes

**DO NOT MODIFY Volunteer Panel** (`/app/volunteer/page.tsx`)
- Volunteer registration/login already implemented by teammate
- Use same Twilio credentials and OTP flow pattern
- Reference only - do not change existing volunteer code
- Citizen OTP flow should mirror volunteer implementation

---

**Document Version**: 1.0  
**Last Updated**: February 22, 2026  
**Author**: Survive.exe Development Team  
