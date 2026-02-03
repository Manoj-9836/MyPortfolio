# 🚀 Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Added `/ping` endpoint for keep-alive
- [x] Configured CORS for Vercel
- [x] Created environment variable templates
- [x] Updated all API calls to use environment variables
- [x] Created API configuration file
- [x] Added .gitignore files
- [x] Created deployment documentation

## 📋 Deployment Steps

### Phase 1: Push to GitHub

```bash
cd f:\Portfolio
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Phase 2: Deploy Backend to Render

1. [ ] Create Render account at https://render.com
2. [ ] Create new Web Service
3. [ ] Connect GitHub repository
4. [ ] Configure settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. [ ] Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://manojbavisetti75_db_user:IdkdQf5sUDkizt46@cluster0.frkqdct.mongodb.net/portfolio
   JWT_SECRET=your-super-secret-jwt-key-change-this
   ADMIN_EMAIL=Manojbavisetti75@gmail.com
   ADMIN_PASSWORD=$2a$10$vKwHXqZ0kxHYDZJZqy4zY.0N5hJZ0bJGV0kCzN0ZqZ0kxHYDZJZqy
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. [ ] Deploy and note the backend URL

### Phase 3: Set Up Keep-Alive

1. [ ] Create UptimeRobot account at https://uptimerobot.com
2. [ ] Add new HTTP monitor
3. [ ] URL: `https://your-backend.onrender.com/ping`
4. [ ] Interval: 5 minutes

### Phase 4: Deploy Frontend to Vercel

1. [ ] Create Vercel account at https://vercel.com
2. [ ] Import GitHub repository
3. [ ] Configure settings:
   - Root Directory: `app`
   - Framework: Vite
4. [ ] Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. [ ] Deploy and note the frontend URL

### Phase 5: Update CORS

1. [ ] Go back to Render
2. [ ] Update `FRONTEND_URL` env variable with Vercel URL
3. [ ] Redeploy backend

## 🧪 Testing

### Backend Tests
- [ ] Visit: `https://your-backend.onrender.com/` (should show API info)
- [ ] Visit: `https://your-backend.onrender.com/ping` (should show "pong")
- [ ] Visit: `https://your-backend.onrender.com/api/portfolio/stats` (should show JSON)

### Frontend Tests
- [ ] Visit homepage (all sections load)
- [ ] Click ©2026 in footer
- [ ] Login with: `Manojbavisetti75@gmail.com` / `0956Manoj@`
- [ ] Dashboard shows real stats
- [ ] Create/edit/delete content works

## 📝 Post-Deployment

- [ ] Save URLs in a secure location
- [ ] Monitor UptimeRobot for keep-alive status
- [ ] Check Render logs for errors
- [ ] Verify MongoDB Atlas connection

## 🎯 Your URLs

```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.onrender.com
Monitor:  https://uptimerobot.com/dashboard
```

## 💡 Quick Commands

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### View Logs
- Render: Dashboard → Your Service → Logs
- Vercel: Dashboard → Your Project → Deployments → View Logs

---

**📖 For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**
