# SKF Karate — Master Build Plan
### Complete System Architecture, Feature Roadmap & Execution Guide
> Last updated: March 2026 | Status: Active development
> Every task in this document reflects decisions made across full system planning sessions.
> **Theme rule (non-negotiable):** Every UI component, every new page, every new feature must reference `app/athlete/athlete.css` before writing a single line of CSS. Use the deep navy backgrounds (`#05080f`), radial glows (`.glow-red`, `.glow-gold`), and 30px-blur glassmorphic cards as the baseline. No new color variables. No new font stacks. Match the premium athlete page — not the older informational pages.

---

## 📌 Project Context

**What this is:** A full-stack Next.js 14/15 (App Router) karate federation website for SKF (Sportkarate Federation), serving multiple branches in Bangalore. The site is not a brochure — it is a living operational platform for students, parents, senseis, and admins.

**Tech stack:**
- Framework: Next.js 14/15, App Router, React 19
- Styling: Tailwind CSS v4 + custom CSS modules per page
- Animations: Framer Motion
- Auth (admin): next-auth — already in codebase
- Auth (students): SKF ID + PIN → httpOnly JWT cookie (to be built)
- Database (operational): Google Sheets via googleapis — already wired
- Database (transactional): Supabase (PostgreSQL) — to be added
- Payments: Razorpay
- Video hosting: YouTube Unlisted embeds (server-side URL only)
- PDF/Certificate: HTML Canvas + jsPDF + html2canvas
- Email: Resend.com (free tier — 3,000 emails/month)
- Hosting: Vercel

**Branches:** 3–4 active branches in Bangalore. All branch-specific data must be isolated — a parent from Koramangala must never see Whitefield's timetable, fees, or videos.

---

## 🎨 Global Theme Rules — Read Before Every Task

These rules apply to **every single task** in this document. Violating them means rework.

```
THEME CHECKLIST (run before writing any UI code):
□ Open app/athlete/athlete.css — read it fully
□ Background: deep navy #05080f or glassmorphic card on navy
□ Primary accent: crimson/red glow (#c0392b range)
□ Secondary accent: gold (#f39c12 range)
□ Cards: backdrop-filter: blur(30px), semi-transparent dark fill, 1px border with rgba gold/white
□ Typography: existing font stack only — no new imports
□ Buttons: match existing button styles — gradient or outline variants
□ Radial glows: .glow-red and .glow-gold classes for section emphasis
□ Mobile: every component tested at 375px width minimum
□ No white backgrounds, no light themes, no generic Bootstrap-style UI
□ html2canvas NOTE: flatten backdrop-filter to solid dark bg before canvas render
```

---

## 🗂️ System Map — What Exists vs What Needs Building

### ✅ Already Built (Production Ready)
- Athlete rankings dashboard (`/athlete`) — WKF-style, category tabs, SKF ID search
- Athlete profile pages (`/athlete/[skfId]`) — dynamic stats, belt history, medals
- Honours page (`/honours`) — dynamic champion calculations
- Events page (`/events`) — past/future split, medal summaries
- Results page (`/results`) — filterable historical statistics
- Gallery (`/gallery`) — masonry, lightbox, keyboard nav
- Contact form (`/contact`) — +91 enforcement, offline queue, localStorage retry
- Admin panel shell (`/admin`) — next-auth protected, student table UI exists

### 🟡 Built But Incomplete (Hardcoded Data / Missing Logic)
- `/about` — UI done, leadership arrays hardcoded in page.js
- `/dojos` — UI done, all data hardcoded
- `/senseis` — UI done, bios hardcoded
- `/grading` — Framer Motion timeline done, content hardcoded
- `/summer-camp` — countdown/maps/pricing done, NOT branch-specific, no payment
- `/admin/students` — table UI exists, CRUD forms (new/edit/delete) missing
- Google Sheets wrapper (`lib/server`) — exists but inconsistently used; no confirmed write methods

### ❌ Not Started (Full Build Required)
- Student/parent auth system (SKF ID + PIN)
- Student portal (`/portal`)
- Branch timetable pages (`/timetable/[branch]`)
- Fee tracker + Razorpay payment
- Receipt PDF generation
- Certificate system (full spec — see Phase 3)
- Video learning system (practice + exam revision)
- Internal linking (sensei ↔ dojo ↔ athlete)
- PWA (next-pwa)
- SEO metadata (generateMetadata on dynamic routes)
- Shareable athlete ranking card (html2canvas)
- Shop
- Attendance tracking
- Announcement/news section
- WhatsApp notification integration (manual copy-paste, no API)
- Supabase setup

---

## 🔐 Architecture Decisions (Locked — Do Not Revisit)

### Auth System
| User Type | Method | Session |
|---|---|---|
| Super Admin | next-auth email + password | Server-managed (existing) |
| Branch Admin | next-auth email + password | Server-managed (existing) |
| Sensei | next-auth email + password | Server-managed (new role) |
| Student / Parent | SKF ID + 4-digit PIN | httpOnly JWT cookie, 30-day |

**Why PIN not DOB:** DOB is semi-public (siblings, classmates know it). PIN is a secret chosen by the parent. bcrypt-hashed in DB. 5 failed attempts = 15-min lockout. Never stored plaintext.

**Why not WhatsApp OTP right now:** Costs money (₹2,500+/month via Interakt/Wati). PIN is zero-cost, zero-dependency. Upgrade path: add Google OAuth alongside PIN when ready — existing users unaffected.

**Future upgrade path:** Google OAuth (Sign in with Google) — free, one tap for Android users, add alongside PIN in Phase 6.

### Data Architecture (Hybrid)
**Google Sheets** — operational data admins edit directly:
- Students, Fees, Tournaments, Timetables, Attendance, Announcements

**Supabase (PostgreSQL)** — transactional data the website writes:
- Programs, CertificateTemplates, Enrollments, certificateUnlocked flags
- VideoProgress, AuthSessions (PIN hashes), OTPAttempts (future placeholder)
- CertificateEvents (analytics/audit)

**The lib/server rule (non-negotiable):** No page, component, or API route ever imports googleapis or the Supabase client directly. All data access goes through typed functions in `lib/server/` — e.g. `getStudentBySkfId()`, `getFeesBySkfId()`, `markCertificateUnlocked()`. This makes future DB migration a single-file change.

### Security Model (Non-Negotiable Rules)
1. JWT is always in an httpOnly, Secure, SameSite=Strict cookie — never localStorage
2. Branch, SKF ID, and role are read exclusively from the verified JWT — never from client-sent query params or body
3. YouTube video URLs are fetched server-side and served as embeds only — raw URL never reaches the browser
4. Google Sheets API credentials live in Vercel env vars only — never in any client bundle
5. Supabase Row Level Security (RLS): public can only read completed/unlocked enrollments; never reads DOB, phone, or payment data
6. Admin panel (/admin/*) is on next-auth — completely separate from student auth

---

## 📋 EXECUTION ORDER — FULL TASK LIST

---

## PHASE 0 — Foundation (Week 1–2)
> **Goal:** Auth works. Supabase is live. Every subsequent phase depends on this being done right.
> **Theme:** These are backend tasks — no UI. But any auth-adjacent UI (login page, PIN entry screen) must use the navy/crimson/gold theme.

---

### TASK 0.1 — Supabase Project Setup
**Priority:** P0 — Do this first, everything else depends on it
**Effort:** 4 hours

```
Steps:
1. Create Supabase project at supabase.com (free tier)
2. Create all 6 tables with exact schema below
3. Enable Row Level Security on all tables
4. Write and test all RLS policies
5. Add Supabase URL and anon key to Vercel environment variables
6. Install @supabase/supabase-js in the project
7. Create lib/server/supabase.js — the single client instance
```

**Supabase Schema:**

```sql
-- Table 1: auth_sessions (student PIN auth)
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: programs (certificate programs)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('camp','belt_exam','training','tournament')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: certificate_templates
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id),
  belt_level TEXT,
  template_image_url TEXT NOT NULL,
  fields JSONB NOT NULL,
  use_qr_code BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  program_id UUID REFERENCES programs(id),
  belt_level TEXT,
  status TEXT CHECK (status IN ('enrolled','completed','revoked')) DEFAULT 'enrolled',
  completion_date DATE,
  issuer_name TEXT,
  certificate_unlocked BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 5: certificate_events (analytics + audit)
CREATE TABLE certificate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skf_id TEXT NOT NULL,
  enrollment_id UUID REFERENCES enrollments(id),
  event_type TEXT CHECK (event_type IN ('viewed','downloaded_pdf','downloaded_png','verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 6: otp_attempts (placeholder for future OTP auth)
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies:**
```sql
-- auth_sessions: only authenticated admin can read/write
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON auth_sessions USING (auth.role() = 'admin');

-- enrollments: public can read completed+unlocked; student reads own; admin reads all
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_completed" ON enrollments FOR SELECT
  USING (certificate_unlocked = true AND status = 'completed');

-- certificate_events: students can insert own; admin reads all
ALTER TABLE certificate_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_insert_own" ON certificate_events FOR INSERT
  WITH CHECK (true); -- skf_id verified at API layer, not RLS
```

---

### TASK 0.2 — Student Auth Implementation
**Priority:** P0
**Effort:** 3 days
**Theme:** Login page — navy background, glassmorphic card centered, crimson accent on PIN dots, gold submit button

```
Files to create:
- app/portal/login/page.js          — SKF ID + PIN entry UI
- app/api/auth/portal/route.js      — POST: verify SKF ID + PIN, issue JWT
- app/api/auth/portal/set-pin/route.js — POST: first-time PIN setup
- app/api/auth/portal/logout/route.js  — POST: clear cookie
- lib/server/auth.js                — createJWT(), verifyJWT(), hashPin(), verifyPin()
- middleware.js (update)            — protect /portal/* routes; keep /admin/* on next-auth

Steps:
1. Install: npm install bcryptjs jsonwebtoken
2. lib/server/auth.js:
   - hashPin(pin) → bcrypt.hash(pin, 12)
   - verifyPin(pin, hash) → bcrypt.compare(pin, hash)
   - createJWT(payload) → sign with JWT_SECRET env var, 30d expiry
   - verifyJWT(token) → verify and decode
3. POST /api/auth/portal:
   a. Extract skfId, pin from body
   b. Look up student in Google Sheets by skfId — confirm Active status
   c. Look up auth_sessions row in Supabase by skf_id
   d. If no row exists → return 404 "PIN not set yet"
   e. Check locked_until — if still locked, return 429
   f. bcrypt.compare(pin, pin_hash)
   g. On fail: increment failed_attempts, set locked_until if >= 5, return 401
   h. On success: reset failed_attempts, create JWT with {skfId, branch, belt, role: 'student'}
   i. Set cookie: httpOnly, Secure, SameSite=Strict, maxAge=2592000 (30 days)
   j. Return 200
4. POST /api/auth/portal/set-pin:
   a. Validate skfId exists in Sheets and is Active
   b. Validate pin is exactly 4 digits
   c. Hash pin with bcrypt
   d. Upsert into auth_sessions
   e. Issue JWT + set cookie
   f. Return 200
5. middleware.js:
   - /portal/* → verify JWT from cookie → if invalid, redirect to /portal/login
   - /admin/* → keep existing next-auth check
   - All other routes → pass through
6. Login page UI (app/portal/login/page.js):
   - Two-step: first enter SKF ID, then enter PIN
   - If no PIN exists for that SKF ID, show "Set your PIN" flow
   - PIN input: 4 large circular dot inputs, not a text field
   - "Forgot PIN?" link — shows: "Contact your branch admin to reset"
   - Full navy/glassmorphic theme
```

---

### TASK 0.3 — Google Sheets lib/server Audit & Standardisation
**Priority:** P0
**Effort:** 2 days

```
Files to audit and rewrite:
- lib/server/sheets.js (or equivalent) — the Google Sheets wrapper

Required functions (create any missing):
- getStudentBySkfId(skfId) → student object or null
- getStudentsByBranch(branch) → array of students
- getFeesBySkfId(skfId) → array of fee rows
- getVideosByBranchAndBatch(branch, batch) → array of video rows
- getTimetableByBranch(branch) → current month image URL
- getTournamentsBySkfId(skfId) → array of tournament rows
- getAttendanceBySkfId(skfId, month) → attendance rows
- updateStudentBelt(skfId, newBelt) → write back to sheet
- markFeeAsPaid(skfId, month, receiptId) → write back to sheet

Rules:
- Every function uses ISR-friendly caching (next: { revalidate: 60 })
- No function is called directly from page.js or components
- Every function returns typed objects (JSDoc at minimum)
- Error handling: every function catches and logs, returns null on failure
```

---

### TASK 0.4 — Multi-Role JWT System
**Priority:** P0
**Effort:** 1 day

```
JWT payload structure:
{
  skfId: "SKF2041",          // null for admin/sensei
  role: "student",           // "student" | "sensei" | "branch_admin" | "super_admin"
  branch: "Koramangala",     // null for super_admin
  batch: "Tue 5pm",          // students only
  belt: "yellow",            // students only
  name: "Arjun Sharma",      // display name
  iat: ...,
  exp: ...
}

Role permission map (enforce in every API route):
- super_admin: all branches, all data, read+write everything
- branch_admin: own branch only, read+write students/fees/videos/timetables
- sensei: own batch only, read students, write attendance + videos for their batch
- student: own skfId only, read own data, write certificate_events

Middleware helper: lib/server/requireRole.js
- requireRole(request, ['branch_admin', 'super_admin']) 
- Returns decoded JWT or throws 403
- Used at the top of every protected API route
```

---

## PHASE 1 — Timetable System (Week 2 — parallel with Phase 0)
> **Goal:** Parents have a reason to visit the website within days of launch.
> **Theme:** Timetable image displayed on a navy glassmorphic card. Branch pill badge in crimson. Month/year header in gold.

---

### TASK 1.1 — Google Sheet: Timetables Tab
**Priority:** P1
**Effort:** 30 minutes

```
Add new sheet tab "Timetables" to the master Google Sheet:
Columns: Branch | Month | Year | Drive_Image_URL | Uploaded_By | Upload_Date

Populate with current month's timetable for each branch.
Set sharing on all timetable images: "Anyone with the link can view"
```

---

### TASK 1.2 — Branch Timetable Pages
**Priority:** P1
**Effort:** 1 day

```
Files to create:
- app/timetable/[branch]/page.js
- app/timetable/[branch]/timetable.css  ← match athlete.css theme

Route examples:
  /timetable/koramangala
  /timetable/whitefield
  /timetable/jp-nagar

Page structure:
- Branch name header with crimson glow
- Current month pill badge (gold)
- Next.js <Image> component loading from Drive URL
- "Previous months" accordion — last 3 months
- WhatsApp button: "Questions? Chat with [Branch Name] admin" → opens wa.me/[branch_number]
- If no timetable uploaded yet: elegant "Coming soon" state, not a broken page

lib/server/sheets.js → getTimetableByBranch(branch):
  - Filters Timetables sheet by branch name (case-insensitive)
  - Returns current month row
  - Cached with revalidate: 3600 (1 hour — timetables don't change mid-month)

generateMetadata():
  - title: "June Timetable — SKF Koramangala"
  - description: "View the training schedule for SKF Koramangala branch"
  - openGraph image: the timetable image URL itself

No login required — timetables are public but branch-separated by URL.
Parents bookmark their branch URL. Share it in the WhatsApp group once.
```

---

### TASK 1.3 — Internal Linking (Dojo → Timetable)
**Priority:** P1
**Effort:** 2 hours

```
Add to each Dojo page:
- "View this month's timetable →" link pointing to /timetable/[branch-slug]

Add to homepage:
- Branch selector widget → "View timetable for your branch"
- 3-4 branch buttons, each linking to /timetable/[branch]

Dojo page → Sensei linking (currently missing):
- Each Dojo page: list all senseis where sensei.dojo === currentDojo
- Each Sensei card: "View [Branch] Dojo →" link

Athlete profile → Dojo linking:
- Athlete profile: "Trains at [Branch]" → links to /dojos/[branch-slug]
```

---

## PHASE 2 — Student Portal (Week 3–5)
> **Goal:** Parents check fees, watch videos, and view their child's profile from a single authenticated dashboard.
> **Theme:** Portal dashboard uses the same navy/glassmorphic card system. Metric cards (fees due, videos watched) in crimson/gold accents. Belt level shown with the exact belt color as a glow accent on the profile header.

---

### TASK 2.1 — Portal Dashboard Layout
**Priority:** P1
**Effort:** 2 days

```
Files to create:
- app/portal/page.js                    — redirects to /portal/dashboard if logged in
- app/portal/dashboard/page.js          — main portal home
- app/portal/layout.js                  — portal shell with nav
- app/portal/portal.css                 — theme: match athlete.css

Dashboard sections:
1. Student header card:
   - Student photo (if photoConsent = true)
   - Name, SKF ID, belt level with belt-color glow accent
   - Branch, batch slot, member since
   - Initials avatar if no photo

2. Quick stats row (4 metric cards):
   - Fee status: "₹1,500 due" (red) or "Paid ✓" (green)
   - Videos this week: "2 of 4 watched"
   - Exam revision: "80% complete"
   - Next grading: "July 2025"

3. Navigation tabs:
   - Fees & Receipts
   - Practice Videos
   - Certificates
   - My Profile

Multi-child families:
- If JWT.phone maps to 2+ students → show child switcher at top of dashboard
- Switching child: re-fetch all data for new skfId, update display
- Cookie holds the parent phone; child selection is a UI state
```

---

### TASK 2.2 — Fee Tracker
**Priority:** P1
**Effort:** 3 days

```
Files to create:
- app/portal/fees/page.js
- app/api/portal/fees/route.js
- app/api/portal/fees/pay/route.js
- lib/server/fees.js

Fee page layout:
1. Current month status: large card — "June 2025: ₹1,500 DUE" in crimson
   - [Pay Now] button → opens Razorpay checkout
2. Payment history table: Month | Amount | Date | Status | Receipt
   - Each paid row has [Download Receipt] button
3. Outstanding dues: if 2+ months unpaid, show total owed

API route (GET /api/portal/fees):
- Verify JWT from cookie
- Read skfId from JWT (never from query params)
- Call getFeesBySkfId(skfId) from lib/server
- Return fee rows filtered to this student only

Razorpay integration:
- Install: npm install razorpay
- POST /api/portal/fees/pay:
  a. Verify JWT
  b. Create Razorpay order with correct amount for student's branch
  c. Return order_id to client
  d. Client opens Razorpay checkout
  e. On success: Razorpay calls webhook
- POST /api/webhooks/razorpay:
  a. Verify webhook signature
  b. Write payment to Fees sheet via markFeeAsPaid()
  c. Generate receipt ID: RCP_[skfId]_[YYYYMM]
  d. Return 200

Receipt generation (see Task 2.3)
```

---

### TASK 2.3 — Receipt PDF Generation
**Priority:** P1
**Effort:** 2 days

```
Files to create:
- app/api/portal/receipts/[receiptId]/route.js
- lib/receipts/generateReceipt.js

Tech: jsPDF (browser-side) + server-side generation option

Receipt contents:
- SKF logo top-left
- "Official Fee Receipt" heading
- Receipt number, date
- Student name, SKF ID, branch
- Month, amount, payment method
- "Paid ✓" stamp in green
- Dojo address, contact

Theme on receipt:
- White/light background for print (exception to dark theme — receipts must print clearly)
- Navy header band with gold text for SKF branding
- Clean, professional, not decorative

API route (GET /api/portal/receipts/[receiptId]):
- Verify JWT
- Confirm receiptId belongs to JWT.skfId (never let one student download another's receipt)
- Fetch fee row from Sheets
- Generate PDF buffer using jsPDF server-side
- Return as application/pdf with Content-Disposition: attachment
```

---

### TASK 2.4 — Practice Video System
**Priority:** P1
**Effort:** 1 week

```
Files to create:
- app/portal/videos/page.js
- app/api/portal/videos/route.js              — fetch video list for student
- app/api/portal/videos/progress/route.js     — POST watch progress
- app/api/portal/videos/embed/[videoId]/route.js — return YouTube embed (server-side URL only)
- lib/server/videos.js

Google Sheet: add "Videos" tab
Columns: Video_ID | Title | YouTube_URL | Branch | Batch | Section | Belt_Level | Unlock_Date | Locked | Duration_Min | Uploaded_By

Video list API (GET /api/portal/videos):
- Verify JWT
- Read branch, batch, belt from JWT
- Call getVideosByBranchAndBatch(branch, batch) from lib/server
- Filter: Unlock_Date ≤ today AND Locked ≠ YES
- For exam videos: Belt_Level ≤ JWT.belt (only current and lower belts)
- NEVER return YouTube_URL field to client
- Return: {videoId, title, section, beltLevel, unlockDate, duration, progressPercent}

Embed API (GET /api/portal/videos/embed/[videoId]):
- Verify JWT
- Confirm this videoId is accessible to JWT.skfId (re-run access check)
- Fetch YouTube_URL from Sheets server-side
- Return ONLY: {embedUrl: "https://www.youtube.com/embed/[youtubeId]"}
- Never return the full youtube.com/watch URL

Video page layout:
Section 1: "This week — after class" (most recent, New badge)
Section 2: "Last week"
Section 3: "Exam revision — [Belt] belt"
  - Current belt videos: unlocked
  - Next belt videos: visible, greyed out, "Unlocks after grading to [Next Belt]"

Each video card:
- Thumbnail placeholder with play button
- Title, batch, date, duration
- Progress bar (from VideoProgress in Supabase)
- "New" badge if uploaded in last 7 days

Progress tracking:
- When student plays a video → POST /api/portal/videos/progress with {videoId, percent}
- Server writes to Supabase video_progress table
- Admin can see "8/15 students watched this video" in their panel

CORS workaround for YouTube thumbnails:
- Route thumbnail URLs through /api/proxy/image?url=[encoded] 
- Prevents CORS issues on canvas/image elements
```

---

### TASK 2.5 — Student Profile View (in Portal)
**Priority:** P2
**Effort:** 1 day

```
Files to update: app/portal/profile/page.js

Profile sections (parent-facing, read-only):
1. Identity: Name, SKF ID, photo (if consent), branch, batch
2. Belt progress: Current belt with belt-color glow, grading history timeline, next grading date
3. Achievements: Total medals (Gold/Silver/Bronze count), recent tournaments
4. Certificates: Quick link to /portal/certificates (see Phase 3)
5. Attendance: This month — "7 of 9 classes attended" with dot calendar

The shareable ranking card (html2canvas):
- [Download my ranking card] button on profile
- Renders a styled card: name, SKF ID, belt, rank, medal count, SKF logo
- IMPORTANT: Before canvas render, replace all backdrop-filter elements with solid #0a0e1a bg
- Saves as: [Name]_SKF_RankingCard.jpg
- Parents share on Instagram/WhatsApp — organic marketing
```

---

## PHASE 3 — Certificate System (Week 6–9)
> **Goal:** Every student can download a professional branded certificate. Admin can issue them in bulk in minutes.
> **Theme:** Certificate cards on the athlete profile feel like achievement badges. Gold border, belt-color glow, subtle seal/crest motif. The certificate modal opening should have a reveal animation (scale + fade in). The certificates themselves use a separate print-optimised design (not dark theme).

---

### TASK 3.1 — Certificate Canvas Engine
**Priority:** P1
**Effort:** 4 days

```
Files to create:
- lib/certificates/renderer.js         — the core canvas rendering engine
- lib/certificates/exportPng.js        — PNG export
- lib/certificates/exportPdf.js        — PDF export via jsPDF
- app/api/certificates/template-image/route.js — CORS proxy for template images

renderer.js — CertificateRenderer class:
constructor(enrollmentId, skfId)
  - Fetches enrollment → program → template → student from Supabase + Sheets
  - Validates certificateUnlocked === true (throws if false)

async render(canvasElement):
  - Sets canvas to 2480 × 1754 (landscape A4 at 300dpi)
  - Loads template image via /api/certificates/template-image?url=[encoded]
  - Draws template image as background: ctx.drawImage(img, 0, 0, 2480, 1754)
  - For each field in template.fields:
      x_px = (field.x / 100) * 2480
      y_px = (field.y / 100) * 1754
      scaledFontSize = field.fontSize * (2480 / 1240)
      ctx.font = `${scaledFontSize}px ${field.fontFamily}`
      ctx.fillStyle = field.color
      ctx.textAlign = field.align
      ctx.fillText(fieldValue, x_px, y_px)
  - If template.useQrCode: generate QR for /verify/[skfId]/[enrollmentId], draw at configured position
  - Returns canvas (ready for export)

exportPng.js:
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studentName}_${programName}_Certificate.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')

exportPdf.js (jsPDF):
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [2480, 1754] })
  const imgData = canvas.toDataURL('image/png')
  pdf.addImage(imgData, 'PNG', 0, 0, 2480, 1754)
  pdf.save(`${studentName}_${programName}_Certificate.pdf`)

iOS Safari download fix:
  - For iOS: use FileReader + data URI instead of object URL
  - Detect iOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
  - On iOS: open PNG in new tab instead of triggering download (user can long-press to save)

Template image CORS proxy (/api/certificates/template-image):
  - Fetch Google Drive image server-side
  - Return with Access-Control-Allow-Origin: *
  - Canvas can then load it from same origin — no CORS error
```

---

### TASK 3.2 — Certificate Templates Admin UI
**Priority:** P1
**Effort:** 4 days

```
Files to create:
- app/admin/certificates/page.js               — certificate programs list
- app/admin/certificates/programs/new/page.js  — create new program
- app/admin/certificates/programs/[id]/page.js — manage program + templates
- app/admin/certificates/programs/[id]/template-editor/page.js — drag-and-drop field editor
- app/api/admin/certificates/programs/route.js
- app/api/admin/certificates/templates/route.js

Program list page:
- Table: Name | Type | Templates | Active students | Actions
- [+ New Program] button

Template editor (the key feature):
- Upload template background image → stores to Google Drive → URL saved in Supabase
- Preview panel: shows the uploaded image at 800px width
- Field list (left sidebar): Name, Date, Belt, Issuer, SKF ID, QR Code
- Each field is a draggable label overlay on the preview
- Dragging updates x% and y% in real time
- Right panel: per-field settings (font, size, color, alignment)
- [Preview with sample data] button: renders actual text at configured positions
- [Save Template] button: writes to Supabase certificate_templates table

For belt_exam programs: separate template per belt level (7 templates total)
For other programs: single template

Belt color accent applied to the template editor card border when editing a belt-specific template
```

---

### TASK 3.3 — Enrollment Management Admin
**Priority:** P1
**Effort:** 3 days

```
Files to create:
- app/admin/enrollments/page.js
- app/api/admin/enrollments/route.js
- app/api/admin/enrollments/[id]/complete/route.js
- app/api/admin/enrollments/[id]/revoke/route.js
- app/api/admin/enrollments/bulk/route.js
- app/api/admin/enrollments/notify/route.js

Enrollment list page:
- Filters: Program | Status (enrolled/completed/revoked) | Branch | Search by name or SKF ID
- Table: Student Name | SKF ID | Program | Belt | Status | Date | Actions
- Bulk select with checkboxes
- Bulk actions bar: [Mark All Completed] [Send Notifications to Selected]

Per-enrollment actions:
- [Preview Certificate] — opens certificate in a modal (admin-only preview, no download logged)
- [Mark Complete + Unlock] — sets status=completed, certificateUnlocked=true
- [Send Notification] — triggers Resend email to parent (see Task 3.5)
- [Edit] — fix name, belt level, date, issuer (mistakes happen)
- [Revoke] — sets certificateUnlocked=false instantly, student gets 403 on next access

WhatsApp message auto-generator:
After bulk completion → show a modal:
"Copy this message to your WhatsApp group:"
[textarea with pre-written message]
[Copy to Clipboard button]

Generated message format:
🥋 Certificates are ready!
Students who completed [Program Name] can now download their digital certificate.
👉 Find your certificate:
1. Visit skfkarate.com/portal
2. Go to Certificates tab
3. Click View → Download
Congratulations to all! 🏆
```

---

### TASK 3.4 — Certificates Tab on Athlete Profile + Portal
**Priority:** P1
**Effort:** 2 days

```
Files to update:
- app/athlete/[skfId]/page.js  — add Certificates tab
- app/portal/certificates/page.js  — portal certificates page

Add "Certificates" tab to the existing /athlete/[skfId] page:
(Do not create a new page — extend the existing one)

Certificate card design:
- Glassmorphic card on navy background
- Belt-color glow border (yellow border for Yellow Belt Exam, etc.)
- Program name, date, issuer
- [View Certificate] button (crimson/gold gradient)
- Past records without digital cert: shown as muted entry, no [View] button

Certificate modal:
- Full-screen overlay (not a floating box) on mobile
- Scale + fade reveal animation on open
- Certificate preview: full canvas render at display size (CSS-scaled down from 2480px)
- Pinch-to-zoom on mobile (touch-action: manipulation)
- [Download PDF] button — full width on mobile, min 48px height
- [Download PNG] button — same
- [Share] button — navigator.share() on mobile, clipboard copy on desktop
- [✕ Close] button top-right

Share message (WhatsApp-optimised):
🥋 My Karate Certificate!
[Student Name] has earned [Program Name]
View here: skfkarate.com/athlete/[skfId]

Portal certificates page (/portal/certificates):
- Same card list, same modal
- Shows ONLY certificates for the logged-in student's skfId
- Data fetched from Supabase enrollments filtered by skf_id from JWT
```

---

### TASK 3.5 — Email Notifications (Resend)
**Priority:** P2
**Effort:** 1 day

```
Install: npm install resend

Files to create:
- lib/email/resend.js           — Resend client setup
- lib/email/templates.js        — email template functions
- app/api/admin/notifications/route.js

lib/email/resend.js:
  import { Resend } from 'resend'
  export const resend = new Resend(process.env.RESEND_API_KEY)

lib/email/templates.js:
  certificateReady({ parentName, studentName, programName, skfId, websiteUrl })
    → returns { subject, html }

POST /api/admin/notifications:
  - Verify admin JWT
  - Fetch enrollment + student data
  - Send via resend.emails.send()
  - Update notification_sent = true in Supabase
  - Return 200

Free tier: 3,000 emails/month — more than enough for SKF's scale
```

---

### TASK 3.6 — Certificate Verification Page
**Priority:** P2
**Effort:** 4 hours

```
Files to create:
- app/verify/[skfId]/[enrollmentId]/page.js

Page content:
If valid enrollment (certificateUnlocked=true, status=completed):
  ✅ Certificate Verified
  Issued to: [Student Name]
  Program: [Program Name]
  Date: [Completion Date]
  Issued by: [Issuer Name]
  SKF ID: [skfId]
  This certificate was issued by SKF and is verified authentic.

If invalid:
  ❌ Certificate not found or invalid.
  This may have been revoked or the link is incorrect.

This page is the QR code scan destination. Must work without login.
Reads from Supabase enrollments — only public fields returned.
generateMetadata() for social sharing.
```

---

## PHASE 4 — Design Standardisation & SEO (Week 9–10)
> **Goal:** The site looks like one product, not six islands. Google starts indexing it properly.
> **Theme:** This entire phase IS the theme work. Every page brought up to athlete.css standard.

---

### TASK 4.1 — CSS Standardisation Pass
**Priority:** P1
**Effort:** 4 days

```
Pages to rewrite (in this order):
1. app/dojos/dojos.css          — most important, highest traffic
2. app/senseis/senseis.css      — linked from dojos
3. app/about/about.css          — brand page
4. app/grading/grading.css      — Framer Motion timeline already good, just needs theme
5. app/events/events.css        — secondary
6. app/summer-camp/summer-camp.css — revenue page, must look premium

For each file:
□ Open athlete.css first — copy the CSS variable references
□ Replace any white/light backgrounds with navy (#05080f) or dark translucent
□ Replace any generic card styles with the glassmorphic card pattern
□ Apply .glow-red and .glow-gold where sections need visual emphasis
□ Ensure all text is on dark backgrounds with sufficient contrast
□ Run the page at 375px mobile width — fix any overflow
□ No new color variables or font imports — only what exists globally

Specific components to standardise:
- All "card" classes → glassmorphic dark card
- All "button" classes → match existing crimson gradient or outline variants
- All section headings → match athlete.css section title style
- All badges/pills → dark background, gold or crimson text
```

---

### TASK 4.2 — Internal Linking Completion
**Priority:** P1
**Effort:** 1 day

```
Every link that should exist but doesn't:

Sensei card → their Dojo page
  senseis/page.js: add href={`/dojos/${sensei.dojoSlug}`} to each card

Dojo page → all Senseis at that branch
  dojos/[slug]/page.js: filter senseis where sensei.branch === currentDojo, render their cards

Athlete profile → their Dojo
  athlete/[skfId]/page.js: add "Trains at [Branch]" link → /dojos/[branchSlug]

Grading page → book grading per branch
  grading/page.js: add "Book your grading at [Branch]" links per branch

Events → medal results per student
  events/[slug]/page.js: link medal results to the athlete's profile

Dojo page → branch timetable
  dojos/[slug]/page.js: prominent "View this month's timetable →" link

Dojo page → summer camp (branch-specific)
  dojos/[slug]/page.js: "Summer Camp at [Branch] →" link
```

---

### TASK 4.3 — Dynamic OpenGraph Metadata
**Priority:** P1
**Effort:** 1 day

```
Add generateMetadata() to these routes:

app/athlete/[skfId]/page.js:
  title: "[Name] — SKF Athlete Profile"
  description: "[Name] · [Belt] Belt · [N] medals · SKF Karate"
  openGraph:
    title: "[Name] — SKF Karate"
    description: "[Belt] Belt · [N] Gold medals · SKF ID: [skfId]"
    images: [{ url: student.profilePhotoUrl || '/og-default-athlete.jpg' }]
    type: 'profile'

app/events/[slug]/page.js:
  title: "[Event Name] — SKF Results"
  description: "SKF at [Event]: [N] Gold, [N] Silver, [N] Bronze"
  openGraph.images: event banner or default

app/timetable/[branch]/page.js:
  title: "[Month] Timetable — SKF [Branch]"
  openGraph.images: the timetable image itself (parents see it in WhatsApp preview)

Default OG image: Create /public/og-default.jpg
  - 1200 × 630px
  - SKF logo centered on navy/crimson gradient
  - "SKF Karate — Bangalore's Premier Karate Federation"

This alone will make every WhatsApp link share look professional instead of blank.
```

---

### TASK 4.4 — PWA (Progressive Web App)
**Priority:** P2
**Effort:** 2 hours

```
Install: npm install next-pwa

next.config.js:
  const withPWA = require('next-pwa')({ dest: 'public', register: true, skipWaiting: true })
  module.exports = withPWA({ ...existing config })

public/manifest.json:
  {
    "name": "SKF Karate",
    "short_name": "SKF",
    "description": "SKF Karate student portal and rankings",
    "theme_color": "#05080f",
    "background_color": "#05080f",
    "display": "standalone",
    "start_url": "/portal",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
  }

Create icons: 192×192 and 512×512 PNG versions of the SKF logo on navy background

Result: "Add to Home Screen" prompt appears on Android Chrome after 2 visits.
Parents install it → looks like an app → they stop losing the URL.
iOS Safari 16.4+: also supports PWA install.
```

---

### TASK 4.5 — Shareable Athlete Ranking Card
**Priority:** P2
**Effort:** 2 days

```
Files to create:
- components/RankingCard.js         — the card component
- lib/rankingCard/generateCard.js   — html2canvas export logic

Card design (1080 × 1080px — square for Instagram):
- Navy background (#05080f)
- SKF logo top-left, crimson glow bottom-right
- Student name in large gold typography
- SKF ID small
- Belt with belt-color accent
- Medal count: [N] Gold | [N] Silver | [N] Bronze
- Ranking: "#4 Overall — SKF Rankings"
- Gold border with subtle texture

html2canvas notes (CRITICAL):
- All backdrop-filter CSS must be replaced with solid bg before render
- Use: card.style.backdropFilter = 'none'; card.style.background = '#0a0e1a'
- Render to a hidden div, not the visible card — never alter the actual UI
- Output: 1080×1080 JPEG (not PNG — smaller file, faster WhatsApp upload)

Button on /athlete/[skfId] page:
[Download Ranking Card] → generates + downloads [Name]_SKF_RankingCard.jpg
```

---

### TASK 4.6 — Google Analytics 4 + Schema.org
**Priority:** P2
**Effort:** 4 hours

```
GA4:
- Create GA4 property
- Add measurement ID to .env
- Install: npm install @next/third-parties
- In app/layout.js: <GoogleAnalytics gaId={process.env.GA_ID} />
- Track custom events: certificate_download, video_watched, fee_paid

Schema.org structured data on Dojo pages:
In dojos/[slug]/page.js — add JSON-LD:
{
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "SKF Karate — [Branch Name]",
  "address": { "@type": "PostalAddress", "streetAddress": "...", "addressLocality": "Bangalore" },
  "telephone": "[branch phone]",
  "openingHours": ["Tu,Th 17:00-18:30", "Sa 09:00-11:00"],
  "sport": "Karate"
}

This makes Google show address, hours, and phone number directly in search results for
"karate classes Koramangala" queries — 35-40% higher click-through rate.
```

---

## PHASE 5 — Revenue Features (Week 11–13)

---

### TASK 5.1 — Branch-Specific Summer Camp
**Priority:** P1
**Effort:** 1 week

```
Files to update/create:
- app/summer-camp/page.js       — make it branch-aware
- app/summer-camp/[branch]/page.js  — branch-specific camp page
- app/api/portal/camp/enrol/route.js

Google Sheet: add "SummerCamp" tab
Columns: Branch | Year | Month1_Price | Month2_Price | FullCamp_Price | Available_Slots | Registration_Open

Camp page logic:
- If user is logged in (JWT exists): auto-detect branch, show only that branch's pricing
- If not logged in: show branch selector → routes to /summer-camp/[branch]
- Each branch page shows: dates, pricing tiers, available slots, batch options
- [Enrol + Pay] button → Razorpay checkout
- On payment success: write to SummerCamp_Enrollments sheet

Confirmation:
- Thank you page with WhatsApp share button
- Email confirmation via Resend
- Admin sees new enrolment in admin panel instantly (Sheets auto-updates)
```

---

### TASK 5.2 — Admin CRUD Completion
**Priority:** P1
**Effort:** 1 week

```
Currently missing (stubs exist):
- app/admin/students/new/page.js     — create new student
- app/admin/students/[id]/edit/page.js — edit student details
- app/api/admin/students/route.js    — POST: create student
- app/api/admin/students/[id]/route.js — PUT: update, DELETE: deactivate

Create student form fields:
Full Name | SKF ID (auto-generated or manual) | DOB | Branch | Batch | Belt Level
Parent Name | Phone | Monthly Fee | Photo Consent checkbox | Enrolled Date

Auto-generate SKF ID:
Format: SKF[YEAR][4-digit-incrementing-number] — e.g. SKF20410001
Fetch highest existing ID from sheet, increment

After student created:
1. Write to Students sheet
2. Create Supabase auth_sessions row (no PIN yet — parent sets on first login)
3. Auto-send welcome WhatsApp message template to admin for copy-paste
4. Optionally send welcome email via Resend

Edit student: same form, pre-populated, PUT request
Deactivate: soft delete (Status = Inactive, not deleted) — preserves history

CSV bulk import:
- [Import CSV] button on /admin/students
- Parse CSV with Papa Parse
- Validate each row (required fields, SKF ID format, belt level enum)
- Show preview table before confirming
- Batch write to Sheets in chunks of 20 (avoid Sheets API rate limits)
```

---

### TASK 5.3 — Attendance Tracking
**Priority:** P2
**Effort:** 3 days

```
Files to create:
- app/admin/attendance/page.js           — admin attendance marking
- app/portal/attendance/page.js          — parent view (read-only)
- app/api/admin/attendance/route.js

Google Sheet: add "Attendance" tab
Columns: SKF_ID | Date | Branch | Batch | Present | Marked_By

Admin attendance page:
- Select branch + batch + date
- Shows student list for that batch
- Checkbox per student: Present / Absent
- [Save Attendance] → writes all rows to Attendance sheet at once

Portal attendance view:
- Parent sees: this month's calendar with green/red dots per class day
- "7 of 9 classes attended this month"
- Sensei can also mark attendance from their Sensei panel
```

---

## PHASE 6 — Growth Features (Ongoing)

---

### TASK 6.1 — Shop
**Priority:** P3
**Effort:** 2 weeks

```
Files to create:
- app/shop/page.js
- app/shop/[productId]/page.js
- app/api/shop/checkout/route.js

Start with 5–10 SKUs:
- White Gi (S/M/L/XL)
- Belt by level
- SKF branded t-shirt
- Sparring gear set
- SKF water bottle / bag

Data: hardcoded JSON initially, move to Google Sheet later

Checkout: Razorpay standard checkout
Post-payment: write order to Orders sheet, send confirmation email

Theme: same navy/gold. Product cards: glassmorphic. Product photo on dark background.
```

---

### TASK 6.2 — Technique Video Library
**Priority:** P2
**Effort:** 1 week

```
Files to create:
- app/techniques/page.js
- app/techniques/[beltLevel]/page.js

Structure (NOT gated — public page):
- Filter by belt level (tabs)
- Filter by category (Kata / Kumite / Kihon / Conditioning)
- Video cards: YouTube unlisted embeds
- Duration, difficulty badge

YouTube embed safety:
- For the PUBLIC technique library, YouTube embeds are acceptable (not secret class recordings)
- These are curated technique reference videos, not private class content
- No raw URLs — still use ?rel=0&modestbranding=1 parameters

Belt-level sections:
Beginner (White–Yellow) | Intermediate (Orange–Green) | Advanced (Blue–Black)
```

---

### TASK 6.3 — News & Announcements
**Priority:** P2
**Effort:** 3 days

```
Files to create:
- app/news/page.js
- app/news/[slug]/page.js

Google Sheet: add "Announcements" tab
Columns: Slug | Title | Body | Branch (or ALL) | Published_Date | Expiry_Date | Author

Page features:
- Latest news feed: tournament results, achievement spotlights, event previews
- Branch filter: All / Koramangala / Whitefield / etc.
- Each article has generateMetadata() → Google indexes it
- This is the SEO compound effect — new content every month = more Google traffic

Admin creates announcements in the Sheet directly (no code needed)
Articles auto-expire after Expiry_Date
```

---

### TASK 6.4 — Google OAuth (Upgrade from PIN)
**Priority:** P3
**Effort:** 2 days

```
Add to next-auth config (app/api/auth/[...nextauth]/route.js):
- GoogleProvider from next-auth/providers/google
- On sign-in: check if JWT email matches any parentEmail in Students sheet
- If match: issue student JWT with that student's skfId, branch, belt, role
- If no match: show "Your Google account is not linked to an SKF student"

Existing PIN users:
- No disruption — PIN login still works
- On PIN login success: offer "Link your Google account for easier login next time"
- Linking stores their Gmail in Students sheet parentEmail column

Cost: ₹0. Google OAuth is free forever.
This becomes the primary login method once the portal has active users.
```

---

### TASK 6.5 — Web Push Notifications
**Priority:** P3
**Effort:** 3 days

```
Install: npm install web-push

When admin uploads a new timetable:
- Send push notification to all subscribed parents of that branch
- "June timetable for Koramangala is now live"

When admin bulk-unlocks certificates:
- Send push to relevant students
- "Your Yellow Belt certificate is ready to download"

Service worker: public/sw.js (generated by next-pwa — extend it)
Push subscription stored in Supabase: push_subscriptions table
(phone/skfId, subscription JSON, branch, created_at)

Cost: ₹0. Web Push API is free. No third-party service needed.
Works on Android Chrome. Works on iOS Safari 16.4+.
```

---

### TASK 6.6 — Sponsor Showcase
**Priority:** P3
**Effort:** 1 day

```
Files to create: app/sponsors/page.js (or section on homepage)

Google Sheet: add "Sponsors" tab
Columns: Name | Logo_URL | Website | Tier (Gold/Silver/Bronze) | Active

Display: logo grid on homepage footer and dedicated /sponsors page
Tiers: Gold (large), Silver (medium), Bronze (small)
Revenue opportunity: ₹10,000–50,000/year per sponsor depending on tier
```

---

## 🔍 Quality Assurance Checklist

Run this before marking any task complete:

### Theme Compliance
```
□ No white or light backgrounds on any component
□ All cards use glassmorphic dark pattern from athlete.css
□ Accent colors only from the established crimson/gold palette
□ No new CSS variables introduced
□ No new font imports
□ Belt-color accents applied wherever belt level is displayed
□ Mobile tested at 375px — no horizontal overflow
□ Dark mode doesn't break anything (navy is already dark-mode-native)
```

### Security
```
□ No Sheets API credentials in any client bundle
□ No YouTube video URLs returned to client (embed only)
□ All protected routes check JWT from cookie (not query params)
□ Branch and SKF ID read from JWT only (never from client body)
□ Rate limiting on OTP/PIN attempts
□ RLS policies tested in Supabase dashboard
□ No DOB, phone, or parent email in any public API response
```

### Performance
```
□ All images use Next.js <Image> (no native <img> tags)
□ Google Sheets calls use revalidate caching
□ Video thumbnails served via proxy (not raw external URLs)
□ PDF generation tested on iOS Safari + Android Chrome
□ html2canvas: backdrop-filter removed before render
□ No library imported globally that should be lazy-loaded
```

### Functionality
```
□ Multi-child families: parent can switch between children
□ Inactive students get 401 on next request (not just on login)
□ certificateUnlocked = false → 403 on certificate API, canvas never starts
□ Enrollment revoked → certificate modal shows "unavailable"
□ Branch isolation: API query uses JWT.branch, not request param
□ Razorpay webhook: signature verified before writing payment
□ Receipt belongs to correct student (skfId check before PDF generation)
```

---

## 📊 Metrics to Track

Once GA4 is live, these are the KPIs that tell you if the site is working:

| Metric | Target | Indicates |
|---|---|---|
| Weekly returning visitors | >60% | Parents are habituated |
| Portal session/month per student | >4 | Fee + video checking is working |
| Certificate download rate | >80% of unlocked | Parents engaged |
| Timetable page views per month | >300 | Parents checking schedule |
| Avg pages per session | >3 | Internal linking is working |
| Mobile % of traffic | >70% | Site is genuinely mobile-friendly |
| Contact form conversions | >5/month | New admissions pipeline is working |

---

## 🗓️ Timeline Summary

| Phase | What | Weeks | Dependency |
|---|---|---|---|
| Phase 0 | Auth + Supabase setup | 1–2 | None — start here |
| Phase 1 | Timetable pages | 2 (parallel) | None — can start day 1 |
| Phase 2 | Student portal + fees + videos | 3–5 | Phase 0 auth must be done |
| Phase 3 | Certificate system | 6–9 | Phase 0 + Supabase |
| Phase 4 | Design polish + SEO + PWA | 9–10 | Any time |
| Phase 5 | Revenue features | 11–13 | Phase 0 auth |
| Phase 6 | Growth features | Ongoing | All previous phases |

**Fastest path to parents using the site:** Phase 1 (3 days) → parents can view timetable
**Fastest path to revenue:** Phase 2 fees (after Phase 0 auth)
**Highest prestige feature:** Phase 3 certificates

---

## 📝 Environment Variables Required

```bash
# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only, never in client

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
JWT_SECRET=                      # for student PIN JWTs (separate from nextauth)

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=

# Google OAuth (Phase 6)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Analytics
NEXT_PUBLIC_GA_ID=

# App
NEXT_PUBLIC_APP_URL=https://skfkarate.com
```

---

*This document is the single source of truth for the SKF Karate website build. Update task statuses as work progresses. Every developer (human or AI) reading this file should be able to pick up any task and execute it without needing additional context — the decisions are locked, the reasoning is documented, the execution steps are explicit.*
