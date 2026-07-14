import { lazy, Suspense, useEffect } from 'react'
import { useApp, WAIT_LINES } from './state/store'
import { Splash } from './screens/Splash'
import { TabBar } from './components/TabBar'
import { HomeOverlay } from './screens/Home'
import { SearchScreen } from './screens/Search'
import { RoutesOverlay } from './screens/Routes'
import { NavOverlay, ArrivalOverlay } from './screens/Nav'
import { ExploreSheet, SavedSheet, YouSheet } from './screens/Tabs'
import { fetchRoutes, fallbackRoutes } from './services/routing'
import { reverseCountry, countryFromLocale, fuelLabel } from './services/locale'

// The map engine (maplibre-gl) and the CarPlay screen are the two heaviest
// modules; splitting them keeps the initial shell + splash instant.
const MapView = lazy(() => import('./map/MapView').then((m) => ({ default: m.MapView })))
const CarPlay = lazy(() => import('./carplay/CarPlay').then((m) => ({ default: m.CarPlay })))

function useThemeAttr() {
  const theme = useApp((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}

/** Localise currency (fuel price) to the driver's country. */
function useLocaleDetect() {
  const origin = useApp((s) => s.origin)
  // seed from the browser locale immediately
  useEffect(() => {
    useApp.getState().setFuelPrice(fuelLabel(countryFromLocale()))
  }, [])
  // refine from the real position once known
  useEffect(() => {
    let cancelled = false
    const ctl = new AbortController()
    reverseCountry(origin, ctl.signal)
      .then((cc) => {
        if (!cancelled && cc) useApp.getState().setFuelPrice(fuelLabel(cc))
      })
      .catch(() => {})
    return () => {
      cancelled = true
      ctl.abort()
    }
  }, [origin])
}

/** Fetch routes whenever the routes screen opens (or the origin resolves). */
let waitLineIdx = 0
function useRouteFetching() {
  const screen = useApp((s) => s.screen)
  const dest = useApp((s) => s.dest)
  const origin = useApp((s) => s.origin)
  useEffect(() => {
    if (screen !== 'routes' || !dest) return
    let cancelled = false
    // "Rotate one line per wait."
    useApp.getState().setRoutesLoading(true, WAIT_LINES[waitLineIdx++ % WAIT_LINES.length])
    ;(async () => {
      let routes
      try {
        routes = await fetchRoutes(origin, dest.pos)
      } catch {
        routes = fallbackRoutes(origin, dest.pos)
      }
      if (!cancelled) useApp.getState().setRoutes(routes)
    })()
    return () => {
      cancelled = true
    }
  }, [screen, dest, origin])
}

export default function App() {
  useThemeAttr()
  useRouteFetching()
  useLocaleDetect()

  const screen = useApp((s) => s.screen)
  const tab = useApp((s) => s.tab)
  const splashDone = useApp((s) => s.splashDone)

  // base-agnostic so it works at "/" (dev) and "/sage-maps/carplay" (Pages)
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/carplay')) {
    return (
      <Suspense fallback={<div style={{ height: '100%', background: '#101210' }} />}>
        <CarPlay />
      </Suspense>
    )
  }

  return (
    <div className="sg-page">
      <div className="sg-stage">
        {/* map fetches lazily; the splash overlay covers the brief gap */}
        <Suspense fallback={<div className="sg-map-wrap" style={{ background: 'var(--bg)' }} />}>
          <MapView />
        </Suspense>

        {screen === 'home' && tab === 'map' && <HomeOverlay />}
        {screen === 'home' && tab === 'explore' && <ExploreSheet />}
        {screen === 'home' && tab === 'saved' && <SavedSheet />}
        {screen === 'home' && tab === 'you' && <YouSheet />}
        {screen === 'home' && <TabBar />}

        {screen === 'search' && <SearchScreen />}
        {screen === 'routes' && <RoutesOverlay />}
        {screen === 'nav' && <NavOverlay />}
        {/* arrival: only the nav MAP layer persists under the scrim (spec §14/§17) */}
        {screen === 'arrived' && <ArrivalOverlay />}

        {!splashDone && <Splash />}
      </div>
    </div>
  )
}
