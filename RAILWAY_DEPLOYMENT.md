# Railway Deployment Guide

This guide walks you through deploying the Gym Progress Tracker to Railway.

## Prerequisites

- Railway account (free tier available)
- GitHub account with the code pushed (already done ✓)
- Active payment method (for production deployments)

## Step 1: Create Railway Account & Login

1. **Go to [railway.app](https://railway.app)**
2. Click **Sign Up** (or **Sign In** if you have an account)
3. **Choose login method:**
   - GitHub (recommended - easiest)
   - Email
   - Google
4. Complete the sign-up process

## Step 2: Add Payment Method

Railway is free but requires:
- Valid credit card for production deployments
- $5/month minimum (free tier available with limits)

**To add payment:**
1. In Railway dashboard, go to **Account Settings** → **Billing**
2. Click **Add Payment Method**
3. Enter credit card details
4. Set a spending limit (recommended: $25/month for MVP)

## Step 3: Deploy from GitHub

### Option A: Using Railway Web UI (Easiest)

1. Log into [Railway](https://railway.app)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. **Authorize Railway** with GitHub (one-time)
5. Search and select `SimpleGymTracker`
6. Railway auto-detects:
   - Next.js framework
   - Dockerfile (uses Docker build)
   - Node 20 runtime
7. Click **Deploy**

### Option B: Using Railway CLI

```powershell
# Install Railway CLI (if not already)
npm install -g @railway/cli

# Login to Railway
railway login

# Link project to GitHub repo
cd c:\Users\decla\Desktop\SimpleGymTracker
railway link

# Deploy
railway up
```

## Step 4: Configure Environment

After deployment, Railway auto-configures:

- **NODE_ENV**: `production`
- **PORT**: `3000` (Railway provides)
- **Database**: SQLite stored in `/app` (persists with volumes)

No additional env vars needed for MVP.

## Step 5: Access Your Deployed App

After ~2-3 minutes:

1. Go to Railway dashboard
2. Click your `SimpleGymTracker` project
3. View **Deployments** tab
4. Click the deployment URL
5. Your app is live! 🎉

Example: `https://simplegymtracker-production.up.railway.app`

## Step 6: Custom Domain (Optional)

To use your own domain:

1. In Railway project, go to **Settings**
2. Click **Custom Domains**
3. Add your domain
4. Update DNS records (follow Railway's instructions)

## Database Persistence

SQLite database persists automatically in Railway because:

- **Volume mounting**: `/app` directory is persistent
- **Database location**: `gym-tracker.db` stored in `/app`
- **Restart safe**: Data survives app restarts and redeployments

## Auto-Deploy on Push

After initial setup, Railway automatically deploys on every push to GitHub:

```powershell
# Any push to master/main triggers auto-deployment
git add .
git commit -m "Updated feature"
git push origin main
# → Railway detects, rebuilds, and deploys automatically
```

## Monitoring & Logs

View logs in Railway:

1. Open project dashboard
2. Click **Deployments**
3. View live logs in real-time
4. Check error messages and uptime

## Troubleshooting

### Build Fails
- Check logs for specific errors
- Verify `npm install` works locally
- Ensure `npm run build` succeeds: `npm run build`

### Database Errors
- Check file permissions (Railway handles automatically)
- Verify disk space (free tier: 5GB included)
- Database automatically initializes on first run

### Port Issues
- Railway automatically assigns PORT via env var
- Dockerfile uses `EXPOSE 3000` (correct)
- App reads process.env.PORT if needed

### Slow Deployments
- First deployment: ~3-5 min (builds Docker image)
- Subsequent: ~1-2 min (uses cache)
- Free tier may have slower builds

## Pricing & Costs

**Free Tier:**
- Up to 5 deployed services
- 500MB memory per service
- Limited bandwidth
- $5 free credit/month

**After Free Credits:**
- Pay-as-you-go: ~$5-15/month for small app
- Can set spending limits in billing

**To Keep Costs Low:**
- Use Railway's free tier
- Set 1 replica (already configured)
- Monitor spending in Account → Billing

## Next Steps After Deployment

1. ✅ Test the live app (create a workout)
2. Configure custom domain (optional)
3. Set up monitoring alerts
4. Document any issues

## Tearing Down

To stop paying Railway:

1. Go to project **Settings**
2. Click **Danger Zone**
3. Select **Delete Project**
4. All data deleted, billing stops

---

**Support:**
- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app
- GitHub Issues: Report bugs in repo
