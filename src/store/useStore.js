import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'tourifique_passport_v1'

const defaultState = {
  user: null,        // { name, email, profile, quizAnswers }
  points: 0,
  places: [],        // [{ id, name, lat, lng, date, photos, videos, stamp }]
  purchases: [],     // [{ productId, date }]
  suppliers: [],     // [email strings]
  onboarded: false,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState }
  } catch {
    return { ...defaultState }
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
  // TODO: swap localStorage.setItem for a Firebase setDoc call here
}

let listeners = []
let state = load()

function getState() { return state }

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : { ...state, ...updater }
  save(state)
  listeners.forEach(fn => fn(state))
}

export function useStore() {
  const [s, setS] = useState(getState)

  useEffect(() => {
    const handler = (next) => setS({ ...next })
    listeners.push(handler)
    return () => { listeners = listeners.filter(fn => fn !== handler) }
  }, [])

  const setUser = useCallback((user) => setState(prev => ({ ...prev, user })), [])

  const addPoints = useCallback((pts) => {
    setState(prev => ({ ...prev, points: prev.points + pts }))
  }, [])

  const addPlace = useCallback((place) => {
    setState(prev => ({
      ...prev,
      places: [...prev.places, { ...place, id: Date.now() }],
      points: prev.points + 50,
    }))
  }, [])

  const addPhotosToPlace = useCallback((placeId, photos) => {
    setState(prev => ({
      ...prev,
      places: prev.places.map(p =>
        p.id === placeId
          ? { ...p, photos: [...(p.photos || []), ...photos] }
          : p
      ),
      points: prev.points + photos.length * 10,
    }))
  }, [])

  const purchaseItem = useCallback((productId, cost) => {
    setState(prev => ({
      ...prev,
      points: prev.points - cost,
      purchases: [...prev.purchases, { productId, date: new Date().toISOString() }],
    }))
  }, [])

  const addSupplier = useCallback((email) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.includes(email) ? prev.suppliers : [...prev.suppliers, email],
    }))
  }, [])

  const resetAll = useCallback(() => {
    setState({ ...defaultState })
  }, [])

  return {
    ...s,
    setUser,
    addPoints,
    addPlace,
    addPhotosToPlace,
    purchaseItem,
    addSupplier,
    resetAll,
  }
}
