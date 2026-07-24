import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE_URL = 'https://statick88.github.io/cyber-guardians'

export default function sitemap(): MetadataRoute.Sitemap {
  const modules = ['modulo0', 'modulo1', 'modulo2', 'modulo3', 'modulo4', 'modulo5', 'modulo6']

  const moduleEntries = modules.map((mod) => ({
    url: `${BASE_URL}/${mod}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...moduleEntries,
    {
      url: `${BASE_URL}/attack`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}
