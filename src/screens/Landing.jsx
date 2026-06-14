import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────
   Tourifique — lean editorial landing
   Hero banner · comparison table · TikTok showcase
   ───────────────────────────────────────────── */

const INK = '#14101F'
const BODY = '#574F69'
const MUTE = '#938CA8'
const LINE = '#ECE8F3'
const PURPLE = '#6D28D9'
const DEEP = '#4C1D95'
const YELLOW = '#FACC15'
const TINT = '#FAF8FD'
const LILAC = '#F4EEFF'
const LILAC_BD = '#E4D7FB'
const GREEN = '#16A34A'
const GREEN_BG = '#E7F6EC'
const AMBER = '#C2820B'

const IMGV = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&h=1100&q=80`
const AV = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=120&h=120&q=80`

/* ─── Buttons ─── */
function Btn({ children, onClick, variant = 'primary', size = 'md' }) {
  const pad = size === 'lg' ? '15px 32px' : size === 'sm' ? '10px 20px' : '13px 26px'
  const fs = size === 'lg' ? 16 : size === 'sm' ? 14 : 15
  const styles = {
    primary: { background: `linear-gradient(135deg,${PURPLE},#8B5CF6)`, color: '#fff', border: 'none', boxShadow: '0 10px 26px -10px rgba(109,40,217,0.6)' },
    yellow: { background: `linear-gradient(135deg,${YELLOW},#F59E0B)`, color: INK, border: 'none', boxShadow: '0 10px 24px -10px rgba(245,158,11,0.6)' },
    glass: { background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.55)', boxShadow: 'none', backdropFilter: 'blur(8px)' },
  }[variant]
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onClick}
      style={{ ...styles, borderRadius: 12, padding: pad, fontSize: fs, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', cursor: 'pointer', letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
      {children}
    </motion.button>
  )
}
const Eyebrow = ({ children }) => <p style={{ color: PURPLE, fontSize: 12.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>{children}</p>
const H2 = ({ children, light }) => <h2 className="section-title font-display" style={{ fontWeight: 700, color: light ? '#fff' : INK, margin: '0 0 18px', lineHeight: 1.08, letterSpacing: '-0.5px' }}>{children}</h2>
const Reveal = ({ children, delay = 0, y = 26, style }) => (
  <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay }} style={style}>{children}</motion.div>
)

/* ─── Comparison marks ─── */
const CheckMark = () => (
  <span style={{ display: 'inline-flex', width: 34, height: 34, borderRadius: '50%', background: GREEN_BG, alignItems: 'center', justifyContent: 'center' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
  </span>
)
const CrossMark = () => (
  <span style={{ display: 'inline-flex', width: 34, height: 34, borderRadius: '50%', background: '#F2F1F5', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2BDCC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
  </span>
)
const Mark = ({ v }) => v === 'yes' ? <CheckMark /> : v === 'rare' ? <span style={{ color: AMBER, fontWeight: 700, fontSize: 13.5 }}>rarely</span> : <CrossMark />

/* ─── TikTok rail icons ─── */
const RailIcon = ({ path, count, fill }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill={fill || 'none'} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>{path}</svg>
    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{count}</span>
  </div>
)

/* ─── Nav ─── */
function LandingNav({ onStart }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, height: 66,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      background: scrolled ? 'rgba(255,255,255,0.82)' : 'transparent',
      backdropFilter: scrolled ? 'blur(18px)' : 'none',
      borderBottom: `1px solid ${scrolled ? LINE : 'transparent'}`, transition: 'all 0.3s',
    }}>
      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 21, letterSpacing: -0.5, color: scrolled ? INK : '#fff', transition: 'color 0.3s', textShadow: scrolled ? 'none' : '0 1px 12px rgba(0,0,0,0.3)' }}>
        touri<span style={{ color: scrolled ? PURPLE : YELLOW }}>fique</span>
      </span>
      <div className="top-nav-links" style={{ gap: 30, alignItems: 'center' }}>
        {['Compare', 'Creators'].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ color: scrolled ? BODY : 'rgba(255,255,255,0.85)', fontSize: 14.5, textDecoration: 'none', fontWeight: 500, textShadow: scrolled ? 'none' : '0 1px 10px rgba(0,0,0,0.3)' }}>{l}</a>
        ))}
      </div>
      <Btn onClick={onStart} size="sm">Get started</Btn>
    </nav>
  )
}

/* ─── Responsive CSS ─── */
const CSS = `
  .tik-grid  { grid-template-columns:1fr 1fr; }
  .foot-grid { grid-template-columns:1fr 1fr; }
  @media(min-width:620px){ .tik-grid { grid-template-columns:repeat(4,1fr); } }
  @media(min-width:680px){ .foot-grid { grid-template-columns:2fr 1fr 1fr 1fr; } }
`

export default function Landing() {
  const navigate = useNavigate()
  const go = () => navigate('/signup')

  const rows = [
    { label: 'Posts their trips', sub: 'shares to a feed', traveler: 'yes', trav: 'yes' },
    { label: 'Knows which brands fit them', sub: 'no more guessing', traveler: 'no', trav: 'yes' },
    { label: 'Has a shareable media kit', sub: 'a one-tap brand profile', traveler: 'no', trav: 'yes' },
    { label: 'Every stop mapped & stamped', sub: 'a living portfolio', traveler: 'no', trav: 'yes' },
    { label: 'Earns points & rewards', sub: 'perks for posting', traveler: 'no', trav: 'yes' },
    { label: 'Matched with paid collabs', sub: 'brands come to you', traveler: 'no', trav: 'yes' },
    { label: 'Trips pay for themselves', sub: 'travel becomes income', traveler: 'rare', trav: 'yes' },
  ]

  const tiks = [
    { img: IMGV('1527631746610-bca00a040d60'), handle: '@lexi.goes', cap: 'POV: your trip just paid for itself ✈️', likes: '248K', comments: '1,204' },
    { img: IMGV('1502920917128-1aa500764cbd'), handle: '@amara.travels', cap: 'how I pitch hotels & get a yes 🏨', likes: '410K', comments: '3,981' },
    { img: IMGV('1503220317375-aaad61436b1b'), handle: '@miguelvoyage', cap: '3 brand deals in 6 weeks 🤝', likes: '192K', comments: '880' },
    { img: IMGV('1539635278303-d4002c07eae3'), handle: '@sol.wanders', cap: 'stamping country #30 🌍', likes: '88K', comments: '502' },
  ]

  return (
    <div style={{ background: '#fff', color: INK, fontFamily: 'Inter, sans-serif' }}>
      <style>{CSS}</style>
      <LandingNav onStart={go} />

      {/* ══════════ HERO ══════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <motion.img src="/public.png" alt="World landmarks gathered around the globe"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(95deg, rgba(13,7,28,0.92) 0%, rgba(13,7,28,0.6) 40%, rgba(13,7,28,0.12) 74%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,7,28,0.55) 0%, transparent 22%, transparent 46%, rgba(13,7,28,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 30% 50%, transparent 40%, rgba(8,4,18,0.55) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 60%, rgba(76,29,149,0.22) 100%)', mixBlendMode: 'screen' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', paddingTop: 130, paddingBottom: 'clamp(60px,9vh,108px)' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 680 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, letterSpacing: 0.4, marginBottom: 26 }}>
              <span style={{ position: 'relative', width: 7, height: 7 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: YELLOW }} />
                <motion.span animate={{ scale: [1, 2.4], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: YELLOW }} />
              </span>
              The platform for travel creators
            </span>
            <h1 className="hero-title font-display" style={{ fontWeight: 700, lineHeight: 1.0, margin: '0 0 24px', letterSpacing: '-1px', color: '#fff', textShadow: '0 4px 44px rgba(0,0,0,0.5)' }}>
              Turn every trip<br />into a <span style={{ color: YELLOW }}>brand deal.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px,1.7vw,20px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 36px', maxWidth: 540, textShadow: '0 2px 18px rgba(0,0,0,0.45)' }}>
              Discover your creator archetype, map your journey, and get matched with the travel brands who want to pay for your content — all from one Passport.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 34 }}>
              <Btn onClick={go} variant="yellow" size="lg">Start for free →</Btn>
              <Btn variant="glass" size="lg" onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}>See the difference</Btn>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {[AV('1494790108377-be9c29b29330'), AV('1500648767791-00dcc994a43e'), AV('1534528741775-53994a69daeb')].map((a, i) => (
                  <img key={i} src={a} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.9)', marginLeft: i > 0 ? -11 : 0, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} />
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}>
                Trusted by <strong style={{ color: '#fff' }}>2,400+</strong> creators in <strong style={{ color: '#fff' }}>50+</strong> countries
              </span>
            </div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.button onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
          <span style={{ width: 26, height: 42, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'center', paddingTop: 7 }}>
            <motion.span animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 4, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.85)' }} />
          </span>
        </motion.button>
      </section>

      {/* ══════════ COMPARISON TABLE ══════════ */}
      <section id="compare" style={{ background: TINT, padding: 'clamp(72px,9vw,116px) 0' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
            <Eyebrow>The difference</Eyebrow>
            <H2>Anyone can travel.<br />Few travel like a Travelpreneur.</H2>
            <p style={{ color: BODY, fontSize: 17, lineHeight: 1.7, margin: 0 }}>Same trips, same content — completely different outcome. Here’s what changes the moment you carry a Tourifique Passport.</p>
          </Reveal>

          <Reveal>
            <div style={{ overflowX: 'auto', borderRadius: 28 }}>
              <div style={{ minWidth: 560, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 28, padding: 'clamp(10px,2vw,18px)', boxShadow: '0 40px 90px -50px rgba(20,16,31,0.5)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1.7fr) 1fr 1fr' }}>
                  {/* header */}
                  <div style={{ padding: '18px 20px' }} />
                  <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, color: MUTE }}>Just traveling</span>
                  </div>
                  <div style={{ padding: '16px 12px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', background: LILAC, borderLeft: `1px solid ${LILAC_BD}`, borderRight: `1px solid ${LILAC_BD}`, borderTop: `1px solid ${LILAC_BD}`, borderRadius: '18px 18px 0 0' }}>
                    <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${DEEP},${PURPLE})`, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, borderRadius: 999, padding: '8px 18px', boxShadow: '0 8px 20px -8px rgba(109,40,217,0.6)' }}>Travelpreneur</span>
                  </div>

                  {/* rows */}
                  {rows.map((r, i) => {
                    const last = i === rows.length - 1
                    const hl = {
                      background: LILAC,
                      borderLeft: `1px solid ${LILAC_BD}`, borderRight: `1px solid ${LILAC_BD}`,
                      borderBottom: last ? `1px solid ${LILAC_BD}` : 'none',
                      borderRadius: last ? '0 0 18px 18px' : '0',
                    }
                    const cellBorder = last ? 'none' : `1px solid ${LINE}`
                    return (
                      <div key={r.label} style={{ display: 'contents' }}>
                        <div style={{ padding: '20px 20px', borderBottom: cellBorder, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 15.5, color: INK }}>{r.label}</span>
                          <span style={{ fontSize: 13, color: MUTE, marginTop: 2 }}>{r.sub}</span>
                        </div>
                        <div style={{ padding: '20px 12px', borderBottom: cellBorder, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mark v={r.traveler} />
                        </div>
                        <div style={{ padding: '20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...hl }}>
                          <Mark v={r.trav} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} style={{ textAlign: 'center', marginTop: 40 }}>
            <Btn onClick={go} size="lg">Become a Travelpreneur →</Btn>
          </Reveal>
        </div>
      </section>

      {/* ══════════ TIKTOK SHOWCASE ══════════ */}
      <section id="creators" style={{ background: '#fff', padding: 'clamp(72px,9vw,116px) 0' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 48px' }}>
            <Eyebrow>On the feed</Eyebrow>
            <H2>Trips that turned into trending.</H2>
            <p style={{ color: BODY, fontSize: 17, lineHeight: 1.7, margin: 0 }}>Real Travelpreneurs are already turning Passports into paid partnerships — one post at a time.</p>
          </Reveal>

          <div className="tik-grid" style={{ display: 'grid', gap: 18 }}>
            {tiks.map((t, i) => (
              <Reveal key={t.handle} delay={i * 0.08}>
                <motion.div whileHover={{ y: -8 }} onClick={go}
                  style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', aspectRatio: '9/16', cursor: 'pointer', boxShadow: '0 30px 60px -30px rgba(20,16,31,0.55)', background: '#000' }}>
                  <img src={t.img} alt={t.handle} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, transparent 28%, transparent 52%, rgba(0,0,0,0.78) 100%)' }} />

                  {/* duration chip */}
                  <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 7, padding: '4px 8px' }}>0:{14 + i}</span>

                  {/* play button */}
                  <motion.div initial={{ scale: 0.9, opacity: 0.85 }} whileHover={{ scale: 1 }}
                    style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%,-50%)', width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5.5v13l11-6.5z" /></svg>
                  </motion.div>

                  {/* right rail */}
                  <div style={{ position: 'absolute', right: 10, bottom: 70, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <RailIcon fill="#fff" count={t.likes} path={<path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.3 4 2.5.8-1.2 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z" />} />
                    <RailIcon count={t.comments} path={<path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />} />
                    <RailIcon count="Share" path={<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />} />
                  </div>

                  {/* handle + caption */}
                  <div style={{ position: 'absolute', left: 14, right: 56, bottom: 16 }}>
                    <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: '0 0 5px', fontFamily: 'Space Grotesk, sans-serif', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{t.handle}</p>
                    <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12.5, lineHeight: 1.4, margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{t.cap}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section style={{ background: '#fff', padding: '0 0 clamp(72px,9vw,110px)' }}>
        <div className="container">
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, padding: 'clamp(64px,9vw,120px) 32px', textAlign: 'center', boxShadow: '0 50px 100px -40px rgba(76,29,149,0.55)' }}>
            {/* photo background */}
            <img src="/P9300402-573af9506e43a__880.jpg" alt="" decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 55%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(76,29,149,0.93) 0%, rgba(46,16,101,0.86) 52%, rgba(18,10,38,0.9) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 55% at 50% 28%, rgba(250,204,21,0.18), transparent 70%)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '7px 16px' }}>
                <span style={{ color: YELLOW, letterSpacing: 2, fontSize: 13 }}>★★★★★</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>Loved by 2,400+ creators</span>
              </div>
              <H2 light>Your Passport is waiting<br />to be claimed.</H2>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.65, maxWidth: 470, margin: '0 auto 34px', textShadow: '0 1px 12px rgba(0,0,0,0.3)' }}>Free forever to start. No credit card. Just you, your story, and the entire world.</p>
              <Btn onClick={go} variant="yellow" size="lg">Create my Passport — it’s free →</Btn>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 18 }}>Takes 3 minutes · No app download · Works on any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: TINT, borderTop: `1px solid ${LINE}`, padding: 'clamp(48px,6vw,72px) 0 36px' }}>
        <div className="container">
          <div className="foot-grid" style={{ display: 'grid', gap: 36, marginBottom: 44 }}>
            <div style={{ maxWidth: 280 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 22, color: INK }}>touri<span style={{ color: PURPLE }}>fique</span></span>
              <p style={{ color: BODY, fontSize: 14.5, lineHeight: 1.65, margin: '14px 0 0' }}>The creator economy for travel. Turn the places you go into the brand deals you want.</p>
            </div>
            {[
              { h: 'Product', links: ['Features', 'Compare', 'Pricing', 'Rewards'] },
              { h: 'Company', links: ['About', 'Creators', 'Careers', 'Press'] },
              { h: 'Legal', links: ['Privacy', 'Terms', 'Contact', 'Cookies'] },
            ].map(col => (
              <div key={col.h}>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: INK, margin: '0 0 16px' }}>{col.h}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {col.links.map(l => <a key={l} href="#" style={{ color: BODY, fontSize: 14, textDecoration: 'none' }}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: MUTE, fontSize: 12.5, margin: 0 }}>© 2026 Tourifique. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Instagram', 'TikTok', 'YouTube'].map(s => <a key={s} href="#" style={{ color: MUTE, fontSize: 12.5, textDecoration: 'none' }}>{s}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
