# 🚀 Portfolio Deployment Guide

Complete guide for deploying your portfolio using the **Golden Trio** free hosting setup.

## Architecture Overview

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express with Keep-Alive)
- **Database**: MongoDB Atlas (Already configured ✅)

---

## Phase 1: MongoDB Atlas (✅ Already Complete)

Your MongoDB connection is already set up:
```
mongodb+srv://manojbavisetti75_db_user:IdkdQf5sUDkizt46@cluster0.frkqdct.mongodb.net/portfolio
```

**Security check:**
- ✅ Ensure IP Address `0.0.0.0/0` is allowed in Network Access
- ✅ Database user credentials are active

---

## Phase 2: Backend Deployment (Render)

### Step 1: Prepare Your Code

1. **Verify /ping endpoint** (Already added ✅)
   - Location: `backend/server.js`
   - URL: `/ping` returns "pong"

2. **Push to GitHub**
   ```bash
   cd f:\Portfolio
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Render

1. **Create Render Account**
   - Go to [https://render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `Portfolio` repository

3. **Configure Build Settings**
   ```
   Name: portfolio-backend (or your choice)
   Region: Choose closest to your location
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Add Environment Variables**
   Click "Environment" and add:
   ```
   MONGODB_URI=mongodb+srv://manojbavisetti75_db_user:IdkdQf5sUDkizt46@cluster0.frkqdct.mongodb.net/portfolio
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ADMIN_EMAIL=Manojbavisetti75@gmail.com
   ADMIN_PASSWORD=$2a$10$vKwHXqZ0kxHYDZJZqy4zY.0N5hJZ0bJGV0kCzN0ZqZ0kxHYDZJZqy
   PORT=5000
   FRONTEND_URL=https://your-frontend-project.vercel.app
   ```
   
   **⚠️ Important**: Update `FRONTEND_URL` after deploying frontend in Phase 3

5. **Select Free Plan**
   - Instance Type: **Free** (750 hours/month)
   - Click "Create Web Service"

6. **Note Your Backend URL**
   - Example: `https://portfolio-backend-xyz.onrender.com`
   - Save this for Phase 3!

### Step 3: Set Up Keep-Alive (No Sleep Mode)

**Option A: UptimeRobot (Recommended)**

1. Go to [https://uptimerobot.com](https://uptimerobot.com)
2. Create free account
3. Click "+ Add New Monitor"
4. Configure:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Portfolio Backend
   URL: https://your-backend-url.onrender.com/ping
   Monitoring Interval: 5 minutes (free tier)
   ```
5. Click "Create Monitor"

**Option B: Cron-job.org**

1. Go to [https://cron-job.org](https://cron-job.org)
2. Create free account
3. Click "Create cronjob"
4. Configure:
   ```
   Title: Keep Portfolio Awake
   Address: https://your-backend-url.onrender.com/ping
   Schedule: */14 * * * * (Every 14 minutes)
   ```
5. Save and enable

---

## Phase 3: Frontend Deployment (Vercel)

### Step 1: Update Environment Variables

1. **Create production .env file**
   ```bash
   cd f:\Portfolio\app
   ```

2. **Update `.env` file**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   Replace with your actual Render backend URL

### Step 2: Deploy to Vercel

1. **Create Vercel Account**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your `Portfolio` repository
   - Select the `app` directory as root

3. **Configure Build Settings**
   ```
   Framework Preset: Vite (auto-detected)
   Root Directory: app
   Build Command: npm run build (auto-detected)
   Output Directory: dist (auto-detected)
   ```

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.onrender.com
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

6. **Note Your Frontend URL**
   - Example: `https://portfolio-username.vercel.app`

### Step 3: Update Backend CORS

1. **Go back to Render Dashboard**
2. **Update Environment Variable**
   ```
   FRONTEND_URL=https://your-frontend-project.vercel.app
   ```
3. **Redeploy** the backend service

---

## Phase 4: Testing & Verification

### Backend Tests

1. **Health Check**
   ```
   Visit: https://your-backend-url.onrender.com/
   Should see: Portfolio Backend API status
   ```

2. **Ping Endpoint**
   ```
   Visit: https://your-backend-url.onrender.com/ping
   Should see: pong
   ```

3. **API Test**
   ```
   Visit: https://your-backend-url.onrender.com/api/portfolio/stats
   Should see: JSON with content counts
   ```

### Frontend Tests

1. **Home Page**
   - Visit your Vercel URL
   - All sections should load with data from MongoDB

2. **Admin Login**
   - Scroll to footer and click on "©2026"
   - Login with: `Manojbavisetti75@gmail.com` / `0956Manoj@`
   - Dashboard should load with real stats

3. **CRUD Operations**
   - Create a new project
   - Edit existing content
   - Delete an item
   - Verify changes appear on homepage

---

## Troubleshooting

### CORS Errors

**Symptom**: "CORS policy blocked" in browser console

**Fix**:
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Check backend logs on Render dashboard
3. Redeploy backend after updating FRONTEND_URL

### Backend Sleeping

**Symptom**: First load takes 30-60 seconds

**Fix**:
1. Verify your UptimeRobot/Cron-job monitor is active
2. Check monitor logs to ensure it's hitting `/ping`
3. Render logs should show ping requests every 5-14 minutes

### Environment Variable Not Working

**Symptom**: Still connecting to localhost

**Fix**:
1. Redeploy Vercel after adding environment variables
2. Check Vercel build logs to ensure `VITE_API_URL` is being used
3. Clear browser cache

### Authentication Failing

**Symptom**: Can't login to admin dashboard

**Fix**:
1. Verify MongoDB connection on Render
2. Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Render env vars
3. Ensure `JWT_SECRET` is set

---

## Cost Breakdown (100% FREE)

| Service | Free Tier Limits | Usage | Status |
|---------|------------------|-------|--------|
| **MongoDB Atlas** | 512MB storage | ~50MB | ✅ Safe |
| **Render** | 750 hours/month | 744 hours (24/7) | ✅ Safe |
| **Vercel** | 100GB bandwidth | ~1-5GB | ✅ Safe |
| **UptimeRobot** | 50 monitors | 1 monitor | ✅ Safe |

**Total Cost**: $0/month 🎉

---

## Post-Deployment

### Custom Domain (Optional)

1. **Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Backend**:
   - Change `FRONTEND_URL` to your custom domain
   - Redeploy backend on Render

### Monitoring

- **Vercel Analytics**: Built-in, shows page views and performance
- **Render Logs**: Real-time backend logs
- **UptimeRobot**: Uptime monitoring and alerts

### Updates

**Frontend Updates**:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

**Backend Updates**:
```bash
git add .
git commit -m "Update backend"  
git push origin main
# Render auto-deploys
```

---

## Quick Reference

### Your URLs (Fill these in):

```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.onrender.com
Database: mongodb+srv://manojbavisetti75_db_user:...

Admin Login:
Email: Manojbavisetti75@gmail.com
Password: 0956Manoj@
```

### Important Files

```
Backend ENV:  f:\Portfolio\backend\.env
Frontend ENV: f:\Portfolio\app\.env
API Config:   f:\Portfolio\app\src\config\api.ts
Server Code:  f:\Portfolio\backend\server.js
```

---

## Support

If you encounter issues:

1. Check Render logs: Dashboard → Logs
2. Check Vercel build logs: Deployments → Click deployment → View logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**🎉 Congratulations! Your portfolio is now live with:**
- ⚡ Zero cold starts
- 🌍 Global CDN delivery
- 💾 Cloud database
- 🔐 Secure authentication
- 💰 100% FREE hosting
