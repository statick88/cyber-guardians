/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// GitHub Pages: https://<user>.github.io/<repo>/
// Set REPO_NAME env var in CI or leave empty for custom domains
const REPO_NAME = process.env.REPO_NAME || 'cyber-guardians'

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // basePath & assetPrefix only needed for GitHub Pages subdirectory
  // Leave empty if using a custom domain (e.g. cyber-guardians.vercel.app)
  basePath: isProd ? `/${REPO_NAME}` : '',
  assetPrefix: isProd ? `/${REPO_NAME}` : '',
}

module.exports = nextConfig
