import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

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

// deterministic colour per place index — visited spots light up the black map
const COLORS = ['#A78BFA', '#FACC15', '#EC4899', '#22D3EE', '#34D399', '#FB923C']
const ROUTE = '#C4B5FD'

const initialsOf = (name = 'You') => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'You'

export default function MapScreen() {
  const { user, places, addPlace } = useStore()
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const layersRef = useRef(null)
  const placesRef = useRef(places); placesRef.current = places
  const userRef = useRef(user); userRef.current = user

  const [locStatus, setLocStatus] = useState('idle')
  const [demoSearch, setDemoSearch] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [revealAnim, setRevealAnim] = useState(null)
  const [toast, setToast] = useState(null)

  const filteredCities = DEMO_CITIES.filter(c => c.name.toLowerCase().includes(demoSearch.toLowerCase()))

  function drawPlaces(L) {
    const map = leafletMap.current
    if (!map) return
    if (!layersRef.current) layersRef.current = L.layerGroup().addTo(map)
    const group = layersRef.current
    group.clearLayers()

    const pts = placesRef.current
    const latlngs = pts.map(p => [p.lat, p.lng])

    // travel route — dotted line from place to place, in order
    if (latlngs.length >= 2) {
      L.polyline(latlngs, { color: ROUTE, weight: 2, opacity: 0.85, dashArray: '1 9', lineCap: 'round' }).addTo(group)
    }

    pts.forEach((p, i) => {
      const color = COLORS[i % COLORS.length]
      const isCurrent = i === pts.length - 1

      if (isCurrent) {
        // "you are here" — avatar pin with a pulsing ring
        const photo = p.photos?.[0]?.url
        const head = photo
          ? `<defs><clipPath id="pc${i}"><circle cx="22" cy="19" r="13"/></clipPath></defs><image href="${photo}" x="9" y="6" width="26" height="26" clip-path="url(#pc${i})" preserveAspectRatio="xMidYMid slice"/>`
          : `<circle cx="22" cy="19" r="13" fill="#7C3AED"/><text x="22" y="23.5" text-anchor="middle" font-size="12.5" font-weight="700" fill="#fff" font-family="Space Grotesk, sans-serif">${initialsOf(userRef.current?.name)}</text>`
        const html = `<svg width="44" height="58" viewBox="0 0 44 58" style="overflow:visible;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.55))">
          <path d="M22 57C22 57 41 33 41 19A19 19 0 1 0 3 19C3 33 22 57 22 57Z" fill="#7C3AED" stroke="#fff" stroke-width="2.5"/>
          ${head}
          <circle cx="22" cy="19" r="13" fill="none" stroke="#C4B5FD" stroke-width="2">
            <animate attributeName="r" values="13;23" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite"/>
          </circle>
        </svg>`
        const icon = L.divIcon({ html, className: '', iconSize: [44, 58], iconAnchor: [22, 57] })
        L.marker([p.lat, p.lng], { icon, zIndexOffset: 1000 }).addTo(group).bindPopup(`<b>${p.name}</b><br/>You are here`)
      } else {
        // visited place — colour teardrop pin, tip on the spot
        const html = `<svg width="30" height="40" viewBox="0 0 30 40" style="overflow:visible;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5)) drop-shadow(0 0 8px ${color}aa)">
          <path d="M15 39C15 39 27.5 23 27.5 14A12.5 12.5 0 1 0 2.5 14C2.5 23 15 39 15 39Z" fill="${color}" stroke="#fff" stroke-width="2"/>
          <circle cx="15" cy="14" r="5" fill="#fff"/>
        </svg>`
        const icon = L.divIcon({ html, className: '', iconSize: [30, 40], iconAnchor: [15, 39] })
        L.marker([p.lat, p.lng], { icon }).addTo(group).bindPopup(`<b>${p.name}</b><br/>${p.date}`)
        L.circle([p.lat, p.lng], { radius: 200000, color, fillColor: color, fillOpacity: 0.07, weight: 1, opacity: 0.3 }).addTo(group)
      }
    })
  }

  // create map once
  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return
    import('leaflet').then(L => {
      const map = L.map(mapRef.current, { center: [20, 0], zoom: 2, zoomControl: false, attributionControl: false, worldCopyJump: true })
      // pure-black basemap (no labels) so visited places are the only colour
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map)
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      leafletMap.current = map
      drawPlaces(L)
      const latlngs = placesRef.current.map(p => [p.lat, p.lng])
      if (latlngs.length > 1) map.fitBounds(latlngs, { padding: [70, 70], maxZoom: 5 })
      else if (latlngs.length === 1) map.setView(latlngs[0], 5)
    })
    return () => {
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; layersRef.current = null }
    }
  }, [])

  // redraw when places change
  useEffect(() => {
    if (!leafletMap.current) return
    import('leaflet').then(L => drawPlaces(L))
  }, [places, user])

  function locateUser() {
    setLocStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocStatus('success')
        if (leafletMap.current) leafletMap.current.flyTo([pos.coords.latitude, pos.coords.longitude], 8, { duration: 1.5 })
        showToast('Found you')
      },
      () => { setLocStatus('error'); showToast('Location blocked — try Demo mode') }
    )
  }

  function dropDemoPin(city) {
    setShowDemo(false)
    setDemoSearch('')
    setRevealAnim(city.name)
    if (leafletMap.current) leafletMap.current.flyTo([city.lat, city.lng], 8, { duration: 1.5 })
    addPlace({
      name: city.name, lat: city.lat, lng: city.lng,
      date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase(),
      stamp: '★', photos: [], videos: [],
    })
    showToast(`${city.name} added to your map`)
    setTimeout(() => setRevealAnim(null), 3000)
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const PinIcon = ({ c = '#fff' }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: '-2px' }}>
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2" />
    </svg>
  )

  return (
    <div style={{ height: '100dvh', position: 'relative', background: '#06060c', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .leaflet-popup-content-wrapper { border-radius: 12px; }
      `}</style>

      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Header overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 16px 0', background: 'linear-gradient(to bottom, rgba(6,6,12,0.92) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ pointerEvents: 'all' }}>
          <p style={{ color: '#A78BFA', fontSize: 11, fontWeight: 700, margin: 0, letterSpacing: 2.5, fontFamily: 'Space Grotesk, sans-serif' }}>EXPLORED</p>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 22, color: 'white', margin: '2px 0 0', letterSpacing: -0.4 }}>World Map</h2>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ position: 'absolute', bottom: 90, left: 16, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Stats bar */}
        <div style={{ background: 'rgba(12,10,24,0.82)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#FACC15', fontSize: 20, margin: 0 }}>{places.length}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, margin: 0, letterSpacing: 0.5 }}>PLACES</p>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, margin: 0, flex: 1 }}>
            {places.length === 0 ? 'Start exploring to light up your map' : `Your trail across ${places.length} place${places.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={locateUser} disabled={locStatus === 'loading'}
            style={{ flex: 1, background: 'rgba(109,40,217,0.9)', backdropFilter: 'blur(12px)', border: 'none', color: 'white', borderRadius: 14, padding: '12px 8px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            <PinIcon />{locStatus === 'loading' ? 'Locating…' : 'My location'}
          </motion.button>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDemo(d => !d)}
            style={{ flex: 1, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.16)', color: '#FACC15', borderRadius: 14, padding: '12px 8px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            <PinIcon c="#FACC15" />Drop a pin
          </motion.button>
        </div>

        {/* Demo city search */}
        <AnimatePresence>
          {showDemo && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(12,10,24,0.96)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '12px 12px 8px' }}>
                <input placeholder="Search a city…" value={demoSearch} onChange={e => setDemoSearch(e.target.value)} autoFocus
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 12px', color: 'white', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', paddingBottom: 8 }}>
                {filteredCities.map(city => (
                  <button key={city.name} onClick={() => dropDemoPin(city)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'white', padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,40,217,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    {city.name}
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
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            style={{ position: 'absolute', top: '34%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(12,10,24,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(250,204,21,0.35)', borderRadius: 20, padding: '20px 28px', textAlign: 'center', zIndex: 50 }}>
            <motion.div animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }} transition={{ duration: 0.6 }} style={{ display: 'inline-block', marginBottom: 8 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#FACC15" stroke="#9A7426" strokeWidth="1" strokeLinejoin="round"><path d="M12 2.5l2.9 6 6.6.6-5 4.4 1.5 6.5L12 17.8 5.5 20l1.5-6.5-5-4.4 6.6-.6z" /></svg>
            </motion.div>
            <p style={{ color: '#FACC15', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, margin: 0 }}>{revealAnim}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>added to your map</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: 76, left: '50%', transform: 'translateX(-50%)', background: 'rgba(12,10,24,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '10px 20px', color: 'white', fontSize: 13, fontWeight: 600, zIndex: 50, whiteSpace: 'nowrap' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
