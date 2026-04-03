import { create } from 'zustand'
import { ElderProfile } from '@eldera/types'

interface ElderState {
  profile: ElderProfile | null
  setProfile: (profile: ElderProfile) => void
  clearProfile: () => void
}

export const useElderStore = create<ElderState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}))