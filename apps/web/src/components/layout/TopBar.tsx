import React from 'react'
import { useAlertStore } from '../../store/alertStore'

interface TopBarProps {
  title: string
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { unreadCount } = useAlertStore()

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}