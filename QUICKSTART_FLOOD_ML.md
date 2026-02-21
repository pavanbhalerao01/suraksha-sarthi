# Quick Start Guide - Flood Prediction Integration

## 🚀 Fast Setup (3 Steps)

### Step 1: Install Backend Dependencies
```bash
cd "D:\VS Code\Python\Suraksha Sathi\survive.exe\backend"
pip install -r requirements.txt
```

### Step 2: Start Backend Server
```bash
python main.py
```
✅ Backend should be running on http://localhost:8000

### Step 3: Start Frontend (in a new terminal)
```bash
cd "D:\VS Code\Python\Suraksha Sathi\survive.exe"
npm run dev
```
✅ Frontend should be running on http://localhost:3000

## 📍 Access the Predictions

1. Open browser: `http://localhost:3000/ndrf-admin`
2. Click the **"Predictions"** tab
3. Click **"🌊 Flood"** filter button
4. You should see real flood predictions from the ML model!

## ✅ What to Expect

You'll see flood predictions like:
- **Location:** Kaziranga, Assam
- **Severity:** HIGH
- **Confidence:** 79.3%
- **Affected Area:** 1,800 km²
- **People at Risk:** 85,000
- **Description:** Brahmaputra river levels rising due to heavy rainfall.

## 🐛 If Something Goes Wrong

### "Backend service unavailable" message?
Make sure Step 2 is complete - backend must be running!

### "Module not found" error?
Run: `pip install -r requirements.txt`

### Port 8000 already in use?
Stop any existing process on port 8000 or change port in `backend/main.py`

## 📚 Full Documentation

See `FLOOD_ML_INTEGRATION.md` for complete details, API docs, and customization options.
