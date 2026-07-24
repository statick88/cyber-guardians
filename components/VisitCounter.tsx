'use client'

import { useState, useEffect } from 'react'

export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const KEY = 'cg_visit_count'
    const current = parseInt(localStorage.getItem(KEY) || '0', 10)
    const next = current + 1
    localStorage.setItem(KEY, String(next))
    setCount(next)
  }, [])

  if (count === null) return null

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
      <span className="inline-block w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
      <span>Visitas: {count.toLocaleString()}</span>
    </div>
  )
}
