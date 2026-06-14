import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Confetti from '../components/Confetti'

export default function ProfileReveal() {
  const navigate = useNavigate()
  const { user, addPoints } = useStore()
  const [stage, setStage] = useState(0) // 0=loading 1=archetype 2=full 3=collabs
  const [confetti, setConfetti] = useState(false)

  const profile = user?.profile
  if (!profile) { navigate('/'); return null }

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => { setStage(2); setConfetti(true) }, 2200),
      setTimeout(() => setStage(3), 3400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  function goToDashboard() {
    addPoints(50)
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B69 50%, #1E1B2E 100%)',
      overflow: 'hidden', padding: '0 24px',
    }}>
      <Confetti active={confetti} count={80} />

      {/* Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [-20, -80, -20], x: [0, (i % 2 === 0 ? 20 : -20), 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: 'fixed',
            left: `${10 + i * 12}%`, bottom: '10%',
            width: 6, height: 6, borderRadius: '50%',
            background: i % 2 === 0 ? '#6D28D9' : '#FACC15',
            pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40 }}>

        {/* Loading */}
        <AnimatePresence>
          {stage === 0 && (
            <motion.div
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: 56, display: 'inline-block', marginBottom: 16 }}
              >
                🌍
              </motion.div>
              <p style={{ color: '#A78BFA', fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                Analysing your vibe...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archetype reveal */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ textAlign: 'center', marginBottom: 24 }}
            >
              <div style={{
                width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${profile.archetype.color}40, ${profile.archetype.color}80)`,
                border: `3px solid ${profile.archetype.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48,
                boxShadow: `0 0 40px ${profile.archetype.color}60`,
              }}>
                {profile.archetype.emoji}
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 28, color: 'white', margin: '0 0 4px',
                }}
              >
                You're
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 24, color: '#FACC15', margin: 0,
                  textShadow: '0 0 30px rgba(250,204,21,0.5)',
                }}
              >
                {profile.archetype.title}
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile card */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 24, padding: 20, marginBottom: 16,
              }}
            >
              <p style={{ color: '#C4B5FD', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                {profile.archetype.blurb}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Chip icon="✈️" text={`Dream: ${profile.dreamDestination}`} />
                <Chip icon="🎨" text={profile.travelStyle} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supplier recs */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{
                background: 'rgba(250,204,21,0.08)',
                border: '1px solid rgba(250,204,21,0.3)',
                borderRadius: 20, padding: 16, marginBottom: 16,
              }}>
                <p style={{ color: '#FACC15', fontSize: 13, fontWeight: 700, margin: '0 0 10px' }}>
                  🤝 Your best collab matches
                </p>
                {profile.recommendedSuppliers.slice(0, 3).map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 2 ? 8 : 0 }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FACC15', flexShrink: 0 }} />
                    <span style={{ color: '#E9D5FF', fontSize: 13 }}>{s}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(250,204,21,0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={goToDashboard}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                  color: '#1E1B2E', border: 'none', borderRadius: 999,
                  padding: '16px', fontSize: 16, fontWeight: 800,
                  fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(250,204,21,0.4)',
                  marginBottom: 12,
                }}
              >
                Add to my Passport 🛂 →
              </motion.button>

              <button
                onClick={() => {
                  const text = `I just got my Travelpreneur Passport on Tourifique! I'm ${profile.archetype.title} 🌍✨`
                  if (navigator.share) navigator.share({ title: 'My Tourifique Passport', text })
                  else navigator.clipboard.writeText(text)
                }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', borderRadius: 999, padding: '14px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                📤 Share my result
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Chip({ icon, text }) {
  return (
    <span style={{
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 999, padding: '4px 10px',
      fontSize: 12, color: '#E9D5FF', display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {icon} {text}
    </span>
  )
}
