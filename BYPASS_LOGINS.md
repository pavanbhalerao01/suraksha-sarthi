# 🚀 Bypass Login - Quick Access Guide

**All portals now have ONE-CLICK bypass login!** No credentials needed!

---

## ✅ How to Use Bypass Login

### **ANY PORTAL** (Universal Method)
1. Go to http://localhost:3000/portal
2. Click **ANY** portal card (NDRF Admin, Collector, Citizen, Volunteer, NGO, or Action Team)
3. Look for the **GREEN BUTTON**: 🚀 **Skip Login - Use Demo Mode**
4. Click it → **INSTANT ACCESS!** ✅

---

## 📋 Portal-by-Portal Guide

### 1. **Citizen Portal**
- **Bypass Button**: 🚀 Skip & Login with Demo Mode
- **Available At**: 
  - Phone entry screen
  - Registration screen
  - OTP verification screen
- **Alternative**: Enter phone `+919876543210` → OTP `123456`

### 2. **NDRF Admin Portal**
- **Bypass Button**: 🚀 Skip Login - Use Demo Mode
- **Available At**: Email/password login screen
- **Alternative**: Email `super@survive.exe` / Password `super`

### 3. **District Collector Portal**
- **Bypass Button**: 🚀 Skip Login - Use Demo Mode
- **Available At**: Email/password login screen

### 4. **Volunteer Portal**
- **Bypass Button**: 🚀 Skip Login - Use Demo Mode
- **Available At**: Email/password login screen

### 5. **NGO & Donors Portal**
- **Bypass Button**: 🚀 Skip Login - Use Demo Mode
- **Available At**: Email/password login screen

### 6. **Action Team Portals** (All Teams)
- **NDRF Field Team**
- **SDRF Field Team**
- **Fire Services**
- **Police Team**
- **Medical Emergency Team**
- **Ambulance Fleet**
- **Civil Defense Team**
- **Relief Camp Incharge**

**ALL have the same bypass:**
- **Bypass Button**: 🚀 Skip Login - Use Demo Mode
- **Available At**: Email/password login screen

---

## 🎯 What Happens When You Click Bypass?

1. **Auto-creates** a demo user for that portal
2. **Sets session** and JWT token automatically
3. **Redirects** you straight to the dashboard
4. **No credentials** required - instant access!

---

## 🛠️ Technical Details

### API Endpoint
- **URL**: `/api/auth/demo-login`
- **Method**: POST
- **Body**: `{ mode: 'citizen' | 'team', targetRoute: '/citizen' | '/ndrf-admin' | '/team/ndrf' etc. }`
- **Response**: Sets `auth-token` cookie, returns user data

### Created Users
The bypass creates users with these defaults:
- **Phone**: +91XXXXXXXXXX (random)
- **Email**: demo-{timestamp}@survive.exe
- **Password**: (not needed - auto-login)
- **Role**: Based on portal (CITIZEN, NDRF_ADMIN, VOLUNTEER, etc.)
- **Status**: Active, verified

---

## 💡 Pro Tips

1. **Fastest Access**: Bookmark http://localhost:3000/portal → Click any card → Click green bypass button
2. **No Waiting**: Bypass skips ALL verification (OTP, email checks, password validation)
3. **Works Every Time**: Creates fresh session each time, no conflicts
4. **Testing**: Perfect for rapid testing of different portal features
5. **No Database Cleanup**: Each bypass creates minimal data

---

## 🔥 Use Cases

### **Rapid Feature Testing**
- Click bypass → Immediately test new features → Close → Repeat
- **Time saved**: ~30 seconds per login (no entering credentials/OTP)

### **Multi-Portal Testing**
- Open 5 browser tabs
- Bypass into 5 different portals
- Test inter-portal communication
- **Time saved**: ~2-3 minutes

### **Demo Presentations**
- Show stakeholders different dashboards quickly
- No fumbling with credentials
- Professional, fast transitions

---

## ⚠️ Important Notes

- **Development Only**: Remove bypass buttons before production
- **Session Conflicts**: If you bypass multiple times, old sessions expire
- **Database Growth**: Each bypass creates a new user - clean up periodically
- **Security**: Never deploy bypass buttons to production environment

---

## 🎉 Summary

**EVERY PORTAL** = **ONE GREEN BUTTON** = **INSTANT ACCESS**

No more:
- ❌ Finding credentials
- ❌ Waiting for OTP
- ❌ Typing passwords
- ❌ Registration forms

Just:
- ✅ Click portal
- ✅ Click bypass
- ✅ **You're in!**

---

**Last Updated**: February 22, 2026  
**Status**: ✅ All portals have bypass login enabled
