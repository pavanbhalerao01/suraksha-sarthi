# ⚠️ CRITICAL: Add Database URL to Vercel

Your Neon database is now configured locally and the schema is created. 

**You must add the DATABASE_URL to Vercel's environment variables for deployment to succeed.**

---

## Step-by-Step Guide (2 minutes)

### 1. Go to Vercel Dashboard

Open: https://vercel.com/[your-username]/[your-project]/settings/environment-variables

Or navigate:
- Go to https://vercel.com
- Click your project: **survive-exe**
- Click **"Settings"** tab
- Click **"Environment Variables"** in left sidebar

### 2. Add DATABASE_URL

Click **"Add New"** button and enter:

**Key (Name):**
```
DATABASE_URL
```

**Value:**
```
postgresql://neondb_owner:npg_1ZY0gawSGqte@ep-holy-resonance-aijahp6d-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Environments:** (Check ALL three)
- ✅ Production
- ✅ Preview  
- ✅ Development

Click **"Save"**

### 3. Trigger Deployment

After adding the environment variable:

**Option A: Automatic (wait 2-3 minutes)**
- Vercel will auto-deploy when it detects environment variable change

**Option B: Manual (faster)**
- Go to **"Deployments"** tab
- Click **"..." (three dots)** on the latest deployment
- Click **"Redeploy"**
- Select **"Use existing Build Cache"** (optional, makes it faster)
- Click **"Redeploy"**

---

## Expected Result

Build output should show:

```
✓ Installing dependencies
✓ Running postinstall (prisma generate)
✓ Prisma Client generated successfully
✓ Compiled successfully
✓ Collecting page data
✓ Build completed successfully
✓ Deployment successful
```

Your app will be live at: **https://survive-exe.vercel.app** (or your custom domain)

---

## Verify Deployment

Once deployed, test these URLs:

1. **Portal Selection**: https://your-app.vercel.app/portal
2. **NDRF Dashboard**: https://your-app.vercel.app/dashboard
3. **Risk Heatmap**: https://your-app.vercel.app/heatmap
4. **Citizen Portal**: https://your-app.vercel.app/citizen
5. **Volunteer Portal**: https://your-app.vercel.app/volunteer

---

## Troubleshooting

### Build still fails after adding DATABASE_URL
- Double-check the value is EXACTLY as shown above (no extra spaces)
- Ensure all 3 environments are selected
- Wait 1-2 minutes for environment variables to propagate
- Try "Redeploy" again

### "Prisma Client initialization error"
- Make sure you clicked "Save" on the environment variable
- Verify the connection string includes `?sslmode=require`
- Check Neon database is active (not paused)

### Pages show errors
- Database is working, but may need seed data
- Check browser console for specific errors
- API routes may need sample data to display

---

## Next Steps After Successful Deployment

1. ✅ **Seed database** with Maharashtra districts data
2. ✅ **Test all 6 portals** (NDRF, Collector, Citizen, Volunteer, NGO, Action Team)
3. ✅ **Add sample incidents** for demo
4. ✅ **Configure SMS/Alert APIs** (optional, for full functionality)
5. ✅ **Add custom domain** (optional)

---

## Your Database Details

- **Provider**: Neon (PostgreSQL)
- **Region**: US East (Virginia)
- **Database**: neondb
- **Status**: ✅ Schema created (11 tables: Region, RiskScore, Disaster, Infrastructure, Alert, WeatherData, User, UserProfile, Incident, Volunteer, Task, NGO, Resource, Session)

---

**DO THIS NOW**: Go to Vercel → Settings → Environment Variables → Add DATABASE_URL

After you add it, come back and let me know the deployment status!
