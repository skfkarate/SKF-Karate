'use client'

import { useState } from 'react'
import EventForm from '../_components/EventForm'
import AthleteAssigner from '../_components/AthleteAssigner'
import ResultsManager from '../_components/ResultsManager'

export default function EditEventClient({ eventData }: { eventData: any }) {
  const [activeTab, setActiveTab] = useState<'details' | 'athletes' | 'results'>('details')

  const tabStyle = (isActive: boolean) => ({
    padding: '0.8rem 1.5rem',
    background: isActive ? '#fff' : '#111',
    color: isActive ? '#000' : '#888',
    border: '1px solid #333',
    borderBottom: isActive ? 'none' : '1px solid #333',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    borderRadius: '4px 4px 0 0',
    flex: 1,
    textAlign: 'center' as const
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#050505', padding: '2rem', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
      
      <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid #333' }}>
        <button style={tabStyle(activeTab === 'details')} onClick={() => setActiveTab('details')}>
          Event Details
        </button>
        <button style={tabStyle(activeTab === 'athletes')} onClick={() => setActiveTab('athletes')}>
          Assign Athletes ({eventData.participants?.length || 0})
        </button>
        <button style={tabStyle(activeTab === 'results')} onClick={() => setActiveTab('results')}>
          Manage & Publish Results
        </button>
      </div>

      <div style={{ minHeight: '500px' }}>
        {activeTab === 'details' && (
          <EventForm initialData={eventData} isEdit={true} />
        )}
        
        {activeTab === 'athletes' && (
          <AthleteAssigner eventId={eventData.id} participants={eventData.participants} />
        )}

        {activeTab === 'results' && (
          <ResultsManager eventId={eventData.id} participants={eventData.participants} results={eventData.results} type={eventData.type} />
        )}
      </div>
      
    </div>
  )
}
