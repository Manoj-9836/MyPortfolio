# Portfolio Admin Dashboard - Design System

## 1. Design Brief & Goals

### User Roles
- **Primary User**: Portfolio Owner (You)
- **Access Level**: Full CRUD permissions on all content sections

### Primary Tasks
1. **Content Management**: Update portfolio sections (Hero, About, Projects, etc.)
2. **Analytics Dashboard**: View site metrics and engagement
3. **Quick Actions**: Fast edits and content publishing
4. **Media Management**: Upload and organize images

### Key Metrics
- Total projects, skills, achievements
- Recent updates timeline
- Content completion status
- Quick stats overview

---

## 2. Layout System

### Structure
```
┌─────────────────────────────────────────────────┐
│  Top Navigation (Sticky)                        │
│  [Logo] [Search] [Notifications] [Profile]     │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│  Side    │  Main Content Area                   │
│  Menu    │  ┌────────────────────────────────┐ │
│  (Fixed) │  │ Page Header                    │ │
│          │  ├────────────────────────────────┤ │
│  • Home  │  │                                │ │
│  • Hero  │  │  Content Cards/Tables          │ │
│  • About │  │  (Grid/Flex Layout)            │ │
│  • Skills│  │                                │ │
│  • ...   │  │                                │ │
│          │  └────────────────────────────────┘ │
└──────────┴──────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: `< 768px` - Hamburger menu, stacked cards
- **Tablet**: `768px - 1024px` - Collapsible sidebar
- **Desktop**: `> 1024px` - Fixed sidebar + full layout
- **Wide**: `> 1536px` - Max-width container with margins

---

## 3. Visual Language

### Color Palette (Dark Theme)
```
Background Hierarchy:
- Base: #000000 (Black)
- Surface 1: #0A0A0A (Cards)
- Surface 2: #141414 (Elevated cards)
- Surface 3: #1F1F1F (Hover states)

Text:
- Primary: #FFFFFF (White)
- Secondary: #A3A3A3 (Gray-400)
- Tertiary: #737373 (Gray-500)
- Muted: #525252 (Gray-600)

Accents:
- Primary Action: #FFFFFF (White buttons)
- Success: #22C55E (Green-500)
- Warning: #F59E0B (Amber-500)
- Danger: #EF4444 (Red-500)
- Info: #3B82F6 (Blue-500)

Borders:
- Subtle: rgba(255, 255, 255, 0.1)
- Medium: rgba(255, 255, 255, 0.2)
- Strong: rgba(255, 255, 255, 0.3)
```

### Typography
```
Font Family: 'Inter', system-ui, sans-serif

Headings:
- H1: 32px / 600 (Page titles)
- H2: 24px / 600 (Section titles)
- H3: 20px / 600 (Card titles)
- H4: 16px / 600 (Subsections)

Body:
- Large: 16px / 400 (Primary text)
- Base: 14px / 400 (Default)
- Small: 12px / 400 (Captions, labels)

Code: 'JetBrains Mono', monospace
```

### Iconography
- Library: Lucide React (consistent stroke width)
- Size: 16px (small), 20px (medium), 24px (large)
- Style: Outline icons, 2px stroke
- Color: Inherit from text color

### Elevation & Shadows
```css
Level 0: none (flush elements)
Level 1: 0 1px 3px rgba(0,0,0,0.3) (cards)
Level 2: 0 4px 12px rgba(0,0,0,0.4) (modals)
Level 3: 0 8px 24px rgba(0,0,0,0.5) (dropdowns)
```

---

## 4. UI Components Specifications

### Stat Cards
```tsx
Properties:
- Title: string
- Value: number | string
- Change: { value: number, trend: 'up' | 'down' }
- Icon: LucideIcon

Variants:
- Default (white/10 bg)
- Highlighted (white/5 bg + border)
- Compact (smaller padding)
```

### Data Tables
```tsx
Features:
- Sortable columns
- Row actions (Edit, Delete)
- Pagination
- Search/Filter
- Empty states
- Loading skeletons

Styling:
- Row hover: white/5 background
- Alternating rows: optional
- Sticky header: on scroll
```

### Form Components
```tsx
Input Fields:
- Text, Email, Password, Textarea
- States: default, focus, error, disabled
- Icons: left/right positioned
- Helper text & error messages

Buttons:
- Primary (white bg, black text)
- Secondary (white/10 bg, white text)
- Danger (red bg, white text)
- Ghost (transparent bg, hover effect)

Sizes: sm, md, lg
```

### Charts & Visualizations
```tsx
Types:
- Line Chart (engagement over time)
- Bar Chart (projects by category)
- Donut Chart (skills distribution)
- Mini Sparklines (quick metrics)

Library: Recharts / Chart.js
Theme: Dark mode compatible
```

### Modals & Dialogs
```tsx
Features:
- Overlay blur backdrop
- Slide-in animation
- Close on ESC key
- Click outside to close
- Focus trap

Sizes: sm (400px), md (600px), lg (800px)
```

### Alerts & Toasts
```tsx
Types:
- Success (green border-l-4)
- Error (red border-l-4)
- Warning (amber border-l-4)
- Info (blue border-l-4)

Position: Top-right corner
Duration: 3s auto-dismiss
```

---

## 5. Interaction Patterns

### Data Loading States
```tsx
Initial Load:
- Full-page skeleton (1.5s)
- Shimmer animation

Inline Updates:
- Button spinner (on action buttons)
- Row-level skeleton (for table updates)
- Optimistic UI updates

Empty States:
- Centered icon + message
- Call-to-action button
```

### Transitions & Animations
```tsx
Page Transitions:
- Fade in: opacity 0 → 1 (300ms)
- Slide up: y: 20 → 0 (300ms)

Interactive Elements:
- Hover scale: 1 → 1.02 (200ms)
- Button press: scale 0.98 (100ms)
- Skeleton shimmer: 2s infinite

Navigation:
- Sidebar collapse: width 240px ↔ 64px (300ms)
- Mobile menu: translateX -100% ↔ 0 (300ms)
```

### Accessibility
```
Keyboard Navigation:
- Tab order: logical flow
- Focus indicators: 2px white ring
- Escape key: close modals/dropdowns

Screen Readers:
- ARIA labels on all interactive elements
- Role attributes (button, dialog, alert)
- Live regions for dynamic content

Color Contrast:
- Text on dark: min 7:1 (AAA)
- Interactive elements: min 4.5:1 (AA)
- Focus indicators: 3:1 minimum
```

---

## 6. Accessibility Targets

### WCAG 2.1 Level AA Compliance
✅ Color contrast ratios met
✅ Keyboard navigable
✅ Screen reader compatible
✅ Focus visible
✅ Alternative text for images
✅ Semantic HTML structure

### Additional Features
- Skip to main content link
- Reduced motion support (@media prefers-reduced-motion)
- High contrast mode support
- Resizable text (up to 200%)

---

## 7. Tech Stack

### Current Stack
```json
{
  "frontend": {
    "framework": "React 19.2.0",
    "language": "TypeScript 5.9.3",
    "styling": "Tailwind CSS 3.4.19",
    "animation": "Framer Motion 12.29.2",
    "icons": "Lucide React",
    "charts": "Recharts (to be added)",
    "forms": "React Hook Form (to be added)"
  },
  "backend": {
    "runtime": "Node.js",
    "framework": "Express.js",
    "database": "MongoDB Atlas",
    "auth": "JWT"
  }
}
```

### Implementation Notes
- Component-driven architecture
- Reusable design system components
- CSS utility classes (Tailwind)
- Type-safe API calls (TypeScript)
- State management: React useState/useEffect
- Form validation: Zod schemas

---

## 8. Module-by-Module Structure

### Module 1: Dashboard Home
```
┌─────────────────────────────────────────┐
│ Dashboard Overview                      │
├─────────────────────────────────────────┤
│ [4 Stat Cards in Grid]                  │
│ • Total Projects                         │
│ • Skills Count                           │
│ • Achievements                           │
│ • Blog Posts                             │
├─────────────────────────────────────────┤
│ [Recent Activity Timeline]               │
│ [Quick Actions Grid]                     │
└─────────────────────────────────────────┘
```

### Module 2: Content Editors
```
For each section (Hero, Projects, Skills, etc.):

┌─────────────────────────────────────────┐
│ Section Name            [+ Add New]     │
├─────────────────────────────────────────┤
│ [Data Table / Card Grid]                │
│ • Row 1 [Edit] [Delete]                 │
│ • Row 2 [Edit] [Delete]                 │
│ • ...                                    │
├─────────────────────────────────────────┤
│ [Pagination]                             │
└─────────────────────────────────────────┘
```

### Module 3: Form Modals
```
┌─────────────────────────────────────────┐
│ Edit Project                       [×]  │
├─────────────────────────────────────────┤
│ Title:     [________________]           │
│ Subtitle:  [________________]           │
│ Tech:      [Tag Input________]          │
│ Date:      [Date Picker_____]           │
│ Links:     [________________]           │
│ Image:     [Upload Button___]           │
├─────────────────────────────────────────┤
│                    [Cancel] [Save]      │
└─────────────────────────────────────────┘
```

---

## 9. Deliverables & Milestones

### Phase 1: Foundation (Week 1)
✅ Design system setup
✅ Base layout (sidebar + header)
✅ Navigation structure
✅ Color/typography tokens

### Phase 2: Core Components (Week 2)
- [ ] Stat cards
- [ ] Data tables
- [ ] Form components
- [ ] Modals
- [ ] Skeletons

### Phase 3: Content Management (Week 3)
- [ ] Projects CRUD
- [ ] Skills CRUD
- [ ] Education CRUD
- [ ] Blog CRUD
- [ ] Hero/About editors

### Phase 4: Polish & QA (Week 4)
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Error handling
- [ ] Documentation

---

## 10. Component Blueprint

### Core Components to Build
```
src/components/admin/
├── layout/
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── MobileMenu.tsx
├── ui/
│   ├── StatCard.tsx
│   ├── DataTable.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Alert.tsx
│   └── Badge.tsx
├── charts/
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   └── DonutChart.tsx
└── forms/
    ├── ProjectForm.tsx
    ├── SkillForm.tsx
    └── EducationForm.tsx
```

### Sample Component Code
```tsx
// StatCard.tsx
interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: { value: number; trend: 'up' | 'down' };
}

export function StatCard({ title, value, icon: Icon, change }: StatCardProps) {
  return (
    <motion.div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {change && (
            <p className={`text-sm mt-2 ${change.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {change.trend === 'up' ? '↑' : '↓'} {change.value}%
            </p>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </motion.div>
  );
}
```

---

## Quick Start Implementation

### Step 1: Install Dependencies
```bash
npm install recharts react-hook-form @hookform/resolvers zod sonner
```

### Step 2: Create Design Tokens
```ts
// lib/design-tokens.ts
export const colors = {
  background: '#000000',
  surface: { 1: '#0A0A0A', 2: '#141414', 3: '#1F1F1F' },
  text: { primary: '#FFFFFF', secondary: '#A3A3A3', tertiary: '#737373' },
  border: { subtle: 'rgba(255,255,255,0.1)', medium: 'rgba(255,255,255,0.2)' }
}
```

### Step 3: Build Dashboard Layout
See implementation below...

---

**Design System Ready for Implementation! 🚀**
