import { create } from 'zustand'
import type { User, Gabinete } from '@/types/database'

interface AuthState {
  user: User | null
  gabinete: Gabinete | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setGabinete: (gabinete: Gabinete | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  gabinete: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setGabinete: (gabinete) => set({ gabinete }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, gabinete: null, isLoading: false }),
}))
