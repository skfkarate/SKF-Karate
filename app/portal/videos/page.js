'use client'

import { useState, useEffect } from 'react'
import { PlayCircle, Lock, X, ChevronRight, Clock, Trophy, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Mock Data removed for production readiness.
const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=600'
const FALLBACK_VIDEO = 'https://vjs.zencdn.net/v/oceans.mp4'

export default function CinematicDojoVideos() {
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [playingVideo, setPlayingVideo] = useState(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/portal/videos')
        if (res.status === 401) {
          window.location.href = '/portal/login'
          return
        }
        const data = await res.json()
        if (data.videos && data.videos.length > 0) {
          const formatted = data.videos.map(v => ({
            ...v,
            id: v.ID || v.id || Math.random().toString(),
            title: v.Title || v.title || 'Untitled Video',
            duration: v.Duration || v.duration || '0:00',
            category: (v.Category || v.category || 'techniques').toLowerCase(),
            locked: (v.Locked || v.locked) === 'TRUE',
            thumbnail: v.Thumbnail || v.thumbnail || FALLBACK_THUMBNAIL,
            url: v.URL || v.url || FALLBACK_VIDEO
          }))
          setVideos(formatted)
        }
      } catch (e) {
        console.error('Failed to load videos', e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const HERO_VIDEO = videos.length > 0 ? videos[0] : null
  const CONTINUE_WATCHING = videos.slice(1, 5).map(v => ({ ...v, progress: Math.floor(Math.random() * 60) + 10 }))

  const categories = [
    { id: 'kata', title: 'Kata Mastery', desc: 'Forms and sequences' },
    { id: 'techniques', title: 'Kihon & Kumite', desc: 'Strikes, blocks, and sparring drills' },
    { id: 'bunkai', title: 'Bunkai Analysis', desc: 'Practical application of kata moves' },
    { id: 'fitness', title: 'Conditioning', desc: 'Strength, cardio, and flexibility' },
  ]

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (playingVideo) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [playingVideo])

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }}>
      
      {isLoading ? (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', border: '3px solid rgba(255, 183, 3, 0.1)', borderTop: '3px solid var(--crimson)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '600', animation: 'loadingPulse 1.5s ease-in-out infinite alternate' }}>Loading Dojo Library...</p>
        </div>
      ) : videos.length === 0 ? (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', background: 'rgba(10,14,22,0.5)' }}>
          <Lock size={64} color="rgba(255,255,255,0.1)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#fff', margin: 0 }}>Vault Empty</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No training videos are currently assigned to your branch yet.</p>
        </div>
      ) : (
        <>
          {/* ── HERO VIDEO SECTION (FOCUS OF THE DAY) ── */}
          {HERO_VIDEO && (
            <div style={{
              position: 'relative', width: '100%', height: '70vh', minHeight: '500px',
              borderRadius: '32px', overflow: 'hidden', marginBottom: '3rem',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
            }}>
              {/* HUGE Kanji Background Decoration */}
              <div style={{
                position: 'absolute', top: '-10%', right: '-5%',
                fontSize: '60vh', color: 'rgba(255,255,255,0.03)',
                fontFamily: 'sans-serif', fontWeight: 900, lineHeight: 1,
                pointerEvents: 'none', zIndex: 1, userSelect: 'none'
              }}>
                武
              </div>

              {/* Background Image Standard Tag to Bypass Next.js Domain Block */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <img src={HERO_VIDEO.thumbnail} alt={HERO_VIDEO.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Cinematic Gradient Overlays */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, #020408 0%, rgba(2,4,8,0.5) 50%, rgba(2,4,8,0.1) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(214,40,40,0.15) 0%, transparent 80%)' }} />

              {/* Hero Content */}
              <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', right: '4rem', zIndex: 10 }}>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{
                      background: 'rgba(214,40,40,0.9)', color: '#fff', fontSize: '0.7rem',
                      fontWeight: 800, letterSpacing: '0.2em', padding: '0.4rem 0.8rem',
                      borderRadius: '6px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <Flame size={14} /> Focus of the Day
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={16} /> {HERO_VIDEO.duration}
                    </span>
                  </div>
                  
                  <h1 style={{
                    fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                    fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: '1rem',
                    letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.8)'
                  }}>
                    {HERO_VIDEO.title}
                  </h1>
                  
                  <p style={{
                    color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '650px',
                    lineHeight: 1.6, marginBottom: '2.5rem', fontWeight: 500
                  }}>
                    {HERO_VIDEO.description || 'Premium Shotokan Training Module'}
                  </p>

                  <button 
                    onClick={() => setPlayingVideo(HERO_VIDEO)}
                    style={{
                      background: '#fff', color: '#000', border: 'none',
                      padding: '1.2rem 3rem', borderRadius: '16px',
                      fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.2rem',
                      fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem',
                      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                      boxShadow: '0 15px 35px rgba(255,255,255,0.2)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                  >
                    <PlayCircle size={24} fill="#000" color="#fff" />
                    Start Training
                  </button>
                </motion.div>
              </div>
            </div>
          )}

          {/* ── CONTINUE TRAINING (PROGRESS WIDGETS) ── */}
      <div style={{ marginBottom: '5rem', paddingLeft: '0.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={20} color="var(--gold, #ffb703)" /> Continue Training
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {CONTINUE_WATCHING.map((vid, i) => (
            <motion.div 
              key={vid.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
              onClick={() => setPlayingVideo(vid)}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <div style={{ position: 'relative', width: '120px', height: '70px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={vid.thumbnail} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlayCircle size={24} color="rgba(255,255,255,0.8)" />
                </div>
              </div>
              <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vid.title}</h3>
                
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                  <div style={{ width: vid.progress + '%', height: '100%', background: 'var(--crimson, #d62828)', borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  <span>{vid.progress}% Complete</span>
                  <span>{vid.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CAROUSEL SECTIONS ── */}
      {categories.map((cat, idx) => {
        const catVideos = videos.filter(v => v.category === cat.id)
        if (catVideos.length === 0) return null

        return (
          <div key={cat.id} style={{ marginBottom: '4rem' }}>
            <div style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{cat.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 500 }}>{cat.desc}</p>
            </div>

            <div style={{
              display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '2rem', paddingLeft: '0.5rem', paddingRight: '2rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
            }} className="kuroobi-scrollbar-hide">
              {catVideos.map((video) => (
                <motion.div
                  key={video.id + '_cat'}
                  onClick={() => !video.locked && setPlayingVideo(video)}
                  style={{
                    minWidth: '280px', width: '280px', flexShrink: 0, scrollSnapAlign: 'start', position: 'relative',
                    cursor: video.locked ? 'not-allowed' : 'pointer',
                  }}
                  whileHover={!video.locked ? { scale: 1.05, y: -5 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div style={{
                    position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem',
                    border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                  }}>
                    <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: video.locked ? 'grayscale(100%) brightness(0.4)' : 'none', transition: 'filter 0.3s' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />

                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {video.locked ? (
                        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '50%', backdropFilter: 'blur(10px)' }}>
                          <Lock size={24} color="rgba(255,255,255,0.5)" />
                        </div>
                      ) : (
                        <motion.div 
                          className="play-icon-hover"
                          initial={{ opacity: 0, scale: 0.8 }} whileHover={{ opacity: 1, scale: 1 }}
                          style={{ background: 'rgba(214,40,40,0.9)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 20px rgba(214,40,40,0.5)' }}
                        >
                          <PlayCircle size={24} color="#fff" fill="#fff" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: video.locked ? 'rgba(255,255,255,0.4)' : '#fff', marginBottom: '0.25rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.title}</h3>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: video.locked ? 'rgba(255,107,107,0.7)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {video.locked ? <><Lock size={12} /> Rank Locked</> : <>{video.duration} • Official Content</>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
      
      </>
      )}

      {/* ── FULLSCREEN VIDEO PLAYER MODAL ── */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2,4,8,0.95)',
              backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Flame size={20} color="var(--crimson, #d62828)" />
                  {playingVideo.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {playingVideo.category?.toUpperCase() || 'TRAINING'} • {playingVideo.duration}
                </div>
              </div>
              <button 
                onClick={() => setPlayingVideo(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.2s', color: '#fff'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(214,40,40,0.8)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player Container */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2rem 2rem 2rem' }}>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", damping: 25 }}
                style={{ width: '100%', maxWidth: '1200px', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <video 
                  controls 
                  autoPlay 
                  src={playingVideo.url} 
                  poster={playingVideo.thumbnail}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  Your browser does not support the video tag.
                </video>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        .kuroobi-scrollbar-hide::-webkit-scrollbar { display: none; }
        .kuroobi-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
