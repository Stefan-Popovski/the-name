import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

/* palette — shared with the landing page */
const INK = '#14101F'
const BODY = '#574F69'
const MUTE = '#938CA8'
const LINE = '#ECE8F3'
const PURPLE = '#6D28D9'
const LILAC = '#F4EEFF'
const LILAC_BD = '#E4D7FB'

/* simple line icons (mobile bottom nav) */
const ICONS = {
  passport: <g><rect x="5" y="3" width="14" height="18" rx="2.5" /><circle cx="12" cy="10.5" r="3" /><path d="M9.5 17h5" /></g>,
  map: <g><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" /><path d="M9 4v14M15 6v14" /></g>,
  store: <g><path d="M6 8h12l-1 11.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></g>,
  profile: <g><circle cx="12" cy="8" r="3.6" /><path d="M5 20a7 7 0 0 1 14 0" /></g>,
}

const tabs = [
  { path: '/dashboard', label: 'Passport', icon: 'passport' },
  { path: '/map', label: 'Map', icon: 'map' },
  { path: '/store', label: 'Store', icon: 'store' },
  { path: '/profile', label: 'Profile', icon: 'profile' },
]

function TabIcon({ name, active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? PURPLE : MUTE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  )
}

export default function AppNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useStore()

  const isApp = tabs.some(t => t.path === location.pathname)
  if (!isApp) return null

  const Logo = (
    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: INK, cursor: 'pointer' }}
      onClick={() => navigate('/dashboard')}>
      touri<span style={{ color: PURPLE }}>fique</span>
    </span>
  )

  return (
    <>
      {/* ── Desktop top nav (landing style) ── */}
      <nav className="top-nav-links" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${LINE}`,
        height: 64,
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        {Logo}

        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(tab => {
            const active = location.pathname === tab.path
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} style={{
                background: active ? LILAC : 'transparent',
                border: active ? `1px solid ${LILAC_BD}` : '1px solid transparent',
                borderRadius: 10, padding: '7px 16px', cursor: 'pointer',
                color: active ? PURPLE : BODY,
                fontSize: 14.5, fontWeight: active ? 700 : 500,
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              }}>
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: MUTE, fontSize: 14, fontWeight: 500 }}>{user?.name}</span>
        </div>
      </nav>

      {/* Spacer for desktop top nav */}
      <div className="top-nav-links" style={{ height: 64 }} />

      {/* ── Mobile bottom nav (light) ── */}
      <motion.nav
        className="bottom-nav-bar"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${LINE}`,
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
          justifyContent: 'space-around', padding: '8px 0 6px',
        }}
      >
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 20px', position: 'relative',
            }}>
              {active && (
                <motion.div layoutId="mob-dot" style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 2, borderRadius: 1, background: PURPLE,
                }} />
              )}
              <TabIcon name={tab.icon} active={active} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? PURPLE : MUTE }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </motion.nav>
    </>
  )
}
