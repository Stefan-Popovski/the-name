import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useState, useEffect, useRef } from 'react'

export default function PointsBadge() {
  const { points } = useStore()
  const [prev, setPrev] = useState(points)
  const [flash, setFlash] = useState(false)
  const prevRef = useRef(points)

  useEffect(() => {
    if (points !== prevRef.current) {
      setFlash(true)
      setPrev(prevRef.current)
      prevRef.current = points
      const t = setTimeout(() => setFlash(false), 800)
      return () => clearTimeout(t)
    }
  }, [points])

  return (
    <motion.div
      animate={flash ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.4 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: flash ? '#FACC15' : 'rgba(250,204,21,0.15)',
        border: '1.5px solid #FACC15',
        borderRadius: 999, padding: '4px 12px',
        transition: 'background 0.3s',
      }}
    >
      <span style={{ fontSize: 14 }}>⭐</span>
      <span style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: 14, color: flash ? '#1E1B2E' : '#6D28D9',
      }}>
        {points.toLocaleString()}
      </span>
    </motion.div>
  )
}
