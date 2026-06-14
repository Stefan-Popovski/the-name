import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

/* Palette — shared with the landing page's editorial sections */
const INK = '#14101F'
const BODY = '#574F69'
const MUTE = '#938CA8'
const LINE = '#ECE8F3'
const YELLOW = '#FACC15'
const TINT = '#FAF8FD'
const LILAC = '#F4EEFF'
const LILAC_BD = '#E4D7FB'

export default function ProfileReveal() {
  const navigate = useNavigate()
  const { user, addPoints } = useStore()
  const [stage, setStage] = useState(0) // 0=loading 1=archetype 2=full 3=collabs

  const profile = user?.profile
  if (!profile) { navigate('/'); return null }

  const accent = profile.archetype.color
  const title = stripEmoji(profile.archetype.title)
  const destination = stripEmoji(profile.dreamDestination)
  const words = title.replace(/^the\s+/i, '').split(' ')
  const monogram = (words[0]?.[0] || 'T').toUpperCase()

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 2200),
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
      position: 'relative',
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: TINT, color: INK,
      overflow: 'hidden', padding: '0 24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Soft accent wash — subtle, tinted by the archetype (not a flat purple) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(90% 60% at 50% -5%, ${accent}14, transparent 60%)` }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 48, paddingBottom: 32 }}>

        {/* Loading */}
        <AnimatePresence>
          {stage === 0 && (
            <motion.div exit={{ opacity: 0, scale: 0.92 }} style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto 18px',
                  border: `3px solid ${accent}22`, borderTopColor: accent,
                }}
              />
              <p style={{ color: MUTE, fontSize: 14, fontWeight: 600, letterSpacing: 0.3, margin: 0 }}>
                Analysing your vibe…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archetype reveal */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', marginBottom: 28 }}
            >
              <div style={{
                width: 84, height: 84, borderRadius: '50%', margin: '0 auto 22px',
                background: `${accent}12`,
                border: `1px solid ${accent}2e`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                fontSize: 36, color: accent, lineHeight: 1,
                boxShadow: `0 16px 36px -16px ${accent}66`,
              }}>
                {monogram}
              </div>

              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                fontSize: 12.5, letterSpacing: 2.5, textTransform: 'uppercase',
                color: MUTE, margin: '0 0 10px',
              }}>
                Your archetype
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                  fontSize: 'clamp(28px, 8vw, 38px)', lineHeight: 1.08,
                  letterSpacing: '-0.5px', color: accent, margin: 0,
                }}
              >
                {title}
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile card */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: '#fff',
                border: `1px solid ${LINE}`,
                borderRadius: 22, padding: 22, marginBottom: 14,
                boxShadow: '0 30px 70px -45px rgba(20,16,31,0.45)',
              }}
            >
              <p style={{ color: BODY, fontSize: 15, lineHeight: 1.65, margin: '0 0 18px' }}>
                {profile.archetype.blurb}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Chip label="Dream" text={destination} accent={accent} />
                <Chip label="Style" text={profile.travelStyle} accent={accent} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supplier recs */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{
                background: LILAC,
                border: `1px solid ${LILAC_BD}`,
                borderRadius: 20, padding: 18, marginBottom: 18,
              }}>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                  fontSize: 12.5, letterSpacing: 0.4, color: INK, margin: '0 0 14px',
                }}>
                  Your best collab matches
                </p>
                {profile.recommendedSuppliers.slice(0, 3).map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: i < 2 ? 11 : 0 }}
                  >
                    <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: '50%', background: '#fff', border: `1px solid ${LILAC_BD}`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
                    </span>
                    <span style={{ color: BODY, fontSize: 14.5, fontWeight: 500 }}>{s}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToDashboard}
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${YELLOW}, #F59E0B)`,
                  color: INK, border: 'none', borderRadius: 14,
                  padding: '16px', fontSize: 16, fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer',
                  letterSpacing: 0.2,
                  boxShadow: '0 14px 30px -12px rgba(245,158,11,0.6)',
                  marginBottom: 10,
                }}
              >
                Add to my Passport →
              </motion.button>

              <button
                onClick={() => {
                  const text = `I just got my Travelpreneur Passport on Tourifique — I'm ${title}.`
                  if (navigator.share) navigator.share({ title: 'My Tourifique Passport', text })
                  else navigator.clipboard.writeText(text)
                }}
                style={{
                  width: '100%', background: '#fff',
                  border: `1px solid ${LINE}`,
                  color: INK, borderRadius: 14, padding: '14px',
                  fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Share my result
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* Remove emoji / pictographs / flags / variation selectors from data strings */
function stripEmoji(s = '') {
  return s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function Chip({ label, text, accent }) {
  return (
    <span style={{
      background: LILAC,
      border: `1px solid ${LILAC_BD}`,
      borderRadius: 999, padding: '6px 6px 6px 12px',
      fontSize: 12.5, fontWeight: 500, color: BODY,
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0 }} />
      <span style={{ color: MUTE, fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
      <span style={{ background: '#fff', border: `1px solid ${LILAC_BD}`, borderRadius: 999, padding: '3px 10px' }}>{text}</span>
    </span>
  )
}
