import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PointsBadge from '../components/PointsBadge'
import Confetti from '../components/Confetti'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user, points, places, purchases, suppliers, addSupplier, resetAll } = useStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [supplierInput, setSupplierInput] = useState('')
  const [shareToast, setShareToast] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const profile = user?.profile
  if (!profile) return null

  function share() {
    const text = `🛂 My Tourifique Passport\n\n${user.name} — ${profile.archetype.title}\n\n✈️ ${places.length} places explored\n⭐ ${points} points earned\n🎯 Dream: ${profile.dreamDestination}\n\ntourifique.com`
    if (navigator.share) navigator.share({ title: 'My Tourifique Passport', text })
    else { navigator.clipboard.writeText(text); setShareToast(true); setTimeout(() => setShareToast(false), 2500) }
  }

  function addSupplierEmail(e) {
    e.preventDefault()
    if (!supplierInput.includes('@') || suppliers.length >= 5) return
    addSupplier(supplierInput.trim())
    setSupplierInput('')
    setConfetti(true)
    setTimeout(() => setConfetti(false), 2000)
  }

  const TABS = [{ id: 'profile', label: 'Profile' }, { id: 'collabs', label: 'Collabs' }, { id: 'suppliers', label: 'Suppliers' }]

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg,#0f0820 0%,#1a0a3e 100%)', paddingBottom: 120, overflowY: 'auto' }}>
      <Confetti active={confetti} />

      <style>{`
        .profile-2col { display:grid; grid-template-columns:1fr; gap:28px; }
        @media(min-width:900px){ .profile-2col { grid-template-columns:360px 1fr; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white', margin: 0 }}>Profile 👤</h1>
          <PointsBadge />
        </div>

        <div className="profile-2col">
          {/* ── Left col: profile card ── */}
          <div>
            {/* Shareable card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: `linear-gradient(135deg,${profile.archetype.color}30,rgba(250,204,21,0.08))`,
                border: `1px solid ${profile.archetype.color}50`,
                borderRadius: 24, padding: 20, marginBottom: 16,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${profile.archetype.color}20,transparent)` }} />
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `${profile.archetype.color}30`, border: `2px solid ${profile.archetype.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>
                  {profile.archetype.emoji}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 18, margin: '0 0 2px' }}>{user.name}</h2>
                  <p style={{ color: '#FACC15', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{profile.archetype.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{user.email}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                <MiniStat value={places.length} label="Places" />
                <MiniStat value={points} label="Points" yellow />
                <MiniStat value={purchases.length} label="Items" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={share}
                style={{ width: '100%', background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', border: 'none', borderRadius: 999, color: 'white', padding: '12px', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(109,40,217,0.4)' }}>
                📤 Share my Passport
              </motion.button>
            </motion.div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4 }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', background: activeTab === tab.id ? 'rgba(109,40,217,0.8)' : 'transparent', color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right col: tab content ── */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <Section title="Your Archetype">
                    <p style={{ color: '#C4B5FD', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{profile.archetype.blurb}</p>
                  </Section>
                  <Section title="Travel Style"><Chip>{profile.travelStyle}</Chip></Section>
                  <Section title="Dream Destination"><Chip>{profile.dreamDestination}</Chip></Section>
                  <Section title="Best Supplier Matches">{profile.recommendedSuppliers.map(s => <Chip key={s}>{s}</Chip>)}</Section>
                  <div style={{ marginTop: 28 }}>
                    <button onClick={() => setShowReset(true)}
                      style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)', borderRadius: 999, padding: '10px 20px', fontSize: 13, cursor: 'pointer', width: '100%' }}>
                      Reset Passport
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'collabs' && (
                <motion.div key="collabs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>3 collab ideas crafted for your archetype 🎯</p>
                  {profile.collabIdeas.map((idea, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'rgba(250,204,21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FACC15', fontWeight: 800, fontSize: 12 }}>{i + 1}</div>
                        <p style={{ color: '#E9D5FF', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{idea}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'suppliers' && (
                <motion.div key="suppliers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>Add up to 5 supplier partners to your Passport.</p>
                  <form onSubmit={addSupplierEmail} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input type="email" placeholder="supplier@brand.com" value={supplierInput} onChange={e => setSupplierInput(e.target.value)} disabled={suppliers.length >= 5}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                    <button type="submit" disabled={suppliers.length >= 5}
                      style={{ background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', border: 'none', borderRadius: 10, padding: '12px 16px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 16, opacity: suppliers.length >= 5 ? 0.5 : 1 }}>+</button>
                  </form>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...Array(5)].map((_, i) => {
                      const email = suppliers[i]
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: email ? 'rgba(109,40,217,0.15)' : 'rgba(255,255,255,0.03)', border: email ? '1px solid rgba(109,40,217,0.4)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px' }}>
                          <span style={{ color: email ? '#A78BFA' : 'rgba(255,255,255,0.2)', fontSize: 14 }}>{email ? '✉️' : '○'}</span>
                          <span style={{ color: email ? '#E9D5FF' : 'rgba(255,255,255,0.2)', fontSize: 13 }}>{email || `Slot ${i + 1} — add a supplier`}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>{suppliers.length}/5 suppliers added</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', borderRadius: 999, padding: '12px 24px', fontSize: 14, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap' }}>
            ✅ Passport copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirm */}
      <AnimatePresence>
        {showReset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              style={{ background: '#1E1B2E', borderRadius: 24, padding: 28, border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center', maxWidth: 340 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 18, margin: '0 0 8px' }}>Reset everything?</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 20px' }}>This deletes your Passport, points, places, and progress.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowReset(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: 999, padding: '12px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button onClick={() => { resetAll(); navigate('/') }} style={{ flex: 1, background: '#EF4444', border: 'none', color: 'white', borderRadius: 999, padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Reset</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ color: '#A78BFA', fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: '0 0 10px' }}>{title.toUpperCase()}</p>
      {children}
    </div>
  )
}
function Chip({ children }) {
  return (
    <span style={{ display: 'inline-block', background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.3)', borderRadius: 999, padding: '6px 14px', color: '#C4B5FD', fontSize: 13, marginRight: 6, marginBottom: 6 }}>
      {children}
    </span>
  )
}
function MiniStat({ value, label, yellow }) {
  return (
    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px 4px' }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: yellow ? '#FACC15' : 'white' }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0, letterSpacing: 0.5 }}>{label}</p>
    </div>
  )
}
