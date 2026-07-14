import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LngLat } from '../lib/geo'
import type { SageRoute } from '../services/routing'

export type Theme = 'day' | 'night'
export type Screen = 'home' | 'search' | 'routes' | 'nav' | 'arrived'
export type Tab = 'map' | 'explore' | 'saved' | 'you'
export type GasOffer = 'hidden' | 'shown' | 'accepted' | 'dismissed'

export interface Destination {
  id: string
  name: string
  addr: string
  pos: LngLat
  cat: string
}

export interface NavManeuver {
  type: string
  modifier?: string
  street: string
  arrive: boolean
}

/** Everything the nav overlays render, recomputed each simulation tick. */
export interface NavTick {
  t: number
  pos: LngLat
  bearingDeg: number
  man: NavManeuver
  next: NavManeuver | null
  distMeters: number
  etaMin: number
  etaClock: string
  etaMi: string
  speed: number
  over: boolean
}

interface AppState {
  theme: Theme
  sageEnabled: boolean
  splashDone: boolean
  screen: Screen
  tab: Tab
  query: string
  origin: LngLat
  dest: Destination | null
  routes: SageRoute[]
  routesLoading: boolean
  waitLine: string
  selectedRouteId: string | null
  sageCardDismissed: boolean
  gasOffer: GasOffer
  toast: string | null
  nav: NavTick | null
  fuelPrice: string // localised to the driver's country, e.g. "€1.85/L"

  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setSageEnabled: (b: boolean) => void
  setSplashDone: () => void
  setScreen: (s: Screen) => void
  setTab: (t: Tab) => void
  setQuery: (q: string) => void
  setOrigin: (p: LngLat) => void
  openRoutes: (d: Destination) => void
  closeRoutes: () => void
  setRoutes: (r: SageRoute[]) => void
  setRoutesLoading: (b: boolean, waitLine?: string) => void
  selectRoute: (id: string) => void
  dismissSageCard: () => void
  setGasOffer: (g: GasOffer) => void
  showToast: (msg: string) => void
  clearToast: () => void
  setNav: (n: NavTick | null) => void
  setFuelPrice: (s: string) => void
  goHome: () => void
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      theme: 'day',
      sageEnabled: true,
      splashDone: false,
      screen: 'home',
      tab: 'map',
      query: '',
      origin: [-122.3355, 47.608], // downtown Seattle; replaced by geolocation when granted
      dest: null,
      routes: [],
      routesLoading: false,
      waitLine: 'Plotting the quiet way…',
      selectedRouteId: null,
      sageCardDismissed: false,
      gasOffer: 'hidden',
      toast: null,
      nav: null,
      fuelPrice: '$3.89/gal', // default until the driver's country is detected

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'day' ? 'night' : 'day' })),
      setSageEnabled: (sageEnabled) => set({ sageEnabled }),
      setSplashDone: () => set({ splashDone: true }),
      setScreen: (screen) => set({ screen }),
      setTab: (tab) => set({ tab, screen: 'home' }),
      setQuery: (query) => set({ query }),
      setOrigin: (origin) => set({ origin }),
      openRoutes: (dest) =>
        set({ screen: 'routes', dest, query: '', tab: 'map', routes: [], selectedRouteId: null }),
      closeRoutes: () => set({ screen: 'home', tab: 'map', routes: [], selectedRouteId: null }),
      setRoutes: (routes) =>
        set({
          routes,
          routesLoading: false,
          selectedRouteId: routes.find((r) => r.isPick)?.id ?? routes[0]?.id ?? null,
        }),
      setRoutesLoading: (routesLoading, waitLine) =>
        set((s) => ({ routesLoading, waitLine: waitLine ?? s.waitLine })),
      selectRoute: (selectedRouteId) => set({ selectedRouteId }),
      dismissSageCard: () => set({ sageCardDismissed: true }),
      setGasOffer: (gasOffer) => set({ gasOffer }),
      showToast: (toast) => set({ toast }),
      clearToast: () => set({ toast: null }),
      setNav: (nav) => set({ nav }),
      setFuelPrice: (fuelPrice) => set({ fuelPrice }),
      goHome: () =>
        set({ screen: 'home', tab: 'map', nav: null, gasOffer: 'hidden', toast: null }),
    }),
    {
      name: 'sage-maps',
      partialize: (s) => ({ theme: s.theme, sageEnabled: s.sageEnabled }),
    },
  ),
)

export function useSelectedRoute(): SageRoute | null {
  return useApp((s) => s.routes.find((r) => r.id === s.selectedRouteId) ?? null)
}

export const WAIT_LINES = [
  'Plotting the quiet way…',
  'Listening to the roads…',
  'Checking what traffic knows…',
  'A calmer route is worth a second.',
]
