import { create } from 'zustand'
import { User } from '@eldera/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
  localStorage.setItem('token', token)
  localStorage.setItem('userRole', user.role)
  set({ user, token, isAuthenticated: true })
},

logout: () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  set({ user: null, token: null, isAuthenticated: false })
},
}))