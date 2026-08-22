'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'

import SecureContentWrapper from '@/app/_components/portal/SecureContentWrapper'
import YouTubeNativePlayer from '@/components/video/YouTubeNativePlayer'

type Lesson = {
  id: string
  title: string
  description: string
  lessonNote: string
  youtubeId: string
  thumbnailUrl: string
  contentFormat: 'landscape' | 'short'
}

export default function DirectPracticeLesson({ lesson }: { lesson: Lesson }) {
  const isShort = lesson.contentFormat === 'short'

  useEffect(() => {
    document.body.classList.add('portal-practice-detail')
    document.body.classList.add('portal-practice-player')
    return () => {
      document.body.classList.remove('portal-practice-detail')
      document.body.classList.remove('portal-practice-player')
    }
  }, [])

  return <SecureContentWrapper>
    <main style={{ minHeight: '100dvh', background: '#000', color: '#fff', padding: 'clamp(5rem, 8vw, 7rem) 4% 3rem' }}>
      <Link href="/portal/videos" style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}><ChevronLeft size={22} /> Home Practice</Link>
      <div style={{ width: isShort ? 'min(calc(100vw - 2rem), 33dvh)' : '100%', maxWidth: isShort ? 360 : 1120, margin: '1.5rem auto 0' }}>
        <h1 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>{lesson.title}</h1>
        <div style={{ position: 'relative', width: '100%', aspectRatio: isShort ? '9 / 16' : '16 / 9', background: '#050505', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 22px 65px rgba(0,0,0,0.5)' }}>
          <YouTubeNativePlayer youtubeId={lesson.youtubeId} title={lesson.title} posterUrl={lesson.thumbnailUrl} contentFormat={lesson.contentFormat} />
        </div>
        {lesson.description ? <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{lesson.description}</p> : null}
        {lesson.lessonNote ? <aside style={{ marginTop: '1rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', padding: '1rem 1.1rem' }}><div style={{ color: '#ffb703', fontSize: '0.7rem', fontWeight: 850, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instructor note</div><p style={{ margin: '0.45rem 0 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{lesson.lessonNote}</p></aside> : null}
      </div>
    </main>
  </SecureContentWrapper>
}
