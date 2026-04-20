# SKF Karate — Data Layer

> Single source of truth for all application data, types, schemas, constants, and relationship mappings.
> Covers three storage layers: **Supabase** (Postgres), **Local JSON** (.data/*.json), and **Google Sheets** (via API).

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    THREE STORAGE LAYERS                          │
├──────────────────┬──────────────────┬────────────────────────────┤
│ SUPABASE (Postgres)│ LOCAL JSON        │ GOOGLE SHEETS           │
│                  │ (.data/*.json)     │ (via googleapis)         │
├──────────────────┼──────────────────┼────────────────────────────┤
│ auth_sessions    │ athletes         │ Students (identity/auth)   │
│ programs         │ events           │ Fees (monthly tracking)    │
│ certificate_     │ tournaments      │ Videos (content library)   │
│   templates      │ instructors      │ Tournaments (results)      │
│ enrollments      │ dojos            │ Attendance                 │
│ certificate_     │ products         │ Announcements              │
│   events         │ testimonials     │ Techniques                 │
│ certificate_     │ gallery          │ Timetables                 │
│   views          │ kyuBelts         │ Sponsors                   │
│ video_progress   │ danGrades        │ Orders                     │
│ push_            │ beltExaminations │ Leads (write-only)         │
│   subscriptions  │                  │ Summer Camp                │
│ otp_attempts     │                  │                            │
│ student_points*  │                  │                            │
│ point_           │                  │                            │
│   transactions*  │                  │                            │
├──────────────────┴──────────────────┴────────────────────────────┤
│ * = MIGRATION NEEDED — used in code but not in SUPABASE_SCHEMA   │
└──────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
data/
├── types/               ← SINGLE SOURCE OF TRUTH for TypeScript interfaces
│   └── index.ts         All entity interfaces, enums, and type aliases
├── schema/              ← Entity schemas & relationship map
│   ├── types.ts         SchemaField, RelationshipDef, EntitySchema
│   ├── _relationships.ts Master relationship map (ALL storage layers)
│   ├── sheetsSync.ts    Google Sheets column mapping + data flow docs
│   ├── authSession.ts   Supabase: auth_sessions
│   ├── program.ts       Supabase: programs
│   ├── certificateTemplate.ts  Supabase: certificate_templates
│   ├── enrollment.ts    Supabase: enrollments
│   ├── certificateEvent.ts     Supabase: certificate_events
│   ├── certificateView.ts      Supabase: certificate_views
│   ├── videoProgress.ts Supabase: video_progress
│   ├── pushAndOtp.ts    Supabase: push_subscriptions + otp_attempts
│   ├── points.ts        Supabase: student_points + point_transactions
│   ├── athlete.ts       Local: athletes
│   ├── dojo.ts          Local: dojos
│   ├── instructor.ts    Local: instructors
│   ├── event.ts         Local: events
│   ├── tournament.ts    Local: tournaments
│   ├── localEntities.ts Local: product, testimonial, gallery, kyu, dan, belt exam
│   ├── sheetsEntities.ts Sheets: student, fee, video, announcement, order, sponsor, etc.
│   ├── portalSession.ts JWT cookie shape (not a DB table)
│   └── index.ts         Barrel + allSchemas aggregate
├── constants/
│   ├── belts.ts         Belt levels, hex colors, Tailwind
│   ├── categories.ts    Event types, gallery cats, product cats, achievements, tournament levels
│   ├── contact.ts       Phone, email, address, WhatsApp, social
│   ├── homeContent.ts   Hero copy, CTA features
│   ├── navigation.ts    Navbar, footer, admin sidebar, portal nav
│   ├── points.ts        Point rules, tiers, thresholds, redemption, legacy calculations
│   ├── roles.ts         User roles
│   ├── routes.ts        Route path constants
│   ├── siteConfig.ts    Org identity, JSON-LD
│   └── statuses.ts      ALL status enums across ALL entities
├── seed/                ← Baseline records (local JSON store)
├── factories/           ← Entity creation functions
├── mocks/               ← Mock API response wrappers
├── scripts/
│   └── seed.ts          Validation script
├── index.ts             ← Top-level barrel export
└── README.md            ← You are here
```

## Entity-Relationship Diagram

```
╔═════════════════════════════════════════════════════════════════════════╗
║                   SKF KARATE — FULL ENTITY MAP                          ║
╚═════════════════════════════════════════════════════════════════════════╝

 ┌──────────────┐    registrationNumber = skfId    ┌───────────────┐
 │   ATHLETE    │◄────────── SAME PERSON ─────────►│   STUDENT     │
 │ (.data/json) │                                  │ (Sheets)      │
 └──────┬───────┘                                  └───────┬───────┘
        │ branchName                                       │ phone
        ▼                                                  ▼
 ┌──────────────┐    senseiId    ┌──────────────┐  ┌──────────────┐
 │     DOJO     │◄───────────────│  INSTRUCTOR  │  │  CHILDREN    │
 │  (seed/json) │                │  (seed/json) │  │ (same phone) │
 └──────┬───────┘                └──────────────┘  └──────────────┘
        │
        ├── hostingBranch ──► EVENT (seed/json)
        ├── branch ─────────► TESTIMONIAL (seed/json)
        └── branch ─────────► ANNOUNCEMENT (Sheets)

 ┌──────────────┐   program_id   ┌──────────────┐  enrollment_id
 │   PROGRAM    │◄───────────────│  ENROLLMENT  │◄──────────────┐
 │  (Supabase)  │                │  (Supabase)  │               │
 └──────┬───────┘                └──────┬───────┘               │
        │ program_id                    │ skf_id           ┌────┴───────┐
        ▼                               ▼                  │ CERT_EVENT │
 ┌──────────────┐               ┌──────────────┐           │ CERT_VIEW  │
 │  TEMPLATE    │               │   STUDENT    │           │ (Supabase) │
 │  (Supabase)  │               │  (Sheets)    │           └────────────┘
 └──────────────┘               └──────────────┘

 ┌──────────────┐               ┌──────────────┐
 │ STUDENT_PTS  │◄── skf_id ──►│ POINT_TRANS  │
 │  (Supabase)  │               │  (Supabase)  │
 └──────────────┘               └──────────────┘

 ┌──────────────┐  skf_id+video_id  ┌──────────────┐
 │VIDEO_PROGRESS│◄─────────────────►│  VIDEO_ROW   │
 │  (Supabase)  │                   │  (Sheets)    │
 └──────────────┘                   └──────────────┘

 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │  TOURNAMENT  │   │   PRODUCT    │   │    ORDER     │
 │ (.data/json) │   │  (seed/json) │   │  (Sheets)    │
 └──────────────┘   └──────────────┘   └──────────────┘

 Standalone: GALLERY, KYU_BELT, DAN_GRADE, BELT_EXAM,
             SPONSOR, TECHNIQUE, TIMETABLE, LEAD, SUMMER_CAMP
```

## Foreign Keys

| Field | Entity | References | Storage |
|-------|--------|------------|---------|
| `dojos.senseiId` | Dojo | `instructors.id` | local → local |
| `instructors.dojoSlug` | Instructor | `dojos.id` | local → local |
| `events.hostingBranch` | Event | `dojos.id` | local → local |
| `testimonials.branch` | Testimonial | `dojos.id` | local → local |
| `athletes.branchName` | Athlete | `dojos.name` | local → local |
| `beltExams.athleteId` | BeltExam | `athletes.id` | local → local |
| `certificate_templates.program_id` | Template | `programs.id` | supabase |
| `enrollments.program_id` | Enrollment | `programs.id` | supabase |
| `enrollments.skf_id` | Enrollment | `students.skfId` | supabase → sheets |
| `certificate_events.enrollment_id` | CertEvent | `enrollments.id` | supabase |
| `certificate_views.enrollment_id` | CertView | `enrollments.id` | supabase |
| `video_progress.skf_id` | VidProgress | `students.skfId` | supabase → sheets |
| `auth_sessions.skf_id` | AuthSession | `students.skfId` | supabase → sheets |
| `student_points.skf_id` | Points | `students.skfId` | supabase → sheets |
| `point_transactions.skf_id` | PointTx | `students.skfId` | supabase → sheets |
| `athletes.registrationNumber` | Athlete | `students.skfId` | local → sheets |

## Portal Auth Flow

```
Login:  POST /api/auth/portal  →  { skfId, dob (DD/MM/YYYY) }
                                      │
                               athlete = getAthleteByRegistrationNumber(skfId)
                               if athlete.dateOfBirth === normalizedDob → JWT cookie
                                      │
                               Session: { skfId, role, branch, belt, name }
                                      │
Multi-child: getStudentsByPhone(phone) → ChildSwitcher component
```

## Points System

Two parallel systems:
1. **Supabase** (`lib/points/pointsService.ts`) — production award/redeem via `student_points` + `point_transactions`
2. **Legacy** (`lib/utils/points.ts`) — local calculation engine for ranking points with time decay

Constants: `/data/constants/points.ts`

## Certificate Lifecycle

```
Program → Template → Enrollment → (admin marks complete) → Certificate unlocked
                                                              │
                                                    Student views at /verify/[skfId]/[enrollmentId]
                                                              │
                                                    certificate_events + certificate_views logged
```

## Google Sheets Sync

Full column mappings in `/data/schema/sheetsSync.ts`.

| Tab | Direction | Key Fields |
|-----|-----------|------------|
| Students | Read/Write | skfId, name, branch, batch, belt, phone |
| Fees | Read/Write | skfId, month, status |
| Videos | Read only | videoId, youtubeUrl (server-only) |
| Tournaments | Read only | skfId, medal, points |
| Attendance | Read/Write | skfId, date, status |
| Announcements | Read only | slug, branch, expiryDate |
| Techniques | Read only | videoId, category, beltLevel |
| Sponsors | Read only | name, tier, active |
| Orders | Read/Write | orderId, skfId, status |
| Leads | Write only | contact form data |

## Supabase Tables Needing Migration

| Table | Used By | Status |
|-------|---------|--------|
| `student_points` | `lib/points/pointsService.ts` | ❌ Not in SUPABASE_SCHEMA.sql |
| `point_transactions` | `lib/points/pointsService.ts` | ❌ Not in SUPABASE_SCHEMA.sql |

## Usage

```ts
// Types
import type { Athlete, Student, Enrollment } from '@/data/types'

// Constants
import { POINT_RULES, TIER_THRESHOLDS, BELTS } from '@/data'

// Schemas
import { allSchemas, supabaseSchemas, relationships } from '@/data'

// Seed data
import { instructors, dojos, events } from '@/data'

// Factories
import { createAthlete, createEvent } from '@/data'
```

## Validation

```bash
npx tsx data/scripts/seed.ts
```
