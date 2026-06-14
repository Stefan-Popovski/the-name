import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import PointsBadge from './PointsBadge'

const tabs = [
  { path: '/dashboard', label: 'Passport', emoji: '🛂' },
  { path: '/map', label: 'Map', emoji: '🌍' },
  { path: '/store', label: 'Store', emoji: '🛍️' },
  { path: '/profile', label: 'Profile', emoji: '👤' },
]

export default function AppNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useStore()

  const isApp = tabs.some(t => t.path === location.pathname)
  if (!isApp) return null

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav className="top-nav-links" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(14,10,30,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: 60,
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#FACC15', letterSpacing: -0.5 }}>
          tourifique
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(tab => {
            const active = location.pathname === tab.path
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} style={{
                background: active ? 'rgba(109,40,217,0.3)' : 'none',
                border: active ? '1px solid rgba(109,40,217,0.5)' : '1px solid transparent',
                borderRadius: 10, padding: '6px 16px', cursor: 'pointer',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              }}>
                <span>{tab.emoji}</span> {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{user?.name}</span>
          <PointsBadge />
        </div>
      </nav>

      {/* Spacer for desktop top nav */}
      <div className="top-nav-links" style={{ height: 60 }} />

      {/* ── Mobile bottom nav ── */}
      <motion.nav
        className="bottom-nav-bar"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: 'rgba(14,10,30,0.95)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
          justifyContent: 'space-around', padding: '8px 0 6px',
        }}
      >
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 20px', position: 'relative',
            }}>
              {active && (
                <motion.div layoutId="mob-dot" style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 28, height: 2, borderRadius: 1, background: '#6D28D9',
                }} />
              )}
              <span style={{ fontSize: 20 }}>{tab.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#A78BFA' : 'rgba(255,255,255,0.35)' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </motion.nav>
    </>
  )
}
