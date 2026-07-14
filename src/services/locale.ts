import type { LngLat } from '../lib/geo'

/**
 * Country-aware fuel pricing. The demo's only money value is Juniper Fuel's
 * pump price; we localise its currency (and a plausible local magnitude/unit)
 * to wherever the driver actually is, detected by reverse-geocoding their
 * position. Falls back to the browser locale, then USD.
 */

interface Fuel {
  currency: string
  /** plausible local pump price in the currency's main unit */
  price: number
  unit: 'gal' | 'L'
}

// USD is priced per gallon; almost everywhere else is per litre.
const US: Fuel = { currency: 'USD', price: 3.89, unit: 'gal' }
const EUR: Fuel = { currency: 'EUR', price: 1.85, unit: 'L' }

const FUEL: Record<string, Fuel> = {
  US,
  CA: { currency: 'CAD', price: 1.65, unit: 'L' },
  GB: { currency: 'GBP', price: 1.48, unit: 'L' },
  CH: { currency: 'CHF', price: 1.9, unit: 'L' },
  SE: { currency: 'SEK', price: 19.5, unit: 'L' },
  NO: { currency: 'NOK', price: 22, unit: 'L' },
  DK: { currency: 'DKK', price: 14, unit: 'L' },
  PL: { currency: 'PLN', price: 6.5, unit: 'L' },
  CZ: { currency: 'CZK', price: 38, unit: 'L' },
  HU: { currency: 'HUF', price: 620, unit: 'L' },
  RO: { currency: 'RON', price: 7.4, unit: 'L' },
  AU: { currency: 'AUD', price: 1.95, unit: 'L' },
  NZ: { currency: 'NZD', price: 2.75, unit: 'L' },
  JP: { currency: 'JPY', price: 175, unit: 'L' },
  KR: { currency: 'KRW', price: 1700, unit: 'L' },
  CN: { currency: 'CNY', price: 8.2, unit: 'L' },
  IN: { currency: 'INR', price: 105, unit: 'L' },
  SG: { currency: 'SGD', price: 2.9, unit: 'L' },
  HK: { currency: 'HKD', price: 18, unit: 'L' },
  TW: { currency: 'TWD', price: 31, unit: 'L' },
  TH: { currency: 'THB', price: 42, unit: 'L' },
  MY: { currency: 'MYR', price: 2.1, unit: 'L' },
  ID: { currency: 'IDR', price: 13000, unit: 'L' },
  PH: { currency: 'PHP', price: 62, unit: 'L' },
  VN: { currency: 'VND', price: 23000, unit: 'L' },
  MX: { currency: 'MXN', price: 24, unit: 'L' },
  BR: { currency: 'BRL', price: 5.9, unit: 'L' },
  AR: { currency: 'ARS', price: 900, unit: 'L' },
  CL: { currency: 'CLP', price: 1200, unit: 'L' },
  CO: { currency: 'COP', price: 15000, unit: 'L' },
  ZA: { currency: 'ZAR', price: 24, unit: 'L' },
  NG: { currency: 'NGN', price: 700, unit: 'L' },
  EG: { currency: 'EGP', price: 15, unit: 'L' },
  IL: { currency: 'ILS', price: 7.5, unit: 'L' },
  AE: { currency: 'AED', price: 3.0, unit: 'L' },
  SA: { currency: 'SAR', price: 2.33, unit: 'L' },
  TR: { currency: 'TRY', price: 42, unit: 'L' },
  RU: { currency: 'RUB', price: 55, unit: 'L' },
  UA: { currency: 'UAH', price: 55, unit: 'L' },
}

// Eurozone members share the EUR entry.
for (const cc of [
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PT', 'SK', 'SI', 'ES', 'HR',
]) {
  FUEL[cc] = EUR
}

// currencies whose pump price reads without decimals
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'COP'])

/**
 * Format a country's fuel price, e.g. "$3.89/gal", "€1.85/L", "¥175/L".
 * The currency symbol comes from Intl; the number is formatted directly so the
 * result is identical on every device regardless of its UI locale.
 */
export function fuelLabel(country: string | null | undefined): string {
  const f = FUEL[(country ?? '').toUpperCase()] ?? US
  let symbol = f.currency
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: f.currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)
    symbol = parts.find((p) => p.type === 'currency')?.value ?? f.currency
  } catch {
    /* keep the ISO code */
  }
  const num = f.price.toFixed(ZERO_DECIMAL.has(f.currency) ? 0 : 2)
  return `${symbol}${num}/${f.unit}`
}

/** Best-effort country code from the browser locale (e.g. "en-GB" → "GB"). */
export function countryFromLocale(): string | null {
  const m = /[-_]([A-Za-z]{2})\b/.exec(navigator.language || '')
  return m ? m[1].toUpperCase() : null
}

/** Reverse-geocode a position to an ISO country code via Photon. */
export async function reverseCountry(pos: LngLat, signal?: AbortSignal): Promise<string | null> {
  const url = `https://photon.komoot.io/reverse?lat=${pos[1].toFixed(4)}&lon=${pos[0].toFixed(4)}&limit=1`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`photon reverse ${res.status}`)
  const json = (await res.json()) as {
    features?: { properties?: { countrycode?: string } }[]
  }
  const cc = json.features?.[0]?.properties?.countrycode
  return cc ? cc.toUpperCase() : null
}
