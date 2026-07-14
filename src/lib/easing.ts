/** Cubic-bezier easing solver (CSS-compatible), for JS-driven animations. */
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x
  const bx = 3 * (p2x - p1x) - cx
  const ax = 1 - cx - bx
  const cy = 3 * p1y
  const by = 3 * (p2y - p1y) - cy
  const ay = 1 - cy - by

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

  return (x: number): number => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x
      if (Math.abs(err) < 1e-6) break
      const d = sampleDX(t)
      if (Math.abs(d) < 1e-6) break
      t -= err / d
    }
    return sampleY(Math.max(0, Math.min(1, t)))
  }
}

/** Camera curve — 850ms cubic-bezier(.25,.9,.3,1). */
export const easeCamera = cubicBezier(0.25, 0.9, 0.3, 1)
/** Route draw-in curve — 1.1s cubic-bezier(.3,.7,.3,1). */
export const easeDraw = cubicBezier(0.3, 0.7, 0.3, 1)
