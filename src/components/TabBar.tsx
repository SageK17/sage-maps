import { useApp, type Tab } from '../state/store'
import { ICON_PATHS } from '../icons'

const TABS: { id: Tab; label: string; path: string }[] = [
  { id: 'map', label: 'Map', path: ICON_PATHS.navigate },
  { id: 'explore', label: 'Explore', path: ICON_PATHS.explore },
  { id: 'saved', label: 'Saved', path: ICON_PATHS.saved },
  { id: 'you', label: 'You', path: ICON_PATHS.you },
]

export function TabBar() {
  const tab = useApp((s) => s.tab)
  const setTab = useApp((s) => s.setTab)
  return (
    <nav className="sg-tabbar glass-20">
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            className={`sg-tab pressable${active ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-label={t.label}
            aria-current={active ? 'page' : undefined}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={t.path}
                fill={active ? 'var(--acT)' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
