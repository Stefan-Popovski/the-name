import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Confetti from '../components/Confetti'

/* ─────────────────────────────────────────────
   Tourifique — the Passport
   A real passport book: opens with animation,
   ID/data page from the user, visa stamps for
   every place they've been.
   ───────────────────────────────────────────── */

const INK = '#2A1B57'          // passport ink (deep violet)
const INK_SOFT = 'rgba(42,27,87,0.55)'
const PAPER = '#F4EEDC'        // cream page
const PAPER_HI = '#FBF7EB'
const GOLD = '#E7C66B'
const GOLD_DEEP = '#B8923C'
const COVER_A = '#241552'
const COVER_B = '#3C2479'

const STAMP_ICONS = ['✈', '☼', '⚓', '☕', '⛩', '☘', '★', '✶']
const STAMP_INKS = ['#6D28D9', '#1F7A6B', '#B0413E', '#27407A', '#A85B1F', '#7A2E6B']

const hashStr = (s = '') => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }
const pad = (s, n) => (s + '<'.repeat(n)).slice(0, n)
const fmtDate = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

export default function Dashboard() {
  const { user, places, addPlace, addPhotosToPlace, points } = useStore()
  const profile = user?.profile

  const [opened, setOpened] = useState(false)
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [newPlace, setNewPlace] = useState({ name: '', country: '', lat: '', lng: '' })
  const fileInputRef = useRef(null)
  const [uploadTargetId, setUploadTargetId] = useState(null)

  // auto-open the book on mount
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 950)
    return () => clearTimeout(t)
  }, [])

  /* identity derived from the user */
  const fullName = (user?.name || 'New Traveler').trim()
  const parts = fullName.split(/\s+/)
  const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0]
  const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : ''
  const passNo = 'TQ' + (hashStr(user?.email || fullName) % 900000 + 100000)
  const issued = profile?.generatedAt ? new Date(profile.generatedAt) : new Date()
  const expiry = new Date(issued); expiry.setFullYear(expiry.getFullYear() + 10)

  const clean = s => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '<')
  const mrz1 = pad(`P<TRP${clean(surname)}<<${clean(given) || '<'}`, 44)
  const mrz2 = pad(`${passNo}<7TRP${String(issued.getFullYear()).slice(2)}${String(expiry.getFullYear()).slice(2)}`, 44)

  function handleAddPlace(e) {
    e.preventDefault()
    if (!newPlace.name) return
    const i = places.length
    addPlace({
      name: newPlace.name,
      country: newPlace.country || '',
      lat: parseFloat(newPlace.lat) || 48.8566,
      lng: parseFloat(newPlace.lng) || 2.3522,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      stamp: STAMP_ICONS[i % STAMP_ICONS.length],
      photos: [], videos: [],
    })
    setNewPlace({ name: '', country: '', lat: '', lng: '' })
    setShowAddPlace(false)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1800)
  }

  function handleFileUpload(e, placeId) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const readers = files.map(f => new Promise(res => {
      const r = new FileReader()
      r.onload = ev => res({ url: ev.target.result, name: f.name, type: f.type })
      r.readAsDataURL(f)
    }))
    Promise.all(readers).then(data => {
      addPhotosToPlace(placeId, data)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1800)
    })
  }

  function share() {
    const text = `🛂 My Tourifique Passport — ${fullName}, ${profile?.archetype?.title}. ${places.length} stamps · ${points} pts`
    if (navigator.share) navigator.share({ title: 'My Tourifique Passport', text }).catch(() => {})
    else { navigator.clipboard?.writeText(text); setShowToast(true); setTimeout(() => setShowToast(false), 1800) }
  }

  return (
    <div style={{
      minHeight: '100dvh', paddingBottom: 110,
      background: 'radial-gradient(120% 80% at 50% -10%, #2E1C5C 0%, #190E36 55%, #0D0622 100%)',
    }}>
      <style>{CSS}</style>
      <Confetti active={showConfetti} />

      {/* ── slim action bar ── */}
      <div className="ps-head" style={{ maxWidth: 980, margin: '0 auto', padding: '22px 24px 6px' }}>
        <div>
          <p style={{ color: GOLD, fontSize: 10.5, fontWeight: 700, letterSpacing: 3, margin: 0 }}>TOURIFIQUE</p>
          <h1 className="ps-display" style={{ fontWeight: 700, fontSize: 22, color: '#fff', margin: '2px 0 0', letterSpacing: -0.4 }}>Your Passport</h1>
        </div>
        <div className="ps-actions">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(231,198,107,0.14)', border: '1px solid rgba(231,198,107,0.32)', color: GOLD, borderRadius: 999, padding: '7px 13px', fontSize: 13, fontWeight: 700 }}>
            ★ {points} pts
          </span>
          <Action onClick={share} ghost>Share</Action>
          <Action onClick={() => setShowAddPlace(true)}>+ Add stamp</Action>
        </div>
      </div>

      {/* ── the book ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 16px 0', perspective: 2000 }}>
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button
              key="cover"
              onClick={() => setOpened(true)}
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              animate={{ opacity: 1, y: [0, -10, 0], rotateX: 0 }}
              exit={{ rotateY: -158, opacity: 0, transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] } }}
              transition={{ y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6 }, rotateX: { duration: 0.6 } }}
              style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
            >
              <PassportCover places={places} />
            </motion.button>
          ) : (
            <motion.div
              key="spread"
              initial={{ opacity: 0, scale: 0.95, rotateY: 12 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%', maxWidth: 960 }}
            >
              <div className="ps-book">
                <DataPage {...{ fullName, surname, given, passNo, issued, expiry, profile, places, points, mrz1, mrz2 }} />
                <div className="ps-spine" />
                <StampsPage places={places} onAdd={() => setShowAddPlace(true)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            style={{ position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)', background: '#16A34A', color: '#fff', borderRadius: 999, padding: '11px 22px', fontSize: 14, fontWeight: 600, zIndex: 300 }}>
            ✓ Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* add-stamp modal */}
      <AnimatePresence>
        {showAddPlace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddPlace(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,6,24,0.72)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ y: 30, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }} onClick={e => e.stopPropagation()}
              style={{ background: PAPER_HI, borderRadius: 22, padding: '26px 24px 24px', width: '100%', maxWidth: 420, boxShadow: '0 40px 90px -30px rgba(0,0,0,0.7)', border: `1px solid ${GOLD}55` }}>
              <p style={{ color: GOLD_DEEP, fontSize: 10.5, fontWeight: 700, letterSpacing: 2, margin: 0 }}>NEW ENTRY</p>
              <h3 className="ps-display" style={{ fontWeight: 700, color: INK, margin: '4px 0 18px', fontSize: 22 }}>Stamp a destination</h3>
              <form onSubmit={handleAddPlace} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <Field2 placeholder="City (e.g. Kyoto)" value={newPlace.name} onChange={v => setNewPlace(p => ({ ...p, name: v }))} autoFocus />
                <Field2 placeholder="Country (e.g. Japan)" value={newPlace.country} onChange={v => setNewPlace(p => ({ ...p, country: v }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <Field2 placeholder="Lat (opt.)" type="number" value={newPlace.lat} onChange={v => setNewPlace(p => ({ ...p, lat: v }))} />
                  <Field2 placeholder="Lng (opt.)" type="number" value={newPlace.lng} onChange={v => setNewPlace(p => ({ ...p, lng: v }))} />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} type="submit"
                  style={{ marginTop: 4, background: `linear-gradient(135deg, ${INK}, #6D28D9)`, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 12px 26px -12px rgba(109,40,217,0.7)' }}>
                  Stamp it · +50 pts
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={e => handleFileUpload(e, uploadTargetId)} />
    </div>
  )
}

/* ─── slim action button ─── */
function Action({ children, onClick, ghost }) {
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onClick}
      style={{
        borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap',
        border: ghost ? '1px solid rgba(255,255,255,0.22)' : 'none',
        background: ghost ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`,
        color: ghost ? 'rgba(255,255,255,0.9)' : '#2A1B05',
      }}>
      {children}
    </motion.button>
  )
}

/* ─── closed cover ─── */
function PassportCover({ places }) {
  return (
    <div className="ps-cover" style={{
      width: 'min(86vw, 340px)', aspectRatio: '0.71', borderRadius: '6px 14px 14px 6px',
      background: `linear-gradient(135deg, ${COVER_B} 0%, ${COVER_A} 100%)`,
      boxShadow: '0 40px 80px -24px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'hidden', padding: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
    }}>
      {/* spine shading */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 14, background: 'linear-gradient(90deg, rgba(0,0,0,0.4), transparent)' }} />
      {/* gold frame */}
      <div style={{ position: 'absolute', inset: 14, border: `1px solid ${GOLD}55`, borderRadius: 8 }} />

      <EmblemGlobe size={96} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: GOLD, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: 5, margin: 0, textShadow: '0 1px 0 rgba(0,0,0,0.3)' }}>PASSPORT</p>
        <p style={{ color: 'rgba(231,198,107,0.7)', fontSize: 9.5, letterSpacing: 3, margin: '8px 0 0' }}>TRAVELPRENEUR · TOURIFIQUE</p>
      </div>
      <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 10.5, letterSpacing: 1.5 }}>
        {places.length} {places.length === 1 ? 'stamp' : 'stamps'} · tap to open
      </div>
    </div>
  )
}

/* ─── gold globe emblem (SVG) ─── */
function EmblemGlobe({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>
      <circle cx="50" cy="50" r="34" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="50" cy="50" r="34" stroke={GOLD} strokeWidth="0.5" opacity="0.5" transform="scale(1.18)" transformOrigin="50 50" />
      <ellipse cx="50" cy="50" rx="14" ry="34" stroke={GOLD} strokeWidth="1" />
      <ellipse cx="50" cy="50" rx="26" ry="34" stroke={GOLD} strokeWidth="0.8" opacity="0.7" />
      <line x1="16" y1="50" x2="84" y2="50" stroke={GOLD} strokeWidth="1" />
      <line x1="20" y1="33" x2="80" y2="33" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
      <line x1="20" y1="67" x2="80" y2="67" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />
      {/* little plane */}
      <path d="M50 8 l4 8 -4 -2 -4 2 z" fill={GOLD} />
    </svg>
  )
}

/* ─── ID / data page ─── */
function DataPage({ fullName, surname, given, passNo, issued, expiry, profile, places, points, mrz1, mrz2 }) {
  return (
    <div className="ps-page">
      <Guilloche />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <p style={{ ...lbl, color: GOLD_DEEP }}>TYPE / CODE / PASSPORT Nº</p>
            <p style={{ ...val, fontFamily: 'monospace', letterSpacing: 1 }}>P &nbsp; TRP &nbsp; {passNo}</p>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: GOLD_DEEP, border: `1px solid ${GOLD}`, borderRadius: 4, padding: '3px 7px' }}>TOURIFIQUE</span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* photo */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 96, height: 116, borderRadius: 8, background: `linear-gradient(160deg, ${profile?.archetype?.color || '#6D28D9'}22, ${profile?.archetype?.color || '#6D28D9'}44)`, border: `1.5px solid ${INK}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.4)' }}>
              {profile?.archetype?.emoji || '🌍'}
            </div>
            <p style={{ ...lbl, textAlign: 'center', marginTop: 6 }}>ID PHOTO</p>
          </div>
          {/* fields */}
          <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
            <FieldP label="Surname" value={surname} wide />
            <FieldP label="Given names" value={given || '—'} wide />
            <FieldP label="Nationality" value="TRAVELPRENEUR" />
            <FieldP label="Archetype" value={profile?.archetype?.title?.replace(/\s*[^\w\s].*$/, '') || '—'} />
            <FieldP label="Date of issue" value={fmtDate(issued)} />
            <FieldP label="Date of expiry" value={fmtDate(expiry)} />
          </div>
        </div>

        {/* signature */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px dashed ${INK}33`, paddingTop: 10 }}>
          <div>
            <p style={lbl}>HOLDER SIGNATURE</p>
            <p style={{ fontFamily: '"Brush Script MT", cursive', fontSize: 26, color: INK, margin: '-2px 0 0', transform: 'rotate(-3deg)' }}>{given || surname}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={lbl}>STAMPS</p>
            <p className="ps-display" style={{ fontSize: 26, fontWeight: 700, color: INK, margin: 0, lineHeight: 1 }}>{places.length}</p>
          </div>
        </div>

        {/* machine-readable zone */}
        <div style={{ marginTop: 14, background: PAPER_HI, borderRadius: 6, padding: '9px 10px', border: `1px solid ${INK}1a` }}>
          <p style={{ fontFamily: 'monospace', fontSize: 'clamp(8px,2.2vw,11px)', letterSpacing: 1, color: INK, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>{mrz1}</p>
          <p style={{ fontFamily: 'monospace', fontSize: 'clamp(8px,2.2vw,11px)', letterSpacing: 1, color: INK, margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden' }}>{mrz2}</p>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize: 8, fontWeight: 700, letterSpacing: 1.3, color: INK_SOFT, margin: 0, textTransform: 'uppercase' }
const val = { fontSize: 14, fontWeight: 600, color: INK, margin: '2px 0 0', fontFamily: 'Space Grotesk, sans-serif' }

function FieldP({ label, value, wide }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : 'auto', minWidth: 0 }}>
      <p style={lbl}>{label}</p>
      <p className="ps-display" style={{ fontSize: 13.5, fontWeight: 600, color: INK, margin: '2px 0 0', lineHeight: 1.2, wordBreak: 'break-word' }}>{value}</p>
    </div>
  )
}

/* ─── stamps page ─── */
function StampsPage({ places, onAdd }) {
  return (
    <div className="ps-page">
      <Guilloche />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <p style={{ ...lbl, fontSize: 9, letterSpacing: 2 }}>VISAS & ENTRIES</p>
          <p style={{ ...lbl, fontSize: 9 }}>TOURIFIQUE</p>
        </div>

        {places.length === 0 ? (
          <button onClick={onAdd} style={{ flex: 1, minHeight: 260, width: '100%', background: 'transparent', border: `2px dashed ${INK}33`, borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: INK_SOFT }}>
            <span style={{ fontSize: 34, opacity: 0.5 }}>✦</span>
            <span className="ps-display" style={{ fontWeight: 700, fontSize: 15, color: INK }}>No stamps yet</span>
            <span style={{ fontSize: 12.5 }}>Tap to stamp your first destination</span>
          </button>
        ) : (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6, alignContent: 'start', justifyItems: 'center', paddingTop: 6 }}>
            {places.map((p, i) => <VisaStamp key={p.id} place={p} i={i} />)}
            <button onClick={onAdd} aria-label="Add stamp" style={{ alignSelf: 'center', justifySelf: 'center', width: 56, height: 56, borderRadius: '50%', border: `2px dashed ${INK}40`, background: 'transparent', color: INK_SOFT, fontSize: 24, cursor: 'pointer', margin: 8 }}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── one visa stamp (arched SVG ink) ─── */
function VisaStamp({ place, i }) {
  const ink = STAMP_INKS[i % STAMP_INKS.length]
  const rot = [-11, 7, -5, 13, -8, 4, -14, 9][i % 8]
  const city = (place.name || '').split(',')[0].toUpperCase()
  const country = (place.country || (place.name || '').split(',')[1] || 'TOURIFIQUE').trim().toUpperCase()
  const icon = place.stamp || '✈'
  const uid = `st${i}`
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.6, rotate: rot - 6 }}
      animate={{ opacity: 1, scale: 1, rotate: rot }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 + i * 0.06 }}
      title={`${city} · ${place.date}`}
      style={{ mixBlendMode: 'multiply', filter: 'contrast(1.05)' }}
    >
      <svg width="124" height="124" viewBox="0 0 124 124" style={{ opacity: 0.9 }}>
        <defs>
          <path id={`top-${uid}`} d="M 24 62 A 38 38 0 0 1 100 62" />
          <path id={`bot-${uid}`} d="M 26 64 A 36 36 0 0 0 98 64" />
        </defs>
        <circle cx="62" cy="62" r="44" fill="none" stroke={ink} strokeWidth="2.4" />
        <circle cx="62" cy="62" r="38" fill="none" stroke={ink} strokeWidth="1" opacity="0.8" />
        <text fill={ink} fontSize="11" fontWeight="700" letterSpacing="1.2" fontFamily="Space Grotesk, sans-serif">
          <textPath href={`#top-${uid}`} startOffset="50%" textAnchor="middle">{city}</textPath>
        </text>
        <text fill={ink} fontSize="8.5" fontWeight="600" letterSpacing="1" fontFamily="Space Grotesk, sans-serif">
          <textPath href={`#bot-${uid}`} startOffset="50%" textAnchor="middle">{country}</textPath>
        </text>
        <text x="62" y="58" textAnchor="middle" fontSize="22" fill={ink}>{icon}</text>
        <text x="62" y="74" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="0.5" fill={ink} fontFamily="monospace">{(place.date || '').replace(/ /g, ' ')}</text>
        <line x1="34" y1="62" x2="40" y2="62" stroke={ink} strokeWidth="1.4" />
        <line x1="84" y1="62" x2="90" y2="62" stroke={ink} strokeWidth="1.4" />
      </svg>
    </motion.div>
  )
}

/* ─── faint security guilloché background ─── */
function Guilloche() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
      {[...Array(7)].map((_, i) => (
        <ellipse key={i} cx="200" cy="260" rx={60 + i * 24} ry={150 + i * 18} fill="none" stroke={INK} strokeWidth="0.6" transform={`rotate(${i * 12} 200 260)`} />
      ))}
      <circle cx="200" cy="260" r="120" fill="none" stroke={INK} strokeWidth="0.6" />
    </svg>
  )
}

/* ─── modal text field ─── */
function Field2({ placeholder, value, onChange, type = 'text', autoFocus }) {
  return (
    <input placeholder={placeholder} value={value} type={type} step="any" autoFocus={autoFocus}
      onChange={e => onChange(e.target.value)}
      style={{ background: '#fff', border: `1.5px solid ${INK}22`, borderRadius: 11, padding: '12px 14px', color: INK, fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }} />
  )
}

const CSS = `
  .ps-display { font-family: 'Space Grotesk', sans-serif; }
  .ps-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
  .ps-actions { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
  @media (max-width: 540px) {
    .ps-actions { width: 100%; }
  }
  .ps-book {
    display: grid; grid-template-columns: 1fr; gap: 0;
    background: linear-gradient(135deg, ${COVER_B}, ${COVER_A});
    padding: 12px; border-radius: 14px;
    box-shadow: 0 50px 110px -40px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(231,198,107,0.18);
  }
  .ps-page {
    position: relative; overflow: hidden;
    background: linear-gradient(168deg, ${PAPER_HI} 0%, ${PAPER} 100%);
    border-radius: 8px; padding: 20px;
    min-height: 460px;
    box-shadow: inset 0 0 40px rgba(42,27,87,0.06);
  }
  .ps-spine { display: none; }
  @media (min-width: 860px) {
    .ps-book { grid-template-columns: 1fr 14px 1fr; }
    .ps-spine {
      display: block;
      background: linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.28));
    }
    .ps-page { min-height: 520px; }
  }
`
