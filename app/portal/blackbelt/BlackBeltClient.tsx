'use client'
import { useMemo, useState } from 'react'
import { Trophy, Shield, Flame, Circle, Clock, Video, FileText, Upload, ArrowRight, GraduationCap, Heart, Megaphone, Target, BookOpen, ExternalLink, Map, BookMarked, CalendarDays, CheckCircle, CircleDashed, Phone, Users } from 'lucide-react'
import type { BBProgram, BBCandidate, BBProgressEntry } from '@/lib/server/repositories/blackbelt-live'
import { normaliseSkfId } from '@/lib/utils/registration'
import SecureContentWrapper from '@/app/_components/portal/SecureContentWrapper'
import { motion } from 'framer-motion'
import './blackbelt.css'

/* ═══ Constants ═══ */
const FIRST_AID_LINK = 'https://alison.com/course/first-aid-for-martial-arts'
const KUMITE_PDF = 'https://www.wkf.net/files/pdf/documents/WKF%202026%20Kumite%20Competition%20Rules%20MASTER%20COPY_V11.pdf'
const KATA_PDF = 'https://www.wkf.net/files/pdf/documents/WKF%20Kata%20Competition%20Rules%202026%20MASTER%20COPY_V2.pdf'
const DRIVE_MAP: Record<string, string> = {
  'SKF13BL000': 'https://drive.google.com/drive/folders/1GGfoE3SOgFsD6wICnp2ztnKHUlEgzjmo?usp=sharing', // SHRIROSHAN P
  'SKF20HE001': 'https://drive.google.com/drive/folders/1txctxGMEgZxv7zQejhW6s-xN9LpwW1Wz?usp=sharing', // SANJANA S
  'SKF20HE002': 'https://drive.google.com/drive/folders/1M9zhju2AwPaLbxzhhXB3beSRwFkyzxiB?usp=sharing', // TEJASHREE S
  'SKF20HE003': 'https://drive.google.com/drive/folders/1aDsAd4ULgD4DLA5NhlqndLstdumseaDv?usp=sharing', // AYUSH KASHYAP G
  'SKF21HE001': 'https://drive.google.com/drive/folders/1FyLxjvGtJ8JKTxIl57vnjHTKifriRda1?usp=sharing', // ISHAAN GOWDA B S
  'SKF21HE003': 'https://drive.google.com/drive/folders/1kHHbgIDixJfbHbPHAJJVUQV1zuzuKN0G?usp=sharing', // SHASHANK
}

function getDriveLink(skfId: string | undefined): string {
  if (!skfId) return 'https://drive.google.com'
  return DRIVE_MAP[normaliseSkfId(skfId)] || 'https://drive.google.com'
}

type Mentee = { name: string; phone: string }

type MenteeCardConfig = {
  title: string
  subtitle: string
  assignments: Record<string, Mentee[]>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeMentee(value: unknown): Mentee | null {
  if (!isRecord(value)) return null
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  const phone = typeof value.phone === 'string' ? value.phone.trim() : ''
  if (!name || !phone) return null
  return { name, phone }
}

function normalizeMentees(values: unknown[]): Mentee[] {
  const seen = new Set<string>()
  const mentees: Mentee[] = []

  for (const value of values) {
    const mentee = sanitizeMentee(value)
    if (!mentee) continue

    const key = `${mentee.name.toLowerCase()}|${mentee.phone.replace(/\D/g, '')}`
    if (seen.has(key)) continue

    seen.add(key)
    mentees.push(mentee)
  }

  return mentees
}

function getMenteeCardConfig(program: BBProgram | null): MenteeCardConfig {
  const base = {
    title: 'Your Mentees',
    subtitle: 'Juniors assigned to you',
    assignments: {},
  }

  if (!isRecord(program?.config)) return base

  const card = isRecord(program.config.mentee_card) ? program.config.mentee_card : {}
  const assignments: Record<string, Mentee[]> = {}
  const rawAssignments = program.config.mentee_assignments

  if (isRecord(rawAssignments)) {
    for (const [skfId, rawMentees] of Object.entries(rawAssignments)) {
      if (!Array.isArray(rawMentees)) continue
      assignments[skfId] = normalizeMentees(rawMentees)
    }
  }

  const hasDbAssignments = Object.keys(assignments).length > 0

  return {
    title: typeof card.title === 'string' && card.title.trim() ? card.title.trim() : base.title,
    subtitle: typeof card.subtitle === 'string' && card.subtitle.trim() ? card.subtitle.trim() : base.subtitle,
    assignments: hasDbAssignments ? assignments : base.assignments,
  }
}

function getMentees(skfId: string | undefined, assignments: Record<string, Mentee[]>): Mentee[] {
  if (!skfId) return []
  return assignments[skfId] || assignments[normaliseSkfId(skfId)] || []
}

function formatPhone(raw: string): string {
  // +919880952278 → +91 98809 52278
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) {
    const n = digits.slice(2)
    return `+91 ${n.slice(0, 5)} ${n.slice(5)}`
  }
  return raw
}

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

const EXAM_COMPONENTS = [
  { id: 'kihon', name: 'Kihon (Basics Under Fatigue)', weight: 10, color: '#ff6b6b' },
  { id: 'kata', name: 'Competition Kata', weight: 15, color: '#f59e0b' },
  { id: 'bunkai', name: 'Bunkai Group Demo', weight: 10, color: '#60a5fa' },
  { id: 'weapon', name: 'Weapon Demonstration', weight: 12, color: '#a78bfa' },
  { id: 'kumite', name: 'Kumite (3 Rounds)', weight: 18, color: '#ef4444' },
  { id: 'wkf', name: 'WKF Rules Oral Exam', weight: 10, color: '#34d399' },
  { id: 'teaching', name: 'Teaching Demonstration', weight: 15, color: '#fbbf24' },
  { id: 'selfdef', name: 'Self-Defense Display', weight: 10, color: '#f472b6' },
]

type SubTask = { key: string; label: string; status?: string; value?: string | number; unit?: string }
type Task = { key: string; label: string; hint?: string; link?: string; linkLabel?: string; status: string; priority?: boolean; subtasks?: SubTask[] }

const MONTHS: { num: number; monthName: string; theme: string; desc: string; tasks: (c: BBCandidate) => Task[] }[] = [
  {
    num: 1, monthName: 'June', theme: 'Foundation', desc: 'Build habits. Start the machine.',
    tasks: (c) => [
      { key: 'fa1', label: 'Complete First Aid Certification', hint: 'Course is 3-4 hours.', link: FIRST_AID_LINK, linkLabel: 'Course Link', status: c.first_aid_status === 'completed' ? 'done' : c.first_aid_status === 'in_progress' ? 'wip' : 'todo', priority: true },
      { key: 'wkfk1', label: 'Start WKF Kumite Rules Reading', link: KUMITE_PDF, linkLabel: 'Read PDF', status: c.wkf_kumite_status === 'quiz_passed' ? 'done' : c.wkf_kumite_status === 'reading' ? 'wip' : 'todo' },
      { 
        key: 'fit1', label: 'Baseline Fitness Test', hint: 'Pushups · Pullups · 2km Run · Leg Split', status: c.fitness_months?.month_1 ? 'done' : 'wip',
        subtasks: [
          { key: 'fit1_pu', label: 'Push Ups (Max reps)', value: c.fitness_months?.month_1?.pushups || '—', unit: 'reps' },
          { key: 'fit1_pl', label: 'Pull Ups (Max reps)', value: c.fitness_months?.month_1?.pullups || '—', unit: 'reps' },
          { key: 'fit1_su', label: 'Sit Ups (1 min)', value: c.fitness_months?.month_1?.situps || '—', unit: 'reps' },
          { key: 'fit1_run', label: '2km Run', value: c.fitness_months?.month_1?.run_time || '—', unit: 'min' },
          { key: 'fit1_split', label: 'Leg Split Angle', value: c.fitness_months?.month_1?.leg_split || '—', unit: 'deg' }
        ]
      },
      { 
        key: 'sd1', label: 'Self-Defense Check-ins', status: c.self_defense_months?.month_1 ? 'done' : 'wip',
        subtasks: [
          { key: 'sd1_1', label: 'Week 1 Check-in', status: c.self_defense_months?.month_1 ? 'done' : 'todo' },
          { key: 'sd1_2', label: 'Week 2 Check-in', status: c.self_defense_months?.month_1 ? 'done' : 'todo' },
          { key: 'sd1_3', label: 'Week 3 Check-in', status: c.self_defense_months?.month_1 ? 'done' : 'todo' },
          { key: 'sd1_4', label: 'Week 4 Check-in', status: c.self_defense_months?.month_1 ? 'done' : 'todo' },
        ]
      },
    ],
  },
  {
    num: 2, monthName: 'July', theme: 'Weapon Mastery', desc: 'Weapon training goes live. Teach the basics.',
    tasks: (c) => [
      { 
        key: 'fit2', label: 'Month 2 Fitness Test', hint: 'Check limits and growth', status: c.fitness_months?.month_2 ? 'done' : 'todo',
        subtasks: [
          { key: 'fit2_pu', label: 'Push Ups (Max reps)', value: c.fitness_months?.month_2?.pushups || '—', unit: 'reps' },
          { key: 'fit2_pl', label: 'Pull Ups (Max reps)', value: c.fitness_months?.month_2?.pullups || '—', unit: 'reps' },
          { key: 'fit2_su', label: 'Sit Ups (1 min)', value: c.fitness_months?.month_2?.situps || '—', unit: 'reps' },
          { key: 'fit2_run', label: '2km Run', value: c.fitness_months?.month_2?.run_time || '—', unit: 'min' },
          { key: 'fit2_split', label: 'Leg Split Angle', value: c.fitness_months?.month_2?.leg_split || '—', unit: 'deg' }
        ]
      },
      { key: 'wpn2', label: 'Weapon Training Month', hint: 'Practice forms & strikes to exam-ready level', status: c.weapon_status === 'exam_ready' ? 'done' : c.weapon_status === 'in_progress' ? 'wip' : 'todo' },
      { key: 'teach_wpn2', label: 'Teach Weapon Basics to Kids/Juniors', hint: 'Share knowledge to solidify mechanics', status: c.teaching_status === 'ongoing' ? 'wip' : 'todo', priority: true },
      { key: 'mock1', label: 'Mock Examination (Review #1)', hint: 'First bi-monthly assessment', status: c.mock_exam_done ? 'done' : 'todo', priority: true },
      { key: 'wkfk2', label: 'Complete WKF Kumite Rules', link: KUMITE_PDF, linkLabel: 'Read PDF', status: c.wkf_kumite_status === 'quiz_passed' ? 'done' : c.wkf_kumite_status === 'reading' ? 'wip' : 'todo' },
      { 
        key: 'sd2', label: 'Self-Defense Check-ins', status: c.self_defense_months?.month_2 ? 'done' : 'wip',
        subtasks: [
          { key: 'sd2_1', label: 'Week 1 Check-in', status: c.self_defense_months?.month_2 ? 'done' : 'todo' },
          { key: 'sd2_2', label: 'Week 2 Check-in', status: c.self_defense_months?.month_2 ? 'done' : 'todo' },
          { key: 'sd2_3', label: 'Week 3 Check-in', status: c.self_defense_months?.month_2 ? 'done' : 'todo' },
          { key: 'sd2_4', label: 'Week 4 Check-in', status: c.self_defense_months?.month_2 ? 'done' : 'todo' },
        ]
      },
    ],
  },
  {
    num: 3, monthName: 'August', theme: 'Bunkai Depth', desc: 'Intellectual depth. Demonstrate understanding of mechanics.',
    tasks: (c) => [
      { 
        key: 'fit3', label: 'Month 3 Fitness Test', hint: 'Push past the plateau', status: c.fitness_months?.month_3 ? 'done' : 'todo',
        subtasks: [
          { key: 'fit3_pu', label: 'Push Ups (Max reps)', value: c.fitness_months?.month_3?.pushups || '—', unit: 'reps' },
          { key: 'fit3_pl', label: 'Pull Ups (Max reps)', value: c.fitness_months?.month_3?.pullups || '—', unit: 'reps' },
          { key: 'fit3_su', label: 'Sit Ups (1 min)', value: c.fitness_months?.month_3?.situps || '—', unit: 'reps' },
          { key: 'fit3_run', label: '2km Run', value: c.fitness_months?.month_3?.run_time || '—', unit: 'min' },
          { key: 'fit3_split', label: 'Leg Split Angle', value: c.fitness_months?.month_3?.leg_split || '—', unit: 'deg' }
        ]
      },
      { key: 'bk3', label: 'Bunkai Mechanics & Principles', hint: 'Deep study of kata applications', status: c.bunkai_status === 'taught_to_kids' ? 'done' : c.bunkai_status === 'internal_demo' ? 'wip' : 'todo', priority: true },
      { key: 'teach_bk3', label: 'Teach Bunkai to Juniors', hint: 'Break down practical applications for kids', status: c.bunkai_status === 'taught_to_kids' ? 'done' : 'todo' },
      { key: 'wkfka3', label: 'Start WKF Kata Rules Reading', link: KATA_PDF, linkLabel: 'Read PDF', status: c.wkf_kata_status === 'quiz_passed' ? 'done' : c.wkf_kata_status === 'reading' ? 'wip' : 'todo' },
      { 
        key: 'sd3', label: 'Self-Defense Check-ins', status: c.self_defense_months?.month_3 ? 'done' : 'wip',
        subtasks: [
          { key: 'sd3_1', label: 'Week 1 Check-in', status: c.self_defense_months?.month_3 ? 'done' : 'todo' },
          { key: 'sd3_2', label: 'Week 2 Check-in', status: c.self_defense_months?.month_3 ? 'done' : 'todo' },
          { key: 'sd3_3', label: 'Week 3 Check-in', status: c.self_defense_months?.month_3 ? 'done' : 'todo' },
          { key: 'sd3_4', label: 'Week 4 Check-in', status: c.self_defense_months?.month_3 ? 'done' : 'todo' },
        ]
      },
    ],
  },
  {
    num: 4, monthName: 'September', theme: 'Consolidation', desc: 'Refine. Complete. Second Mock Exam.',
    tasks: (c) => [
      { 
        key: 'fit4', label: 'Month 4 Fitness Test', hint: 'Almost at final form', status: c.fitness_months?.month_4 ? 'done' : 'todo',
        subtasks: [
          { key: 'fit4_pu', label: 'Push Ups (Max reps)', value: c.fitness_months?.month_4?.pushups || '—', unit: 'reps' },
          { key: 'fit4_pl', label: 'Pull Ups (Max reps)', value: c.fitness_months?.month_4?.pullups || '—', unit: 'reps' },
          { key: 'fit4_su', label: 'Sit Ups (1 min)', value: c.fitness_months?.month_4?.situps || '—', unit: 'reps' },
          { key: 'fit4_run', label: '2km Run', value: c.fitness_months?.month_4?.run_time || '—', unit: 'min' },
          { key: 'fit4_split', label: 'Leg Split Angle', value: c.fitness_months?.month_4?.leg_split || '—', unit: 'deg' }
        ]
      },
      { key: 'mock2', label: 'Mock Examination (Review #2)', hint: 'Second bi-monthly assessment', status: c.mock_exam_done ? 'done' : 'todo', priority: true },
      { key: 'bk4', label: 'Bunkai Group Execution', hint: 'Practice group timing and realism', status: c.bunkai_status === 'taught_to_kids' ? 'done' : 'todo' },
      { key: 'wkfka4', label: 'Complete WKF Kata Rules', link: KATA_PDF, linkLabel: 'Read PDF', status: c.wkf_kata_status === 'quiz_passed' ? 'done' : c.wkf_kata_status === 'reading' ? 'wip' : 'todo' },
      { 
        key: 'sd4', label: 'Self-Defense Check-ins', status: c.self_defense_months?.month_4 ? 'done' : 'wip',
        subtasks: [
          { key: 'sd4_1', label: 'Week 1 Check-in', status: c.self_defense_months?.month_4 ? 'done' : 'todo' },
          { key: 'sd4_2', label: 'Week 2 Check-in', status: c.self_defense_months?.month_4 ? 'done' : 'todo' },
          { key: 'sd4_3', label: 'Week 3 Check-in', status: c.self_defense_months?.month_4 ? 'done' : 'todo' },
          { key: 'sd4_4', label: 'Week 4 Check-in', status: c.self_defense_months?.month_4 ? 'done' : 'todo' },
        ]
      },
    ],
  },
  {
    num: 5, monthName: 'October', theme: 'Examination', desc: 'Prove it. All of it. OSU! 🥋',
    tasks: (c) => [
      { 
        key: 'fit5', label: 'Final Fitness Retest', hint: 'Show massive improvement over baseline', status: c.fitness_months?.month_5 ? 'done' : 'todo',
        subtasks: [
          { key: 'fit5_pu', label: 'Push Ups (Max reps)', value: c.fitness_months?.month_5?.pushups || '—', unit: 'reps' },
          { key: 'fit5_pl', label: 'Pull Ups (Max reps)', value: c.fitness_months?.month_5?.pullups || '—', unit: 'reps' },
          { key: 'fit5_su', label: 'Sit Ups (1 min)', value: c.fitness_months?.month_5?.situps || '—', unit: 'reps' },
          { key: 'fit5_run', label: '2km Run', value: c.fitness_months?.month_5?.run_time || '—', unit: 'min' },
          { key: 'fit5_split', label: 'Leg Split Angle', value: c.fitness_months?.month_5?.leg_split || '—', unit: 'deg' }
        ]
      },
      { key: 'wkfr5', label: 'WKF Referee Questions', hint: 'Oral review of referee procedures', status: c.wkf_referee_status === 'reviewed' ? 'done' : c.wkf_referee_status === 'in_progress' ? 'wip' : 'todo' },
      { key: 'mock5', label: 'Final Exam Simulation', hint: 'Full dry-run with Sensei', status: c.mock_exam_done ? 'done' : 'todo', priority: true },
      { 
        key: 'sd5', label: 'Self-Defense Check-ins', status: c.self_defense_months?.month_5 ? 'done' : 'wip',
        subtasks: [
          { key: 'sd5_1', label: 'Week 1 Check-in', status: c.self_defense_months?.month_5 ? 'done' : 'todo' },
          { key: 'sd5_2', label: 'Week 2 Check-in', status: c.self_defense_months?.month_5 ? 'done' : 'todo' },
          { key: 'sd5_3', label: 'Week 3 Check-in', status: c.self_defense_months?.month_5 ? 'done' : 'todo' },
          { key: 'sd5_4', label: 'Week 4 Check-in', status: c.self_defense_months?.month_5 ? 'done' : 'todo' },
        ]
      },
    ],
  },
]

const CONTINUOUS_GOALS: (c: BBCandidate) => Task[] = (c) => [
  { key: 'cg_vid', label: `Training Videos: ${c.video_count}/${c.video_target}`, hint: 'Submit to Google Drive continuously', link: getDriveLink(c.skf_id), linkLabel: 'Upload', status: c.video_count >= c.video_target ? 'done' : c.video_count > 0 ? 'wip' : 'todo' },
  { key: 'cg_mkt', label: 'Enroll 1 New Student', hint: c.enrolled_student_name || 'Guide a prospective student', status: c.marketing_status === 'enrolled' ? 'done' : 'wip' },
  { key: 'cg_kg', label: 'Kata Gold Medal 🏆', hint: c.tournament_kata_event || 'Achieve gold in Kata', status: c.tournament_kata_status === 'won' ? 'done' : 'todo' },
  { key: 'cg_kug', label: 'Kumite Gold Medal 🏆', hint: c.tournament_kumite_event || 'Achieve gold in Kumite', status: c.tournament_kumite_status === 'won' ? 'done' : 'todo' },
]

function getCurrentMonth(start: string | null, now: Date): number {
  if (!start) return 1
  const s = new Date(start)
  const firstJuneYear = s.getMonth() <= 5 ? s.getFullYear() : s.getFullYear() + 1
  const monthsSinceJune = (now.getFullYear() - firstJuneYear) * 12 + (now.getMonth() - 5)
  return Math.max(1, Math.min(5, monthsSinceJune + 1))
}
function getDaysUntil(d: string | null, now: Date): number { return d ? Math.max(0, Math.ceil((new Date(d).getTime() - now.getTime()) / 86400000)) : 0 }

/* ═══ Sub-components ═══ */
function XPRing({ pct }: { pct: number }) {
  const r = 32, c = 2 * Math.PI * r
  return (
    <div className="bb-xp__ring">
      <svg className="bb-xp__svg" viewBox="0 0 72 72">
        <circle className="bb-xp__bg" cx="36" cy="36" r={r} />
        <circle className="bb-xp__fill" cx="36" cy="36" r={r} strokeDasharray={c} strokeDashoffset={c - c * pct / 100} />
      </svg>
      <div className="bb-xp__pct">
        <span className="bb-xp__pct-val">{pct}</span>
        <span className="bb-xp__pct-sym">%</span>
      </div>
    </div>
  )
}

function ReminderTask({ t }: { t: Task }) {
  return (
    <div className={`bb-rem ${t.status === 'done' ? 'bb-rem--done' : ''}`}>
      <div className="bb-rem__circle">
        {t.status === 'done' ? <CheckCircle size={20} className="bb-rem__icon bb-rem__icon--done" /> : 
         t.status === 'wip' ? <CircleDashed size={20} className="bb-rem__icon bb-rem__icon--wip" /> : 
         <Circle size={20} className="bb-rem__icon" />}
      </div>
      <div className="bb-rem__content">
        <div className="bb-rem__title-row">
          <span className="bb-rem__title">{t.label}</span>
          {t.priority && <span className="bb-rem__priority">!</span>}
        </div>
        {t.hint && <div className="bb-rem__hint">{t.hint}</div>}
        {t.link && t.status !== 'done' && (
          <a href={t.link} target="_blank" rel="noopener noreferrer" className="bb-rem__link">
            {t.linkLabel || 'Open Link'} <ExternalLink size={10} />
          </a>
        )}
        
        {t.subtasks && t.subtasks.length > 0 && (
          <div className="bb-rem__subtasks">
            {t.subtasks.map(st => (
              <div key={st.key} className={`bb-subtask ${st.status === 'done' ? 'bb-subtask--done' : ''} ${st.value !== undefined ? 'bb-subtask--metric' : ''}`}>
                {st.value === undefined && (
                  <div className="bb-subtask__circle">
                    {st.status === 'done' ? <CheckCircle size={14} className="bb-subtask__icon bb-subtask__icon--done" /> : 
                    <Circle size={14} className="bb-subtask__icon" />}
                  </div>
                )}
                <span className="bb-subtask__label">{st.label}</span>
                {st.value !== undefined && (
                  <div className="bb-subtask__metric-val">
                    <span className="bb-subtask__value">{st.value}</span>
                    {st.unit && <span className="bb-subtask__unit">{st.unit}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReminderList({ title, tasks, icon: Icon }: { title: string, tasks: Task[], icon: React.ElementType }) {
  return (
    <div className="bb-rem-list">
      <div className="bb-rem-list__header">
        <div className="bb-rem-list__icon-wrap"><Icon size={14} /></div>
        <h3 className="bb-rem-list__title">{title}</h3>
        <span className="bb-rem-list__count">{tasks.filter(t => t.status === 'done').length}/{tasks.length}</span>
      </div>
      <div className="bb-rem-list__items">
        {tasks.map(t => <ReminderTask key={t.key} t={t} />)}
      </div>
    </div>
  )
}

/* ═══ MAIN ═══ */
interface Props { program: BBProgram | null; candidates: BBCandidate[]; progressMap: Record<string, BBProgressEntry[]>; currentSkfId: string; renderedAt: string }

export default function BlackBeltClient({ program, candidates, currentSkfId, renderedAt }: Props) {
  const referenceDate = useMemo(() => new Date(renderedAt), [renderedAt])
  const curMonth = useMemo(
    () => program ? getCurrentMonth(program.program_start ?? null, referenceDate) : 1,
    [program, referenceDate]
  )
  const daysLeft = useMemo(
    () => program ? getDaysUntil(program.exam_date ?? null, referenceDate) : 0,
    [program, referenceDate]
  )
  const [activeMonth, setActiveMonth] = useState(() => Math.max(1, curMonth))

  const normalizedCurrentSkfId = useMemo(() => normaliseSkfId(currentSkfId), [currentSkfId])
  const me = useMemo(
    () => candidates.find(c => normaliseSkfId(c.skf_id) === normalizedCurrentSkfId),
    [candidates, normalizedCurrentSkfId]
  )
  const [activeTab, setActiveTab] = useState<'journey' | 'requirements' | 'examination'>('journey')
  
  const menteeCard = useMemo(() => getMenteeCardConfig(program), [program])

  if (!program) return (
    <SecureContentWrapper>
      <div style={{ paddingBottom: '6rem', width: '100%', minHeight: '100dvh', position: 'relative', overflowX: 'clip' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '500px', background: 'radial-gradient(ellipse at top, rgba(214,40,40,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="bb" style={{ position: 'relative', zIndex: 10 }}>
          <div className="bb-empty">
            <div className="bb-empty__ic"><Trophy size={28} color="rgba(255,255,255,0.3)" /></div>
            <h2 className="bb-empty__title">No Active Program</h2>
            <p className="bb-empty__text">Check back when your Sensei announces the next Black Belt examination cycle.</p>
          </div>
        </div>
      </div>
    </SecureContentWrapper>
  )

  if (!me) return (
    <SecureContentWrapper>
      <div style={{ paddingBottom: '6rem', width: '100%', minHeight: '100dvh', position: 'relative', overflowX: 'clip' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '500px', background: 'radial-gradient(ellipse at top, rgba(214,40,40,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="bb" style={{ position: 'relative', zIndex: 10 }}>
          <div className="bb-banner"><span className="bb-banner__kanji">黒帯</span>
            <h1 className="bb-banner__title">{program.title}</h1>
            <p className="bb-banner__sub">{program.tagline || 'Forging the next generation.'}</p>
          </div>
          <div className="bb-empty" style={{ marginTop: '2rem' }}>
            <div className="bb-empty__ic"><Shield size={28} color="rgba(255,255,255,0.3)" /></div>
            <h2 className="bb-empty__title">Not Enrolled</h2>
            <p className="bb-empty__text">Only selected candidates can view this program.</p>
          </div>
        </div>
      </div>
    </SecureContentWrapper>
  )

  const md = MONTHS[activeMonth - 1]
  const tasks = md.tasks(me)
  const contTasks = CONTINUOUS_GOALS(me)
  const mentees = getMentees(me.skf_id, menteeCard.assignments)

  const allTasksCount = MONTHS.reduce((s, m) => s + m.tasks(me).length, 0) + contTasks.length
  const allDoneCount = MONTHS.reduce((s, m) => s + m.tasks(me).filter(t => t.status === 'done').length, 0) + contTasks.filter(t => t.status === 'done').length
  const pct = allTasksCount > 0 ? Math.round(allDoneCount / allTasksCount * 100) : 0
  // A month is "done" ONLY when ALL its tasks are completed — not just by time passing
  const monthDone = tasks.length > 0 && tasks.every(t => t.status === 'done')

  return (
    <SecureContentWrapper>
      <div style={{ paddingBottom: '6rem', width: '100%', minHeight: '100dvh', position: 'relative', overflowX: 'clip' }}>

        {/* ── BACKGROUND GLOWS ── */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '500px', background: 'radial-gradient(ellipse at top, rgba(214,40,40,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,183,3,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="bb" style={{ position: 'relative', zIndex: 10 }}>

          {/* ── PREMIUM HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}
          >
            <h1 style={{
              fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 7vw, 4.5rem)',
              fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 0.5rem 0',
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {program.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '0 auto', maxWidth: '600px', fontWeight: 500 }}>
              {program.tagline || 'Your path to Black Belt.'}
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(230,57,70,0.1)', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid rgba(230,57,70,0.2)', marginTop: '1.25rem' }}>
              <Flame size={14} color="#e63946" />
              <span style={{ color: '#e63946', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {daysLeft > 0 ? `${daysLeft} DAYS LEFT` : 'EXAM DAY'}
              </span>
            </div>
          </motion.div>

          {/* HERO SECTION */}
          <div className="bb-hero bb-in" style={{ marginTop: 0 }}>
            <div className="bb-hero__bg">
              <span className="bb-hero__kanji">黒帯</span>
              <div className="bb-hero__gradient"></div>
            </div>

            <div className="bb-hero__content" style={{ justifyContent: 'center', margin: '0 auto 2.5rem' }}>
              <div className="bb-hero__xp" style={{ width: '100%', maxWidth: '450px' }}>
                <XPRing pct={pct} />
                <div className="bb-hero__xp-details">
                  <div className="bb-hero__xp-label">Overall Progress</div>
                  <div className="bb-hero__xp-stats">
                    <span>{allDoneCount}/{allTasksCount} Tasks</span>
                    <span className="bb-hero__xp-dot"></span>
                    <span>Level {curMonth}/5</span>
                  </div>
                </div>
              </div>
            </div>

        {/* TABS NAVIGATION */}
        <div className="bb-tabs">
          <button 
            className={`bb-tab ${activeTab === 'journey' ? 'bb-tab--active' : ''}`}
            onClick={() => setActiveTab('journey')}
          >
            <Map size={16} className="bb-tab__icon" />
            <span className="bb-tab__label">Journey</span>
          </button>
          <button 
            className={`bb-tab ${activeTab === 'requirements' ? 'bb-tab--active' : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            <Shield size={16} className="bb-tab__icon" />
            <span className="bb-tab__label">Requirements</span>
          </button>
          <button 
            className={`bb-tab ${activeTab === 'examination' ? 'bb-tab--active' : ''}`}
            onClick={() => setActiveTab('examination')}
          >
            <GraduationCap size={16} className="bb-tab__icon" />
            <span className="bb-tab__label">Examination</span>
          </button>
        </div>
      </div>

      <div className="bb-content-area">
        {/* TAB 1: JOURNEY */}
        {activeTab === 'journey' && (
          <div className="bb-tab-content bb-in" key="journey">
            {/* MONTH SELECTOR */}
            <div className="bb-nav">
              {MONTHS.map(m => {
                const mTasks = m.tasks(me)
                const mAllDone = mTasks.length > 0 && mTasks.every(t => t.status === 'done')
                return (
                  <button key={m.num}
                    className={`bb-nav__btn ${m.num === activeMonth ? 'bb-nav__btn--active' : ''} ${mAllDone ? 'bb-nav__btn--done' : ''}`}
                    onClick={() => setActiveMonth(m.num)}>
                    <span className="bb-nav__num">Level {m.num}</span>
                    <span className="bb-nav__theme">{m.monthName}</span>
                    {(m.num <= curMonth) && <span className="bb-nav__pip" />}
                  </button>
                )
              })}
            </div>

            <div className="bb-grid">
              <div className="bb-col bb-col--main">
                {/* STAGE CARD */}
                <div className="bb-stage">
                  <div className="bb-stage__top">
                    <span className={`bb-stage__badge ${monthDone ? 'bb-stage__done-badge' : ''}`}>
                      {monthDone ? '✓ Level Complete' : activeMonth === curMonth ? '● Current Level' : '○ Upcoming Level'}
                    </span>
                  </div>
                  <h2 className="bb-stage__name">{md.monthName}: {md.theme}</h2>
                  <p className="bb-stage__desc">{md.desc}</p>
                </div>

                {/* APPLE REMINDERS UI */}
                <ReminderList title={`${md.monthName} Quests`} tasks={tasks} icon={CalendarDays} />
              </div>

              <div className="bb-col bb-col--side">
                {/* TEACHING HOURS TRACKER WIDGET */}
                <div className="bb-card bb-teach-card">
                  <div className="bb-teach__top">
                    <div className="bb-teach__icon"><Clock size={20} /></div>
                    <div className="bb-teach__texts">
                      <div className="bb-teach__title">Teaching Hours</div>
                      <div className="bb-teach__sub">Assist in junior classes</div>
                    </div>
                    <div className="bb-teach__fraction">
                      <span>{me.teaching_hours || 0}</span>/16
                    </div>
                  </div>
                  <div className="bb-teach__track">
                    <div className="bb-teach__fill" style={{ width: `${Math.min(100, ((me.teaching_hours || 0) / 16) * 100)}%` }} />
                  </div>
                </div>

                {/* CONTINUOUS GOALS */}
                <ReminderList title="5-Month Continuous Goals" tasks={contTasks} icon={Target} />

                {/* YOUR MENTEES — contact card */}
                {mentees.length > 0 && (
                  <div className="bb-card" style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(96,165,250,0.06), rgba(96,165,250,0.01))', border: '1px solid rgba(96,165,250,0.15)' }}>
                    <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={15} color="#60a5fa" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{menteeCard.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{menteeCard.subtitle}</div>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 1rem 1rem' }}>
                      {mentees.map((mentee, i) => (
                        <a
                          key={i}
                          href={`tel:${mentee.phone}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.85rem',
                            padding: '0.85rem 0.75rem', borderRadius: 14,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                            textDecoration: 'none', color: '#fff',
                            transition: 'all 0.2s ease',
                            marginBottom: i < mentees.length - 1 ? '0.5rem' : 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.08)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}
                        >
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(96,165,250,0.05))',
                            border: '1px solid rgba(96,165,250,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 800, color: '#60a5fa', flexShrink: 0,
                          }}>
                            {mentee.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mentee.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.03em' }}>{formatPhone(mentee.phone)}</div>
                          </div>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Phone size={13} color="#60a5fa" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REQUIREMENTS */}
        {activeTab === 'requirements' && (
          <div className="bb-tab-content bb-in" key="requirements">
            <div className="bb-grid bb-grid--equal">
              <div className="bb-col">
                <div className="bb-section-header">
                  <div className="bb-section-title"><Shield size={16} /> Gate Requirements</div>
                  <div className="bb-section-sub">Mandatory conditions for exam entry</div>
                </div>
                <div className="bb-card bb-gates-card">
                  <div className={`bb-gate-item ${me.first_aid_status === 'completed' ? 'bb-gate-item--ok' : 'bb-gate-item--no'}`}>
                    <div className="bb-gate-item__icon"><Heart size={18} /></div>
                    <div className="bb-gate-item__info">
                      <div className="bb-gate-item__name">First Aid Certification</div>
                      <div className="bb-gate-item__stat">{me.first_aid_status === 'completed' ? 'Verified' : 'Pending'}</div>
                    </div>
                  </div>
                  <div className={`bb-gate-item ${me.marketing_status === 'enrolled' ? 'bb-gate-item--ok' : 'bb-gate-item--no'}`}>
                    <div className="bb-gate-item__icon"><Megaphone size={18} /></div>
                    <div className="bb-gate-item__info">
                      <div className="bb-gate-item__name">Student Enrollment</div>
                      <div className="bb-gate-item__stat">{me.marketing_status === 'enrolled' ? 'Complete' : '0/1 Enrolled'}</div>
                    </div>
                  </div>
                  <div className={`bb-gate-item ${me.video_count >= me.video_target ? 'bb-gate-item--ok' : 'bb-gate-item--no'}`}>
                    <div className="bb-gate-item__icon"><Video size={18} /></div>
                    <div className="bb-gate-item__info">
                      <div className="bb-gate-item__name">Video Submissions</div>
                      <div className="bb-gate-item__stat">{me.video_count}/{me.video_target} Submitted</div>
                    </div>
                  </div>
                </div>

                <div className="bb-section-header" style={{ marginTop: '2rem' }}>
                  <div className="bb-section-title"><Video size={16} /> Video Log Tracker</div>
                </div>
                <div className="bb-card bb-vid">
                  <div className="bb-vid__head">
                    <div className="bb-vid__count"><span>{me.video_count}</span> / {me.video_target} videos</div>
                  </div>
                  <div className="bb-vid__bar"><div className="bb-vid__fill" style={{ width: `${Math.min(100, me.video_count / me.video_target * 100)}%` }} /></div>
                  <p className="bb-vid__desc">Record your solo training and submit to Google Drive for review.</p>
                  <a href={getDriveLink(me?.skf_id)} target="_blank" rel="noopener noreferrer" className="bb-vid__upload">
                    <Upload size={16} /> Open Drive Folder <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              <div className="bb-col">
                <div className="bb-section-header">
                  <div className="bb-section-title"><BookMarked size={16} /> Program Rulebook</div>
                  <div className="bb-section-sub">The 10 directives of the Black Belt program</div>
                </div>
                <div className="bb-card bb-rules">
                  <ol className="bb-rules__list">
                    {RULEBOOK.map((r, i) => (
                      <li key={i} className="bb-rules__item">
                        <span className="bb-rules__num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="bb-rules__text">{r}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXAMINATION */}
        {activeTab === 'examination' && (
          <div className="bb-tab-content bb-in" key="examination">
            <div className="bb-grid bb-grid--equal">
              <div className="bb-col">
                <div className="bb-section-header">
                  <div className="bb-section-title"><GraduationCap size={16} /> Examination Breakdown</div>
                  <div className="bb-section-sub">Scoring matrix for the final test</div>
                </div>
                <div className="bb-card bb-exam">
                  <div className="bb-exam__passes">
                    <div className="bb-exam__pass"><div className="bb-exam__pass-val" style={{ color: 'var(--jade)' }}>70%</div><div className="bb-exam__pass-lbl">Overall Pass</div></div>
                    <div className="bb-exam__pass"><div className="bb-exam__pass-val" style={{ color: 'var(--gold)' }}>50%</div><div className="bb-exam__pass-lbl">Min / Component</div></div>
                    <div className="bb-exam__pass"><div className="bb-exam__pass-val" style={{ color: '#ff6b6b' }}>3</div><div className="bb-exam__pass-lbl">Gates Required</div></div>
                  </div>
                  <div className="bb-exam__grid">
                    {EXAM_COMPONENTS.map(e => (
                      <div key={e.id} className="bb-exam__item">
                        <span className="bb-exam__wt" style={{ color: e.color }}>{e.weight}%</span>
                        <span className="bb-exam__nm">{e.name}</span>
                        <span className="bb-exam__dot" style={{ background: e.color }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bb-col">
                <div className="bb-section-header">
                  <div className="bb-section-title"><BookOpen size={16} /> WKF Official Documents</div>
                  <div className="bb-section-sub">Required reading for the oral exam</div>
                </div>
                <div className="bb-docs">
                  <a href={KUMITE_PDF} target="_blank" rel="noopener noreferrer" className="bb-doc">
                    <div className="bb-doc__ic"><FileText size={20} color="#ff6b6b" /></div>
                    <div className="bb-doc__info">
                      <div className="bb-doc__name">Kumite Competition Rules 2026</div>
                      <div className="bb-doc__sub">Scoring, penalties, prohibited actions</div>
                    </div>
                    <div className="bb-doc__arrow"><ArrowRight size={16} /></div>
                  </a>
                  <a href={KATA_PDF} target="_blank" rel="noopener noreferrer" className="bb-doc">
                    <div className="bb-doc__ic"><FileText size={20} color="#ff6b6b" /></div>
                    <div className="bb-doc__info">
                      <div className="bb-doc__name">Kata Competition Rules 2026</div>
                      <div className="bb-doc__sub">Performance criteria, deductions</div>
                    </div>
                    <div className="bb-doc__arrow"><ArrowRight size={16} /></div>
                  </a>
                </div>

                <div className="bb-section-header" style={{ marginTop: '2.5rem' }}>
                  <div className="bb-section-title"><Target size={16} /> Mandatory Syllabus: Kata</div>
                  <div className="bb-section-sub">Master these Katas to remain in the safe zone for examination</div>
                </div>
                <div className="bb-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                    {['Bassai', 'Chinto', 'Kushanku', 'Seienchin', 'Anan', 'Unsu', 'Superenpi'].map(k => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' }} />
                        Kata {k}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
    </SecureContentWrapper>
  )
}
