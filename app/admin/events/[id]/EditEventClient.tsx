'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import EventForm from '../_components/EventForm'
import AthleteAssigner from '../_components/AthleteAssigner'
import ResultsManager from '../_components/ResultsManager'
import type { EventParticipant } from '../_components/AthleteAssigner'
import type { ManagedResult, ResultEventParticipant } from '../_components/ResultsManager'
import type { City } from '@/lib/classesData'
import type { SenseiSummary } from '@/lib/types/sensei'

type EventTab = 'details' | 'athletes' | 'results'

type EditableEventData = {
  id: string
  name: string
  type: string
  status?: string
  date: string
  city?: string
  venue?: string
  coverImageUrl?: string
  affiliatedBody?: string
  hostingBranch?: string
  isPublished?: boolean
  isResultsPublished?: boolean
  showInJourney?: boolean
  participants: EventParticipant[] & ResultEventParticipant[]
  results: ManagedResult[]
  resultsAppliedAt?: string | null
}

function getWorkflowStatus(eventData: EditableEventData) {
  const participantCount = Array.isArray(eventData.participants)
    ? eventData.participants.length
    : 0
  const resultCount = Array.isArray(eventData.results) ? eventData.results.length : 0

  if (eventData.status === 'draft') return 'Draft'
  if (eventData.status === 'completed' && resultCount > 0 && eventData.resultsAppliedAt) {
    return 'Completed & Synced'
  }
  if (eventData.status === 'completed' && resultCount > 0) return 'Completed'
  if (eventData.status === 'completed') return 'Completed / Awaiting outcomes'
  if (eventData.status === 'ongoing') return 'Live'
  if (participantCount === 0) return 'Awaiting athlete assignment'
  return 'Scheduled'
}

export default function EditEventClient({
  eventData,
  classCities,
  senseis,
  initialTab = 'details',
}: {
  eventData: EditableEventData
  classCities: City[]
  senseis: SenseiSummary[]
  initialTab?: EventTab
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<EventTab>(initialTab)

  const participantCount = Array.isArray(eventData.participants)
    ? eventData.participants.length
    : 0
  const resultCount = Array.isArray(eventData.results) ? eventData.results.length : 0
  const workflowStatus = getWorkflowStatus(eventData)

  const workflowCards = useMemo(
    () => [
      {
        label: 'Workflow Status',
        value: workflowStatus,
        helper: eventData.status === 'draft' ? 'Core details are still being prepared.' : 'This reflects the current operational stage.',
      },
      {
        label: 'Athlete Assignment',
        value: String(participantCount),
        helper:
          participantCount > 0
            ? 'Assigned athletes will see the event in their flow.'
            : 'No athletes assigned yet.',
      },
      {
        label: 'Recorded Outcomes',
        value: String(resultCount),
        helper:
          resultCount > 0
            ? 'Attendance, grading, or tournament outcomes are saved.'
            : 'Nothing recorded yet.',
      },
      {
        label: 'Profile Sync',
        value: eventData.resultsAppliedAt ? 'Applied' : 'Pending',
        helper: eventData.resultsAppliedAt
          ? `Last pushed ${new Date(eventData.resultsAppliedAt).toLocaleDateString('en-IN')}`
          : 'Athlete profiles are waiting for published outcomes.',
      },
    ],
    [eventData.resultsAppliedAt, eventData.status, participantCount, resultCount, workflowStatus]
  )

  const tabs = useMemo(
    () =>
      [
        {
          id: 'details',
          title: '1. Core Details',
          description: 'Schedule, branch, city, visibility, and draft/public settings.',
        },
        {
          id: 'athletes',
          title: '2. Assign Athletes',
          description: `${participantCount} athlete${participantCount === 1 ? '' : 's'} currently assigned.`,
        },
        {
          id: 'results',
          title: '3. Record Outcomes',
          description:
            resultCount > 0
              ? `${resultCount} athlete outcome${resultCount === 1 ? '' : 's'} recorded.`
              : 'Attendance, grading, or participation results are still pending.',
        },
      ] as Array<{ id: EventTab; title: string; description: string }>,
    [participantCount, resultCount]
  )

  const nextActionMessage =
    participantCount === 0
      ? 'Next recommended action: assign athletes so upcoming events and attendance flow into the right profiles.'
      : resultCount === 0
        ? 'Next recommended action: record attendance or results once the event has started or completed.'
        : !eventData.resultsAppliedAt
          ? 'Next recommended action: publish outcomes to athlete profiles after you verify the final data.'
          : 'The full event chain is connected. Edits here will replace the previously synced athlete-profile entries when republished.'

  const handleTabChange = (tab: EventTab) => {
    setActiveTab(tab)
    router.replace(`${pathname}?tab=${tab}`, { scroll: false })
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '1180px', margin: '0 auto' }}>
      <div style={{ padding: '1.25rem', borderRadius: '20px', border: '1px solid #151515', background: '#050505' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              <span style={{ padding: '0.3rem 0.65rem', borderRadius: '999px', border: '1px solid #202020', color: '#d5d5d5', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {workflowStatus}
              </span>
              <span style={{ padding: '0.3rem 0.65rem', borderRadius: '999px', border: '1px solid #202020', color: eventData.isPublished ? '#baf2c7' : '#8d8d8d', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {eventData.isPublished ? 'Public' : 'Internal'}
              </span>
              <span style={{ padding: '0.3rem 0.65rem', borderRadius: '999px', border: '1px solid #202020', color: eventData.isResultsPublished ? '#9ee7c4' : '#8d8d8d', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {eventData.isResultsPublished ? 'Public results visible' : 'Results private'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-0.03em' }}>
              {eventData.name}
            </h2>
            <p style={{ margin: '0.7rem 0 0', color: '#7f7f7f', lineHeight: 1.65 }}>
              {nextActionMessage}
            </p>
          </div>
          <div style={{ color: '#8c8c8c', fontSize: '0.86rem', lineHeight: 1.65, minWidth: '220px' }}>
            <div>{new Date(eventData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div>{eventData.city || 'City pending'} · {eventData.venue || 'Venue pending'}</div>
            <div>{eventData.hostingBranch || 'Branch not linked yet'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {workflowCards.map((card) => (
          <div key={card.label} style={{ padding: '1rem 1.05rem', borderRadius: '18px', border: '1px solid #161616', background: '#050505' }}>
            <div style={{ color: '#6f6f6f', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</div>
            <div style={{ marginTop: '0.45rem', fontSize: '1.2rem', fontWeight: 700 }}>{card.value}</div>
            <div style={{ marginTop: '0.3rem', color: '#838383', fontSize: '0.8rem', lineHeight: 1.5 }}>{card.helper}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem', borderRadius: '20px', border: '1px solid #151515', background: '#050505' }}>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: `1px solid ${isActive ? '#2c2c2c' : '#171717'}`,
                  background: isActive ? '#101010' : '#080808',
                  color: isActive ? '#fff' : '#8a8a8a',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tab.title}</div>
                <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', lineHeight: 1.5, color: isActive ? '#a0a0a0' : '#666' }}>
                  {tab.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '1.35rem', borderRadius: '20px', border: '1px solid #151515', background: '#050505' }}>
        {activeTab === 'details' ? (
          <EventForm
            initialData={eventData}
            isEdit={true}
            classCities={classCities}
            redirectTab="details"
          />
        ) : null}

        {activeTab === 'athletes' ? (
          <AthleteAssigner eventId={eventData.id} participants={eventData.participants} />
        ) : null}

        {activeTab === 'results' ? (
          <ResultsManager
            eventId={eventData.id}
            participants={eventData.participants}
            results={eventData.results}
            type={eventData.type}
            senseis={senseis}
          />
        ) : null}
      </div>
    </div>
  )
}
