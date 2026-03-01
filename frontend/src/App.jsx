import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Livestock from './pages/Livestock'
import Crops from './pages/Crops'
import Finances from './pages/Finances'
import Workers from './pages/Workers'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function Public({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return user ? <Navigate to="/" /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Public><Login /></Public>} />
          <Route path="/" element={<Private><Layout /></Private>}>
            <Route index element={<Dashboard />} />
            <Route path="livestock" element={<Livestock />} />
            <Route path="crops" element={<Crops />} />
            <Route path="finances" element={<Finances />} />
            <Route path="workers" element={<Workers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
