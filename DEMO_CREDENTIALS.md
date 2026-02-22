# Demo Credentials - Survive.exe

## 🚀 INSTANT ACCESS (NO OTP NEEDED!)

### Demo Login Button - FASTEST WAY TO ACCESS
1. Go to [http://localhost:3000/portal](http://localhost:3000/portal)
2. Click **Citizen Portal** button
3. In the login modal, click the **green "🚀 Skip OTP & Login Instantly"** button
4. ✅ Instant access to Citizen Dashboard!

**No phone number needed! No OTP needed! Just one click!**

---

## Quick Access Credentials

### 🔐 Super Admin (Full Access)
**Use this to bypass ALL OTP and access any dashboard**

- **Portal**: Team Portal (recommended for admin access)
- **Email**: `super@survive.exe`
- **Password**: `super`
- **Role**: NDRF_ADMIN (Highest privilege)
- **Access**: All dashboards, all features

---

## Citizen Portal (Phone + OTP)

### 📱 Demo Citizens
**Login Flow**: Enter phone → System checks → Enter OTP `123456`

1. **Test Citizen**
   - Phone: `+919876543210`
   - Email: `citizen@test.com`
   - OTP: `123456` (always works in demo mode)

2. **Citizen 2**
   - Phone: `+919998889998`
   - Email: `s.aryan0505@gmail.com`
   - OTP: `123456`

3. **Citizen 3**
   - Phone: `+919999999999`
   - Email: `tomvom@survive.exe`
   - OTP: `123456`

**For NEW Citizens**: Enter any Indian phone number → Fill registration form → Use OTP `123456`

---

## Volunteer Portal

1. **Volunteer 1**
   - Phone: `+917887796921`
   - Email: `+917887796921@example.com`
   - OTP: `123456`

2. **Volunteer 2**
   - Phone: `+919370950520`
   - Email: `+919370950520@example.com`
   - Name: Aryan
   - OTP: `123456`

---

## Team Portals (Email/Password)

### 🚨 NDRF Team
- **Email**: Check database for team members
- **Password**: `password123` (default for seeded users)

### 🚨 SDRF Team
- **Email**: Check database
- **Password**: `password123`

### 🔥 Fire Brigade
- **Email**: Check database
- **Password**: `password123`

### 👮 Police
- **Email**: Check database
- **Password**: `password123`

### 🏥 Medical Team
- **Email**: Check database
- **Password**: `password123`

### 🚑 Ambulance Team
- **Email**: Check database
- **Password**: `password123`

---

## Testing Dashboard Communication

### Scenario 1: Ambulance → Medical Team Coordination
1. **Login as Ambulance** (use `super@survive.exe` / `super` in Team Portal)
2. Navigate to Ambulance Dashboard
3. Create emergency request
4. **Login as Medical Team** (different browser/incognito)
5. Check for incoming request
6. Test accept/reject workflow

### Scenario 2: Citizen SOS
1. **Login as Citizen** (any phone + OTP `123456`)
2. Trigger SOS or report incident
3. **Login as NDRF Admin** (`super@survive.exe` / `super`)
4. View incident queue
5. Assign to team

---

## Environment Setup

### Demo Mode OTP
- **All OTPs**: `123456` (hardcoded for testing)
- **SMS**: Demo mode enabled in `.env.local`
- No actual SMS sent in demo mode

### Quick Commands
```bash
# List all users in database
npx tsx scripts/list-all-users.ts

# Create test citizen
npx tsx scripts/create-test-citizen.ts

# Create super admin
npx tsx scripts/create-super-admin.ts
```

---

## Login Endpoints

- **Portal Selection**: `http://localhost:3000/portal`
- **Citizen Dashboard**: `http://localhost:3000/citizen`
- **Team Dashboard**: `http://localhost:3000/team`
- **Admin Dashboard**: Coming soon

---

## Troubleshooting

### Can't login?
- Use super admin: `super@survive.exe` / `super`
- Always use OTP `123456` for phone-based login
- Clear browser cache if auth cookies are stuck

### Dashboard not loading?
- Check server is running: `npm run dev`
- Verify you're logged in (check auth cookie)
- Check role permissions

---

**Last Updated**: February 22, 2026
**Demo Mode**: ENABLED
**OTP Bypass**: ACTIVE (`123456` always works)
