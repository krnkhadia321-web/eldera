import { create } from 'zustand'
import { Alert } from '@eldera/types'

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  setAlerts: (alerts: Alert[]) => void
  addAlert: (alert: Alert) => void
  resolveAlert: (alertId: string) => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,

  setAlerts: (alerts) =>
    set({ alerts, unreadCount: alerts.filter((a) => !a.resolved).length }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),

  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, resolved: true } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}))