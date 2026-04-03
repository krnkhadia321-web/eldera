import React from 'react'
import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../lib/constants'

const mobileItems = [
  { path: ROUTES.DASHBOARD, label: 'Home', icon: '🏠' },
  { path: ROUTES.MEDICATIONS, label: 'Meds', icon: '💊' },
  { path: ROUTES.ALERTS, label: 'Alerts', icon: '🔔' },
  { path: ROUTES.COMPANION, label: 'AI', icon: '🤖' },
  { path: ROUTES.ELDER, label: 'Profile', icon: '👴' },
]

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden z-40">
      {mobileItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}