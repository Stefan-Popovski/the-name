import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function SignUp() {
  const navigate = useNavigate()
  const { setUser } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('What do we call you? 🙃')
    if (!email.includes('@')) return setError('That email looks a bit off 👀')
    setLoading(true)
    setTimeout(() => {
      setUser({ name: name.trim(), email: email.trim(), profile: null, quizAnswers: null })
      navigate('/quiz')
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'linear-gradient(160deg,#070414 0%,#1a0a3e 60%,#070414 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 560, padding: '0 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Back */}
      <div style={{ padding: '20px 0 0' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A78BFA', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← Back
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0], y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ fontSize: 56, display: 'inline-block' }}
            >
              🛂
            </motion.div>
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 28, lineHeight: 1.2, margin: '0 0 8px', textAlign: 'center',
            color: 'white',
          }}>
            Claim your <span style={{ color: '#6D28D9' }}>Passport</span>
          </h1>
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
            No passwords. No drama. Just you and your travel story.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9', display: 'block', marginBottom: 6 }}>
                YOUR NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Sofia Montero"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1.5px solid rgba(109,40,217,0.3)',
                  borderRadius: 14, fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  outline: 'none', transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#6D28D9'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,40,217,0.2)'}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9', display: 'block', marginBottom: 6 }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="sofia@theworld.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1.5px solid rgba(109,40,217,0.3)',
                  borderRadius: 14, fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  background: 'rgba(255,255,255,0.06)', color: 'white',
                  outline: 'none', transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#6D28D9'}
                onBlur={e => e.target.style.borderColor = 'rgba(109,40,217,0.2)'}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ color: '#EF4444', fontSize: 13, fontWeight: 500, margin: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#A78BFA' : 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                color: 'white', border: 'none', borderRadius: 999,
                padding: '16px', fontSize: 16, fontWeight: 700,
                fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                marginTop: 8, boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
                transition: 'background 0.2s',
              }}
            >
              {loading ? '✈️ Boarding...' : 'Let\'s go! →'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 20, lineHeight: 1.5 }}>
            No spam. No selling your data. Just vibes. 🌴
          </p>
        </motion.div>
      </div>
      </div>{/* max-width wrapper */}
    </div>
  )
}
