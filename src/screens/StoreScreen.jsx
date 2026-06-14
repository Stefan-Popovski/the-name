import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PointsBadge from '../components/PointsBadge'
import Confetti from '../components/Confetti'

const PRODUCTS = [
  { id: 'tote', name: 'Tourifique Tote', price: 200, emoji: '👜', desc: 'Organic cotton. Full logo print. Go places in style.', tag: 'bestseller' },
  { id: 'sticker', name: 'Sticker Pack', price: 80, emoji: '🎨', desc: '12 premium vinyl stickers. Passport stamp collection.', tag: 'popular' },
  { id: 'cap', name: 'Travelpreneur Cap', price: 350, emoji: '🧢', desc: 'Embroidered logo. Adjustable. Perfect for any airport.', tag: null },
  { id: 'bottle', name: 'Hydration Companion', price: 280, emoji: '💧', desc: 'Insulated steel bottle. Keeps you hydrated at altitude.', tag: 'new' },
  { id: 'hoodie', name: 'Creator Hoodie', price: 600, emoji: '👕', desc: 'Premium fleece. "Travelpreneur" chest print. Limited.', tag: 'limited' },
  { id: 'notebook', name: 'Journey Journal', price: 150, emoji: '📓', desc: 'Hardcover. Passport-sized. Gold foil stamp pages.', tag: null },
]

const TAG_COLORS = {
  bestseller: { bg: '#6D28D9', color: 'white' },
  popular: { bg: '#FACC15', color: '#1E1B2E' },
  new: { bg: '#10B981', color: 'white' },
  limited: { bg: '#EF4444', color: 'white' },
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
    <div style={{
      minHeight: '100dvh', background: 'linear-gradient(160deg,#0f0820 0%,#1a0a3e 100%)',
      paddingBottom: 120, overflowY: 'auto',
    }}>
      <Confetti active={confetti} />

      {/* Header */}
      <div style={{ padding: '28px 32px 16px', position: 'sticky', top: 60, zIndex: 20, background: 'rgba(14,10,30,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#A78BFA', fontSize: 11, fontWeight: 600, margin: 0, letterSpacing: 1 }}>TRAVELPRENEUR</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'white', margin: 0 }}>
              Merch Store 🛍️
            </h1>
          </div>
          <PointsBadge />
        </div>

        {/* Points hint */}
        <div style={{
          marginTop: 10, background: 'rgba(250,204,21,0.1)',
          border: '1px solid rgba(250,204,21,0.3)',
          borderRadius: 10, padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>⭐</span>
          <span style={{ color: '#FACC15', fontSize: 12, fontWeight: 600 }}>
            Earn points by exploring & uploading content. Spend them here.
          </span>
        </div>
      </div>

      {/* Products grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 0' }}>
      <div className="products-grid" style={{ display: 'grid', gap: 14 }}>
        {PRODUCTS.map((product, i) => {
          const isOwned = owned.has(product.id)
          const canAfford = points >= product.price
          const tagStyle = product.tag ? TAG_COLORS[product.tag] : null

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: isOwned
                  ? 'rgba(16,185,129,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: isOwned
                  ? '1px solid rgba(16,185,129,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: 16,
                display: 'flex', gap: 14, alignItems: 'center',
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                background: 'rgba(109,40,217,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, position: 'relative',
              }}>
                {product.emoji}
                {product.tag && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: tagStyle.bg, color: tagStyle.color,
                    borderRadius: 999, fontSize: 8, fontWeight: 700,
                    padding: '2px 5px', letterSpacing: 0.3,
                  }}>
                    {product.tag.toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white', fontSize: 15, margin: '0 0 2px' }}>
                  {product.name}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 8px', lineHeight: 1.4 }}>
                  {product.desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#FACC15', fontWeight: 800, fontSize: 15, fontFamily: 'Syne, sans-serif' }}>
                    ⭐ {product.price}
                  </span>
                  {isOwned ? (
                    <span style={{ color: '#10B981', fontSize: 12, fontWeight: 600 }}>✓ Owned</span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: canAfford ? 1.04 : 1 }}
                      whileTap={{ scale: canAfford ? 0.96 : 1 }}
                      onClick={() => canAfford && setConfirming(product)}
                      style={{
                        background: canAfford
                          ? 'linear-gradient(135deg, #6D28D9, #8B5CF6)'
                          : 'rgba(255,255,255,0.08)',
                        border: 'none', borderRadius: 999,
                        color: canAfford ? 'white' : 'rgba(255,255,255,0.3)',
                        padding: '6px 14px', fontSize: 12, fontWeight: 700,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        fontFamily: 'Inter, sans-serif',
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
      </div>{/* end products-grid */}

      {/* Invite Suppliers section */}
      <div style={{ marginTop: 32 }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 20,
        }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 18, margin: '0 0 4px' }}>
            🤝 Invite Suppliers
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 16px' }}>
            Invite up to 5 supplier partners to collaborate. +100 pts when they join.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {supplierEmails.map((email, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#A78BFA', fontSize: 13, width: 20, textAlign: 'center' }}>{i + 1}</span>
                <input
                  type="email"
                  placeholder={`supplier${i + 1}@brand.com`}
                  value={email}
                  onChange={e => {
                    const next = [...supplierEmails]
                    next[i] = e.target.value
                    setSupplierEmails(next)
                  }}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, padding: '10px 12px',
                    color: 'white', fontSize: 13,
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={sendInvites}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
              color: '#1E1B2E', border: 'none', borderRadius: 999,
              padding: '14px', fontFamily: 'Syne, sans-serif',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}
          >
            Send Invites 📨
          </motion.button>
          <AnimatePresence>
            {supplierSent && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: '#10B981', textAlign: 'center', fontSize: 13, fontWeight: 600, margin: '10px 0 0' }}
              >
                ✅ Invites sent! They'll get an email shortly.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>{/* end max-width wrapper */}

      {/* Confirm modal */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#1E1B2E', borderRadius: 24, padding: 28,
                border: '1px solid rgba(255,255,255,0.1)',
                width: '100%', maxWidth: 340, textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 12 }}>{confirming.emoji}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 20, margin: '0 0 8px' }}>
                {confirming.name}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 20px' }}>
                Redeem <strong style={{ color: '#FACC15' }}>⭐ {confirming.price}</strong> pts for this item?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirming(null)}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', borderRadius: 999,
                    padding: '12px', cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => buyProduct(confirming)}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
                    border: 'none', color: 'white',
                    borderRadius: 999, padding: '12px',
                    cursor: 'pointer', fontSize: 14, fontWeight: 700,
                    fontFamily: 'Syne, sans-serif',
                  }}
                >
                  Confirm! 🎉
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
              borderRadius: 16, padding: '14px 24px',
              display: 'flex', alignItems: 'center', gap: 10, zIndex: 400,
              boxShadow: '0 8px 32px rgba(109,40,217,0.5)',
            }}
          >
            <span style={{ fontSize: 28 }}>{success.emoji}</span>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0, fontFamily: 'Syne, sans-serif' }}>
                {success.name} redeemed!
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>
                Check your email for details
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  )
}
