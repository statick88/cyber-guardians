'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { GripVertical, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react'

interface MicroActivityProps {
  activityId: string
  title: string
  description: string
  onComplete: () => void
}

interface DragItem {
  id: string
  label: string
  order: number
}

function DataFlowPuzzle({ onComplete }: { onComplete: () => void }) {
  const [items, setItems] = useState<DragItem[]>([
    { id: 'step-1', label: '📱 Abres una app en tu teléfono', order: 0 },
    { id: 'step-2', label: '🌐 Tu envías una solicitud HTTP', order: 1 },
    { id: 'step-3', label: '📡 El servidor recibe la solicitud', order: 2 },
    { id: 'step-4', label: '🔐 Se verifica tu identidad', order: 3 },
    { id: 'step-5', label: '📦 El servidor devuelve los datos', order: 4 },
    { id: 'step-6', label: '📱 Tu app muestra la información', order: 5 },
  ])
  const [placed, setPlaced] = useState<DragItem[]>([])
  const [completed, setCompleted] = useState(false)

  const [shuffled] = useState(() => [...items].sort(() => Math.random() - 0.5))

  const handlePlace = (item: DragItem) => {
    if (placed.find(p => p.id === item.id)) return
    const newPlaced = [...placed, item]
    setPlaced(newPlaced)

    if (newPlaced.length === items.length) {
      const allCorrect = newPlaced.every((p, i) => p.order === i)
      if (allCorrect) {
        setCompleted(true)
        setTimeout(onComplete, 1500)
      }
    }
  }

  const handleReset = () => {
    setPlaced([])
    setCompleted(false)
  }

  const available = items.filter(i => !placed.find(p => p.id === i.id))

  return (
    <div className="space-y-4">
      {/* Available items */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider code-font mb-2">
          Paso a paso — haz clic para ordenar
        </p>
        {available.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePlace(item)}
            className="w-full flex items-center gap-3 p-3 min-h-[44px] rounded-xl border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label={`Colocar: ${item.label}`}
          >
            <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <span className="text-sm text-slate-300">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Placed items */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider code-font mb-2">
          Tu orden:
        </p>
        {placed.length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-slate-400 text-sm">
            Haz clic en los pasos arriba para ordenarlos
          </div>
        )}
        {placed.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20"
          >
            <span className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300 code-font">
              {index + 1}
            </span>
            <span className="text-sm text-slate-200">{item.label}</span>
            {completed && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
          </motion.div>
        ))}
      </div>

      {/* Feedback */}
      {placed.length === items.length && !completed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
        >
          <p className="text-rose-300 text-sm">
            El orden no es correcto. ¡Inténtalo de nuevo!
          </p>
          <button
            onClick={handleReset}
            className="mt-2 inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 code-font px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        </motion.div>
      )}

      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
        >
          <p className="text-emerald-300 font-semibold">¡Correcto! Los datos viajan así:</p>
          <p className="text-emerald-400/70 text-xs mt-1 code-font">
            App → HTTP → Servidor → Verificación → Datos → App
          </p>
        </motion.div>
      )}
    </div>
  )
}

function PasswordChainPuzzle({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    q1: null,
    q2: null,
    q3: null,
  })
  const [completed, setCompleted] = useState(false)

  const questions = [
    {
      id: 'q1',
      text: 'Si Netflix es hackeado y usas la misma contraseña en Gmail, ¿qué pasa?',
      correct: true,
      explanation: 'El atacante probará esa contraseña en Gmail y otras cuentas (credential stuffing).',
    },
    {
      id: 'q2',
      text: '¿Cambiar "MiClave2024" por "MiClave2024!" hace la contraseña segura para reusar?',
      correct: false,
      explanation: 'Una variación predecible no es segura. El atacante probará variaciones obvias.',
    },
    {
      id: 'q3',
      text: '¿Un gestor de contraseñas genera y almacena contraseñas únicas para cada sitio?',
      correct: true,
      explanation: 'Exacto. Por eso se recomienda usar uno como Bitwarden o 1Password.',
    },
  ]

  const handleAnswer = (qId: string, answer: boolean) => {
    if (completed) return
    const newAnswers = { ...answers, [qId]: answer }
    setAnswers(newAnswers)

    if (Object.values(newAnswers).every(v => v !== null)) {
      const allCorrect = questions.every(q => newAnswers[q.id] === q.correct)
      if (allCorrect) {
        setCompleted(true)
        setTimeout(onComplete, 1500)
      }
    }
  }

  const allAnswered = Object.values(answers).every(v => v !== null)
  const allCorrect = questions.every(q => answers[q.id] === q.correct)

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-200 mb-3">{q.text}</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAnswer(q.id, true)}
              disabled={completed}
              className={`px-5 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                answers[q.id] === true
                  ? q.correct
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              Verdadero
            </button>
            <button
              onClick={() => handleAnswer(q.id, false)}
              disabled={completed}
              className={`px-5 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                answers[q.id] === false
                  ? !q.correct
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              Falso
            </button>
          </div>
          {answers[q.id] !== null && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-xs text-slate-400 code-font"
            >
              {q.explanation}
            </motion.p>
          )}
        </div>
      ))}

      {allAnswered && !allCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center"
        >
          <p className="text-rose-300 text-sm">Algunas respuestas no son correctas. ¡Revisa las explicaciones e inténtalo de nuevo!</p>
          <button
            onClick={() => { setAnswers({ q1: null, q2: null, q3: null }); setCompleted(false) }}
            className="mt-2 inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 code-font px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        </motion.div>
      )}

      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
        >
          <p className="text-emerald-300 font-semibold">¡Excelente! Entiendes la importancia de contraseñas únicas.</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function MicroActivity({ activityId, title, description, onComplete }: MicroActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-5 sm:p-6 mb-4"
    >
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 mb-4">{description}</p>

      {activityId === 'micro-001' && <DataFlowPuzzle onComplete={onComplete} />}
      {activityId === 'micro-002' && <PasswordChainPuzzle onComplete={onComplete} />}
    </motion.div>
  )
}
