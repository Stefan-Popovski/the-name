import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PointsBadge from '../components/PointsBadge'

// Demo cities for pin-drop without traveling
const DEMO_CITIES = [
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Cape Town, SA', lat: -33.9249, lng: 18.4241 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Bangkok, Thailand', lat: 13.7563, lng: 100.5018 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
]

const COLORS = ['#6D28D9', '#FACC15', '#EC4899', '#06B6D4', '#10B981']

export default function MapScreen() {
  const { places, addPlace } = useStore()
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef([])
  const circlesRef = useRef([])

  const [userLoc, setUserLoc] = useState(null)
  const [locStatus, setLocStatus] = useState('idle')
  const [demoSearch, setDemoSearch] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [revealAnim, setRevealAnim] = useState(null)
  const [toast, setToast] = useState(null)

  const filteredCities = DEMO_CITIES.filter(c =>
    c.name.toLowerCase().includes(demoSearch.toLowerCase())
  )

  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then(L => {
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
      })

      // CartoDB dark tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      leafletMap.current = map
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Render existing places
      places.forEach(p => addMarker(L, map, p))
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Sync markers when places change
  useEffect(() => {
    if (!leafletMap.current) return
    import('leaflet').then(L => {
      // Clear existing
      markersRef.current.forEach(m => m.remove())
      circlesRef.current.forEach(c => c.remove())
      markersRef.current = []
      circlesRef.current = []
      places.forEach(p => addMarker(L, leafletMap.current, p))
    })
  }, [places])

  function addMarker(L, map, place) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    const icon = L.divIcon({
      html: `<div style="
        width:20px;height:20px;border-radius:50%;
        background:${color};border:3px solid white;
        box-shadow:0 0 20px ${color}80,0 0 40px ${color}40;
      "></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const marker = L.marker([place.lat, place.lng], { icon }).addTo(map)
    marker.bindPopup(`<b>${place.name}</b><br>${place.date}`)
    markersRef.current.push(marker)

    const circle = L.circle([place.lat, place.lng], {
      radius: 300000,
      color, fillColor: color,
      fillOpacity: 0.08, weight: 1, opacity: 0.4,
    }).addTo(map)
    circlesRef.current.push(circle)
  }

  function locateUser() {
    setLocStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocStatus('success')
        if (leafletMap.current) {
          leafletMap.current.flyTo([pos.coords.latitude, pos.coords.longitude], 8, { duration: 1.5 })
        }
        showToast('📍 Found you!')
      },
      () => {
        setLocStatus('error')
        showToast('Location blocked — try Demo mode')
      }
    )
  }

  function dropDemoPin(city) {
    setShowDemo(false)
    setDemoSearch('')
    setRevealAnim(city.name)

    if (leafletMap.current) {
      leafletMap.current.flyTo([city.lat, city.lng], 8, { duration: 1.5 })
    }

    addPlace({
      name: city.name,
      lat: city.lat, lng: city.lng,
      date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      stamp: '📍',
      photos: [], videos: [],
    })

    showToast(`✨ ${city.name} unlocked! +50 pts`)
    setTimeout(() => setRevealAnim(null), 3000)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div style={{ height: '100dvh', position: 'relative', background: '#0f0f1a', display: 'flex', flexDirection: 'column' }}>
      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Header overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 16px 0',
        background: 'linear-gradient(to bottom, rgba(15,15,26,0.9) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'all' }}>
          <div>
            <p style={{ color: '#A78BFA', fontSize: 11, fontWeight: 600, margin: 0, letterSpacing: 1 }}>YOUR</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', margin: 0 }}>
              World Map 🌍
            </h2>
          </div>
          <PointsBadge />
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: 90, left: 16, right: 16,
        zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Stats bar */}
        <div style={{
          background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#FACC15', fontSize: 20, margin: 0 }}>
              {places.length}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0 }}>PLACES</p>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
              {places.length === 0
                ? 'Start exploring to light up your map!'
                : `${places.length} location${places.length > 1 ? 's' : ''} glowing ✨`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={locateUser}
            disabled={locStatus === 'loading'}
            style={{
              flex: 1,
              background: 'rgba(109,40,217,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(109,40,217,0.5)',
              color: 'white', borderRadius: 14, padding: '12px 8px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {locStatus === 'loading' ? '📡 Locating...' : '📍 My Location'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDemo(d => !d)}
            style={{
              flex: 1,
              background: 'rgba(250,204,21,0.15)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(250,204,21,0.4)',
              color: '#FACC15', borderRadius: 14, padding: '12px 8px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            🎯 Demo: Drop pin
          </motion.button>
        </div>

        {/* Demo city search */}
        <AnimatePresence>
          {showDemo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 12px 8px' }}>
                <input
                  placeholder="Search a city..."
                  value={demoSearch}
                  onChange={e => setDemoSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, padding: '10px 12px',
                    color: 'white', fontSize: 13,
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', paddingBottom: 8 }}>
                {filteredCities.map(city => (
                  <button
                    key={city.name}
                    onClick={() => dropDemoPin(city)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      background: 'none', border: 'none',
                      color: 'white', padding: '10px 16px',
                      fontSize: 13, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(109,40,217,0.3)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    📍 {city.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reveal animation */}
      <AnimatePresence>
        {revealAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute', top: '35%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15,15,26,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(250,204,21,0.4)',
              borderRadius: 20, padding: '20px 28px', textAlign: 'center',
              zIndex: 50,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6 }}
              style={{ fontSize: 44, marginBottom: 8 }}
            >
              🌟
            </motion.div>
            <p style={{ color: '#FACC15', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, margin: 0 }}>
              {revealAnim}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>unlocked on your map!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999, padding: '10px 20px',
              color: 'white', fontSize: 13, fontWeight: 600,
              zIndex: 50, whiteSpace: 'nowrap',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
