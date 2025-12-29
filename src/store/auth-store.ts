import { create } from 'zustand'
import type { User, Tenant } from '@/types/database'

interface AuthState {
  user: User | null
  tenant: Tenant | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, tenant: null, isLoading: false }),
}))
