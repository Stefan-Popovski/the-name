import { useState, useEffect } from 'react'

export function useBreakpoint(px = 768) {
  const [isWide, setIsWide] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= px : false
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const handler = e => setIsWide(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [px])
  return isWide
}
