import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../lib/constants'

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '🏠' },
  { path: ROUTES.ELDER, label: 'Elder Profile', icon: '👴' },
  { path: ROUTES.CAREGIVERS, label: 'Caregivers', icon: '🤝' },
  { path: ROUTES.DOCTORS, label: 'Doctors', icon: '🩺' },
  { path: ROUTES.MEDICATIONS, label: 'Medications', icon: '💊' },
  { path: ROUTES.DOCUMENTS, label: 'Documents', icon: '📄' },
  { path: ROUTES.EXPENSES, label: 'Expenses', icon: '💰' },
  { path: ROUTES.ALERTS, label: 'Alerts', icon: '🔔' },
  { path: ROUTES.COMPANION, label: 'AI Companion', icon: '🤖' },
]

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600">EldEra</h1>
        <p className="text-xs text-gray-500 mt-1">Elderly Care Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.fullName?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}