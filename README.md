# SurakshaSarthi - Predict. Respond. Survive.

> AI-powered disaster prediction & real-time coordination platform for India.

India loses thousands of lives every year to disasters - not from lack of bravery, but from **lack of coordinated intelligence**. SurakshaSarthi solves this with two modes:

- **PRE-DISASTER** - ML/DL models trained on IMD + NDMA data predict floods, heatwaves, and landslides **7 days in advance**
- **DURING-DISASTER** - Real-time command dashboard eliminates duplicate rescues, tracks all NDRF/SDRF/volunteer teams live, and works **offline-first**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend API | Next.js API Routes |
| ML Service | Python + FastAPI + scikit-learn |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Maps | Leaflet.js + OpenStreetMap |
| Real-time | Server-Sent Events (SSE) |
| SMS/OTP | Twilio |
| Offline | PWA + IndexedDB |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/pavanbhalerao01/suraksha-sarthi.git
cd suraksha-sarthi
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in your DATABASE_URL, TWILIO_*, OPENWEATHER_API_KEY
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Start Frontend

```bash
npm run dev
```

### 5. Start ML Backend (optional - for live predictions)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

App runs at `http://localhost:3000`

---

## Portals

| Portal | URL | Role |
|---|---|---|
| NDRF Admin | `/ndrf-admin` | Command & coordination |
| Team Dashboard | `/team/[teamType]` | Field team operations |
| Citizen | `/citizen` | SOS, updates, volunteer signup |
| NGO | `/ngo` | Resource & relief coordination |
| Collector | `/collector` | District-level oversight |

---

## Key Features

- **Risk Heatmap** - Ward-level disaster probability across Maharashtra
- **7-Day Forecasting** - Flood, heatwave, drought predictions
- **Create Disaster** - NDRF admins manually declare disasters and coordinate response
- **SOS System** - Citizens send SOS, auto-routed to nearest available team
- **Live Team Tracking** - GPS tracking of all active response teams
- **Volunteer Portal** - Registration, verification, safe deployment with geofencing
- **Resource Tracking** - Warehouse to relief camp supply chain
- **Offline PWA** - Field teams work without internet

---

## Environment Variables

See `.env.example` for all required variables. Never commit `.env` files.