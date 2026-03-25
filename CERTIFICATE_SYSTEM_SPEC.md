# 🥋 Karate Certificate System — Full Build Specification
> For Claude Opus — Read this entirely before writing a single line of code.

---

## 📌 Project Context

This certificate system is an **integrated feature** of an existing **Karate Club / Dojo website** (referred to as "the project"). It is NOT a standalone app. Every component, page, and UI element built here must:

- **Reference and follow the existing `global.css`** and CSS variables already defined in the project
- **Match the visual language** of other existing sections, pages, and components in the project
- **Carry a strong Karate identity** — powerful, disciplined, honorable, energetic. Think bold typography, structured layouts, strong contrast, subtle martial arts motifs (belts, brushstrokes, crests, seals)
- Be **fully mobile responsive** — most parents and students access via phone
- Be **production-grade** — no placeholder UI, no generic design, everything polished

> Before building any UI, scan the project for:
> - `global.css` or equivalent global styles
> - Existing color variables (e.g., `--primary`, `--accent`, `--bg`, `--text`)
> - Existing font choices (headings, body)
> - Existing component patterns (cards, buttons, modals, forms, nav)
> - Existing page layouts and spacing rhythm
> Then build every new component to be indistinguishable from the rest of the project.

---

## 🗂️ System Overview

The certificate system has **3 major parts**:

```
1. ADMIN PANEL          → You (dojo owner/admin) manage everything here
2. ATHLETE PROFILE      → Public-facing student profile with achievements
3. CERTIFICATE ENGINE   → Generates, previews, and downloads certificates
```

All three are deeply connected through a shared database.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Database | Firebase Firestore (free tier) OR Supabase (free tier) |
| Auth (Admin only) | Firebase Auth / Supabase Auth — email+password for admin |
| Certificate Generation | Browser-side canvas rendering (HTML Canvas / html2canvas) |
| File Storage | Firebase Storage / Supabase Storage — for template images only |
| Email Notifications | EmailJS (free tier) OR Resend (free tier) |
| Hosting | Existing project hosting (Vercel / Netlify / existing server) |
| Frontend | Match existing project stack (React / Next.js / plain HTML — check project) |

> **Zero cost for users. Zero backend server needed. Everything runs free.**

---

## 🗄️ Database Schema

### Collection: `programs`
```
{
  id: "prog_001",
  name: "Summer Camp 2025",
  type: "camp",                         // "camp" | "belt_exam" | "training" | "tournament"
  hasBeltSubtypes: false,               // true only for belt_exam type
  isActive: true,
  createdAt: timestamp
}
```

### Collection: `templates`
```
{
  id: "tpl_001",
  programId: "prog_001",
  beltLevel: null,                      // null for non-belt programs
                                        // "white" | "yellow" | "orange" | "green" | "blue" | "brown" | "black"
  templateImageUrl: "https://...",      // uploaded background image URL
  fields: {                             // defines what text appears where on the certificate
    recipientName: { x: 50, y: 45, fontSize: 32, fontFamily: "...", color: "#000", align: "center" },
    courseName:    { x: 50, y: 55, fontSize: 18, fontFamily: "...", color: "#555", align: "center" },
    date:          { x: 30, y: 80, fontSize: 14, fontFamily: "...", color: "#333", align: "left" },
    issuerName:    { x: 70, y: 80, fontSize: 14, fontFamily: "...", color: "#333", align: "right" },
    skfId:         { x: 15, y: 92, fontSize: 10, fontFamily: "...", color: "#888", align: "left" },
    qrCode:        { x: 85, y: 85, size: 60 }   // optional — null if not used
  },
  useQrCode: false,                     // QR code is optional per template
  createdAt: timestamp,
  updatedAt: timestamp
}
```

> **Note:** All x/y values are percentages (0–100) relative to the certificate canvas dimensions. This ensures coordinates work correctly regardless of resolution.

### Collection: `students`
```
{
  id: "stu_001",
  skfId: "SKF-2025-4872",              // THE unique identifier — used for all lookups
  fullName: "Arjun Sharma",
  dateOfBirth: "2012-06-15",           // stored but NEVER shown publicly
  parentEmail: "parent@email.com",     // stored but NEVER shown publicly
  currentBeltLevel: "yellow",
  memberSince: "2023-01-10",
  photoConsent: true,                  // parent agreed during registration
  profilePhotoUrl: "https://...",      // shown only if photoConsent = true
  createdAt: timestamp
}
```

### Collection: `enrollments`
```
{
  id: "enr_001",
  skfId: "SKF-2025-4872",             // links to student
  programId: "prog_001",              // links to program
  beltLevel: "yellow",                // only relevant for belt_exam programs
  status: "completed",                // "enrolled" | "completed" | "revoked"
  completionDate: "2025-06-28",
  issuerName: "Sensei Ramesh",
  certificateUnlocked: true,          // admin flips this to true = certificate becomes downloadable
  notificationSent: false,            // tracks if email was sent
  enrolledAt: timestamp,
  updatedAt: timestamp
}
```

> **The `certificateUnlocked` field is the key security gate.** Certificate only generates if this is `true`.

### Collection: `certificate_views`
```
{
  id: "cv_001",
  skfId: "SKF-2025-4872",
  enrollmentId: "enr_001",
  viewedAt: timestamp,
  downloadedAt: timestamp | null,
  downloadFormat: "pdf" | "png" | null
}
```
> Used for admin analytics only.

---

## 👤 Part 1 — Public Athlete Profile

### Route
```
/athlete/[skfId]        e.g. /athlete/SKF-2025-4872
```
Or via the "Find Your Profile" search section on the homepage / dedicated search page.

### "Find Your Profile" Search
- Search input accepts **SKF ID** or **Full Name**
- Searching by name returns a results list (cards showing: Name + Belt Level + Member Since)
- Searching by SKF ID opens the profile directly
- If name returns multiple results, show disambiguation cards — never just show one person's private data based on name alone
- No login required for any of this

### Athlete Profile Page Layout

```
┌─────────────────────────────────────────────────────┐
│  [DOJO LOGO]                              [NAV MENU] │
├─────────────────────────────────────────────────────┤
│                                                      │
│   [PHOTO if consent given]  Arjun Sharma            │
│                             SKF ID: SKF-2025-4872   │
│                             🟡 Yellow Belt          │
│                             Member Since: Jan 2023  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  TABS:  Certifications  |  Tournaments  |  Overview  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  CERTIFICATIONS                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🎖️  Yellow Belt Exam     June 2025    [View]  │ │
│  │ 🎖️  Summer Camp 2025     Aug 2025    [View]  │ │
│  │ 🎖️  Orange Belt Exam     Dec 2024    [View]  │ │
│  │ ⚪  White Belt Exam      Mar 2023    (Past record — no digital cert) │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  TOURNAMENTS                                         │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🏆  State Championship   Mar 2025    [View]   │ │
│  │ 🥈  City Open            Nov 2024    [View]   │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Certificate View Modal
When [View] is clicked:
- A **full-screen modal / overlay** opens (no page navigation)
- Shows the certificate rendered on canvas — full preview
- Two download buttons: **[Download PDF]** and **[Download PNG]**
- A **[Share]** button — opens native share sheet on mobile, or copies a WhatsApp-friendly message on desktop:
  ```
  🥋 Check out my Karate Certificate!
  [Student Name] has earned [Program Name]
  View here: [profile URL]
  ```
- Close button (X) dismisses the modal
- Certificate renders at **high resolution** — minimum 2480 × 1754px (A4 landscape at 300dpi equivalent)

### Past Records (No Certificate)
- Show the event name, date, and a subtle label: `"Certificate not available for this record"`
- Do NOT show a [View] button for these
- Do NOT hide them — historical record transparency is good

### Privacy Rules for Public Profile
- ✅ Show: Full name, SKF ID, belt level, member since, photo (if consent given)
- ✅ Show: All certifications, tournament history, program completions
- ❌ Never show: Date of birth, parent email, phone number, address, payment info

---

## ⚙️ Part 2 — Certificate Engine

### How It Works
1. Admin marks enrollment as `certificateUnlocked: true`
2. System fetches the enrollment record → finds the linked program → finds the correct template
3. Template image is loaded onto an HTML Canvas
4. Text fields (name, date, SKF ID, issuer, etc.) are drawn on top of the canvas at the configured coordinates
5. QR code is optionally drawn (links to `/verify/[skfId]/[enrollmentId]`)
6. Canvas is exported as PNG or converted to PDF via jsPDF

### Template Resolution
All certificate templates should be:
- **Landscape orientation**
- Minimum **2480 × 1754 pixels** for print quality
- PNG format with transparent or white background

### Field Rendering Rules
- All x/y positions are **percentage-based** (0–100%) so they scale correctly
- Font size scales proportionally with canvas size
- Text alignment (left / center / right) is respected
- If a field value is empty, skip rendering that field silently

### Download Formats
**PNG:**
- Export canvas directly as `image/png`
- Full resolution, suitable for sharing digitally

**PDF:**
- Use jsPDF
- Single page, landscape A4
- Certificate canvas image embedded at full page size
- No margins — image fills the page
- Filename: `[StudentName]_[ProgramName]_Certificate.pdf`

### Certificate Verification Page
Route: `/verify/[skfId]/[enrollmentId]`

If QR code is enabled on a certificate, scanning it opens this page showing:
```
✅ Certificate Verified

Issued to:   Arjun Sharma
Program:     Yellow Belt Exam
Date:        June 28, 2025
Issued by:   Sensei Ramesh
SKF ID:      SKF-2025-4872

This certificate was issued by [Dojo Name]
and is verified as authentic.
```
If the SKF ID or enrollment ID is invalid → show a clear error: `❌ Certificate not found or invalid.`

---

## 🛠️ Part 3 — Admin Panel

### Route & Access
```
/admin                  → Login page (email + password)
/admin/dashboard        → Main dashboard
/admin/programs         → Manage programs & templates
/admin/students         → Student records
/admin/enrollments      → Manage enrollments & completions
/admin/analytics        → Usage analytics
```

Only one admin (dojo owner). Simple email + password auth. No public access.

---

### Admin Dashboard (`/admin/dashboard`)

Quick stats at a glance:
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Students│ │ Active Programs│ │Certs Issued  │ │Downloads MTD │
│    247        │ │      4        │ │    189        │ │     43       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```
Recent activity feed: last 10 certificate downloads, enrollments, completions.

---

### Programs & Templates (`/admin/programs`)

**Program List:**
- View all programs (name, type, student count, status)
- Add new program
- Archive old programs

**Per Program:**
- Edit program name, type
- Manage templates:
  - For `belt_exam` type: one template per belt level (white, yellow, orange, green, blue, brown, black)
  - For other types: single template
  - Upload/replace template image for each
  - Configure field positions (visual drag-and-drop coordinate editor OR manual x/y % input)
  - Toggle QR code on/off per template

**Template Field Editor:**
Show a preview of the uploaded template image. For each field (name, course, date, issuer, SKF ID, QR), allow admin to set:
- X position (%)
- Y position (%)
- Font size (px, scales with canvas)
- Font family (from a curated list of certificate-appropriate fonts)
- Color (hex picker)
- Alignment (left / center / right)

> This is how the admin controls exactly where each piece of text appears on the certificate — no code required after initial setup.

---

### Student Records (`/admin/students`)

- Full searchable, filterable table of all students
- Search by: SKF ID, name
- Filter by: belt level, member since year
- Per student actions: View Profile, Edit Details, View Enrollments
- Add new student (manual entry)
- Bulk import students via CSV upload

**CSV Import Format:**
```
skfId, fullName, dateOfBirth, parentEmail, currentBeltLevel, memberSince, photoConsent
SKF-2025-001, Arjun Sharma, 2012-06-15, parent@email.com, yellow, 2023-01-10, true
```

---

### Enrollments & Completion (`/admin/enrollments`)

This is the most used admin page.

**View:**
- Filter by program
- Filter by status (enrolled / completed / revoked)
- Search by SKF ID or name

**Actions per enrollment:**
- ✅ **Mark as Completed** — sets `status: completed` and `certificateUnlocked: true`
- 📧 **Send Email Notification** — triggers email to parent saying certificate is ready
- ✏️ **Edit Details** — fix name, belt level, date, issuer (mistakes happen)
- ❌ **Revoke Certificate** — sets `certificateUnlocked: false`, certificate becomes inaccessible immediately
- 👁️ **Preview Certificate** — admin can see how the certificate will look before unlocking

**Bulk Actions:**
- Select multiple enrollments (checkboxes)
- **Mark All Selected as Completed** — one click completes 50 students at once
- **Send Notifications to All Selected** — batch email send

---

### Error Correction Flow
If a mistake was made (wrong belt level, wrong name, wrong date):
1. Admin goes to the enrollment record
2. Clicks **Edit**
3. Changes the incorrect field
4. Saves — the updated data is stored in the database
5. Next time the student views or downloads their certificate, it renders with the corrected data
6. No file regeneration needed — certificate is always generated fresh from the latest data

---

### Analytics (`/admin/analytics`)

```
OVERVIEW
├── Total certificates unlocked this month
├── Total downloads this month (PDF vs PNG breakdown)
├── Most active program (by downloads)
└── Students who haven't downloaded yet (pending notification)

PROGRAM BREAKDOWN
├── Per-program: enrolled / completed / downloaded counts
└── Belt level distribution chart (for belt exam program)

ENGAGEMENT
├── Download rate: % of unlocked certificates that were downloaded
├── Average time between unlock and download
└── Certificates never downloaded (follow-up list)
```

---

## 📧 Notification System

### Email Notification (Free — EmailJS or Resend)
Triggered when admin marks a student as completed and clicks "Send Notification":

**Email Template:**
```
Subject: Your Certificate is Ready — [Program Name] 🥋

Dear [Parent Name],

Great news! [Student Name]'s certificate for [Program Name] is now
ready to view and download.

To access it:
1. Visit [website URL]
2. Go to "Find Your Profile"
3. Search for SKF ID: [SKF-2025-4872]
4. Click "View" next to [Program Name]

You can download it as PDF or PNG from there.

Congratulations to [Student Name]!

— [Dojo Name]
```

### WhatsApp Group Notification (Manual)
The admin receives a **pre-written WhatsApp message** they can copy and paste into their dojo WhatsApp group:

```
🥋 Certificates are ready!

Students who completed [Program Name] can now download
their digital certificate.

👉 Find your certificate:
1. Visit [website link]
2. Search your SKF ID in "Find Your Profile"
3. Click View → Download

Congratulations to all! 🏆
```

This message is auto-generated by the system and shown to the admin after bulk completion — they just copy and paste it into WhatsApp. No integration needed, no cost.

---

## 📱 Mobile Experience Requirements

This is critical — most users are on mobile phones.

**Athlete Profile (Mobile):**
- Stacked single-column layout
- Tab bar at the bottom or scrollable tabs at the top
- Certificate cards full-width with large [View] tap target
- Certificate modal is full-screen on mobile (not a floating box)

**Certificate Modal (Mobile):**
- Certificate preview is pinch-to-zoom capable
- Download buttons are large (minimum 48px height) and full-width
- Share button is prominent

**Certificate Generation (Mobile):**
- Canvas rendering must work on iOS Safari and Android Chrome
- PDF generation tested on both platforms
- Download triggers correctly on mobile browsers (handle iOS Safari blob download quirk)

**Search Page (Mobile):**
- Large search input
- Results display as clean stacked cards
- No horizontal scrolling anywhere

---

## 🎨 Design & Theme Requirements

> These are non-negotiable. The system must feel like it belongs to the karate website, not like an addon.

**Before writing any CSS or components:**
1. Open `global.css` (or equivalent) and read all CSS variables
2. Look at 2–3 existing pages/components for spacing, font, color usage
3. Use the SAME variables, SAME font stack, SAME button styles, SAME card styles

**Karate Brand Identity to carry through:**
- Strong, structured typography — not decorative, not generic
- Bold use of the primary brand color
- Subtle martial arts motifs where appropriate: belt-color accents per certificate type, dojo crest/seal visual on certificate templates, disciplined grid layouts
- Certificate cards should feel like **achievement badges** — not plain list items
- The View modal should feel like opening a physical certificate — consider a subtle reveal animation

**Belt Color Accents:**
When displaying an enrollment or certificate tied to a specific belt, use the belt's color as a subtle visual accent:
```
White  → #FFFFFF border / badge
Yellow → #FFD700 border / badge
Orange → #FF8C00 border / badge
Green  → #228B22 border / badge
Blue   → #1E3A8A border / badge
Brown  → #8B4513 border / badge
Black  → #1a1a1a border / badge
```

---

## 🔐 Security Considerations

- Admin panel is behind email + password auth — no public access
- Student data (DOB, email) is never exposed via any public API endpoint
- Certificate is only generated client-side after confirming `certificateUnlocked: true` from the database
- Firestore / Supabase security rules must enforce:
  - Public can only READ: student name, SKF ID, belt level, member since, photoConsent, enrollments (only completed ones)
  - Public can NEVER READ: DOB, parent email, admin fields
  - Only authenticated admin can WRITE any data

---

## 🚀 Build Order Recommendation

Build in this order to have a working system at each stage:

```
Phase 1 — Foundation
├── Database setup (Firestore or Supabase)
├── Security rules
└── Seed with 2–3 test students and 1 program

Phase 2 — Certificate Engine
├── Canvas renderer (load template image + draw text fields)
├── PNG export
├── PDF export
└── Test with dummy data

Phase 3 — Public Athlete Profile
├── /athlete/[skfId] route
├── "Find Your Profile" search
└── Certificate view modal with download + share

Phase 4 — Admin Panel
├── Auth (login page)
├── Student management
├── Program & template management (with field coordinate editor)
├── Enrollment management with bulk completion
└── Email notification trigger

Phase 5 — Polish
├── Analytics dashboard
├── Certificate verification page (/verify/...)
├── Mobile experience QA pass
├── Notification message generator (email + WhatsApp copy)
└── Final design consistency pass against global.css
```

---

## ✅ Feature Checklist for Opus

Use this to track what's been built:

**Certificate Engine**
- [ ] Canvas-based certificate rendering
- [ ] Template image as background
- [ ] Text fields at percentage-based coordinates
- [ ] Belt-level template auto-selection
- [ ] PNG download
- [ ] PDF download (landscape, full-bleed)
- [ ] QR code optional rendering
- [ ] High resolution output (min 2480 × 1754px)

**Public Athlete Profile**
- [ ] /athlete/[skfId] public route
- [ ] Find Your Profile search (by SKF ID or name)
- [ ] Search disambiguation for duplicate names
- [ ] Certifications tab with [View] button
- [ ] Tournaments tab with [View] button
- [ ] Past records shown without [View] button
- [ ] Certificate view modal (full-screen on mobile)
- [ ] Download PDF from modal
- [ ] Download PNG from modal
- [ ] Share button (WhatsApp message + copy link)
- [ ] Belt color accents per certificate card
- [ ] Privacy: DOB and email never shown

**Admin Panel**
- [ ] Login page (email + password)
- [ ] Dashboard with stats
- [ ] Student list with search + filter
- [ ] CSV bulk student import
- [ ] Program management (add / edit / archive)
- [ ] Template upload per program / belt level
- [ ] Field coordinate editor (visual or manual x/y %)
- [ ] QR code toggle per template
- [ ] Enrollment list with filters
- [ ] Mark individual enrollment as completed
- [ ] Bulk mark multiple enrollments as completed
- [ ] Send email notification (individual or bulk)
- [ ] Edit enrollment details (error correction)
- [ ] Revoke certificate
- [ ] Admin certificate preview
- [ ] WhatsApp message auto-generator
- [ ] Analytics page

**Mobile Experience**
- [ ] Athlete profile fully responsive
- [ ] Certificate modal full-screen on mobile
- [ ] Download works on iOS Safari
- [ ] Download works on Android Chrome
- [ ] Large tap targets everywhere
- [ ] No horizontal scroll

**Design Consistency**
- [ ] global.css variables used throughout
- [ ] Matches existing component patterns
- [ ] Belt color accents applied correctly
- [ ] Karate brand identity maintained
- [ ] Certificate cards feel like achievement badges
- [ ] View modal has certificate reveal animation

---

## 📝 Notes for Claude Opus

1. **Always check global.css first.** Never invent new color variables or font stacks. Use what exists.

2. **Certificate coordinate system uses percentages.** This ensures the certificate looks correct at any resolution — whether displayed at 300px preview width or exported at 2480px print width.

3. **Never store certificate files.** Certificates are always generated on the fly from database data. The only stored files are the template background images.

4. **The `certificateUnlocked` flag is the only gate.** If it's false, the certificate does not render — even if the enrollment status is "completed". Admin explicitly sets this after verification.

5. **SKF ID is the universal key.** Every lookup, every certificate, every profile is tied to the SKF ID. Treat it like a primary key across all collections.

6. **Email is free, WhatsApp is manual.** Don't try to integrate WhatsApp API (it costs money). Instead, auto-generate a copy-paste message for the admin to post in their group manually.

7. **Mobile is not secondary.** The primary use case is a parent on their phone downloading their child's certificate. Every interaction must be tested and optimised for mobile.

8. **Design must feel earned.** This is a karate school — achievement, discipline, pride. The certificate view should feel like a moment. Use subtle animation on the modal open. Use the belt colors. Make it feel special.
