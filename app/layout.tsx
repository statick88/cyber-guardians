import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import HUDProvider from '@/components/HUDProvider'
import HUD from '@/components/HUD'
import { MIAAgent } from '@/components/mia'
import { BackgroundScene } from '@/components/three/BackgroundSceneClient'

export const metadata: Metadata = {
  title: {
    default: 'CyberGuardians - Plataforma Educativa de Ciberseguridad',
    template: '%s | CyberGuardians',
  },
  description: 'Plataforma interactiva de aprendizaje de ciberseguridad con módulos gamificados, IA adaptativa y simulaciones de amenazas reales.',
  keywords: ['ciberseguridad', 'educación', 'phishing', 'seguridad informática', 'gamificación', 'IA educativa'],
  authors: [{ name: 'Statick', url: 'https://statick88.github.io' }],
  creator: 'Statick',
  metadataBase: new URL('https://statick88.github.io/cyber-guardians'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://statick88.github.io/cyber-guardians',
    siteName: 'CyberGuardians',
    title: 'CyberGuardians - Plataforma Educativa de Ciberseguridad',
    description: 'Plataforma interactiva de aprendizaje de ciberseguridad con módulos gamificados, IA adaptativa y simulaciones de amenazas reales.',
    images: [
      {
        url: '/og-image.png', // Create 1200x630 PNG from public/og-image.svg template
        width: 1200,
        height: 630,
        alt: 'CyberGuardians - Cybersecurity Education Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CyberGuardians',
    description: 'Plataforma interactiva de aprendizaje de ciberseguridad.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://statick88.github.io/cyber-guardians" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: 'CyberGuardians - Plataforma Educativa de Ciberseguridad',
              description: 'Plataforma interactiva de aprendizaje de ciberseguridad con módulos gamificados, IA adaptativa y simulaciones de amenazas reales.',
              provider: {
                '@type': 'Organization',
                name: 'Statick',
                url: 'https://statick88.github.io',
              },
              url: 'https://statick88.github.io/cyber-guardians',
              inLanguage: 'es',
              isAccessibleForFree: true,
              hasCourseInstance: {
                '@type': 'CourseInstance',
                courseMode: 'online',
                courseWorkload: 'PT2H',
              },
              about: [
                'Ciberseguridad',
                'Privacidad Digital',
                'Ingeniería Social',
                'Phishing',
                'Criptografía',
                'Deepfakes',
                'Estafas Digitales',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Inicio',
                  item: 'https://statick88.github.io/cyber-guardians',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-void text-slate-100 antialiased font-sans min-h-screen pt-9 md:pt-12">
        <BackgroundScene />
        <HUDProvider>
          <HUD />
          <MIAAgent />
          {children}
        </HUDProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          richColors={false}
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '0.75rem',
              color: '#e2e8f0',
            },
          }}
        />
      </body>
    </html>
  )
}
