import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Landing from './screens/Landing'
import SignUp from './screens/SignUp'
import Quiz from './screens/Quiz'
import ProfileReveal from './screens/ProfileReveal'
import Dashboard from './screens/Dashboard'
import MapScreen from './screens/MapScreen'
import StoreScreen from './screens/StoreScreen'
import ProfileScreen from './screens/ProfileScreen'
import AppNav from './components/AppNav'

function AppRoutes() {
  const { user } = useStore()
  const hasProfile = user?.profile

  return (
    <>
      {hasProfile && <AppNav />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/reveal" element={<ProfileReveal />} />
        <Route path="/dashboard" element={hasProfile ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/map" element={hasProfile ? <MapScreen /> : <Navigate to="/" />} />
        <Route path="/store" element={hasProfile ? <StoreScreen /> : <Navigate to="/" />} />
        <Route path="/profile" element={hasProfile ? <ProfileScreen /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
