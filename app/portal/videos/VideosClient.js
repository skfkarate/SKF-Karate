'use client'
/* eslint-disable @next/next/no-img-element -- protected Supabase images use short-lived signed URLs. */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Copy, Folder, FolderOpen, Image as ImageIcon, Lock, Play, PlayCircle, Search } from 'lucide-react'

import SecureContentWrapper from '@/app/_components/portal/SecureContentWrapper'
import YouTubeNativePlayer from '@/components/video/YouTubeNativePlayer'
import YouTubeThumbnail from '@/components/video/YouTubeThumbnail'
import { VideosPageSkeleton } from '../_components/skeletons/VideosPageSkeleton'
import { useNonce } from '@/components/NonceProvider'
import { redirectToCurrentPortalLogin } from '@/app/_components/portal/portalClientRedirect'

/**
 * Responsive + alignment layer for the Home Practice Library.
 * Kept beside the component because every rule here exists to make the
 * library behave like a streaming shelf (uniform tiles, snap rails,
 * viewport-fit player) across phones, tablets, and desktops.
 */
const PRACTICE_LIBRARY_CSS = `
.pv-main { display: grid; gap: 3rem; max-width: 1400px; margin: 0 auto; }
.pv-h2 {
  padding: 0 max(4%, 1rem); margin: 0 0 1rem; color: #f1f5f9;
  font-size: clamp(1.15rem, 1rem + 0.9vw, 1.3rem); font-weight: 850;
  display: flex; align-items: center; gap: 0.65rem;
}

/* Grids */
.pv-grid { display: grid; gap: 1.15rem; padding: 0 max(4%, 1rem) 1rem; align-items: start; }
.pv-grid-folders { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; padding-bottom: 0.5rem; }
.pv-grid-videos { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
.pv-grid-photos { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }

/* Folder view keeps one vertical rhythm between its stacked shelves */
.pv-folder-view > * + * { margin-top: 1.75rem; }

/* Netflix-style rail */
.pv-rail-wrap { position: relative; }
.pv-rail {
  display: flex; gap: 0.85rem; overflow-x: auto; align-items: stretch;
  padding: 0 max(4%, 1rem) 1rem;
  scroll-snap-type: x proximity; scroll-padding-left: max(4%, 1rem);
  -webkit-overflow-scrolling: touch;
}
.kuroobi-scrollbar-hide::-webkit-scrollbar { display: none; }
.kuroobi-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.pv-rail-arrow {
  position: absolute; top: 50%; transform: translateY(calc(-50% - 0.5rem));
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.18); background: rgba(10,10,12,0.85);
  color: #fff; display: none; align-items: center; justify-content: center;
  cursor: pointer; z-index: 2; box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  backdrop-filter: blur(8px); opacity: 0; transition: opacity 0.2s ease;
}
.pv-rail-arrow--left { left: 0.6rem; }
.pv-rail-arrow--right { right: 0.6rem; }
@media (hover: hover) and (min-width: 900px) {
  .pv-rail-arrow { display: flex; pointer-events: auto; }
  .pv-rail-wrap:hover .pv-rail-arrow, .pv-rail-arrow:focus-visible { opacity: 1; }
}

/* Interaction polish */
.pv-tap { -webkit-tap-highlight-color: transparent; }
.pv-focus:focus-visible { outline: 2px solid #ffb703; outline-offset: 2px; }
.pv-crumb {
  border: 0; background: transparent; cursor: pointer; padding: 0.35rem 0;
  font-size: 0.9rem; display: inline-flex; align-items: center; gap: 4px;
}

/* Video tile text */
.pv-video-overlay { position: absolute; left: 0.85rem; right: 0.85rem; bottom: 0.75rem; }
.pv-video-title {
  font-weight: 800; line-height: 1.25; font-size: 0.95rem;
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pv-video-title--sm { font-size: 0.8rem; }
.pv-video-meta { margin-top: 0.3rem; color: rgba(255,255,255,0.65); font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem; }

/* Search — 16px stops iOS Safari zoom-on-focus */
.practice-search:focus { border-color: rgba(255,183,3,0.55); background: rgba(255,255,255,0.08); }
.practice-search::placeholder { color: rgba(255,255,255,0.35); }
@media (max-width: 640px) { .practice-search { font-size: 16px; } }
.pv-clear { padding: 0.55rem 0.4rem; margin-right: 2px; }

/* Player — box always fits the viewport height (no giant scroll for shorts) */
.pv-player-bar {
  position: absolute; top: 0; left: 0; right: 0; z-index: 10;
  padding: max(0.75rem, env(safe-area-inset-top)) clamp(1rem, 4vw, 2rem) 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
  pointer-events: none; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
}
.pv-viewer {
  --pv-chrome: 11.5rem;
  flex: 1; width: 100%; min-height: 0;
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; overscroll-behavior: contain;
  padding: max(4.5rem, calc(env(safe-area-inset-top) + 4rem)) max(4%, 1rem) max(2rem, env(safe-area-inset-bottom));
}
.pv-player-col { width: 100%; display: flex; flex-direction: column; gap: 1.25rem; margin: 0 auto; }
.pv-player-col--wide {
  max-width: min(1280px, calc((100vh - var(--pv-chrome)) * 16 / 9));
  max-width: min(1280px, calc((100dvh - var(--pv-chrome)) * 16 / 9));
}
.pv-player-col--short {
  max-width: min(440px, calc((100vh - var(--pv-chrome)) * 9 / 16));
  max-width: min(440px, calc((100dvh - var(--pv-chrome)) * 9 / 16));
}
.pv-player-title { margin: 0; color: #fff; font-size: clamp(1.05rem, 1rem + 1vw, 1.8rem); line-height: 1.25; font-weight: 850; }
.pv-player-box {
  position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden;
  border-radius: clamp(12px, 2vw, 24px); border: 1px solid rgba(255,255,255,0.12);
  background: #000; box-shadow: 0 25px 70px rgba(0,0,0,0.85);
}
.pv-player-box--short { aspect-ratio: 9 / 16; }
.pv-note {
  margin-top: 0.25rem; border-radius: 20px; border: 1px solid rgba(255,183,3,0.2);
  background: linear-gradient(145deg, rgba(25,25,28,0.85), rgba(14,14,16,0.95));
  padding: 1.25rem 1.5rem; color: #fff; box-shadow: 0 12px 36px rgba(0,0,0,0.4);
  backdrop-filter: blur(12px);
}

/* ---------- Breakpoints ---------- */
@media (max-width: 640px) {
  .pv-main { gap: 2.25rem; }
  .pv-grid { gap: 0.75rem; }
  .pv-grid-videos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pv-grid-photos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pv-grid-folders { grid-template-columns: 1fr; }
  .pv-video-overlay { left: 0.6rem; right: 0.6rem; bottom: 0.55rem; }
  .pv-video-title { font-size: 0.8rem; }
  .pv-video-title--sm { font-size: 0.74rem; }
  .pv-note { padding: 1rem 1.1rem; border-radius: 16px; }
}
@media (max-width: 380px) {
  .pv-grid { gap: 0.6rem; }
  .pv-video-title { font-size: 0.76rem; }
}
@media (orientation: landscape) and (max-height: 500px) {
  .pv-viewer { --pv-chrome: 8rem; padding-top: 4.25rem; }
  .pv-player-title { font-size: 1rem; }
  .pv-player-col { gap: 0.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .pv-photo-img { transition: none !important; transform: none !important; }
}
`

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
    contentFormat: video.contentFormat === 'short' ? 'short' : 'landscape',
  }
}

function formatCategoryLabel(value) {
  return String(value || 'Training')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function normaliseLibraryPayload(payload) {
  return {
    folders: (payload?.folders || []).map((folder) => ({
      ...folder,
      id: String(folder.id || ''),
      title: folder.title || 'Home Practice',
      videos: (folder.videos || []).map(normalizeVideo).filter((video) => video.id && video.youtubeId),
      photos: (folder.photos || []).filter((photo) => photo.id && photo.imageUrl),
    })).filter((folder) => folder.id),
    unfiledVideos: (payload?.unfiledVideos || []).map(normalizeVideo).filter((video) => video.id && video.youtubeId),
    unfiledPhotos: (payload?.unfiledPhotos || []).filter((photo) => photo.id && photo.imageUrl),
    progressData: payload?.progressData || [],
    recentCutoff: String(payload?.recentlyAddedCutoff || ''),
  }
}

export default function VideosClient({ initialPayload = null }) {
  const nonce = useNonce()
  const initialLibrary = useMemo(() => initialPayload ? normaliseLibraryPayload(initialPayload) : null, [initialPayload])
  const [folders, setFolders] = useState(() => initialLibrary?.folders || [])
  const [unfiledVideos, setUnfiledVideos] = useState(() => initialLibrary?.unfiledVideos || [])
  const [unfiledPhotos, setUnfiledPhotos] = useState(() => initialLibrary?.unfiledPhotos || [])
  const [progressData, setProgressData] = useState(() => initialLibrary?.progressData || [])
  const [isLoading, setIsLoading] = useState(() => !initialLibrary)
  const [error, setError] = useState('')
  const [playingVideo, setPlayingVideo] = useState(null)
  const [activeFolder, setActiveFolder] = useState(null)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [recentCutoff, setRecentCutoff] = useState(() => initialLibrary?.recentCutoff || '')
  const viewerScrollRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPortalVideos() {
      if (!initialPayload) setIsLoading(true)
      if (!initialPayload) setError('')

      try {
        const videosRes = await fetch('/api/portal/videos', { cache: 'no-store' })

        if (videosRes.status === 401) {
          redirectToCurrentPortalLogin()
          return
        }

        if (!videosRes.ok) throw new Error('Unable to load training videos.')

        const videosPayload = await videosRes.json()

        if (!cancelled) {
          const nextLibrary = normaliseLibraryPayload(videosPayload)
          setFolders(nextLibrary.folders)
          setUnfiledVideos(nextLibrary.unfiledVideos)
          setUnfiledPhotos(nextLibrary.unfiledPhotos)
          setProgressData(nextLibrary.progressData)
          setRecentCutoff(nextLibrary.recentCutoff)
        }
      } catch (loadError) {
        if (!cancelled && !initialPayload) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load training videos.')
        }
      } finally {
        if (!cancelled && !initialPayload) setIsLoading(false)
      }
    }

    void fetchPortalVideos()
    return () => {
      cancelled = true
    }
  }, [initialPayload])

  useEffect(() => {
    if (playingVideo) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [playingVideo])

  useEffect(() => {
    const isInsidePracticeDetail = Boolean(activeFolder || playingVideo)
    document.body.classList.toggle('portal-practice-detail', isInsidePracticeDetail)
    document.body.classList.toggle('portal-practice-player', Boolean(playingVideo))
    return () => {
      document.body.classList.remove('portal-practice-detail')
      document.body.classList.remove('portal-practice-player')
    }
  }, [activeFolder, playingVideo])

  useEffect(() => {
    if (!playingVideo) return
    const frame = window.requestAnimationFrame(() => viewerScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
    return () => window.cancelAnimationFrame(frame)
  }, [playingVideo])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [activeFolder?.id])

  const progressByVideoId = useMemo(() => {
    return new Map(progressData.map((entry) => [String(entry.videoId), entry]))
  }, [progressData])

  const videos = useMemo(() => [...folders.flatMap((folder) => folder.videos), ...unfiledVideos], [folders, unfiledVideos])
  const hasContent = Boolean(videos.length || folders.some((folder) => folder.photos?.length) || unfiledPhotos.length)

  const continueTraining = useMemo(() => {
    return videos
      .map((video) => ({ ...video, progress: progressByVideoId.get(video.id) }))
      .filter((video) => {
        const percent = Number(video.progress?.progressPercent || 0)
        return percent > 0 && percent < 100
      })
      .sort((a, b) => new Date(b.progress?.lastWatchedAt || 0).getTime() - new Date(a.progress?.lastWatchedAt || 0).getTime())
  }, [progressByVideoId, videos])

  const recentVideos = useMemo(() => {
    return [...videos]
      .filter((video) => !recentCutoff || new Date(video.createdAt || 0).getTime() >= new Date(recentCutoff).getTime())
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
      .slice(0, 12)
  }, [recentCutoff, videos])

  const searchedLibrary = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase()
    if (!query) return { folders, unfiledVideos, unfiledPhotos }
    const matches = (value) => String(value || '').toLowerCase().includes(query)
    const matchingFolders = folders.filter((folder) => (
      matches(folder.title) || matches(folder.description) || folder.videos.some((video) => (
        matches(video.title) || matches(video.description) || matches(video.category)
      )) || folder.photos.some((photo) => matches(photo.title) || matches(photo.description))
    ))
    return {
      folders: matchingFolders,
      unfiledVideos: unfiledVideos.filter((video) => matches(video.title) || matches(video.description) || matches(video.category)),
      unfiledPhotos: unfiledPhotos.filter((photo) => matches(photo.title) || matches(photo.description)),
    }
  }, [folders, libraryQuery, unfiledPhotos, unfiledVideos])

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
      // Keep local progress responsive
    }
  }

  function toggleCompletion(video) {
    const current = Number(progressByVideoId.get(video.id)?.progressPercent || 0)
    void saveProgress(video.id, current >= 100 ? 0 : 100)
  }

  async function copyLessonLink(video) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/portal/videos/${encodeURIComponent(video.id)}`)
    } catch {
      // Convenience action
    }
  }

  function closePlayerToLibrary() {
    setPlayingVideo(null)
    setActiveFolder(null)
  }

  // Calculate breadcrumbs for active folder view
  const folderBreadcrumbs = useMemo(() => {
    if (!activeFolder) return []
    const crumbs = []
    let curr = activeFolder
    while (curr) {
      crumbs.unshift(curr)
      curr = folders.find((f) => f.id === curr.parentFolderId)
    }
    return crumbs
  }, [activeFolder, folders])

  const rootFolders = useMemo(() => {
    const availableIds = new Set(searchedLibrary.folders.map((folder) => folder.id))
    return searchedLibrary.folders.filter((folder) => !folder.parentFolderId || !availableIds.has(folder.parentFolderId))
  }, [searchedLibrary.folders])

  const childFolders = useMemo(() => activeFolder
    ? folders.filter((folder) => folder.parentFolderId === activeFolder.id)
    : [], [activeFolder, folders])

  return (
    <SecureContentWrapper>
      <MotionConfig reducedMotion="user">
      {isLoading ? (
        <VideosPageSkeleton />
      ) : (
      <div style={{ background: '#030712', color: '#fff', minHeight: '100dvh', width: '100%', overflowX: 'hidden', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: PRACTICE_LIBRARY_CSS }} />
        {!activeFolder ? (
          <header style={{ padding: 'clamp(2.5rem, 6vw, 4.5rem) max(4%, 1rem) 2rem', maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)', padding: '0.4rem 0.85rem', borderRadius: 99, color: '#ffb703', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              <PlayCircle size={14} /> SKF Practice Portal
            </div>
            <h1 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Home Practice Library
            </h1>
            <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.6)', maxWidth: 640, lineHeight: 1.6, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
              Explore personally assigned karate drills, syllabus videos, and technique photo guides to refine your martial arts practice.
            </p>
            <div style={{ position: 'relative', maxWidth: 480, marginTop: '1.5rem' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input 
                value={libraryQuery} 
                onChange={(event) => setLibraryQuery(event.target.value)} 
                placeholder="Search techniques, drills, or folders..." 
                aria-label="Search practice library" 
                className="practice-search"
                style={{ 
                  width: '100%', 
                  minHeight: 48, 
                  boxSizing: 'border-box', 
                  borderRadius: 14, 
                  border: '1px solid rgba(255,255,255,0.12)', 
                  background: 'rgba(255,255,255,0.05)', 
                  color: '#fff', 
                  padding: '0.75rem 1rem 0.75rem 2.8rem', 
                  fontSize: '0.95rem',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }} 
              />
              {libraryQuery ? (
                <button
                  type="button"
                  onClick={() => setLibraryQuery('')}
                  className="pv-clear pv-tap pv-focus"
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </header>
        ) : null}

        {error ? (
          <div style={{ padding: '2rem max(4%, 1rem)' }}>
            <div role="alert" style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem', borderRadius: 18, background: 'rgba(214,40,40,0.12)', border: '1px solid rgba(214,40,40,0.3)', color: '#ffb4b4', fontWeight: 700 }}>
              {error}
            </div>
          </div>
        ) : !hasContent ? (
          <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Lock size={48} color="rgba(255,255,255,0.3)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: '#fff', margin: 0, fontWeight: 800 }}>No Practice Videos Found</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: 420, lineHeight: 1.5 }}>Your branch practice library is empty or content is currently hidden.</p>
          </div>
        ) : (
          <main className="pv-main">
            {activeFolder ? (
              <section className="pv-folder-view">
                <div style={{ padding: 'max(1.25rem, env(safe-area-inset-top)) max(4%, 1rem) 0' }}>
                  {/* Breadcrumbs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveFolder(null)}
                      className="pv-crumb pv-tap pv-focus"
                      style={{ color: '#ffb703', fontWeight: 700 }}
                    >
                      <ChevronLeft size={16} /> Home Practice
                    </button>
                    {folderBreadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.id}>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>/</span>
                        {idx === folderBreadcrumbs.length - 1 ? (
                          <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', padding: '0.35rem 0' }}>{crumb.title}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveFolder(crumb)}
                            className="pv-crumb pv-tap pv-focus"
                            style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}
                          >
                            {crumb.title}
                          </button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', lineHeight: 1.15, fontWeight: 900, letterSpacing: '-0.02em' }}>{activeFolder.title}</h2>
                  {activeFolder.description ? <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0.6rem 0 0', maxWidth: 720, lineHeight: 1.6 }}>{activeFolder.description}</p> : null}
                </div>

                <FolderRail title="Subfolders" folders={childFolders} allFolders={folders} progressByVideoId={progressByVideoId} onOpen={setActiveFolder} />
                <VideoRow title="Videos" videos={activeFolder.videos} progressByVideoId={progressByVideoId} onPlay={setPlayingVideo} />
                <PhotoRow title="Photo Guides" photos={activeFolder.photos || []} />
              </section>
            ) : (
              <>
                <VideoRow
                  title="Continue Watching"
                  videos={libraryQuery ? continueTraining.filter((video) => String(video.title).toLowerCase().includes(libraryQuery.trim().toLowerCase())) : continueTraining}
                  progressByVideoId={progressByVideoId}
                  onPlay={setPlayingVideo}
                  compact
                />
                {!libraryQuery ? <VideoRow title="Recently Added" videos={recentVideos} progressByVideoId={progressByVideoId} onPlay={setPlayingVideo} compact /> : null}
                <FolderRail folders={rootFolders} allFolders={searchedLibrary.folders} progressByVideoId={progressByVideoId} onOpen={setActiveFolder} />

                <VideoRow title="General Videos" videos={searchedLibrary.unfiledVideos} progressByVideoId={progressByVideoId} onPlay={setPlayingVideo} />
                <PhotoRow title="Photo Guides" photos={searchedLibrary.unfiledPhotos} />
                {libraryQuery && !searchedLibrary.folders.length && !searchedLibrary.unfiledVideos.length && !searchedLibrary.unfiledPhotos.length ? (
                  <p style={{ padding: '0 max(4%, 1rem)', margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>No practice content matches “{libraryQuery}”.</p>
                ) : null}
              </>
            )}
          </main>
        )}

        {typeof document !== 'undefined' ? createPortal(
          <AnimatePresence>
            {playingVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}
              >
                {/* Header bar */}
                <div className="pv-player-bar">
                  <button type="button" onClick={closePlayerToLibrary} className="pv-tap pv-focus" style={{ minHeight: 42, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'auto', backdropFilter: 'blur(10px)' }}>
                    <ChevronLeft size={20} /> Back
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
                    <button type="button" onClick={() => toggleCompletion(playingVideo)} className="pv-tap pv-focus" style={{ minHeight: 42, background: Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0) >= 100 ? 'rgba(28,154,97,0.3)' : 'rgba(255,255,255,0.08)', border: Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0) >= 100 ? '1px solid #1c9a61' : '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.85rem', fontWeight: 700, fontSize: '0.88rem', backdropFilter: 'blur(10px)' }}>
                      <CheckCircle2 size={16} color={Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0) >= 100 ? '#2ecc71' : '#fff'} />
                      <span className="practice-complete-label">{Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0) >= 100 ? 'Completed' : 'Complete'}</span>
                    </button>
                    <button type="button" onClick={() => copyLessonLink(playingVideo)} className="pv-tap pv-focus" style={{ minHeight: 42, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 0.85rem', fontWeight: 700, fontSize: '0.88rem', backdropFilter: 'blur(10px)' }}>
                      <Copy size={16} /> <span className="practice-copy-label">Share</span>
                    </button>
                  </div>
                </div>

                <div ref={viewerScrollRef} className="pv-viewer">
                  <div className={`pv-player-col ${playingVideo.contentFormat === 'short' ? 'pv-player-col--short' : 'pv-player-col--wide'}`}>
                    <h1 className="pv-player-title">{playingVideo.title}</h1>
                    <div className={`pv-player-box ${playingVideo.contentFormat === 'short' ? 'pv-player-box--short' : ''}`}>
                      <YouTubeNativePlayer
                        youtubeId={playingVideo.youtubeId}
                        title={playingVideo.title}
                        posterUrl={playingVideo.thumbnail}
                        initialProgressPercent={Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0)}
                        contentFormat={playingVideo.contentFormat}
                        onProgress={({ progressPercent }) => saveProgress(playingVideo.id, progressPercent)}
                        onEscape={closePlayerToLibrary}
                      />
                    </div>
                    {playingVideo.lessonNote ? (
                      <aside className="pv-note">
                        <div style={{ color: '#ffb703', fontSize: '0.75rem', fontWeight: 850, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffb703', boxShadow: '0 0 10px #ffb703' }} /> Instructor Note
                        </div>
                        <p style={{ margin: '0.65rem 0 0', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{playingVideo.lessonNote}</p>
                      </aside>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        ) : null}
      </div>
      )}
      </MotionConfig>
    </SecureContentWrapper>
  )
}

function FolderRail({ folders, allFolders, progressByVideoId, onOpen, title = 'Your Practice Library' }) {
  if (!folders.length) return null
  return (
    <section>
      <h2 className="pv-h2">
        <FolderOpen size={20} color="#ffb703" /> {title}
      </h2>
      <div className="pv-grid pv-grid-folders">
        {folders.map((folder) => {
          const subfolderCount = (allFolders || []).filter((candidate) => candidate.parentFolderId === folder.id).length
          const totalItems = folder.videos.length + (folder.photos?.length || 0)
          const completedCount = folder.videos.filter((video) => Number(progressByVideoId.get(video.id)?.progressPercent || 0) >= 100).length
          
          return (
            <motion.button 
              key={folder.id} 
              type="button" 
              onClick={() => onOpen(folder)} 
              className="pv-tap pv-focus"
              whileHover={{ y: -3, borderColor: 'rgba(255,183,3,0.4)', backgroundColor: 'rgba(30,30,35,0.9)' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                overflow: 'hidden', 
                borderRadius: 16, 
                border: '1px solid rgba(255,183,3,0.15)', 
                background: 'linear-gradient(145deg, rgba(24,24,27,0.8), rgba(12,12,14,0.9))', 
                padding: '1.15rem 1.25rem', 
                textAlign: 'left', 
                color: '#fff', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.1rem', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)', 
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                backdropFilter: 'blur(10px)'
              }} 
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,183,3,0.12)', border: '1px solid rgba(255,183,3,0.25)', borderRadius: 14, padding: '0.8rem', flexShrink: 0 }}>
                <Folder size={26} strokeWidth={2} color="#ffb703" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0, justifyContent: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.3 }}>
                  {subfolderCount ? `${subfolderCount} subfolders · ` : ''}{totalItems} items {folder.videos.length > 0 ? `· ${completedCount}/${folder.videos.length} done` : ''}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function PhotoRow({ title, photos }) {
  if (!photos.length) return null
  return (
    <section>
      <h2 className="pv-h2">
        <ImageIcon size={20} color="#ffb703" /> {title}
      </h2>
      <div className="pv-grid pv-grid-photos">
        {photos.map((photo) => (
            <a key={photo.id} href={photo.imageUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
              <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 14, background: '#171717', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img className="pv-photo-img" src={photo.imageUrl} alt={photo.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />
            </div>
            <div style={{ fontWeight: 750, marginTop: 8, fontSize: '0.95rem' }}>{photo.title}</div>
            {photo.description ? <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: 2, fontSize: '0.82rem' }}>{photo.description}</div> : null}
          </a>
        ))}
      </div>
    </section>
  )
}

function VideoRow({ title, videos, progressByVideoId, onPlay, compact = false }) {
  const railRef = useRef(null)

  if (!videos.length) return null

  // Netflix-style paging: arrows glide the rail by roughly one viewport width.
  function pageRail(direction) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * rail.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section>
      <h2 className="pv-h2">
        <PlayCircle size={20} color="#ffb703" />
        {title}
      </h2>
      {compact ? (
        <div className="pv-rail-wrap">
          <div ref={railRef} className="pv-rail kuroobi-scrollbar-hide">
            {videos.map((video) => (
              <VideoTile
                key={`${title}-${video.id}`}
                video={video}
                progressByVideoId={progressByVideoId}
                onPlay={onPlay}
                variant="rail"
                sizes="(max-width: 640px) 62vw, 320px"
              />
            ))}
          </div>
          <button type="button" aria-label={`Scroll ${title} backwards`} className="pv-rail-arrow pv-rail-arrow--left pv-tap pv-focus" onClick={() => pageRail(-1)}>
            <ChevronLeft size={22} />
          </button>
          <button type="button" aria-label={`Scroll ${title} forwards`} className="pv-rail-arrow pv-rail-arrow--right pv-tap pv-focus" onClick={() => pageRail(1)}>
            <ChevronRight size={22} />
          </button>
        </div>
      ) : (
        <div className="pv-grid pv-grid-videos">
          {videos.map((video) => (
            <VideoTile
              key={`${title}-${video.id}`}
              video={video}
              progressByVideoId={progressByVideoId}
              onPlay={onPlay}
              variant="grid"
              sizes="(max-width: 640px) 46vw, 380px"
            />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * One uniform 16/9 tile — the same footprint in rails and grids so every
 * shelf reads as a straight line, exactly like a streaming service.
 * Shorts are centre-cropped for their thumbnail but always open in their
 * native 9/16 player.
 */
function VideoTile({ video, progressByVideoId, onPlay, variant, sizes }) {
  const compact = variant === 'rail'
  const progress = Number(progressByVideoId.get(video.id)?.progressPercent || 0)

  return (
    <motion.button
      type="button"
      onClick={() => !video.locked && onPlay(video)}
      className="pv-tap pv-focus"
      whileHover={!video.locked ? { y: -4, scale: 1.01 } : undefined}
      whileTap={!video.locked ? { scale: 0.97 } : undefined}
      style={{
        position: 'relative',
        flex: compact ? '0 0 clamp(230px, 62vw, 320px)' : undefined,
        minWidth: 0,
        width: '100%',
        scrollSnapAlign: compact ? 'start' : undefined,
        aspectRatio: '16 / 9',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#0d0d0f',
        color: '#fff',
        cursor: video.locked ? 'not-allowed' : 'pointer',
        padding: 0,
        textAlign: 'left',
        boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
      }}
    >
      <YouTubeThumbnail youtubeId={video.youtubeId} alt={video.title} fill sizes={sizes} style={{ objectFit: 'cover', filter: video.locked ? 'grayscale(100%) brightness(0.35)' : 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

      {progress > 0 && progress < 100 ? (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.2)' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#d62828' }} />
        </div>
      ) : null}

      {progress >= 100 ? (
        <span title="Completed" aria-label="Completed" style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', width: 28, height: 28, borderRadius: '50%', background: '#1c9a61', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
          <CheckCircle2 size={17} />
        </span>
      ) : null}

      <div className="pv-video-overlay">
        <div className={compact ? 'pv-video-title pv-video-title--sm' : 'pv-video-title'}>{video.title}</div>
        {video.duration || video.category ? (
          <div className="pv-video-meta">
            {video.duration ? <><Clock size={12} /> {video.duration}</> : formatCategoryLabel(video.category)}
          </div>
        ) : null}
      </div>

      {!video.locked ? (
        <span style={{ position: 'absolute', top: '0.65rem', right: '0.65rem', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
          <Play size={14} fill="#000" style={{ marginLeft: 2 }} />
        </span>
      ) : (
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={28} color="rgba(255,255,255,0.7)" />
        </span>
      )}
    </motion.button>
  )
}
