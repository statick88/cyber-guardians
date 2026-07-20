import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import VolumeControl from '@/components/VolumeControl'
import HUDProvider from '@/components/HUDProvider'
import HUD from '@/components/HUD'
import { MIAAgent } from '@/components/mia'
import { BackgroundScene } from '@/components/three/BackgroundSceneClient'

export const metadata: Metadata = {
  title: 'CyberGuardians - Módulo 0: Cyber-Diagnóstico',
  description: 'Diagnostic interactivo para evaluar tu nivel de ciberseguridad',
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
      </head>
      <body className="bg-void text-slate-100 antialiased font-sans min-h-screen pt-9 md:pt-12">
        <BackgroundScene />
        <HUDProvider>
          <HUD />
          <MIAAgent />
          {children}
        </HUDProvider>
        <VolumeControl />
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
