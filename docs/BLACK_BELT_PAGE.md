# Black Belt Page — Full Context

> Route: `/portal/blackbelt` — private, auth-protected section of the Athlete Portal.
> This document captures the complete context of the page: purpose, architecture,
> every source file, the database schema, data flow, security model, and how to
> assign candidates.

---

## 1. What this page is

The **Black Belt page** is the private portal page for students selected as
candidates for the SKF Black Belt Examination Program. It shows each candidate:

- An **overall progress ring** (XP-style percentage across all tasks).
- A **5-level Journey** (June → October), each level with a list of quests/tasks
  (First Aid, WKF rules reading, fitness tests, self-defense check-ins, weapon,
  bunkai, mock exams).
- **Continuous goals** (training videos, enrolling 1 new student, gold medals in
  Kata and Kumite).
- A **Requirements** tab (gate requirements, video log tracker, program rulebook).
- An **Examination** tab (scoring matrix, WKF documents, mandatory Kata syllabus).
- A **Teaching Hours** tracker and a **Mentees** contact card (phone-to-call).

It is **only visible to assigned candidates** — nobody else can see the nav link,
open the page, or read the underlying data.

---

## 2. Folder / file map

| File | Type | Purpose |
|------|------|---------|
| `app/portal/blackbelt/page.tsx` | Server Component | Route + auth guard + data fetch |
| `app/portal/blackbelt/BlackBeltClient.tsx` | Client Component | All page UI (journey / requirements / examination tabs) |
| `app/portal/blackbelt/loading.tsx` | Client Component | Skeleton loading state |
| `app/portal/blackbelt/actions.ts` | Server Actions | `submitBBEnrollmentPayment` (deposit proof → Telegram) |
| `app/portal/blackbelt/blackbelt.css` | CSS | Page styles |
| `lib/server/repositories/blackbelt-live.ts` | Server | All data-access functions & types |
| `data/constants/blackbelt.ts` | Constants | SKF-ID normalizer for candidates |
| `database/migrations/018_blackbelt_program.sql` | SQL | Creates `bb_programs`, `bb_candidates`, `bb_progress_entries` + RLS |
| `app/_components/portal/AthleteHubNav.tsx` | Client | Portal dock; shows the Black Belt nav link only for candidates |
| `app/portal/layout.js` | Server | Computes `isBlackBeltCandidate` and passes it to the nav |
| `app/api/auth/portal/session/route.ts` | API | Session endpoint (also returns `isBlackBeltCandidate`) |

---

## 3. Access-control summary (who can see what)

**Rule:** A logged-in athlete sees the page **iff** their SKF ID has an enrollment
row in the `bb_candidates` table (regardless of program status).

| Layer | Mechanism | Non-candidate outcome |
|-------|-----------|----------------------|
| Nav link | `app/portal/layout.js` → `isBBCandidate()` (server, DB-backed) → `AthleteHubNav` filters `/portal/blackbelt` | Link hidden |
| Route | `page.tsx` → `getBBCandidateBySkfIdAcrossPrograms()` first, redirect on failure | Redirected to `/portal/dashboard` |
| Data | `getBBProgramForPortal()` is strictly candidate-scoped; no active-program fallback | Returns `null`, no data served |
| Database | RLS enabled on all `bb_*` tables, service-role-only policies | Anon key returns 0 rows |

There is **no hardcoded SKF-ID allowlist anymore** — the database is the single
source of truth. Assigning a candidate = inserting a row into `bb_candidates`.

---

## 4. Route guard (`app/portal/blackbelt/page.tsx`)

```tsx
import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getBBProgramForPortal, getBBCandidateBySkfIdAcrossPrograms } from '@/lib/server/repositories/blackbelt-live'
import { normaliseSkfId } from '@/lib/utils/registration'
import { redirect } from 'next/navigation'
import BlackBeltClient from './BlackBeltClient'


export default async function BlackBeltPage() {
  const { athlete } = await requirePortalAthlete({ callbackUrl: '/portal/blackbelt' })

  const normalizedAthleteId = normaliseSkfId(athlete.skfId)

  // Only assigned Black Belt candidates may ever access this page. Verify the
  // enrollment row FIRST so no program data is ever fetched for non-candidates.
  const candidateRecord = await getBBCandidateBySkfIdAcrossPrograms(normalizedAthleteId)
  if (!candidateRecord) {
    redirect('/portal/dashboard')
  }

  const data = await getBBProgramForPortal(candidateRecord.skf_id)
  if (!data?.program) {
    redirect('/portal/dashboard')
  }

  return (
    <BlackBeltClient
      program={data.program}
      candidates={data.candidates}
      progressMap={data.progressMap}
      currentSkfId={candidateRecord.skf_id}
      renderedAt={new Date().toISOString()}
    />
  )
}
```

Flow:
1. `requirePortalAthlete()` — verifies the HttpOnly portal-session cookie.
2. Candidate row lookup happens **before** any program query.
3. Only on success is `getBBProgramForPortal()` called.
4. The normalized canonical SKF ID is passed to the client.

---

## 5. Portal nav wiring

### 5.1 `app/portal/layout.js`

```js
import './portal.css'
import AthleteHubNav from '@/app/_components/portal/AthleteHubNav'
import { buildNoIndexMetadata } from '@/data/constants/seo'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { isBBCandidate } from '@/lib/server/repositories/blackbelt-live'

export const metadata = buildNoIndexMetadata(
  '/portal',
  'Access your SKF Karate athlete profile, home practice videos, certificates, rankings, timetable, and fees through the private athlete portal.'
)

export default async function PortalLayout({ children }) {
  let portal = null
  let isBlackBeltCandidate = false

  try {
    portal = await getPortalAthleteFromCookies()
    isBlackBeltCandidate = await isBBCandidate(portal?.session?.skfId)
  } catch {
    isBlackBeltCandidate = false      // fail-closed
  }

  return (
    <div className="hub-layout">
      <AthleteHubNav
        isBlackBeltCandidate={isBlackBeltCandidate}
        currentSession={portal?.session}
        currentAthlete={portal?.athlete}
      />
      <main className="hub-main">
        {children}
      </main>
    </div>
  )
}
```

### 5.2 `app/_components/portal/AthleteHubNav.tsx` (relevant part)

```tsx
// Filter links: only show the Black Belt link to assigned Black Belt candidates.
const visibleNavLinks = navLinks.filter(link => {
  if (link.href === '/portal/blackbelt') {
    return isBlackBeltCandidate
  }
  return true
})
```

### 5.3 `data/constants/navigation.ts` (portal nav item)

```ts
export const PORTAL_NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Identity', iconName: 'UserCircle' },
  { href: '/portal/journey', label: 'Journey', iconName: 'Map' },
  { href: '/portal/credits', label: 'Credits', iconName: 'Award' },
  { href: '/portal/fees', label: 'Fees', iconName: 'CreditCard' },
  { href: '/portal/events', label: 'Events', iconName: 'Flag' },
  { href: '/portal/videos', label: 'Home Practice', iconName: 'PlayCircle' },
  { href: '/portal/timetable', label: 'Timetable', iconName: 'Calendar' },
  { href: '/portal/blackbelt', label: 'Black Belt', iconName: 'Trophy' },
] as const
```

---

## 6. Data layer (`lib/server/repositories/blackbelt-live.ts`)

All reads go through `supabaseAdmin` (service-role). Types exported here are
consumed by the client component.

### 6.1 Constants module (`data/constants/blackbelt.ts`)

```ts
import { normaliseSkfId } from '@/lib/utils/registration'

export function normaliseBlackBeltCandidateId(skfId?: string | null) {
  return normaliseSkfId(String(skfId || ''))
}
```

### 6.2 Repository — types

```ts
export interface BBProgram {
  id: string
  title: string
  slug: string
  tagline: string
  exam_date: string | null
  program_start: string | null
  program_end: string | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  exam_components: ExamComponent[]
  wkf_documents: WKFDocument[]
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ExamComponent {
  id: string
  name: string
  weight: number
  description: string
}

export interface WKFDocument {
  id: string
  title: string
  url: string
  description: string
}

export interface BBCandidate {
  id: string
  program_id: string
  skf_id: string
  display_name: string
  display_code: string | null
  photo_url: string | null
  weapon_group: 'bo_staff' | 'nunchaku'
  bunkai_group: 'group_a' | 'group_b'
  self_defense_day: 'tuesday' | 'friday' | 'saturday'

  first_aid_status: 'not_started' | 'in_progress' | 'completed'
  first_aid_cert_date: string | null

  marketing_status: 'in_progress' | 'enrolled'
  enrolled_student_name: string | null
  enrolled_student_date: string | null

  enrollment_fee_status: 'pending' | 'verifying' | 'paid'

  tournament_kata_status: 'not_won' | 'won'
  tournament_kata_event: string | null
  tournament_kata_date: string | null
  tournament_kumite_status: 'not_won' | 'won'
  tournament_kumite_event: string | null
  tournament_kumite_date: string | null

  fitness_baseline_done: boolean
  fitness_baseline_data: FitnessData
  fitness_retest_done: boolean
  fitness_retest_data: FitnessData
  fitness_months?: {
    month_1?: FitnessData
    month_2?: FitnessData
    month_3?: FitnessData
    month_4?: FitnessData
    month_5?: FitnessData
  }
  fitness_improved: boolean | null

  wkf_kumite_status: 'not_started' | 'reading' | 'quiz_passed'
  wkf_kata_status: 'not_started' | 'reading' | 'quiz_passed'
  wkf_referee_status: 'not_started' | 'in_progress' | 'reviewed'

  weapon_status: 'not_started' | 'in_progress' | 'exam_ready'
  bunkai_status: 'not_done' | 'internal_demo' | 'taught_to_kids'

  self_defense_months: Record<string, boolean>

  video_count: number
  video_target: number

  teaching_status: 'active' | 'ongoing' | 'flagged'
  teaching_hours: number
  mock_exam_done: boolean

  readiness: 'on_track' | 'attention_needed' | 'exam_ready'

  exam_score: number | null
  exam_result: 'pass' | 'conditional' | 'defer' | null
  exam_component_scores: Record<string, number>

  instructor_notes: string

  sort_order: number
  created_at: string
  updated_at: string
}

export interface FitnessData {
  pushups?: number
  pullups?: number
  situps?: number
  run_time?: string
  leg_split?: number
}

export interface BBProgressEntry {
  id: string
  candidate_id: string
  entry_type: string
  title: string
  description: string
  month_number: number | null
  entry_date: string
  metadata: Record<string, unknown>
  is_private: boolean
  created_at: string
}
```

### 6.3 Repository — functions (current implementation)

```ts
import { supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'
import { normaliseBlackBeltCandidateId } from '@/data/constants/blackbelt'

function dedupeCandidates(candidates: BBCandidate[]) {
  const bySkfId = new Map<string, BBCandidate>()

  for (const candidate of candidates) {
    const normalized = normaliseBlackBeltCandidateId(candidate.skf_id)

    const nextCandidate = { ...candidate, skf_id: normalized }
    const existing = bySkfId.get(normalized)
    if (!existing || Number(nextCandidate.sort_order || 0) < Number(existing.sort_order || 0)) {
      bySkfId.set(normalized, nextCandidate)
    }
  }

  return [...bySkfId.values()].sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
}
```

**`getActiveBBProgram()`** — returns the single `bb_programs` row with
`status = 'active'` (used by the server-side fee service, not the portal page).

**`getBBProgramById(programId)`** — returns a program regardless of status.

**`getAllBBCandidates(programId)`** — returns all candidates of a program
(deduplicated + normalized SKF IDs), ordered by `sort_order`.

**`getAllBBCandidatesAcrossPrograms()`** — returns every candidate row across all
programs (used by the staff FeetTrack integration and as a fallback matcher).

**`getBBCandidateBySkfId(programId, skfId)`** — candidate within a specific program.

**`getBBCandidateBySkfIdAcrossPrograms(skfId)`** — the access key. Normalizes the
requested SKF ID, queries `bb_candidates` directly; if not found by exact match,
falls back to scanning all candidates and comparing normalized IDs. Returns the
candidate row with the canonical normalized `skf_id`. **Portal access is tied to
this enrollment row, not to program status.**

```ts
export async function getBBCandidateBySkfIdAcrossPrograms(
  skfId?: string | null
): Promise<BBCandidate | null> {
  const raw = String(skfId || '').trim()
  if (!raw) return null

  const normalizedAthleteId = normaliseBlackBeltCandidateId(raw)

  const { data, error } = await supabaseAdmin
    .from('bb_candidates')
    .select('*')
    .eq('skf_id', normalizedAthleteId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    logger.error('blackbelt_live.candidate_by_skf_id_any_program_failed', {
      skfId: normalizedAthleteId,
      error,
    })
    return null
  }

  if (data?.[0]) return { ...(data[0] as BBCandidate), skf_id: normalizedAthleteId }

  // Fallback: normalize stored candidate IDs before comparison.
  const allCandidates = await getAllBBCandidatesAcrossPrograms()
  return (
    dedupeCandidates(allCandidates).find((candidate) => normaliseBlackBeltCandidateId(candidate.skf_id) === normalizedAthleteId) ||
    null
  )
}
```

**`getBBProgramForCandidate(skfId)`** — the program containing an assigned
candidate (via their enrollment row).

**`isBBCandidate(skfId)`** — boolean used by `layout.js` (nav) and the session API.

```ts
export async function isBBCandidate(skfId?: string | null): Promise<boolean> {
  return Boolean(await getBBCandidateBySkfIdAcrossPrograms(skfId))
}

export const isActiveBBCandidate = isBBCandidate
```

**`getBBCandidateProgress(candidateId, includePrivate)`** — progress timeline
entries; the portal passes `includePrivate = false`.

**`getBBProgramForPortal(skfId)`** — the single data bundle for the page. Strictly
candidate-scoped with **no** fallback to the active program.

```ts
export async function getBBProgramForPortal(skfId?: string | null) {
  const candidate = skfId ? await getBBCandidateBySkfIdAcrossPrograms(skfId) : null
  if (!candidate?.program_id) return null

  const program = await getBBProgramById(candidate.program_id)
  if (!program) return null

  const candidates = await getAllBBCandidates(program.id)

  // Fetch public progress for all candidates in parallel
  const progressMap: Record<string, BBProgressEntry[]> = {}
  await Promise.all(
    candidates.map(async (c) => {
      progressMap[c.id] = await getBBCandidateProgress(c.id, false)
    })
  )

  return {
    program,
    candidates,
    progressMap,
  }
}
```

**`updateBBCandidateAdmin(candidateId, updates)`** — admin-only update helper.

---

## 7. Server action (`app/portal/blackbelt/actions.ts`)

`submitBBEnrollmentPayment(formData)` — used by the client page (fee flow) to
submit a ₹2,000 deposit screenshot:

1. Reads the logged-in session; normalizes SKF ID.
2. Looks up the candidate via `getBBCandidateBySkfIdAcrossPrograms` — **rejects
   non-candidates** (`'Candidate not enrolled in this program.'`).
3. Loads the program and validates the image (type + ≤ 5 MB).
4. Sets `enrollment_fee_status = 'verifying'` on the candidate row.
5. Sends the screenshot + caption to the Telegram `fees` channel.
6. Calls `revalidatePath('/portal/blackbelt')`.

```ts
'use server'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import {
  getBBCandidateBySkfIdAcrossPrograms,
  getBBProgramById,
} from '@/lib/server/repositories/blackbelt-live'
import { supabaseAdmin } from '@/lib/server/supabase'
import { normaliseSkfId } from '@/lib/utils/registration'
import { sendTelegramMessage, sendTelegramPhoto } from '@/src/server/services/telegram.service'
import { AppError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { success: false; message: string }

const MAX_PROOF_BYTES = 5 * 1024 * 1024

export async function submitBBEnrollmentPayment(formData: FormData): Promise<ActionResult> {
  try {
    const portal = await getPortalAthleteFromCookies()

    if (!portal?.session?.skfId) {
      return { success: false, message: 'Please log in again.' }
    }

    const skfId = normaliseSkfId(portal.session.skfId)

    const candidate = await getBBCandidateBySkfIdAcrossPrograms(skfId)
    if (!candidate) {
      return { success: false, message: 'Candidate not enrolled in this program.' }
    }

    const program = await getBBProgramById(candidate.program_id)
    if (!program) {
      return { success: false, message: 'Black Belt program not found.' }
    }

    const screenshot = formData.get('screenshot') as File | null
    if (!screenshot || screenshot.size === 0) {
      return { success: false, message: 'Payment screenshot is required.' }
    }
    if (!String(screenshot.type || '').startsWith('image/')) {
      return { success: false, message: 'Please upload an image file.' }
    }
    if (screenshot.size > MAX_PROOF_BYTES) {
      return { success: false, message: 'Payment screenshot must be 5 MB or smaller.' }
    }

    const arrayBuffer = await screenshot.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: updateErr } = await supabaseAdmin
      .from('bb_candidates')
      .update({ enrollment_fee_status: 'verifying' })
      .eq('id', candidate.id)

    if (updateErr) {
      return { success: false, message: 'Failed to update payment status in database.' }
    }

    const text = [
      '📋 *Black Belt Program Deposit Submitted*',
      '',
      `*Student:* ${candidate.display_name || portal.session.name} (${skfId})`,
      `*Amount:* ₹2,000`,
      `*Submitted:* ${new Date().toLocaleString('en-IN')}`,
    ].filter(Boolean).join('\n')

    try {
      const blob = new Blob([new Uint8Array(buffer)], { type: screenshot.type || 'image/png' })
      await sendTelegramPhoto({
        channel: 'fees',
        photo: blob,
        filename: screenshot.name || 'proof.png',
        caption: text,
        parseMode: 'Markdown',
        timeoutMs: 15000,
      })
    } catch {
      try {
        await sendTelegramMessage({
          channel: 'fees',
          text: text + '\n⚠️ (Image upload failed, screenshot not attached)',
          parseMode: 'Markdown',
          timeoutMs: 5000,
        })
      } catch {
        // Ignore notification failures to avoid blocking user flow
      }
    }

    revalidatePath('/portal/blackbelt')
    return { success: true }
  } catch (error) {
    logger.warn('portal.bb_payment_failed', { error })
    return {
      success: false,
      message: error instanceof AppError && error.expose ? error.message : 'Could not submit payment proof. Please try again.',
    }
  }
}
```

---

## 8. Client component (`app/portal/blackbelt/BlackBeltClient.tsx`)

A `'use client'` component that renders all page UI from server-passed props.
It makes **no** direct Supabase or network calls — it only renders `program`,
`candidates`, `currentSkfId`, and `renderedAt`.

Key structures defined inside the component file:

### 8.1 Static links

```ts
const FIRST_AID_LINK = 'https://alison.com/course/first-aid-for-martial-arts'
const KUMITE_PDF = 'https://www.wkf.net/files/pdf/documents/WKF%202026%20Kumite%20Competition%20Rules%20MASTER%20COPY_V11.pdf'
const KATA_PDF = 'https://www.wkf.net/files/pdf/documents/WKF%20Kata%20Competition%20Rules%202026%20MASTER%20COPY_V2.pdf'
```

### 8.2 Per-candidate Google Drive upload folders

```ts
const DRIVE_MAP: Record<string, string> = {
  'SKF13BL000': 'https://drive.google.com/drive/folders/1GGfoE3SOgFsD6wICnp2ztnKHUlEgzjmo?usp=sharing', // SHRI ROSHAN P
  'SKF20HE001': 'https://drive.google.com/drive/folders/1txctxGMEgZxv7zQejhW6s-xN9LpwW1Wz?usp=sharing', // SANJANA S
  'SKF20HE002': 'https://drive.google.com/drive/folders/1M9zhju2AwPaLbxzhhXB3beSRwFkyzxiB?usp=sharing', // TEJASHREE S
  'SKF20HE003': 'https://drive.google.com/drive/folders/1aDsAd4ULgD4DLA5NhlqndLstdumseaDv?usp=sharing', // AYUSH KASHYAP G
  'SKF21HE001': 'https://drive.google.com/drive/folders/1FyLxjvGtJ8JKTxIl57vnjHTKifriRda1?usp=sharing', // ISHAAN GOWDA B S
  'SKF21HE003': 'https://drive.google.com/drive/folders/1kHHbgIDixJfbHbPHAJJVUQV1zuzuKN0G?usp=sharing', // SHASHANK
}
```

### 8.3 Program rulebook (10 directives shown on the Requirements tab)

```ts
const RULEBOOK = [
  'Complete a First Aid certification course and submit the certificate.',
  'Read the WKF Kumite and Kata competition rules and pass the oral quiz.',
  'Focus 1 full month on Weapon Training and teach it to Juniors.',
  'Focus 1 full month on Bunkai mechanics and teach it to Juniors.',
  'Achieve one gold medal in Kumite and one in Kata over the 5 months.',
  'Complete baseline fitness test and show improvement in the retest.',
  'Record and submit 16 training videos throughout the program.',
  'Complete 16 hours of teaching assistance in junior classes.',
  'Enroll at least 1 new student into SKF Karate (marketing).',
  'Attend weekly self-defense check-ins with your Sensei.',
  'Complete mock examinations in Month 2 and Month 4 before the final exam.',
]
```

### 8.4 Examination scoring matrix

```ts
const EXAM_COMPONENTS = [
  { id: 'kihon', name: 'Kihon (Basics Under Fatigue)', weight: 10 },
  { id: 'kata', name: 'Competition Kata', weight: 15 },
  { id: 'bunkai', name: 'Bunkai Group Demo', weight: 10 },
  { id: 'weapon', name: 'Weapon Demonstration', weight: 12 },
  { id: 'kumite', name: 'Kumite (3 Rounds)', weight: 18 },
  { id: 'wkf', name: 'WKF Rules Oral Exam', weight: 10 },
  { id: 'teaching', name: 'Teaching Demonstration', weight: 15 },
  { id: 'selfdef', name: 'Self-Defense Display', weight: 10 },
]
```

Pass criteria: **70% overall**, minimum **50% per component**, **3 gates required**.

### 8.5 The 5-month journey levels

| Level | Month | Theme | Focus |
|-------|-------|-------|-------|
| 1 | June | Foundation | Build habits. Start the machine. |
| 2 | July | Weapon Mastery | Weapon training goes live. Teach the basics. |
| 3 | August | Bunkai Depth | Intellectual depth. Demonstrate understanding of mechanics. |
| 4 | September | Consolidation | Refine. Complete. Second Mock Exam. |
| 5 | October | Examination | Prove it. All of it. OSU! 🥋 |

A month is marked **done only when every task in it is `done`** — not by time
passing. The current level is computed from `program_start` relative to the
server-rendered date.

### 8.6 Continuous goals

```ts
const CONTINUOUS_GOALS: (c: BBCandidate) => Task[] = (c) => [
  { key: 'cg_vid', label: `Training Videos: ${c.video_count}/${c.video_target}`, ... status: done when count >= target },
  { key: 'cg_mkt', label: 'Enroll 1 New Student', ... status: done when marketing_status === 'enrolled' },
  { key: 'cg_kg', label: 'Kata Gold Medal 🏆', ... status: done when tournament_kata_status === 'won' },
  { key: 'cg_kug', label: 'Kumite Gold Medal 🏆', ... status: done when tournament_kumite_status === 'won' },
]
```

### 8.7 Rendering states

1. `!program` → "No Active Program" empty state.
2. `program && !me` → "Not Enrolled" empty state (only selected candidates can
   view this program) — shown behind the authenticated route guard.
3. Otherwise → full page with three tabs: **Journey**, **Requirements**,
   **Examination**.

---

## 9. Database schema (`database/migrations/018_blackbelt_program.sql`)

### `bb_programs`

```sql
CREATE TABLE IF NOT EXISTS bb_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT DEFAULT '',
  exam_date DATE,
  program_start DATE,
  program_end DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  exam_components JSONB DEFAULT '[]',
  wkf_documents JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bb_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_bb_programs" ON bb_programs
  FOR ALL USING (auth.role() = 'service_role');
```

### `bb_candidates`

```sql
CREATE TABLE IF NOT EXISTS bb_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES bb_programs(id) ON DELETE CASCADE,
  skf_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_code TEXT,
  photo_url TEXT,
  weapon_group TEXT NOT NULL CHECK (weapon_group IN ('bo_staff', 'nunchaku')),
  bunkai_group TEXT NOT NULL CHECK (bunkai_group IN ('group_a', 'group_b')),
  self_defense_day TEXT NOT NULL CHECK (self_defense_day IN ('tuesday', 'friday', 'saturday')),

  -- Gate statuses
  first_aid_status TEXT DEFAULT 'not_started' CHECK (first_aid_status IN ('not_started', 'in_progress', 'completed')),
  first_aid_cert_date DATE,

  marketing_status TEXT DEFAULT 'in_progress' CHECK (marketing_status IN ('in_progress', 'enrolled')),
  enrolled_student_name TEXT,
  enrolled_student_date DATE,

  tournament_kata_status TEXT DEFAULT 'not_won' CHECK (tournament_kata_status IN ('not_won', 'won')),
  tournament_kata_event TEXT,
  tournament_kata_date DATE,
  tournament_kumite_status TEXT DEFAULT 'not_won' CHECK (tournament_kumite_status IN ('not_won', 'won')),
  tournament_kumite_event TEXT,
  tournament_kumite_date DATE,

  fitness_baseline_done BOOLEAN DEFAULT false,
  fitness_baseline_data JSONB DEFAULT '{}',
  fitness_retest_done BOOLEAN DEFAULT false,
  fitness_retest_data JSONB DEFAULT '{}',
  fitness_improved BOOLEAN,

  wkf_kumite_status TEXT DEFAULT 'not_started' CHECK (wkf_kumite_status IN ('not_started', 'reading', 'quiz_passed')),
  wkf_kata_status TEXT DEFAULT 'not_started' CHECK (wkf_kata_status IN ('not_started', 'reading', 'quiz_passed')),
  wkf_referee_status TEXT DEFAULT 'not_started' CHECK (wkf_referee_status IN ('not_started', 'in_progress', 'reviewed')),

  weapon_status TEXT DEFAULT 'not_started' CHECK (weapon_status IN ('not_started', 'in_progress', 'exam_ready')),
  bunkai_status TEXT DEFAULT 'not_done' CHECK (bunkai_status IN ('not_done', 'internal_demo', 'taught_to_kids')),

  self_defense_months JSONB DEFAULT '{"month_1":false,"month_2":false,"month_3":false,"month_4":false}',

  video_count INTEGER DEFAULT 0,
  video_target INTEGER DEFAULT 16,

  teaching_status TEXT DEFAULT 'active' CHECK (teaching_status IN ('active', 'ongoing', 'flagged')),

  mock_exam_done BOOLEAN DEFAULT false,

  readiness TEXT DEFAULT 'attention_needed' CHECK (readiness IN ('on_track', 'attention_needed', 'exam_ready')),

  exam_score NUMERIC,
  exam_result TEXT CHECK (exam_result IS NULL OR exam_result IN ('pass', 'conditional', 'defer')),
  exam_component_scores JSONB DEFAULT '{}',

  instructor_notes TEXT DEFAULT '',

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(program_id, skf_id)
);

CREATE INDEX IF NOT EXISTS idx_bb_candidates_program ON bb_candidates(program_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bb_candidates_skf ON bb_candidates(skf_id);
ALTER TABLE bb_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_bb_candidates" ON bb_candidates
  FOR ALL USING (auth.role() = 'service_role');
```

### `bb_progress_entries`

```sql
CREATE TABLE IF NOT EXISTS bb_progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES bb_candidates(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'tournament', 'video_approved', 'video_retake',
    'self_defense', 'weapon_milestone', 'bunkai_milestone',
    'first_aid', 'marketing', 'fitness', 'teaching_note',
    'wkf_quiz', 'mock_exam', 'general', 'instructor_note'
  )),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  month_number INTEGER,
  entry_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bb_progress_candidate ON bb_progress_entries(candidate_id, entry_date DESC);
ALTER TABLE bb_progress_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_bb_progress" ON bb_progress_entries
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 10. Data flow

```
Login (portal session cookie)
      │
      ▼
PortalLayout (server)
      │  isBBCandidate(session.skfId)  ── reads bb_candidates ──► isBlackBeltCandidate
      ▼
AthleteHubNav (client) — shows "Black Belt" link only if isBlackBeltCandidate
      │
      ▼
GET /portal/blackbelt  (server page)
      │
      ├─ requirePortalAthlete() ──► 401 redirect to login if not authenticated
      │
      ├─ getBBCandidateBySkfIdAcrossPrograms(skfId)   ──► null? ──► redirect /portal/dashboard
      │
      ├─ getBBProgramForPortal(skfId)  (strictly candidate-scoped)
      │     ├─ program = the candidate's enrolled bb_programs row
      │     ├─ candidates = all bb_candidates of that program
      │     └─ progressMap = public bb_progress_entries per candidate
      │
      └─► <BlackBeltClient program candidates progressMap currentSkfId renderedAt />
```

`submitBBEnrollmentPayment` (client form) → server action → verifies candidate row
→ updates `enrollment_fee_status` → Telegram fees channel → `revalidatePath`.

---

## 11. Security model ("only visible to assigned candidates")

| Attack surface | Protection |
|----------------|-----------|
| Nav link visible to others | `layout.js` computes `isBBCandidate` server-side; nav filters `/portal/blackbelt`; errors default to hidden (fail-closed) |
| Direct URL `/portal/blackbelt` | Server route guard redirects non-candidates to `/portal/dashboard` |
| Program/candidate data leakage | `getBBProgramForPortal` returns `null` for non-candidates — no active-program fallback |
| Direct Supabase reads via anon key | RLS enabled on `bb_programs`, `bb_candidates`, `bb_progress_entries`; only `service_role` policy exists → anon returns 0 rows (verified live) |
| Client bundle | `BlackBeltClient` performs no data fetching; all data arrives server-side |
| Session endpoint | `isBlackBeltCandidate` is computed per logged-in student from their own session |

---

## 12. How to assign a new candidate (one-stop solution)

The database is the single source of truth — **no code changes required**.

Insert a row into `bb_candidates` for the athlete's SKF ID:

```sql
INSERT INTO bb_candidates (program_id, skf_id, display_name, display_code, weapon_group, bunkai_group, self_defense_day, sort_order)
VALUES (
  '<program-uuid>',   -- id of the program row in bb_programs
  'SKF25XX001',       -- athlete's SKF ID (normalized uppercase)
  'Athlete Full Name',
  'BB-07',
  'bo_staff',         -- 'bo_staff' | 'nunchaku'
  'group_a',          -- 'group_a' | 'group_b'
  'saturday',         -- 'tuesday' | 'friday' | 'saturday'
  7
)
ON CONFLICT (program_id, skf_id) DO NOTHING;
```

Once the row exists, the athlete will see the Black Belt link in their portal nav
and can open the page on their next load — no deployment or code edit needed.
Removing the row removes their access everywhere.

### Currently assigned candidates

| # | SKF ID | Name |
|---|--------|------|
| 1 | SKF13BL000 | Shri Roshan P |
| 2 | SKF20HE001 | Sanjana S |
| 3 | SKF20HE002 | Tejashree S |
| 4 | SKF20HE003 | Ayush Kashyap G |
| 5 | SKF21HE001 | Ishaan Gowda B S |
| 6 | SKF21HE003 | Shashank R |

---

## 13. Tests

`tests/unit/portal/blackbelt-access.test.ts` covers:
- Nav/link availability for all six assigned candidates (case-insensitive).
- Legacy `isActiveBBCandidate` alignment with enrollment.
- Program loaded by enrollment row even when status is `archived`/`completed`.
- Normalized stored/requested SKF-ID matching.
- Link hidden when the enrollment row is gone.
- **Non-candidates never receive program data** (no active-program fallback).
- Only the enrolled program is served (never the active one).
- Newly assigned candidates get access without any hardcoded entry.

Run: `npm run test:unit`
