'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import type { VideoRow, Student } from '@/types'
import { FaPlay, FaLock, FaCheckCircle } from 'react-icons/fa'

type VideoWithProgress = VideoRow & { progressPercent: number, completed: boolean }

const beltWeights: Record<string, number> = {
  'white': 1, 'yellow': 2, 'orange': 3, 'green': 4,
  'blue': 5, 'purple': 6, 'brown': 7, 'black': 8
}

export default function VideosClient({ student }: { student: Student }) {
  const [activeVideo, setActiveVideo] = useState<VideoWithProgress | null>(null)
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const secondsWatchedRef = useRef(0)

  const { data: videos = [], refetch } = useQuery<VideoWithProgress[]>({
    queryKey: ['videos', student.skfId],
    queryFn: async () => {
      const res = await fetch('/api/portal/videos')
      if (!res.ok) throw new Error('Failed to fetch videos')
      const json = await res.json()
      return json.videos || []
    }
  })

  // Group videos
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const thisWeek = videos.filter(v => v.section !== 'Exam Revision' && new Date(v.unlockDate!) >= sevenDaysAgo)
  const lastWeek = videos.filter(v => v.section !== 'Exam Revision' && new Date(v.unlockDate!) >= fourteenDaysAgo && new Date(v.unlockDate!) < sevenDaysAgo)
  
  const studentBeltWeight = beltWeights[student.belt.toLowerCase()] || 0
  const examRevisionCurrent = videos.filter(v => v.section === 'Exam Revision' && (beltWeights[v.beltLevel!.toLowerCase()] || 0) <= studentBeltWeight)
  const examRevisionNext = videos.filter(v => v.section === 'Exam Revision' && (beltWeights[v.beltLevel!.toLowerCase()] || 0) === studentBeltWeight + 1)

  // Tracking API
  const trackProgress = async (videoId: string, percent: number) => {
    try {
      await fetch('/api/portal/videos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, watchedPercent: Math.min(100, Math.round(percent)) })
      })
    } catch (e) {
      console.error('Failed to sync progress', e)
    }
  }

  // Handle Modal Open
  const openVideo = async (video: VideoWithProgress) => {
    setActiveVideo(video)
    secondsWatchedRef.current = 0
    try {
      const res = await fetch(`/api/portal/videos/embed/${video.videoId}`)
      const data = await res.json()
      if (data.embedUrl) setEmbedUrl(data.embedUrl)
    } catch (e) {
      console.error('Failed to get embed URL', e)
    }
  }

  // Handle Modal Close
  const closeVideo = () => {
    if (activeVideo && secondsWatchedRef.current > 10) {
      // Approximate percentage if we don't hook directly into YouTube iframe API reliably because of react lifecycle
      // Assuming 1 minute per 1% for simple metric, or use real tracking.
      // Better tracking via postMessage usually requires the YT iframe API script which we lack natively.
      // E2E simplified: 
      const newPercent = Math.min(100, activeVideo.progressPercent + (secondsWatchedRef.current / (activeVideo.durationMin * 60)) * 100)
      trackProgress(activeVideo.videoId, newPercent).then(() => refetch())
    }
    setActiveVideo(null)
    setEmbedUrl(null)
    if (watchTimerRef.current) clearInterval(watchTimerRef.current)
  }

  // Simulated Watch Tracking loop
  useEffect(() => {
    if (activeVideo && embedUrl) {
      watchTimerRef.current = setInterval(() => {
        secondsWatchedRef.current += 30
        
        // Sync every 30 seconds inherently
        const newPercent = Math.min(100, activeVideo.progressPercent + (secondsWatchedRef.current / (activeVideo.durationMin * 60)) * 100)
        trackProgress(activeVideo.videoId, newPercent)
      }, 30000)
    }
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current)
    }
  }, [activeVideo, embedUrl])

  // --- UI Components ---
  const VideoCard = ({ v, locked = false }: { v: VideoWithProgress, locked?: boolean }) => {
    const isNew = new Date(v.unlockDate!) >= sevenDaysAgo
    return (
      <div 
        onClick={() => !locked && openVideo(v)}
        style={{
          background: 'rgba(10, 14, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px', overflow: 'hidden', cursor: locked ? 'not-allowed' : 'pointer',
          opacity: locked ? 0.5 : 1, transition: 'transform 0.2s', position: 'relative',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
        onMouseOver={e => !locked && (e.currentTarget.style.transform = 'translateY(-4px)')}
        onMouseOut={e => !locked && (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <div style={{ position: 'relative', height: '180px', background: '#000' }}>
          <Image 
            src={`/api/proxy/thumbnail?videoId=${v.videoId}`} 
            alt={v.title} 
            fill
            style={{ objectFit: 'cover', opacity: 0.7 }} 
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
          
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
            {isNew && !locked && <span style={{ background: 'var(--crimson)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>NEW</span>}
            {v.completed && <span style={{ background: '#27ae60', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, display: 'flex', gap: '4px', alignItems: 'center' }}><FaCheckCircle /> COMPLETED</span>}
          </div>

          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {locked ? <FaLock size={32} color="rgba(255,255,255,0.8)" /> : <FaPlay size={32} color="var(--gold)" />}
          </div>

          <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' }}>
            {v.durationMin} min
          </div>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <span>{v.batch} Batch</span>
            <span>{new Date(v.unlockDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          {locked ? (
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--gold)', textAlign: 'center' }}>
              Unlocks after {v.beltLevel} Belt grading
            </div>
          ) : (
            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
               <div style={{ background: 'var(--crimson)', height: '100%', width: `${v.progressPercent}%` }}></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          This Week <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>— After Class</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {thisWeek.length > 0 ? thisWeek.map(v => <VideoCard key={v.videoId} v={v} />) : <div style={{ color: 'rgba(255,255,255,0.3)' }}>No new videos this week.</div>}
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          Last Week
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {lastWeek.length > 0 ? lastWeek.map(v => <VideoCard key={v.videoId} v={v} />) : <div style={{ color: 'rgba(255,255,255,0.3)' }}>No videos last week.</div>}
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,183,3,0.2)', paddingBottom: '0.5rem' }}>
          Exam Revision <span style={{ fontSize: '1rem', color: 'rgba(255,183,3,0.5)', fontWeight: 400 }}>— {student.belt} Belt</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {examRevisionCurrent.map(v => <VideoCard key={v.videoId} v={v} />)}
          {examRevisionNext.map(v => <VideoCard key={v.videoId} v={v} locked />)}
        </div>
      </div>

      {/* Video Modal Overlay */}
      {activeVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)',
          zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '1rem', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>{activeVideo.title}</h3>
            <button onClick={closeVideo} style={{ background: 'var(--crimson)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
              CLOSE
            </button>
          </div>
          
          <div style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', background: '#000', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {embedUrl ? (
              <iframe 
                src={embedUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading Secure Player...</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
