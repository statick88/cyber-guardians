/**
 * Navigation helper that respects Next.js basePath.
 * In production (GitHub Pages), basePath is "/cyber-guardians".
 * In development, basePath is "".
 *
 * In static export, __NEXT_DATA__ may not be available, so we fall back
 * to detecting GitHub Pages via hostname and using the known repo name.
 */

// Known GitHub Pages repo name (from next.config.js REPO_NAME default)
const GITHUB_PAGES_REPO_NAME = 'cyber-guardians'

interface NextData {
  basePath?: string
}

function isGitHubPages(): boolean {
  if (typeof window === 'undefined') return false
  // GitHub Pages hosts are *.github.io or custom domains with CNAME
  // The default repo URL pattern is username.github.io/repo-name
  return window.location.hostname.endsWith('.github.io')
}

export function getBasePath(): string {
  if (typeof window === 'undefined') return ''

  // 1. First try Next.js __NEXT_DATA__ (works in dev and some deployments)
  try {
    const nextData = (window as unknown as { __NEXT_DATA__?: NextData }).__NEXT_DATA__
    const basePath = nextData?.basePath
    if (basePath) return basePath
  } catch {
    // ignore
  }

  // 2. Fallback: if we're on GitHub Pages, use the known repo name
  if (isGitHubPages()) {
    return `/${GITHUB_PAGES_REPO_NAME}`
  }

  // 3. Development or custom domain: no basePath
  return ''
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
