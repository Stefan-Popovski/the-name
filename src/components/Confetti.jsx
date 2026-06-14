import { useEffect, useRef } from 'react'

const COLORS = ['#6D28D9', '#FACC15', '#EC4899', '#06B6D4', '#10B981', '#F97316']

export default function Confetti({ active = true, count = 60 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active || !ref.current) return
    const container = ref.current
    const pieces = []

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const size = Math.random() * 10 + 6
      const left = Math.random() * 100
      const delay = Math.random() * 0.8
      const duration = Math.random() * 2 + 2
      const isRect = Math.random() > 0.5

      Object.assign(el.style, {
        position: 'absolute',
        left: `${left}%`,
        top: '-20px',
        width: `${size}px`,
        height: isRect ? `${size * 0.5}px` : `${size}px`,
        background: color,
        borderRadius: isRect ? '2px' : '50%',
        animation: `confettiFall ${duration}s ${delay}s ease-in forwards`,
        pointerEvents: 'none',
      })
      container.appendChild(el)
      pieces.push(el)
    }

    const timer = setTimeout(() => {
      pieces.forEach(el => el.remove())
    }, 3500)

    return () => {
      clearTimeout(timer)
      pieces.forEach(el => el.remove())
    }
  }, [active, count])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        zIndex: 9999, overflow: 'hidden',
      }}
    />
  )
}
