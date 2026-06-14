import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Confetti from '../components/Confetti'

/* palette — shared with the landing / passport */
const INK = '#14101F'
const BODY = '#574F69'
const MUTE = '#938CA8'
const LINE = '#ECE8F3'
const PURPLE = '#6D28D9'
const TINT = '#FAF8FD'
const LILAC = '#F4EEFF'
const LILAC_BD = '#E4D7FB'
const GREEN = '#16A34A'
const RED = '#DC2626'

const stripEmoji = (s = '') => s
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, '')
  .replace(/\s{2,}/g, ' ').trim()

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user, places, purchases, suppliers, addSupplier, resetAll } = useStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [supplierInput, setSupplierInput] = useState('')
  const [shareToast, setShareToast] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const profile = user?.profile
  if (!profile) return null

  const accent = profile.archetype.color
  const archetypeTitle = stripEmoji(profile.archetype.title)
  const dream = stripEmoji(profile.dreamDestination)
  const initials = (user.name || 'T').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()

  function share() {
    const text = `My Tourifique Passport\n\n${user.name} — ${archetypeTitle}\n${places.length} places explored\nDream: ${dream}\n\ntourifique.com`
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
    <div style={{ position: 'relative', minHeight: '100dvh', background: TINT, paddingBottom: 120, fontFamily: 'Inter, sans-serif' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(90% 40% at 50% -5%, ${accent}10, transparent 55%)` }} />
      <Confetti active={confetti} />

      <style>{`
        .profile-2col { display:grid; grid-template-columns:1fr; gap:28px; }
        @media(min-width:900px){ .profile-2col { grid-template-columns:360px 1fr; } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: PURPLE, fontSize: 11, fontWeight: 700, margin: 0, letterSpacing: 2.5, fontFamily: 'Space Grotesk, sans-serif' }}>YOUR ACCOUNT</p>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 28, color: INK, margin: '3px 0 0', letterSpacing: -0.5 }}>Profile</h1>
          </div>
        </div>

        <div className="profile-2col">
          {/* ── Left col: profile card ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fff', border: `1px solid ${LINE}`,
                borderRadius: 22, padding: 20, marginBottom: 16,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 24px 60px -45px rgba(20,16,31,0.55)',
              }}
            >
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${accent}1f, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `${accent}14`, border: `1px solid ${accent}3a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 26, color: accent }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: INK, fontSize: 18, margin: '0 0 2px' }}>{user.name}</h2>
                  <p style={{ color: accent, fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>{archetypeTitle}</p>
                  <p style={{ color: MUTE, fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                <MiniStat value={places.length} label="Places" accent />
                <MiniStat value={suppliers.length} label="Partners" />
                <MiniStat value={purchases.length} label="Items" />
              </div>
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={share}
                style={{ width: '100%', background: `linear-gradient(135deg, ${PURPLE}, #8B5CF6)`, border: 'none', borderRadius: 12, color: '#fff', padding: '13px', fontSize: 14.5, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 12px 26px -12px rgba(109,40,217,0.6)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /></svg>
                Share my Passport
              </motion.button>
            </motion.div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: LILAC, border: `1px solid ${LILAC_BD}`, borderRadius: 14, padding: 4 }}>
              {TABS.map(tab => {
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s', background: active ? '#fff' : 'transparent', color: active ? PURPLE : BODY, boxShadow: active ? '0 6px 16px -10px rgba(20,16,31,0.5)' : 'none' }}>
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Right col: tab content ── */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <Section title="Your Archetype">
                    <p style={{ color: BODY, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>{profile.archetype.blurb}</p>
                  </Section>
                  <Section title="Travel Style"><Chip>{profile.travelStyle}</Chip></Section>
                  <Section title="Dream Destination"><Chip>{dream}</Chip></Section>
                  <Section title="Best Supplier Matches">{profile.recommendedSuppliers.map(s => <Chip key={s}>{s}</Chip>)}</Section>
                  <div style={{ marginTop: 28 }}>
                    <button onClick={() => setShowReset(true)}
                      style={{ background: '#fff', border: `1px solid ${LINE}`, color: RED, borderRadius: 999, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', fontFamily: 'Inter, sans-serif' }}>
                      Reset Passport
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'collabs' && (
                <motion.div key="collabs" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <p style={{ color: BODY, fontSize: 13.5, margin: '0 0 16px' }}>3 collab ideas crafted for your archetype.</p>
                  {profile.collabIdeas.map((idea, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0 18px 44px -40px rgba(20,16,31,0.5)' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `${accent}14`, border: `1px solid ${accent}3a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontWeight: 800, fontSize: 13, fontFamily: 'Space Grotesk, sans-serif' }}>{i + 1}</div>
                        <p style={{ color: BODY, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{idea}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'suppliers' && (
                <motion.div key="suppliers" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <p style={{ color: BODY, fontSize: 13.5, margin: '0 0 16px' }}>Add up to 5 supplier partners to your Passport.</p>
                  <form onSubmit={addSupplierEmail} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input type="email" placeholder="supplier@brand.com" value={supplierInput} onChange={e => setSupplierInput(e.target.value)} disabled={suppliers.length >= 5}
                      onFocus={e => e.target.style.borderColor = PURPLE}
                      onBlur={e => e.target.style.borderColor = LINE}
                      style={{ flex: 1, background: '#fff', border: `1.5px solid ${LINE}`, borderRadius: 10, padding: '12px 14px', color: INK, fontSize: 13.5, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.18s' }} />
                    <button type="submit" disabled={suppliers.length >= 5}
                      style={{ background: `linear-gradient(135deg, ${PURPLE}, #8B5CF6)`, border: 'none', borderRadius: 10, padding: '12px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 18, lineHeight: 1, opacity: suppliers.length >= 5 ? 0.5 : 1 }}>+</button>
                  </form>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...Array(5)].map((_, i) => {
                      const email = suppliers[i]
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: email ? LILAC : '#fff', border: email ? `1px solid ${LILAC_BD}` : `1px dashed ${LINE}`, borderRadius: 12, padding: '12px 14px' }}>
                          {email ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 8l9 6 9-6" /></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="1.6"><circle cx="12" cy="12" r="7" /></svg>
                          )}
                          <span style={{ color: email ? INK : MUTE, fontSize: 13.5, fontWeight: email ? 500 : 400 }}>{email || `Slot ${i + 1} — add a supplier`}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ color: MUTE, fontSize: 11.5, textAlign: 'center', marginTop: 16 }}>{suppliers.length}/5 suppliers added</p>
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
            style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: GREEN, color: '#fff', borderRadius: 999, padding: '12px 24px', fontSize: 14, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap', boxShadow: '0 16px 36px -16px rgba(22,163,74,0.6)' }}>
            Passport copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirm */}
      <AnimatePresence>
        {showReset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowReset(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,31,0.5)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 14 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 22, padding: 28, border: `1px solid ${LINE}`, textAlign: 'center', maxWidth: 340, boxShadow: '0 40px 90px -30px rgba(20,16,31,0.45)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px', background: '#FDECEC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4 2.5 20.5h19z" /><path d="M12 10v5" /><circle cx="12" cy="17.6" r="0.4" fill={RED} stroke="none" /></svg>
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: INK, fontSize: 18, margin: '0 0 8px' }}>Reset everything?</h3>
              <p style={{ color: BODY, fontSize: 13.5, margin: '0 0 20px', lineHeight: 1.55 }}>This deletes your Passport, points, places, and progress.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowReset(false)} style={{ flex: 1, background: '#fff', border: `1px solid ${LINE}`, color: INK, borderRadius: 999, padding: '12px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button onClick={() => { resetAll(); navigate('/') }} style={{ flex: 1, background: RED, border: 'none', color: '#fff', borderRadius: 999, padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif' }}>Reset</button>
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
      <p style={{ color: MUTE, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, margin: '0 0 10px', fontFamily: 'Space Grotesk, sans-serif' }}>{title.toUpperCase()}</p>
      {children}
    </div>
  )
}
function Chip({ children }) {
  return (
    <span style={{ display: 'inline-block', background: LILAC, border: `1px solid ${LILAC_BD}`, borderRadius: 999, padding: '7px 14px', color: BODY, fontSize: 13, fontWeight: 500, marginRight: 6, marginBottom: 6 }}>
      {children}
    </span>
  )
}
function MiniStat({ value, label, accent }) {
  return (
    <div style={{ textAlign: 'center', background: TINT, border: `1px solid ${LINE}`, borderRadius: 12, padding: '10px 4px' }}>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 19, margin: 0, color: accent ? PURPLE : INK }}>{value}</p>
      <p style={{ color: MUTE, fontSize: 10, margin: '2px 0 0', letterSpacing: 0.5, fontWeight: 600 }}>{label}</p>
    </div>
  )
}
