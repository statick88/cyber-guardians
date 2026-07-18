'use client'

import dynamic from 'next/dynamic'

/**
 * Client-side wrapper for Modulo0Game with ssr: false.
 * This prevents the blank screen issue by ensuring the game only renders on the client.
 */
const Modulo0Game = dynamic(() => import('@/components/module0/Modulo0Game'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-void aurora-bg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-6 animate-pulse">
          <span className="text-4xl" role="img" aria-label="shield">🛡️</span>
        </div>
        <h2 className="text-xl font-bold text-cyan-400 mb-2">CyberGuardians</h2>
        <p className="text-slate-400 text-sm">Cargando módulo...</p>
        <div className="mt-4 animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent mx-auto" />
      </div>
    </main>
  ),
})

export default function Modulo0Client() {
  return <Modulo0Game />
}
