'use client'

import { useCallback } from 'react'
import type { SkillCompetencyTag } from '@/types/educational'
import { usePortfolio } from '@/hooks/usePortfolio'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortfolioSummaryProps {
  /** Optional className for the outermost element */
  className?: string
  /** Show export button (default true) */
  showExport?: boolean
  /** Show clear button (default false) */
  showClear?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAG_LABELS: Record<SkillCompetencyTag, string> = {
  'email-analysis': 'Análisis de Emails',
  'url-inspection': 'Inspección de URLs',
  'phishing-sim': 'Simulación de Phishing',
  'digital-defense': 'Defensa Digital',
  'metadata-extraction': 'Extracción de Metadatos',
  'cookie-sweeping': 'Revisión de Cookies',
}

const TAG_ICONS: Record<SkillCompetencyTag, string> = {
  'email-analysis': '📧',
  'url-inspection': '🔗',
  'phishing-sim': '🎣',
  'digital-defense': '🛡️',
  'metadata-extraction': '🔍',
  'cookie-sweeping': '🍪',
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  if (score >= 30) return 'text-orange-400'
  return 'text-red-400'
}

function scoreBarWidth(score: number): string {
  return `${Math.max(2, Math.min(100, score))}%`
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 60) return 'bg-amber-400'
  if (score >= 30) return 'bg-orange-400'
  return 'bg-red-400'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PortfolioSummary({
  className = '',
  showExport = true,
  showClear = false,
}: PortfolioSummaryProps) {
  const { competencyScores, overallScore, totalEntries, exportPortfolio, clearPortfolio } =
    usePortfolio()

  const handleExport = useCallback(() => {
    const json = exportPortfolio()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cg-portfolio-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportPortfolio])

  const handleClear = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres borrar todo tu portafolio? Esta acción no se puede deshacer.')) {
      clearPortfolio()
    }
  }, [clearPortfolio])

  if (totalEntries === 0) {
    return (
      <div
        className={`rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm ${className}`}
      >
        <p className="text-sm text-white/60">
          Aún no tienes datos en tu portafolio. Completa escenarios para acumular puntajes.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Portafolio de Competencias</h3>
        <span className="text-xs text-white/50">
          {totalEntries} escenario{totalEntries !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Overall Score */}
      <div className="mb-5 rounded-lg bg-white/5 p-3 text-center">
        <div className={`text-2xl font-bold ${scoreColor(overallScore)}`}>
          {overallScore.toFixed(1)}
        </div>
        <div className="text-xs text-white/50">Puntaje general</div>
      </div>

      {/* Competency Grid */}
      <div className="space-y-3">
        {competencyScores.map((cs) => (
          <div key={cs.tag} className="flex items-center gap-3">
            <span className="w-6 text-center text-base" title={TAG_LABELS[cs.tag]}>
              {TAG_ICONS[cs.tag]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate text-white/80">{TAG_LABELS[cs.tag]}</span>
                <span className={`ml-2 tabular-nums ${scoreColor(cs.score)}`}>
                  {cs.score.toFixed(0)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${scoreBarColor(cs.score)}`}
                  style={{ width: scoreBarWidth(cs.score) }}
                />
              </div>
              <div className="mt-0.5 text-[10px] text-white/40">
                {cs.attempts} intento{cs.attempts !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {(showExport || showClear) && (
        <div className="mt-5 flex gap-2">
          {showExport && (
            <button
              onClick={handleExport}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              📥 Exportar JSON
            </button>
          )}
          {showClear && (
            <button
              onClick={handleClear}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/20"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  )
}
