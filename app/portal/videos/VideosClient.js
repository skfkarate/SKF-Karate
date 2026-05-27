'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Clock, Lock, Play, PlayCircle } from 'lucide-react'

import SecureContentWrapper from '@/app/_components/portal/SecureContentWrapper'
import YouTubeNativePlayer from '@/components/video/YouTubeNativePlayer'
import YouTubeThumbnail from '@/components/video/YouTubeThumbnail'
import { VideosPageSkeleton } from '../_components/skeletons/VideosPageSkeleton'
import { useNonce } from '@/components/NonceProvider'

function normalizeVideo(video) {
  return {
    ...video,
    id: String(video.id || video.youtubeId || video.title || ''),
    title: video.title || 'Untitled Training Video',
    duration: video.durationLabel || video.duration || '',
    category: String(video.category || 'techniques').toLowerCase(),
    locked: Boolean(video.locked),
    youtubeId: video.youtubeId,
    thumbnail: video.thumbnailUrl,
  }
}

function formatCategoryLabel(value) {
  return String(value || 'Training')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function VideosClient() {
  const [videos, setVideos] = useState([])
  const [progressData, setProgressData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [playingVideo, setPlayingVideo] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPortalVideos() {
      setIsLoading(true)
      setError('')

      try {
        const [videosRes, progressRes] = await Promise.all([
          fetch('/api/portal/videos', { cache: 'no-store' }),
          fetch('/api/portal/videos/progress', { cache: 'no-store' }),
        ])

        if (videosRes.status === 401 || progressRes.status === 401) {
          window.location.href = '/portal/login'
          return
        }

        if (!videosRes.ok) throw new Error('Unable to load training videos.')
        if (!progressRes.ok) throw new Error('Unable to load watch progress.')

        const [videosPayload, progressPayload] = await Promise.all([
          videosRes.json(),
          progressRes.json(),
        ])

        if (!cancelled) {
          setVideos((videosPayload.videos || []).map(normalizeVideo).filter((video) => video.id && video.youtubeId))
          setProgressData(progressPayload.data?.progressData || progressPayload.progressData || [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load training videos.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchPortalVideos()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (playingVideo) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [playingVideo])

  const progressByVideoId = useMemo(() => {
    return new Map(progressData.map((entry) => [String(entry.videoId), entry]))
  }, [progressData])

  const continueTraining = useMemo(() => {
    return videos
      .map((video) => ({ ...video, progress: progressByVideoId.get(video.id) }))
      .filter((video) => {
        const percent = Number(video.progress?.progressPercent || 0)
        return percent > 0 && percent < 100
      })
      .sort((a, b) => new Date(b.progress?.lastWatchedAt || 0).getTime() - new Date(a.progress?.lastWatchedAt || 0).getTime())
  }, [progressByVideoId, videos])

  const categories = useMemo(() => {
    return Array.from(new Set(videos.map((video) => video.category))).sort()
  }, [videos])

  async function saveProgress(videoId, progressPercent) {
    const safeProgress = Math.max(0, Math.min(100, Math.round(progressPercent)))
    setProgressData((current) => {
      const existing = current.find((entry) => String(entry.videoId) === String(videoId))
      const nextEntry = {
        videoId,
        progressPercent: safeProgress,
        completed: safeProgress >= 100,
        lastWatchedAt: new Date().toISOString(),
      }
      return existing
        ? current.map((entry) => String(entry.videoId) === String(videoId) ? nextEntry : entry)
        : [nextEntry, ...current]
    })

    try {
      await fetch('/api/portal/videos/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, progressPercent: safeProgress }),
      })
    } catch {
      // Keep local progress responsive; the next page load will reconcile from the server.
    }
  }

  return (
    <SecureContentWrapper>
      {isLoading ? (
        <VideosPageSkeleton />
      ) : (
      <div style={{ background: '#000', minHeight: '100vh', width: '100%', overflowX: 'hidden', paddingBottom: '6rem' }}>
        <header style={{ padding: '5rem 4% 2rem' }}>
          <h1 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.6rem, 6vw, 4.8rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Home Practice
          </h1>
          <p style={{ margin: '0.8rem 0 0', color: 'rgba(255,255,255,0.55)', maxWidth: 620, lineHeight: 1.6 }}>
            Belt, batch, and branch-specific training videos assigned to your athlete portal.
          </p>
        </header>

        {error ? (
          <div style={{ margin: '2rem 4%', padding: '2rem', borderRadius: 20, background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.25)', color: '#ffb4b4', fontWeight: 700 }}>
            {error}
          </div>
        ) : videos.length === 0 ? (
          <div style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
            <Lock size={56} color="rgba(255,255,255,0.2)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#fff', margin: 0 }}>No Content Available</h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', margin: 0 }}>Your branch videos will appear here once they are published.</p>
          </div>
        ) : (
          <main style={{ display: 'grid', gap: '3rem' }}>
            <VideoRow
              title="Continue Training"
              videos={continueTraining}
              progressByVideoId={progressByVideoId}
              onPlay={setPlayingVideo}
            />

            {categories.map((category) => (
              <VideoRow
                key={category}
                title={formatCategoryLabel(category)}
                videos={videos.filter((video) => video.category === category)}
                progressByVideoId={progressByVideoId}
                onPlay={setPlayingVideo}
              />
            ))}
          </main>
        )}

        <AnimatePresence>
          {playingVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '2rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', pointerEvents: 'none' }}>
                <button type="button" onClick={() => setPlayingVideo(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9, pointerEvents: 'auto' }}>
                  <ChevronLeft size={32} /> <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Back</span>
                </button>
              </div>

              <div style={{ flex: 1, width: '100%', height: '100%', background: '#000' }}>
                <YouTubeNativePlayer
                  youtubeId={playingVideo.youtubeId}
                  title={playingVideo.title}
                  posterUrl={playingVideo.thumbnail}
                  initialProgressPercent={Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0)}
                  onProgress={({ progressPercent }) => saveProgress(playingVideo.id, progressPercent)}
                  onEscape={() => setPlayingVideo(null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </SecureContentWrapper>
  )
}

function VideoRow({ title, videos, progressByVideoId, onPlay }) {
  const nonce = useNonce()

  if (!videos.length) return null

  return (
    <section>
      <h2 style={{ padding: '0 4%', margin: '0 0 1rem', color: '#e5e5e5', fontSize: '1.35rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlayCircle size={19} color="var(--gold, #ffb703)" />
        {title}
      </h2>
      <div className="kuroobi-scrollbar-hide" style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', padding: '0 4% 1rem', scrollBehavior: 'smooth' }}>
        {videos.map((video) => {
          const progress = Number(progressByVideoId.get(video.id)?.progressPercent || 0)
          return (
            <button
              key={`${title}-${video.id}`}
              type="button"
              onClick={() => !video.locked && onPlay(video)}
              style={{
                position: 'relative',
                flex: '0 0 clamp(230px, 24vw, 340px)',
                aspectRatio: '16 / 9',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#111',
                color: '#fff',
                cursor: video.locked ? 'not-allowed' : 'pointer',
                padding: 0,
                textAlign: 'left',
              }}
            >
              <YouTubeThumbnail youtubeId={video.youtubeId} alt={video.title} fill sizes="340px" style={{ objectFit: 'cover', filter: video.locked ? 'grayscale(100%) brightness(0.4)' : 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.86), transparent 58%)' }} />
              {progress > 0 && progress < 100 ? (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.2)' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#d62828' }} />
                </div>
              ) : null}
              <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '0.9rem' }}>
                <div style={{ fontWeight: 850, lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>{video.title}</div>
                <div style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.68)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {video.duration ? <><Clock size={13} /> {video.duration}</> : formatCategoryLabel(video.category)}
                </div>
              </div>
              {!video.locked ? (
                <span style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={17} fill="#000" />
                </span>
              ) : (
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={30} color="rgba(255,255,255,0.72)" />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <style nonce={nonce} dangerouslySetInnerHTML={{ __html: `
        .kuroobi-scrollbar-hide::-webkit-scrollbar { display: none; }
        .kuroobi-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </section>
  )
}
