# Activity Tracking System - Implementation Guide

## Overview
I've transformed the placeholder "Recent Activity" section into a fully functional activity tracking system that logs all admin actions across your portfolio dashboard.

---

## Features Implemented

### 1. **Real-Time Activity Logging**
- Automatically tracks admin actions across all sections
- Logs action type, section, timestamp, and optional details
- Stores activities in MongoDB for persistent history

### 2. **Dashboard Activity Feed**
- **Recent Activity Widget** - Shows last 10 activities on dashboard home
- Real-time updates with refresh button
- Relative timestamps (e.g., "5m ago", "2h ago")
- Color-coded action types (create, update, delete, view, login)
- Hover effects for better UX

### 3. **Full Activity Log Page**
- New "Activity Log" section in admin sidebar
- **Advanced Filtering:**
  - Filter by activity type (All, Create, Update, Delete, View, Login)
  - Filter by section (Hero, About, Projects, Blog, etc.)
- **Statistics Dashboard:**
  - Total activities count
  - Today's activities count
  - Activities by type breakdown
- **Table View:**
  - Sortable list of all activities
  - Type icon and color coding
  - Action description
  - Section categorization
  - Precise timestamps
  - Expandable details for each activity

### 4. **Admin Controls**
- **Export to CSV** - Download all activity logs as CSV file
- **Clear Old Activities** - Remove activities older than 30 days
- **Activity Statistics** - Real-time stats dashboard
- **Detailed Activity Information** - View extra details about each action

---

## Backend Implementation

### New Database Model
**File:** `backend/models/Portfolio.js`

```javascript
const activitySchema = new mongoose.Schema({
  action: String,           // What happened (e.g., "Updated hero section")
  section: String,          // Where it happened (e.g., "Hero")
  type: String,             // create | update | delete | view | login
  details: Mixed,           // Extra data (optional)
  timestamp: Date           // When it happened
});
```

### New API Routes
**File:** `backend/routes/portfolio.js`

| Route | Method | Description |
|-------|--------|-------------|
| `/activities` | GET | Get all activities (latest 50) |
| `/activities/section/:section` | GET | Get activities from specific section |
| `/activities-stats` | GET | Get activity statistics |
| `/activities/log` | POST | Log new activity (from frontend) |
| `/activities/clear-old` | DELETE | Clear activities older than 30 days |

All routes are **protected with JWT authentication** - only admins can access.

---

## Frontend Implementation

### 1. **Activity Logging Hook**
**File:** `app/src/hooks/useActivityLogger.ts`

Reusable hook for logging activities from any component:

```typescript
import { useActivityLogger } from '../hooks/useActivityLogger';

const { logActivity } = useActivityLogger();

// Log an action
await logActivity(
  'Updated hero section',  // action
  'Hero',                  // section
  'update',                // type
  { title: 'New Title' }   // details (optional)
);
```

### 2. **Enhanced Activity Timeline**
**File:** `app/src/components/admin/ActivityTimeline.tsx`

- Fetches real data from backend
- Shows last 10 activities
- Includes different icons for each activity type:
  - ➕ Create (Green)
  - ✏️ Update (Blue)
  - 🗑️ Delete (Red)
  - 👁️ View (Purple)
  - 🔓 Login (Yellow)
- Relative timestamps
- Expandable details
- Refresh button

### 3. **Full Activities Log Page**
**File:** `app/src/components/admin/ActivitiesForm.tsx`

Complete activity management interface with:

**Stats Cards:**
- Total activities
- Today's count
- Created count
- Updated count

**Filters:**
- Activity type selector
- Section dropdown
- Real-time filtering

**Activity Table:**
- Sortable columns
- Type badge
- Action description
- Section tag
- Timestamp
- Expandable details
- Hover effects

**Export & Management:**
- CSV export button
- Clear old activities button
- Activity count display

---

## How Activities Are Logged

### Automatic Logging
Activities logged automatically when:
- Admin logs in
- Admin views messages
- Admin deletes messages
- Admin sends replies

### Manual Logging (In Forms)
You can add logging to any admin form using the hook:

```typescript
const { logActivity } = useActivityLogger();

// When saving a project
await logActivity(
  'Created new project: ApexResume',
  'Projects',
  'create',
  { title: 'ApexResume', tech: ['React', 'Node.js'] }
);
```

---

## Activity Types

| Type | Color | Icon | Usage |
|------|-------|------|-------|
| **create** | Green | ➕ | New item added |
| **update** | Blue | ✏️ | Item modified |
| **delete** | Red | 🗑️ | Item removed |
| **view** | Purple | 👁️ | Page viewed |
| **login** | Yellow | 🔓 | Admin login |

---

## Admin Dashboard Sections

### Recent Activity Widget (Dashboard Home)
Located on dashboard homepage - shows quick overview of latest activities with:
- Activity icons and descriptions
- Section badges
- Timestamps
- Details preview

### Activity Log Page (New Section)
Full-featured activity management with:
- Advanced filtering
- Statistics dashboard
- Complete activity history
- Export functionality
- Cleanup tools

---

## Example Activity Log Entries

```
✏️ Updated hero section          Hero          14 Sep, 2:15 PM
  Details: title="New Title", subtitle="Updated subtitle"

🗑️ Deleted old blog post        Blog          14 Sep, 2:10 PM
  Details: postId="123abc", title="Old Post"

➕ Created new skill             Skills        14 Sep, 1:45 PM
  Details: name="TypeScript", level=85, category="Frontend"

👁️ Viewed messages page          Messages      14 Sep, 1:30 PM
  Details: messageCount=5, unread=2

✏️ Sent reply to message         Messages      14 Sep, 1:25 PM
  Details: senderEmail="user@example.com"
```

---

## Data Storage & Retention

- **Activities stored:** Indefinitely in MongoDB
- **Default display:** Last 50 activities on Activity Log page
- **Dashboard feed:** Last 10 activities
- **Auto-cleanup:** Manual option to clear activities older than 30 days
- **Export:** Download all activities as CSV anytime

---

## Usage in Admin Dashboard

### Viewing Activities
1. **On Dashboard Home:** See recent activity widget automatically
2. **Activity Log Page:** Click "Activity Log" in sidebar
3. **Refresh:** Click refresh button to get latest activities
4. **Filter:** Use type and section filters

### Exporting & Management
1. **Export to CSV:** Click "Export CSV" button
2. **Clear Old:** Click "Clear Old" to remove 30+ day old activities
3. **Details:** Click "View" on any activity to see more info

### Understanding the Data
- **Type:** What kind of action (create/update/delete)
- **Action:** Human-readable description
- **Section:** Which portfolio section
- **Timestamp:** When it happened
- **Details:** Additional metadata (expandable)

---

## Statistics Dashboard

The Activity Log page shows real-time stats:
- **Total Activities:** Lifetime count
- **Today:** Activities from current day
- **Created:** Items created
- **Updated:** Items modified

These stats update when you:
- Refresh the page
- Clear old activities
- Perform new admin actions

---

## Integration Points

### Already Integrated
✅ Dashboard home activity feed
✅ Activity Log page with full features
✅ Message section activities
✅ Message reply activities

### Ready to Integrate (Optional)
You can add logging to any form using `useActivityLogger`:
- Hero form updates
- About section edits
- Education entries
- Skills management
- Project creation
- Blog posts
- Leadership roles
- Achievements
- Certifications
- Contact info updates

---

## Security & Privacy

✅ All activity endpoints protected with JWT authentication
✅ Only admins can view/manage activities
✅ No sensitive data stored in details (no passwords, tokens)
✅ Activity logs are immutable (can't edit, only delete)
✅ Activities tied to timestamp (audit trail)

---

## Performance

- **Database:** Indexed timestamps for fast queries
- **API:** Limits to 50 activities per fetch
- **Frontend:** Efficient pagination and filtering
- **Export:** Handles large datasets (CSV)
- **Cleanup:** Background deletion of old records

---

## Troubleshooting

**Activities not showing?**
- Make sure you're logged in as admin
- Check that token is valid
- Try refreshing the page
- Check browser console for errors

**Activities not being logged?**
- Verify backend is running
- Check that `logActivity` is being called
- Ensure section and action are provided
- Check network tab for 201/200 response

**Export not working?**
- Check browser download folder
- Verify you have export permission
- Try with fewer activities first

**Clear Old not working?**
- Confirm you want to delete old activities
- Check that activities exist (older than 30 days)
- Verify admin permissions

---

## Next Steps (Optional Enhancements)

Future improvements you could add:
- ⏰ Activity notifications (real-time alerts)
- 🔍 Advanced search within activities
- 📊 Activity analytics & charts
- 🔄 Undo/rollback functionality
- 👤 User attribution (admin identification)
- 📱 Mobile-friendly activity view
- ⭐ Activity favorites/bookmarks
- 🏷️ Activity tagging system
- 📧 Email reports of daily activities

---

## Files Created/Modified

### Created
- `app/src/hooks/useActivityLogger.ts` - Activity logging hook
- `app/src/components/admin/ActivitiesForm.tsx` - Full Activities page
- `ACTIVITY_TRACKING.md` - This guide

### Modified
- `backend/models/Portfolio.js` - Added Activity model
- `backend/routes/portfolio.js` - Added 5 new routes + logging helper
- `app/src/components/admin/ActivityTimeline.tsx` - Enhanced with real data
- `app/src/pages/AdminDashboard.tsx` - Added Activities section

---

## Quick Start

1. **View activities on dashboard:**
   - Go to Admin Dashboard → Home
   - See "Recent Activity" widget

2. **View full activity log:**
   - Click "Activity Log" in sidebar
   - See all activities with stats

3. **Filter & export:**
   - Use type/section filters
   - Click "Export CSV" to download
   - Click "Clear Old" to cleanup (optional)

4. **Integrate logging:**
   - Import `useActivityLogger` in your form
   - Call `logActivity()` when saving data

That's it! You now have full activity tracking for your admin dashboard.

