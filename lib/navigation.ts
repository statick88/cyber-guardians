/**
 * Navigation helper that respects Next.js basePath.
 * In production (GitHub Pages), basePath is "/cyber-guardians".
 * In development, basePath is "".
 */
interface NextData {
  basePath?: string
}

export function getBasePath(): string {
  if (typeof window === 'undefined') return ''
  try {
    const nextData = (window as unknown as { __NEXT_DATA__?: NextData }).__NEXT_DATA__
    return nextData?.basePath || ''
  } catch {
    return ''
  }
}

/** Navigate to a path, automatically prepending the basePath */
export function navigateTo(path: string): void {
  try {
    const base = getBasePath()
    window.location.href = `${base}${path}`
  } catch {
    window.location.href = path
  }
}
