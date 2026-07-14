import { useEffect, useState } from 'react'
import { Monogram } from '../brand/Monogram'
import { useApp } from '../state/store'

/** Splash — the route draws itself. ~2.6s total, 700ms fade. */
export function Splash() {
  const setSplashDone = useApp((s) => s.setSplashDone)
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2000)
    const t2 = setTimeout(() => {
      setGone(true)
      setSplashDone()
    }, 2750)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [setSplashDone])

  if (gone) return null

  return (
    <div className={`sg-splash${fading ? ' fading' : ''}`}>
      <Monogram size={100} stroke="#E9EFE2" dot="#EBC670" drawIn style={{ marginBottom: 16 }} />
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#F3F1E6',
          animation: 'sgFade .6s .4s ease both',
        }}
      >
        sage
        <span style={{ fontWeight: 500, opacity: 0.75 }}> maps</span>
      </div>
      <div
        className="t-sage"
        style={{ fontSize: 16, color: '#B9C9AE', marginTop: 8, animation: 'sgFade .6s .8s ease both' }}
      >
        the wise way there
      </div>
      <div className="sg-splash-dots">
        {[0, 0.18, 0.36].map((d) => (
          <div key={d} className="sg-splash-dot" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
    </div>
  )
}
