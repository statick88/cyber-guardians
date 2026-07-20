'use client'

import dynamic from 'next/dynamic'

export const BackgroundScene = dynamic(
  () => import('./BackgroundScene'),
  {
    ssr: false,
    loading: () => null,
  }
)