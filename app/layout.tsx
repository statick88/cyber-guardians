import type { Metadata } from 'next'
import './globals.css'

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
