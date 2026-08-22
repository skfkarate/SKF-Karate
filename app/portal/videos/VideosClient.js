'use client'
/* eslint-disable @next/next/no-img-element -- protected Supabase images use short-lived signed URLs. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, Clock, Copy, Folder, FolderOpen, Lock, Play, PlayCircle, Search } from 'lucide-react'

import SecureContentWrapper from '@/app/_components/portal/SecureContentWrapper'
import YouTubeNativePlayer from '@/components/video/YouTubeNativePlayer'
import YouTubeThumbnail from '@/components/video/YouTubeThumbnail'
import { VideosPageSkeleton } from '../_components/skeletons/VideosPageSkeleton'
import { useNonce } from '@/components/NonceProvider'
import { redirectToCurrentPortalLogin } from '@/app/_components/portal/portalClientRedirect'

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
    })).filter((folder) => folder.id && (folder.videos.length || folder.photos.length)),
    unfiledVideos: (payload?.unfiledVideos || []).map(normalizeVideo).filter((video) => video.id && video.youtubeId),
    unfiledPhotos: (payload?.unfiledPhotos || []).filter((photo) => photo.id && photo.imageUrl),
    progressData: payload?.progressData || [],
    recentCutoff: String(payload?.recentlyAddedCutoff || ''),
  }
}

export default function VideosClient({ initialPayload = null }) {
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

  // The portal shell has a global "Home Page" affordance. Once a learner is
  // inside this nested experience, the local back action is clearer and avoids
  // two competing ways to leave the screen.
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

  // Folder navigation is client-side, so browsers otherwise preserve the
  // scroll position from the library. Always begin a syllabus section at its
  // own heading, just as a normal page navigation would.
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
      // Keep local progress responsive; the next page load will reconcile from the server.
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
      // Sharing is an optional convenience action; playback remains available.
    }
  }

  function closePlayerToLibrary() {
    setPlayingVideo(null)
    setActiveFolder(null)
  }

  function goBackFromFolder() {
    const parent = folders.find((folder) => folder.id === activeFolder?.parentFolderId)
    setActiveFolder(parent || null)
  }

  const rootFolders = useMemo(() => {
    const availableIds = new Set(searchedLibrary.folders.map((folder) => folder.id))
    return searchedLibrary.folders.filter((folder) => !folder.parentFolderId || !availableIds.has(folder.parentFolderId))
  }, [searchedLibrary.folders])

  const childFolders = useMemo(() => activeFolder
    ? folders.filter((folder) => folder.parentFolderId === activeFolder.id)
    : [], [activeFolder, folders])

  return (
    <SecureContentWrapper>
      {isLoading ? (
        <VideosPageSkeleton />
      ) : (
      <div style={{ background: '#000', minHeight: '100dvh', width: '100%', overflowX: 'hidden', paddingBottom: '6rem' }}>
        {!activeFolder ? <header style={{ padding: '5rem 4% 2rem' }}>
          <h1 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.6rem, 6vw, 4.8rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Home Practice Videos
          </h1>
          <p style={{ margin: '0.8rem 0 0', color: 'rgba(255,255,255,0.55)', maxWidth: 620, lineHeight: 1.6 }}>
            Your belt-based practice library, personally assigned by your instructor.
          </p>
          <label style={{ display: 'block', position: 'relative', maxWidth: 440, marginTop: '1.25rem' }}>
            <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)' }} />
            <input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search your practice library" aria-label="Search your practice library" style={{ width: '100%', minHeight: 44, boxSizing: 'border-box', borderRadius: 12, border: '1px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.65rem 0.85rem 0.65rem 2.6rem', outline: 'none' }} />
          </label>
        </header> : null}

        {error ? (
          <div style={{ margin: '2rem 4%', padding: '2rem', borderRadius: 20, background: 'rgba(214,40,40,0.1)', border: '1px solid rgba(214,40,40,0.25)', color: '#ffb4b4', fontWeight: 700 }}>
            {error}
          </div>
        ) : !hasContent ? (
          <div style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
            <Lock size={56} color="rgba(255,255,255,0.2)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#fff', margin: 0 }}>No Content Available</h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', margin: 0 }}>Your branch videos will appear here once they are published.</p>
          </div>
        ) : (
          <main style={{ display: 'grid', gap: '3rem' }}>
            {activeFolder ? (
              <section>
                <div style={{ padding: 'max(1.25rem, env(safe-area-inset-top)) 4% 0', marginBottom: '1rem' }}>
                  <button type="button" onClick={goBackFromFolder} style={{ minHeight: 44, border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', padding: '0.35rem 0', display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 800 }} aria-label="Back to Home Practice"><ChevronLeft size={24} /> {activeFolder.parentFolderId ? 'Back to folder' : 'Home Practice'}</button>
                  <h2 style={{ margin: '0.7rem 0 0', fontSize: 'clamp(1.6rem, 6vw, 2rem)', lineHeight: 1.15 }}>{activeFolder.title}</h2>
                </div>
                {activeFolder.description ? <p style={{ padding: '0 4%', color: 'rgba(255,255,255,0.62)', margin: '0 0 1.2rem', maxWidth: 680 }}>{activeFolder.description}</p> : null}
                <FolderRail title="Folders" folders={childFolders} allFolders={folders} progressByVideoId={progressByVideoId} onOpen={setActiveFolder} />
                <VideoRow title="Videos" videos={activeFolder.videos} progressByVideoId={progressByVideoId} onPlay={setPlayingVideo} />
                <PhotoRow title="Photo guides" photos={activeFolder.photos || []} />
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
                {!libraryQuery ? <VideoRow title="Recently Added · Last 30 Days" videos={recentVideos} progressByVideoId={progressByVideoId} onPlay={setPlayingVideo} compact /> : null}
                <FolderRail folders={rootFolders} allFolders={searchedLibrary.folders} progressByVideoId={progressByVideoId} onOpen={setActiveFolder} />

                <VideoRow title="Videos" videos={searchedLibrary.unfiledVideos} progressByVideoId={progressByVideoId} onPlay={setPlayingVideo} />
                <PhotoRow title="Photo guides" photos={searchedLibrary.unfiledPhotos} />
                {libraryQuery && !searchedLibrary.folders.length && !searchedLibrary.unfiledVideos.length && !searchedLibrary.unfiledPhotos.length ? <p style={{ padding: '0 4%', margin: 0, color: 'rgba(255,255,255,0.55)' }}>No practice content matches “{libraryQuery}”.</p> : null}
              </>
            )}
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
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: 'max(0.75rem, env(safe-area-inset-top)) clamp(0.75rem, 4vw, 1.25rem) 1.25rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                <button type="button" onClick={closePlayerToLibrary} style={{ minHeight: 44, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9, pointerEvents: 'auto' }}><ChevronLeft size={32} /> <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Home Practice</span></button>
                <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}><button type="button" onClick={() => toggleCompletion(playingVideo)} style={{ minHeight: 44, background: Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0) >= 100 ? 'rgba(30,150,95,0.28)' : 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.75rem', fontWeight: 700 }}><CheckCircle2 size={16} /><span className="practice-complete-label">{Number(progressByVideoId.get(playingVideo.id)?.progressPercent || 0) >= 100 ? 'Completed' : 'Complete'}</span></button><button type="button" onClick={() => copyLessonLink(playingVideo)} style={{ minHeight: 44, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.75rem', fontWeight: 700 }}><Copy size={16} /> <span className="practice-copy-label">Copy link</span></button></div>
              </div>

              <div ref={viewerScrollRef} style={{ flex: 1, width: '100%', minHeight: 0, background: '#000', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: 'max(5rem, calc(env(safe-area-inset-top) + 4.25rem)) clamp(0.75rem, 2vw, 2rem) max(1rem, env(safe-area-inset-bottom))' }}>
                <div style={{ width: playingVideo.contentFormat === 'short' ? 'min(calc(100vw - 1.5rem), 33dvh)' : 'min(calc(100vw - 1.5rem), 112dvh)', maxWidth: playingVideo.contentFormat === 'short' ? 360 : 1520 }}>
                  <h1 style={{ margin: '0 0 0.8rem', color: '#fff', fontSize: 'clamp(1.1rem, 2.3vw, 1.55rem)', lineHeight: 1.25, fontWeight: 850 }}>{playingVideo.title}</h1>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: playingVideo.contentFormat === 'short' ? '9 / 16' : '16 / 9', overflow: 'hidden', borderRadius: 'clamp(14px, 2vw, 22px)', border: '1px solid rgba(255,255,255,0.12)', background: '#070707', boxShadow: '0 24px 70px rgba(0,0,0,0.58)' }}>
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
                  {playingVideo.lessonNote ? <aside style={{ marginTop: '0.9rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', padding: '1rem 1.1rem', color: '#fff' }}><div style={{ color: '#ffb703', fontSize: '0.7rem', fontWeight: 850, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Instructor note</div><p style={{ margin: '0.45rem 0 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{playingVideo.lessonNote}</p></aside> : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </SecureContentWrapper>
  )
}

function formatBeltLabel(value) {
  const labels = {
    white: 'White Belt · 10th Kyu',
    yellow: 'Yellow Belt · 9th Kyu',
    orange: 'Orange Belt · 8th Kyu',
    'green-ii': 'Green II · 7th Kyu',
    'green-i': 'Green I · 6th Kyu',
    blue: 'Blue Belt · 5th Kyu',
    purple: 'Purple Belt · 4th Kyu',
    'brown-iii': 'Brown III · 3rd Kyu',
    'brown-ii': 'Brown II · 2nd Kyu',
    'brown-i': 'Brown I · 1st Kyu',
    black: 'Black Belt · Dan',
  }
  const key = String(value || '').trim().toLowerCase().replace(/\bbelt\b/g, '').trim().replace(/[\s_]+/g, '-')
  return labels[key] || String(value || '').replace(/\b\w/g, (letter) => letter.toUpperCase()).replace(/\s*Belt$/i, '')
}

function folderBeltLabel(folder) {
  const belts = folder.beltLevels || []
  if (!belts.length) return 'All Belts'
  return belts.map(formatBeltLabel).join(' · ')
}

function FolderRail({ folders, allFolders, progressByVideoId, onOpen, title = 'Your Practice Library' }) {
  if (!folders.length) return null
  return <section>
    <h2 style={{ padding: '0 4%', margin: '0 0 1rem', color: '#e5e5e5', fontSize: '1.35rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FolderOpen size={19} color="var(--gold, #ffb703)" /> {title}</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', padding: '0 4% 0.8rem' }}>
      {folders.map((folder) => <button key={folder.id} type="button" onClick={() => onOpen(folder)} style={{ flex: '0 0 clamp(246px, 72vw, 360px)', aspectRatio: '1.22 / 1', overflow: 'hidden', borderRadius: 18, border: '1px solid rgba(255,183,3,0.24)', background: 'radial-gradient(circle at 50% 25%, rgba(255,183,3,0.12), transparent 46%), linear-gradient(145deg, #1a1a1a, #0d0d0d)', padding: '1.15rem', textAlign: 'left', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 16px 30px rgba(0,0,0,0.22)' }}>
        <Folder size={56} strokeWidth={1.45} color="#ffb703" />
        <div><div style={{ color: '#ffb703', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 5 }}>{folderBeltLabel(folder)}</div><div style={{ fontWeight: 850, fontSize: '1.14rem' }}>{folder.title}</div><div style={{ color: 'rgba(255,255,255,0.66)', fontSize: '0.8rem', marginTop: 5 }}>{(allFolders || []).filter((candidate) => candidate.parentFolderId === folder.id).length ? `${(allFolders || []).filter((candidate) => candidate.parentFolderId === folder.id).length} subfolders · ` : ''}{folder.videos.length + (folder.photos?.length || 0)} items · {folder.videos.filter((video) => Number(progressByVideoId.get(video.id)?.progressPercent || 0) >= 100).length}/{folder.videos.length} videos complete</div></div>
      </button>)}
    </div>
  </section>
}

function PhotoRow({ title, photos }) {
  if (!photos.length) return null
  return <section><h2 style={{ padding: '0 4%', margin: '1.5rem 0 1rem', color: '#e5e5e5', fontSize: '1.35rem', fontWeight: 850 }}>{title}</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '1rem', padding: '0 4% 1rem' }}>{photos.map((photo) => <a key={photo.id} href={photo.imageUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none' }}><div style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 10, background: '#171717' }}><img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><div style={{ fontWeight: 750, marginTop: 9 }}>{photo.title}</div>{photo.description ? <div style={{ color: 'rgba(255,255,255,0.55)', marginTop: 3, fontSize: '0.82rem' }}>{photo.description}</div> : null}</a>)}</div></section>
}

function VideoRow({ title, videos, progressByVideoId, onPlay, compact = false }) {
  const nonce = useNonce()

  if (!videos.length) return null

  return (
    <section>
      <h2 style={{ padding: '0 4%', margin: '0 0 1rem', color: '#e5e5e5', fontSize: '1.35rem', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlayCircle size={19} color="var(--gold, #ffb703)" />
        {title}
      </h2>
      <div className={compact ? 'kuroobi-scrollbar-hide' : undefined} style={compact
        ? { display: 'flex', gap: '0.65rem', overflowX: 'auto', padding: '0 4% 1rem', alignItems: 'start', scrollSnapType: 'x proximity' }
        : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', padding: '0 4% 1rem', alignItems: 'start' }}>
        {videos.map((video) => {
          const progress = Number(progressByVideoId.get(video.id)?.progressPercent || 0)
          const isShort = video.contentFormat === 'short'
          // Home rails are intentionally uniform, portrait cards. This keeps
          // Continue Watching and Recently Added easy to scan on phones; the
          // player still uses the source lesson's original aspect ratio.
          const usePortraitCard = compact || isShort
          return (
            <button
              key={`${title}-${video.id}`}
              type="button"
              onClick={() => !video.locked && onPlay(video)}
              style={{
                position: 'relative',
                flex: compact
                  ? '0 0 clamp(98px, 28vw, 132px)'
                  : undefined,
                gridColumn: !compact && !isShort ? 'span 2' : undefined,
                minWidth: 0,
                scrollSnapAlign: compact ? 'start' : undefined,
                aspectRatio: usePortraitCard ? '9 / 16' : '16 / 9',
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
              {progress >= 100 ? <span title="Completed" aria-label="Completed" style={{ position: 'absolute', top: compact ? '0.55rem' : '0.85rem', left: compact ? '0.55rem' : '0.85rem', width: compact ? 26 : 32, height: compact ? 26 : 32, borderRadius: '50%', background: '#1c9a61', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.35)' }}><CheckCircle2 size={compact ? 16 : 19} /></span> : null}
              <div style={{ position: 'absolute', left: compact ? '0.65rem' : '1rem', right: compact ? '0.65rem' : '1rem', bottom: compact ? '0.55rem' : '0.9rem' }}>
                <div style={{ fontWeight: 850, lineHeight: 1.2, fontSize: compact ? '0.78rem' : undefined, textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>{video.title}</div>
                <div style={{ marginTop: compact ? '0.2rem' : '0.35rem', color: 'rgba(255,255,255,0.68)', fontSize: compact ? '0.68rem' : '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {video.duration ? <><Clock size={13} /> {video.duration}</> : formatCategoryLabel(video.category)}
                </div>
              </div>
              {!video.locked ? (
                <span style={{ position: 'absolute', top: compact ? '0.55rem' : '0.85rem', right: compact ? '0.55rem' : '0.85rem', width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={compact ? 13 : 17} fill="#000" />
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
