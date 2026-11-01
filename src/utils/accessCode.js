export function normalizeAccessCode(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

export function formatAccessCode(code) {
  const clean = normalizeAccessCode(code)
  if (clean.length <= 4) return clean
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`
}
