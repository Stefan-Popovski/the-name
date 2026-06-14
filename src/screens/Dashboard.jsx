import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toBlob } from 'html-to-image'
import worldMap from '@svg-maps/world'
import { useStore } from '../store/useStore'
import Confetti from '../components/Confetti'

/* ─────────────────────────────────────────────
   Tourifique — the Passport (light editorial)
   A real passport book: opens with animation,
   ID/data page from the user, visa stamps for
   every place they've been. Palette + type
   shared with the landing & reveal screens.
   ───────────────────────────────────────────── */

/* document ink + cover */
const INK = '#1E1640'              // deep indigo passport ink
const INK_SOFT = 'rgba(30,22,64,0.5)'
const PAPER = '#FFFFFF'            // page
const PAPER_HI = '#FBFAFE'
const CREAM = '#F4EEDC'            // cover
const CREAM_HI = '#FCF8EF'
const GOLD = '#C9A24A'
const GOLD_DEEP = '#9A7426'

/* landing chrome */
const PURPLE = '#6D28D9'
const YELLOW = '#FACC15'
const TINT = '#FAF8FD'
const LINE = '#ECE8F3'
const LILAC = '#F4EEFF'
const LILAC_BD = '#E4D7FB'

const STAMP_ICONS = ['✈', '☼', '⚓', '☕', '⛩', '☘', '★', '✶']
const STAMP_INKS = ['#6D28D9', '#1F7A6B', '#B0413E', '#27407A', '#A85B1F', '#7A2E6B']
const TEXT_PRES = '︎' // force monochrome glyph rendering (no color emoji)

const hashStr = (s = '') => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }
const pad = (s, n) => (s + '<'.repeat(n)).slice(0, n)
const fmtDate = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
const stripEmoji = (s = '') => s
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, '')
  .replace(/\s{2,}/g, ' ').trim()

export default function Dashboard() {
  const { user, places, addPlace, addPhotosToPlace } = useStore()
  const profile = user?.profile

  const [opened, setOpened] = useState(false)
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [newPlace, setNewPlace] = useState({ name: '', country: '', lat: '', lng: '' })
  const fileInputRef = useRef(null)
  const [uploadTargetId, setUploadTargetId] = useState(null)
  const bookRef = useRef(null)
  const [sharing, setSharing] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [toastMsg, setToastMsg] = useState('Copied to clipboard')

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

  function flashToast(msg) {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2200)
  }

  async function share() {
    if (sharing) return
    setSharing(true)
    try {
      // the book must be open to capture it
      if (!opened) { setOpened(true); await new Promise(r => setTimeout(r, 950)) }
      const node = bookRef.current
      if (!node) throw new Error('not ready')

      // hide the heavy world-map watermarks during capture, then let it repaint
      setCapturing(true)
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true, skipFonts: true, backgroundColor: '#FAF8FD' })
      if (!blob) throw new Error('capture failed')

      const arche = stripEmoji(profile?.archetype?.title || '')
      const file = new File([blob], 'tourifique-passport.png', { type: 'image/png' })
      const text = `My Tourifique Passport — ${fullName}${arche ? `, ${arche}` : ''}. ${places.length} stamps`

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Tourifique Passport', text })
      } else {
        // no native file share — download the image instead
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'tourifique-passport.png'
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        flashToast('Passport saved as image')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') flashToast("Couldn't create image")
    } finally {
      setCapturing(false)
      setSharing(false)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', paddingBottom: 110, background: TINT, fontFamily: 'Inter, sans-serif' }}>
      <style>{CSS}</style>
      {/* soft top wash, tinted by archetype */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(90% 45% at 50% -5%, ${(profile?.archetype?.color || PURPLE)}12, transparent 55%)` }} />
      {/* faint world map behind the book */}
      <div aria-hidden style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', width: 'min(150vw, 1100px)', pointerEvents: 'none', zIndex: 0, opacity: 0.05 }}>
        <WorldMap color={INK} />
      </div>
      <Confetti active={showConfetti} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── slim action bar ── */}
        <div className="ps-head" style={{ maxWidth: 980, margin: '0 auto', padding: '26px 24px 6px' }}>
          <div>
            <p style={{ color: PURPLE, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>TOURIFIQUE</p>
            <h1 className="ps-display" style={{ fontWeight: 700, fontSize: 24, color: INK, margin: '3px 0 0', letterSpacing: -0.5 }}>Your Passport</h1>
          </div>
          <div className="ps-actions">
            <Action onClick={share} ghost>{sharing ? 'Saving…' : 'Share'}</Action>
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
                animate={{ opacity: 1, y: [0, -10, 0], rotate: [0, -1, 0], rotateX: 0 }}
                exit={{ rotateY: -162, opacity: 0, boxShadow: '40px 0 60px -30px rgba(0,0,0,0.5)', transition: { duration: 0.6, ease: [0.45, 0, 0.55, 1] } }}
                transition={{ y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6 }, rotateX: { duration: 0.6 } }}
                style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
              >
                <PassportCover places={places} />
              </motion.button>
            ) : (
              <motion.div
                key="spread"
                initial={{ opacity: 0, scale: 0.96, rotateY: -42 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 85, damping: 15 }}
                style={{ width: '100%', maxWidth: 960, transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
              >
                <div className={`ps-book${capturing ? ' capturing' : ''}`} ref={bookRef}>
                  <DataPage {...{ fullName, surname, given, passNo, issued, expiry, profile, places, mrz1, mrz2 }} />
                  <div className="ps-spine" />
                  <StampsPage places={places} onAdd={() => setShowAddPlace(true)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            style={{ position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)', background: '#16A34A', color: '#fff', borderRadius: 999, padding: '11px 22px', fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: '0 16px 36px -16px rgba(22,163,74,0.6)' }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* add-stamp modal */}
      <AnimatePresence>
        {showAddPlace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddPlace(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,31,0.5)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ y: 30, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }} onClick={e => e.stopPropagation()}
              style={{ background: PAPER, borderRadius: 22, padding: '26px 24px 24px', width: '100%', maxWidth: 420, boxShadow: '0 40px 90px -30px rgba(20,16,31,0.45)', border: `1px solid ${LINE}` }}>
              <p style={{ color: PURPLE, fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>NEW ENTRY</p>
              <h3 className="ps-display" style={{ fontWeight: 700, color: INK, margin: '4px 0 18px', fontSize: 22, letterSpacing: -0.4 }}>Stamp a destination</h3>
              <form onSubmit={handleAddPlace} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <Field2 placeholder="City (e.g. Kyoto)" value={newPlace.name} onChange={v => setNewPlace(p => ({ ...p, name: v }))} autoFocus />
                <Field2 placeholder="Country (e.g. Japan)" value={newPlace.country} onChange={v => setNewPlace(p => ({ ...p, country: v }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <Field2 placeholder="Lat (opt.)" type="number" value={newPlace.lat} onChange={v => setNewPlace(p => ({ ...p, lat: v }))} />
                  <Field2 placeholder="Lng (opt.)" type="number" value={newPlace.lng} onChange={v => setNewPlace(p => ({ ...p, lng: v }))} />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} type="submit"
                  style={{ marginTop: 4, background: `linear-gradient(135deg, ${PURPLE}, #8B5CF6)`, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 12px 26px -12px rgba(109,40,217,0.6)' }}>
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
        borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap',
        border: ghost ? `1px solid ${LINE}` : 'none',
        background: ghost ? '#fff' : `linear-gradient(135deg, ${PURPLE}, #8B5CF6)`,
        color: ghost ? INK : '#fff',
        boxShadow: ghost ? 'none' : '0 10px 24px -12px rgba(109,40,217,0.6)',
      }}>
      {children}
    </motion.button>
  )
}

/* ─── closed cover (light cream + gold foil) ─── */
function PassportCover({ places }) {
  return (
    <div className="ps-cover" style={{
      width: 'min(86vw, 340px)', aspectRatio: '0.71', borderRadius: '6px 14px 14px 6px',
      background: `linear-gradient(150deg, ${CREAM_HI} 0%, ${CREAM} 100%)`,
      boxShadow: '0 44px 90px -36px rgba(30,22,64,0.42), inset 0 0 0 1px rgba(201,162,74,0.25)',
      position: 'relative', overflow: 'hidden', padding: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
    }}>
      {/* spine shading */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 14, background: 'linear-gradient(90deg, rgba(30,22,64,0.14), transparent)' }} />
      {/* gold frame */}
      <div style={{ position: 'absolute', inset: 14, border: `1px solid ${GOLD}`, opacity: 0.55, borderRadius: 8 }} />
      {/* gold shine sweep */}
      <motion.div aria-hidden
        initial={{ x: '-130%' }}
        animate={{ x: ['-130%', '170%'] }}
        transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3.6 }}
        style={{ position: 'absolute', top: -20, bottom: -20, width: '42%', transform: 'skewX(-18deg)', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.5), transparent)', pointerEvents: 'none' }}
      />

      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <EmblemGlobe size={96} color={GOLD_DEEP} />
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: GOLD_DEEP, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: 5, margin: 0 }}>PASSPORT</p>
        <p style={{ color: INK_SOFT, fontSize: 9.5, letterSpacing: 3, margin: '8px 0 0' }}>TRAVELPRENEUR · TOURIFIQUE</p>
      </div>
      <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', color: INK_SOFT, fontSize: 10.5, letterSpacing: 1.5 }}>
        {places.length} {places.length === 1 ? 'stamp' : 'stamps'} · tap to open
      </div>
    </div>
  )
}

/* ─── gold globe emblem (SVG) ─── */
function EmblemGlobe({ size = 96, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="34" stroke={color} strokeWidth="1.4" />
      <circle cx="50" cy="50" r="34" stroke={color} strokeWidth="0.5" opacity="0.5" transform="scale(1.18)" transformOrigin="50 50" />
      <ellipse cx="50" cy="50" rx="14" ry="34" stroke={color} strokeWidth="1" />
      <ellipse cx="50" cy="50" rx="26" ry="34" stroke={color} strokeWidth="0.8" opacity="0.7" />
      <line x1="16" y1="50" x2="84" y2="50" stroke={color} strokeWidth="1" />
      <line x1="20" y1="33" x2="80" y2="33" stroke={color} strokeWidth="0.7" opacity="0.7" />
      <line x1="20" y1="67" x2="80" y2="67" stroke={color} strokeWidth="0.7" opacity="0.7" />
      {/* little plane */}
      <path d="M50 8 l4 8 -4 -2 -4 2 z" fill={color} />
    </svg>
  )
}

/* ─── ID / data page ─── */
function DataPage({ fullName, surname, given, passNo, issued, expiry, profile, places, mrz1, mrz2 }) {
  const accent = profile?.archetype?.color || PURPLE
  const initials = ((given?.[0] || '') + (surname?.[0] || '')).toUpperCase() || 'T'
  const archetype = stripEmoji(profile?.archetype?.title || '') || '—'
  return (
    <div className="ps-page">
      <PageMap />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ ...lbl, color: GOLD_DEEP }}>TYPE / CODE / PASSPORT Nº</p>
            <p style={{ ...val, fontFamily: 'monospace', letterSpacing: 1 }}>P &nbsp; TRP &nbsp; {passNo}</p>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: GOLD_DEEP, border: `1px solid ${GOLD}`, borderRadius: 4, padding: '3px 7px' }}>TOURIFIQUE</span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* photo → monogram */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 96, height: 116, borderRadius: 8, background: `linear-gradient(160deg, ${accent}14, ${accent}33)`, border: `1px solid ${accent}3a`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.55)' }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 44, color: accent, lineHeight: 1 }}>{initials}</span>
            </div>
            <p style={{ ...lbl, textAlign: 'center', marginTop: 6 }}>ID PHOTO</p>
          </div>
          {/* fields */}
          <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
            <FieldP label="Surname" value={surname} wide />
            <FieldP label="Given names" value={given || '—'} wide />
            <FieldP label="Nationality" value="TRAVELPRENEUR" />
            <FieldP label="Archetype" value={archetype} />
            <FieldP label="Date of issue" value={fmtDate(issued)} />
            <FieldP label="Date of expiry" value={fmtDate(expiry)} />
          </div>
        </div>

        {/* signature */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px dashed ${INK}26`, paddingTop: 12 }}>
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
        <div style={{ marginTop: 16, background: PAPER_HI, borderRadius: 6, padding: '9px 10px', border: `1px solid ${INK}14` }}>
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
      <PageMap />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <p style={{ ...lbl, fontSize: 9, letterSpacing: 2 }}>VISAS & ENTRIES</p>
          <p style={{ ...lbl, fontSize: 9 }}>TOURIFIQUE</p>
        </div>

        {places.length === 0 ? (
          <button onClick={onAdd} style={{ flex: 1, minHeight: 260, width: '100%', background: 'transparent', border: `2px dashed ${INK}26`, borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: INK_SOFT }}>
            <EmblemGlobe size={44} color={`${INK}66`} />
            <span className="ps-display" style={{ fontWeight: 700, fontSize: 15, color: INK }}>No stamps yet</span>
            <span style={{ fontSize: 12.5 }}>Tap to stamp your first destination</span>
          </button>
        ) : (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6, alignContent: 'start', justifyItems: 'center', paddingTop: 6 }}>
            {places.map((p, i) => <VisaStamp key={p.id} place={p} i={i} />)}
            <button onClick={onAdd} aria-label="Add stamp" style={{ alignSelf: 'center', justifySelf: 'center', width: 56, height: 56, borderRadius: '50%', border: `2px dashed ${INK}33`, background: 'transparent', color: INK_SOFT, fontSize: 24, cursor: 'pointer', margin: 8 }}>+</button>
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
  const icon = (place.stamp || '✈') + TEXT_PRES
  const uid = `st${i}`
  const land = 0.1 + i * 0.09
  return (
    <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
      {/* impact ring on landing */}
      <motion.span aria-hidden
        initial={{ scale: 0.45, opacity: 0 }}
        animate={{ scale: 1.55, opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.5, delay: land, ease: 'easeOut' }}
        style={{ position: 'absolute', width: 92, height: 92, borderRadius: '50%', border: `2px solid ${ink}`, pointerEvents: 'none' }}
      />
    <motion.div
      initial={{ opacity: 0, scale: 2.2, rotate: rot - 12 }}
      animate={{ opacity: [0, 1, 1, 1], scale: [2.2, 0.86, 1.05, 1], rotate: rot }}
      transition={{ duration: 0.46, delay: land, ease: [0.3, 0.85, 0.35, 1], times: [0, 0.5, 0.78, 1] }}
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
    </div>
  )
}

/* ─── faint world-globe map watermark (page background) ─── */
function WorldMap({ opacity = 1, color = INK }) {
  return (
    <svg viewBox={worldMap.viewBox} preserveAspectRatio="xMidYMid meet"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}>
      <g fill={color} stroke={color} strokeWidth="0.4" strokeLinejoin="round">
        {worldMap.locations.map(l => <path key={l.id} d={l.path} />)}
      </g>
    </svg>
  )
}

/* ─── faint security guilloché background ─── */
function PageMap({ opacity = 0.07 }) {
  return (
    <div aria-hidden className="ps-worldmap" style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 10 }}>
      <WorldMap color={INK} opacity={opacity} />
    </div>
  )
}

/* ─── modal text field ─── */
function Field2({ placeholder, value, onChange, type = 'text', autoFocus }) {
  return (
    <input placeholder={placeholder} value={value} type={type} step="any" autoFocus={autoFocus}
      onChange={e => onChange(e.target.value)}
      onFocus={e => e.target.style.borderColor = PURPLE}
      onBlur={e => e.target.style.borderColor = LINE}
      style={{ background: '#fff', border: `1.5px solid ${LINE}`, borderRadius: 11, padding: '12px 14px', color: INK, fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%', transition: 'border-color 0.18s' }} />
  )
}

const CSS = `
  .ps-display { font-family: 'Space Grotesk', sans-serif; }
  .ps-book.capturing .ps-worldmap { display: none; }
  .ps-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
  .ps-actions { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
  @media (max-width: 540px) {
    .ps-actions { width: 100%; }
  }
  .ps-book {
    display: grid; grid-template-columns: 1fr; gap: 0;
    background: linear-gradient(160deg, ${CREAM_HI}, ${CREAM});
    padding: 12px; border-radius: 16px;
    border: 1px solid ${LINE};
    box-shadow: 0 44px 96px -48px rgba(30,22,64,0.4), inset 0 0 0 1px rgba(201,162,74,0.16);
  }
  .ps-page {
    position: relative; overflow: hidden;
    background: ${PAPER};
    border: 1px solid ${LINE};
    border-radius: 10px; padding: 20px;
    min-height: 460px;
    box-shadow: 0 1px 2px rgba(30,22,64,0.05);
  }
  .ps-spine { display: none; }
  @media (min-width: 860px) {
    .ps-book { grid-template-columns: 1fr 16px 1fr; }
    .ps-spine {
      display: block; border-radius: 2px;
      background: linear-gradient(90deg, rgba(30,22,64,0.12), rgba(30,22,64,0.02) 45%, rgba(30,22,64,0.02) 55%, rgba(30,22,64,0.12));
    }
    .ps-page { min-height: 520px; }
  }
`
