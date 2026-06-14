import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PointsBadge from '../components/PointsBadge'
import Confetti from '../components/Confetti'

/* palette — shared with the landing / passport */
const INK = '#14101F'
const BODY = '#574F69'
const MUTE = '#938CA8'
const LINE = '#ECE8F3'
const PURPLE = '#6D28D9'
const YELLOW = '#FACC15'
const GOLD_DEEP = '#9A7426'
const TINT = '#FAF8FD'
const LILAC = '#F4EEFF'
const LILAC_BD = '#E4D7FB'
const GREEN = '#16A34A'
const GREEN_BG = '#E7F6EC'

const PRODUCTS = [
  { id: 'tote', name: 'Tourifique Tote', price: 200, icon: 'tote', desc: 'Organic cotton. Full logo print. Go places in style.', tag: 'bestseller' },
  { id: 'sticker', name: 'Sticker Pack', price: 80, icon: 'sticker', desc: '12 premium vinyl stickers. Passport stamp collection.', tag: 'popular' },
  { id: 'cap', name: 'Travelpreneur Cap', price: 350, icon: 'cap', desc: 'Embroidered logo. Adjustable. Perfect for any airport.', tag: null },
  { id: 'bottle', name: 'Hydration Companion', price: 280, icon: 'bottle', desc: 'Insulated steel bottle. Keeps you hydrated at altitude.', tag: 'new' },
  { id: 'hoodie', name: 'Creator Hoodie', price: 600, icon: 'hoodie', desc: 'Premium fleece. “Travelpreneur” chest print. Limited.', tag: 'limited' },
  { id: 'notebook', name: 'Journey Journal', price: 150, icon: 'notebook', desc: 'Hardcover. Passport-sized. Gold foil stamp pages.', tag: null },
]

const TAG_COLORS = {
  bestseller: { bg: PURPLE, color: '#fff' },
  popular: { bg: YELLOW, color: INK },
  new: { bg: GREEN, color: '#fff' },
  limited: { bg: '#DC2626', color: '#fff' },
}

const ICON_PATHS = {
  tote: <g><path d="M6 8h12l-1 11.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8z" /><path d="M9.2 8a2.8 2.8 0 0 1 5.6 0" /></g>,
  sticker: <g><path d="M5 4h10a1 1 0 0 1 1 1v8l-5 5H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /><path d="M16 13l-5 5v-4a1 1 0 0 1 1-1z" /></g>,
  cap: <g><path d="M5 14a7 7 0 0 1 14 0z" /><path d="M19 14h2.5" /></g>,
  bottle: <g><path d="M10 3h4v2.5l1 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 19V7l1-1.5z" /><path d="M9 10.5h6" /></g>,
  hoodie: <g><path d="M8.5 4 4 7l1.8 3L8 9v10h8V9l2.2 1L20 7l-4.5-3" /><path d="M9.5 4a2.5 2.5 0 0 0 5 0" /></g>,
  notebook: <g><rect x="6" y="3" width="12" height="18" rx="1.5" /><path d="M9.5 3v18" /><path d="M12.5 9h3M12.5 13h3" /></g>,
}

function Star({ size = 13, fill = YELLOW }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={GOLD_DEEP} strokeWidth="1" strokeLinejoin="round">
      <path d="M12 2.5l2.9 6 6.6.6-5 4.4 1.5 6.5L12 17.8 5.5 20l1.5-6.5-5-4.4 6.6-.6z" />
    </svg>
  )
}

function ProductIcon({ name, size = 28, color = PURPLE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  )
}

export default function StoreScreen() {
  const { points, purchases, purchaseItem } = useStore()
  const [confirming, setConfirming] = useState(null)
  const [confetti, setConfetti] = useState(false)
  const [success, setSuccess] = useState(null)
  const [supplierEmails, setSupplierEmails] = useState(['', '', '', '', ''])
  const [supplierSent, setSupplierSent] = useState(false)

  function buyProduct(product) {
    if (points < product.price) return
    purchaseItem(product.id, product.price)
    setConfirming(null)
    setConfetti(true)
    setSuccess(product)
    setTimeout(() => { setConfetti(false); setSuccess(null) }, 3000)
  }

  const owned = new Set(purchases.map(p => p.productId))

  function sendInvites() {
    const valid = supplierEmails.filter(e => e.includes('@'))
    if (valid.length === 0) return
    setSupplierSent(true)
    setTimeout(() => setSupplierSent(false), 3000)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: TINT, paddingBottom: 120, fontFamily: 'Inter, sans-serif' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(90% 40% at 50% -5%, ${PURPLE}10, transparent 55%)` }} />
      <Confetti active={confetti} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '28px 32px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: PURPLE, fontSize: 11, fontWeight: 700, margin: 0, letterSpacing: 2.5, fontFamily: 'Space Grotesk, sans-serif' }}>TRAVELPRENEUR</p>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 28, color: INK, margin: '3px 0 0', letterSpacing: -0.5 }}>
              Merch Store
            </h1>
          </div>
          <PointsBadge />
        </div>

        {/* Points hint */}
        <div style={{ marginTop: 16, background: LILAC, border: `1px solid ${LILAC_BD}`, borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <Star />
          <span style={{ color: PURPLE, fontSize: 12.5, fontWeight: 600 }}>
            Earn points by exploring &amp; uploading content. Spend them here.
          </span>
        </div>

        {/* Products grid */}
        <div className="products-grid" style={{ display: 'grid', gap: 14, marginTop: 24 }}>
          {PRODUCTS.map((product, i) => {
            const isOwned = owned.has(product.id)
            const canAfford = points >= product.price
            const tagStyle = product.tag ? TAG_COLORS[product.tag] : null

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                style={{
                  background: '#fff',
                  border: `1px solid ${isOwned ? 'rgba(22,163,74,0.4)' : LINE}`,
                  borderRadius: 18, padding: 16,
                  display: 'flex', gap: 14, alignItems: 'center',
                  boxShadow: '0 20px 50px -40px rgba(20,16,31,0.5)',
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                  background: isOwned ? GREEN_BG : LILAC,
                  border: `1px solid ${isOwned ? 'rgba(22,163,74,0.25)' : LILAC_BD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <ProductIcon name={product.icon} color={isOwned ? GREEN : PURPLE} />
                  {product.tag && !isOwned && (
                    <span style={{
                      position: 'absolute', top: -8, right: -8,
                      background: tagStyle.bg, color: tagStyle.color,
                      borderRadius: 999, fontSize: 8, fontWeight: 700,
                      padding: '3px 6px', letterSpacing: 0.4,
                      boxShadow: '0 4px 10px -4px rgba(20,16,31,0.4)',
                    }}>
                      {product.tag.toUpperCase()}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: INK, fontSize: 15.5, margin: '0 0 3px' }}>
                    {product.name}
                  </h3>
                  <p style={{ color: BODY, fontSize: 12, margin: '0 0 9px', lineHeight: 1.45 }}>
                    {product.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: INK, fontWeight: 800, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>
                      <Star /> {product.price}
                    </span>
                    {isOwned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: GREEN, fontSize: 12.5, fontWeight: 700 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
                        Owned
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: canAfford ? 1.04 : 1 }}
                        whileTap={{ scale: canAfford ? 0.96 : 1 }}
                        onClick={() => canAfford && setConfirming(product)}
                        style={{
                          background: canAfford ? `linear-gradient(135deg, ${PURPLE}, #8B5CF6)` : '#F1EEF7',
                          border: canAfford ? 'none' : `1px solid ${LINE}`, borderRadius: 999,
                          color: canAfford ? '#fff' : MUTE,
                          padding: '7px 16px', fontSize: 12.5, fontWeight: 700,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          fontFamily: 'Space Grotesk, sans-serif',
                          boxShadow: canAfford ? '0 8px 20px -10px rgba(109,40,217,0.6)' : 'none',
                        }}
                      >
                        {canAfford ? 'Redeem' : 'Need more pts'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Invite Suppliers section */}
        <div style={{ marginTop: 32, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: 22, boxShadow: '0 20px 50px -40px rgba(20,16,31,0.5)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: INK, fontSize: 18, margin: '0 0 4px', letterSpacing: -0.3 }}>
            Invite Suppliers
          </h3>
          <p style={{ color: BODY, fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.55 }}>
            Invite up to 5 supplier partners to collaborate. <strong style={{ color: PURPLE }}>+100 pts</strong> when they join.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {supplierEmails.map((email, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: MUTE, fontSize: 13, fontWeight: 700, width: 18, textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif' }}>{i + 1}</span>
                <input
                  type="email"
                  placeholder={`supplier${i + 1}@brand.com`}
                  value={email}
                  onChange={e => {
                    const next = [...supplierEmails]
                    next[i] = e.target.value
                    setSupplierEmails(next)
                  }}
                  onFocus={e => e.target.style.borderColor = PURPLE}
                  onBlur={e => e.target.style.borderColor = LINE}
                  style={{ flex: 1, background: '#fff', border: `1.5px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', color: INK, fontSize: 13.5, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.18s' }}
                />
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={sendInvites}
            style={{ width: '100%', background: `linear-gradient(135deg, ${YELLOW}, #F59E0B)`, color: INK, border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 12px 26px -12px rgba(245,158,11,0.6)' }}
          >
            Send invites
          </motion.button>
          <AnimatePresence>
            {supplierSent && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: GREEN, textAlign: 'center', fontSize: 13, fontWeight: 600, margin: '12px 0 0' }}
              >
                Invites sent — they'll get an email shortly.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,31,0.5)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 14 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 22, padding: 28, border: `1px solid ${LINE}`, width: '100%', maxWidth: 340, textAlign: 'center', boxShadow: '0 40px 90px -30px rgba(20,16,31,0.45)' }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 18, margin: '0 auto 14px', background: LILAC, border: `1px solid ${LILAC_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ProductIcon name={confirming.icon} size={34} />
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: INK, fontSize: 20, margin: '0 0 8px' }}>
                {confirming.name}
              </h3>
              <p style={{ color: BODY, fontSize: 13.5, margin: '0 0 20px' }}>
                Redeem <strong style={{ color: INK, display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'middle' }}><Star /> {confirming.price}</strong> pts for this item?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirming(null)}
                  style={{ flex: 1, background: '#fff', border: `1px solid ${LINE}`, color: INK, borderRadius: 999, padding: '12px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => buyProduct(confirming)}
                  style={{ flex: 1, background: `linear-gradient(135deg, ${PURPLE}, #8B5CF6)`, border: 'none', color: '#fff', borderRadius: 999, padding: '12px', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 12px 26px -12px rgba(109,40,217,0.6)' }}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 400, boxShadow: '0 24px 60px -24px rgba(20,16,31,0.5)' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 11, background: LILAC, border: `1px solid ${LILAC_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ProductIcon name={success.icon} size={22} />
            </div>
            <div>
              <p style={{ color: INK, fontWeight: 700, fontSize: 14, margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>
                {success.name} redeemed
              </p>
              <p style={{ color: MUTE, fontSize: 11.5, margin: 0 }}>
                Check your email for details
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
