import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/livestock', label: 'Livestock', icon: '🐄' },
  { to: '/crops', label: 'Crops & Fields', icon: '🌾' },
  { to: '/finances', label: 'Finances', icon: '💰' },
  { to: '/workers', label: 'Workers', icon: '👷' },
]

const titles = { '/': 'Dashboard', '/livestock': 'Livestock Management', '/crops': 'Crops & Fields', '/finances': 'Financial Records', '/workers': 'Worker Management' }

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <div className="layout">
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>🌿 Farm Manager</h2>
          <small>Data Management System</small>
        </div>
        <nav className="sidebar-nav">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="avatar">{initials}</div>
            <div><div className="user-name">{user?.name}</div><div className="user-email">{user?.email}</div></div>
          </div>
          <button className="logout-btn" onClick={logout}>🚪 Sign Out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{titles[pathname] || 'Farm Manager'}</div>
            <div className="topbar-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
        </header>
        <main className="page"><Outlet /></main>
      </div>
    </div>
  )
}
