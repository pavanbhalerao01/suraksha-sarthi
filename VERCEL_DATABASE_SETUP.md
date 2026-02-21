# Vercel PostgreSQL Database Setup Guide

## Problem
Your app now uses PostgreSQL (required for enums and production), but Vercel needs a database connection to complete the build.

## Quick Solution: Vercel Postgres (Recommended)

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Click on **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"** 
5. Choose a database name (e.g., `survive-db`)
6. Select region closest to your deployment (Washington D.C. - East)
7. Click **"Create"**

### Step 2: Connect Database to Project

1. After creation, click **"Connect"**
2. Vercel will automatically add `DATABASE_URL` environment variable to your project
3. This happens instantly - no manual configuration needed!

### Step 3: Trigger New Deployment

Option A: **Automatic** (wait 1-2 minutes for auto-deploy after database connection)

Option B: **Manual**
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Deployment should succeed now with database connected

---

## Alternative: Use External PostgreSQL

If you prefer using Neon, Supabase, or other PostgreSQL provider:

### Step 1: Get Database URL

**Neon (Free Tier)**:
1. Go to https://neon.tech
2. Sign up / Login
3. Create new project
4. Copy the connection string (looks like: `postgresql://user:password@host/database`)

**Supabase (Free Tier)**:
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" → "URI"

### Step 2: Add to Vercel

1. Go to Vercel project → **"Settings"** → **"Environment Variables"**
2. Click **"Add"**
3. Name: `DATABASE_URL`
4. Value: (paste your PostgreSQL connection string)
5. Environment: **Production**, **Preview**, **Development** (check all)
6. Click **"Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab  
2. Click **"Redeploy"** on the latest failed deployment
3. Build should succeed!

---

## Expected Build Output (Success)

```
✓ Compiled successfully
✓ Prisma generated successfully
✓ Collecting page data
✓ Finalizing optimized chunks
✓ Build completed successfully
```

---

## Database Migrations (After First Successful Deploy)

Once your app is deployed, initialize the database:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations
npx prisma migrate deploy
```

Or use Prisma Studio to create tables manually.

---

## Troubleshooting

### "Prisma schema validation error"
- Make sure DATABASE_URL environment variable is set in Vercel
- Format: `postgresql://user:password@host:5432/database`

### "Connection timeout"
- Check database is running and accessible
- Verify connection string is correct
- Ensure IP allowlist includes Vercel's IPs (Neon/Supabase usually auto-allow)

### Build still failing
- Check Vercel build logs for specific error
- Verify all environment variables are set
- Make sure you clicked "Redeploy" AFTER adding DATABASE_URL

---

## Why PostgreSQL?

SQLite (file-based database) doesn't work on Vercel because:
- Serverless functions have read-only filesystem
- No persistent storage between function calls
- Enums not supported in SQLite

PostgreSQL offers:
- Proper enum support (UserRole, IncidentStatus, etc.)
- Persistent cloud database
- Better for production workloads
- Free tiers available (Vercel Postgres, Neon, Supabase)

---

## Next Steps After Deployment Success

1. ✅ Seed database with sample data (districts, risk scores)
2. ✅ Test all 6 portals (NDRF, Collector, Citizen, Volunteer, NGO, Action Team)
3. ✅ Verify API endpoints work
4. ✅ Add real Maharashtra districts data
5. ✅ Set up ML service separately

---

**Recommended**: Use **Vercel Postgres** for easiest setup (1-click integration).
