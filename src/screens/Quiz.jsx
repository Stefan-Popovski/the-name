import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { generateProfile } from '../lib/generateProfile'
import Confetti from '../components/Confetti'

const QUESTIONS = [
  {
    id: 'contentType',
    type: 'emoji-choice',
    question: "What kind of content do you make?",
    subtitle: "Be honest, we won't judge 👀",
    options: [
      { value: 'reels', emoji: '🎬', label: 'Reels & shorts' },
      { value: 'lifestyle', emoji: '✨', label: 'Lifestyle vlogs' },
      { value: 'food', emoji: '🍽️', label: 'Food content' },
      { value: 'documentary', emoji: '🎥', label: 'Mini-docs' },
    ],
  },
  {
    id: 'audience',
    type: 'emoji-choice',
    question: "How big is your audience?",
    subtitle: "No ego required 😌",
    options: [
      { value: 'nano', emoji: '🌱', label: 'Under 10K' },
      { value: 'micro', emoji: '🌿', label: '10K – 100K' },
      { value: 'macro', emoji: '🌳', label: '100K – 1M' },
      { value: 'mega', emoji: '🌲', label: '1M+' },
    ],
  },
  {
    id: 'dreamDestination',
    type: 'image-pick',
    question: "Pick your dream destination 🌍",
    subtitle: "Where would you go RIGHT NOW if flights were free?",
    options: [
      { value: 'japan', emoji: '🇯🇵', label: 'Japan', sub: 'Tokyo neon dreams' },
      { value: 'kenya', emoji: '🇰🇪', label: 'Kenya', sub: 'Savanna sunsets' },
      { value: 'brazil', emoji: '🇧🇷', label: 'Brazil', sub: 'Carnival vibes' },
      { value: 'norway', emoji: '🇳🇴', label: 'Norway', sub: 'Northern lights' },
    ],
  },
  {
    id: 'travelStyle',
    type: 'emoji-choice',
    question: "Your travel style in one word?",
    subtitle: "This determines your Passport archetype 🛂",
    options: [
      { value: 'luxury', emoji: '💎', label: 'Luxury' },
      { value: 'adventure', emoji: '🏕️', label: 'Adventure' },
      { value: 'culture', emoji: '🎭', label: 'Culture' },
      { value: 'budget', emoji: '🎒', label: 'Budget' },
    ],
  },
  {
    id: 'travelVibe',
    type: 'slider',
    question: "How spontaneous are you?",
    subtitle: "Drag the slider — zero judgment 🎚️",
    min: 0,
    max: 100,
    defaultValue: 50,
    leftLabel: '📋 Hyper-planner',
    rightLabel: '🎲 Total chaos',
  },
]

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

export default function Quiz() {
  const navigate = useNavigate()
  const { user, setUser, addPoints } = useStore()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100

  function answer(key, value) {
    const next = { ...answers, [key]: value }
    setAnswers(next)

    if (step < QUESTIONS.length - 1) {
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
        setDirection(1)
        setStep(s => s + 1)
      }, 600)
    } else {
      // Done — generate profile
      const profile = generateProfile(next)
      setUser({ ...user, quizAnswers: next, profile })
      addPoints(100)
      setTimeout(() => navigate('/reveal'), 400)
    }
  }

  function back() {
    if (step === 0) { navigate('/signup'); return }
    setDirection(-1)
    setStep(s => s - 1)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'linear-gradient(160deg,#070414 0%,#1a0a3e 60%,#070414 100%)',
      overflow: 'hidden',
    }}>
      <Confetti active={showCelebration} count={30} />
      <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh' }}>

      {/* Progress bar */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button
            onClick={back}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A78BFA', fontSize: 14, fontWeight: 600 }}
          >
            ← Back
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            {step + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(109,40,217,0.1)', borderRadius: 999, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6D28D9, #FACC15)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '32px 24px 24px' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 26, color: 'white', margin: '0 0 8px', lineHeight: 1.2,
              }}>
                {q.question}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 28px' }}>{q.subtitle}</p>
            </motion.div>

            {q.type === 'emoji-choice' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {q.options.map((opt, i) => (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => answer(q.id, opt.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid rgba(109,40,217,0.3)',
                      borderRadius: 16, padding: '20px 12px',
                      cursor: 'pointer', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 36 }}>{opt.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {q.type === 'image-pick' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {q.options.map((opt, i) => (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => answer(q.id, opt.value)}
                    style={{
                      background: 'rgba(109,40,217,0.1)',
                      border: '1.5px solid rgba(109,40,217,0.3)',
                      borderRadius: 16, padding: '24px 12px',
                      cursor: 'pointer', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 40 }}>{opt.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{opt.label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{opt.sub}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {q.type === 'slider' && (
              <SliderQuestion q={q} onAnswer={(v) => answer(q.id, v)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>{/* maxWidth wrapper */}
    </div>
  )
}

function SliderQuestion({ q, onAnswer }) {
  const [value, setValue] = useState(q.defaultValue)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 28,
        border: '1.5px solid rgba(109,40,217,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 48 }}>
            {value < 33 ? '📋' : value < 66 ? '🧭' : '🎲'}
          </span>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#A78BFA', margin: '8px 0 0' }}>
            {value < 33 ? 'Planner mode' : value < 66 ? 'Balanced explorer' : 'Pure chaos'}
          </p>
        </div>
        <input
          type="range"
          min={q.min} max={q.max}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#6D28D9', height: 6, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{q.leftLabel}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{q.rightLabel}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAnswer(value)}
        style={{
          background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
          color: 'white', border: 'none', borderRadius: 999,
          padding: '16px', fontSize: 16, fontWeight: 700,
          fontFamily: 'Syne, sans-serif', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
        }}
      >
        Reveal my Passport! 🛂
      </motion.button>
    </motion.div>
  )
}
