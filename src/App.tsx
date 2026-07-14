import { useEffect } from 'react'
import { useApp, WAIT_LINES } from './state/store'
import { MapView } from './map/MapView'
import { Splash } from './screens/Splash'
import { TabBar } from './components/TabBar'
import { HomeOverlay } from './screens/Home'
import { SearchScreen } from './screens/Search'
import { RoutesOverlay } from './screens/Routes'
import { NavOverlay, ArrivalOverlay } from './screens/Nav'
import { ExploreSheet, SavedSheet, YouSheet } from './screens/Tabs'
import { fetchRoutes, fallbackRoutes } from './services/routing'
import { CarPlay } from './carplay/CarPlay'

function useThemeAttr() {
  const theme = useApp((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
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

  const screen = useApp((s) => s.screen)
  const tab = useApp((s) => s.tab)
  const splashDone = useApp((s) => s.splashDone)

  // base-agnostic so it works at "/" (dev) and "/sage-maps/carplay" (Pages)
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/carplay')) {
    return <CarPlay />
  }

  return (
    <div className="sg-page">
      <div className="sg-stage">
        <MapView />

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
