# Portfolio Admin System - Setup Complete ✅

## Backend Server
**Status:** Running on `http://localhost:5000`

**Location:** `f:\Portfolio\backend\`

**Start Command:**
```powershell
cd f:\Portfolio\backend
npm start
```

**API Endpoints:**
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/portfolio/*` - Get all portfolio data
- `POST /api/portfolio/*` - Create new items (protected)
- `PUT /api/portfolio/*/:id` - Update items (protected)
- `DELETE /api/portfolio/*/:id` - Delete items (protected)

**Database:** MongoDB Atlas (Connected)

---

## Frontend

**Location:** `f:\Portfolio\app\`

**Start Command:**
```powershell
cd f:\Portfolio\app
npm run dev
```

---

## Admin Access

### How to Login:

**Option 1: Admin Button (Easy)**
- Click the "Admin" button in the top navigation bar
- Login modal will open automatically

**Option 2: Ctrl+Click Logo**
- Hold Ctrl (Windows) or Cmd (Mac)
- Click on "BMK" logo
- Login modal will open

**Option 3: Mobile Menu**
- Open mobile menu (hamburger icon)
- Click "Admin Login" at the bottom

### Credentials:
- **Email:** `Manojbavisetti75@gmail.com`
- **Password:** `0956Manoj@`

### Admin Dashboard:
- After successful login, you'll be redirected to `/admin`
- Protected route - requires authentication
- Click "View Site" to return to main portfolio
- Click "Logout" to end session

---

## Features Implemented

✅ **Backend:**
- Express.js server with MongoDB
- JWT authentication
- CRUD APIs for all portfolio sections
- Protected admin routes
- CORS enabled for frontend

✅ **Frontend:**
- Login modal with authentication
- Admin dashboard layout
- Section navigation
- Logout functionality
- Route protection

---

## Database Models

All sections are stored in MongoDB:
- Hero (single document)
- About (single document)
- Projects (multiple)
- Skills (multiple)
- Education (multiple)
- Blog (multiple)
- Leadership (multiple)
- Achievements (multiple)

---

## Next Steps

The admin dashboard UI is ready. You can now:
1. Build forms for each section to edit content
2. Connect API calls to fetch/update data
3. Add image upload functionality
4. Implement real-time preview

---

## Files Created

**Backend:**
- `/backend/server.js` - Express server
- `/backend/.env` - Environment variables
- `/backend/models/Portfolio.js` - MongoDB schemas
- `/backend/routes/auth.js` - Authentication routes
- `/backend/routes/portfolio.js` - CRUD routes

**Frontend:**
- `/app/src/components/admin/LoginModal.tsx` - Login UI
- `/app/src/pages/AdminDashboard.tsx` - Admin panel
- Updated `/app/src/App.tsx` - Added routing
- Updated `/app/src/sections/Navigation.tsx` - Added login triggers

---

## Troubleshooting

**Backend not starting?**
```powershell
cd f:\Portfolio\backend
npm install
npm start
```

**Frontend errors?**
```powershell
cd f:\Portfolio\app
npm install
npm run dev
```

**Can't login?**
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify MongoDB connection is active

---

**All set! 🚀**
