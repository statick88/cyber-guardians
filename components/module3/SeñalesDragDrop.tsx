"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import type { MensajeDragDrop } from "@/types/module3";

interface SeñalesDragDropProps {
  mensajes: MensajeDragDrop[];
  onScore: (points: number, category: string) => void;
  onComplete: () => void;
}

const categorias = [
  {
    key: "seguro",
    label: "✅ Seguro",
    color: "bg-emerald-600/20 border-emerald-500/40 text-emerald-300",
    hover: "hover:bg-emerald-600/30 hover:border-emerald-500/60",
    glow: "shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  },
  {
    key: "reclutamiento",
    label: "🎯 Reclutamiento",
    color: "bg-red-600/20 border-red-500/40 text-red-300",
    hover: "hover:bg-red-600/30 hover:border-red-500/60",
    glow: "shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  },
  {
    key: "mula",
    label: "💰 Mula Dinero",
    color: "bg-orange-600/20 border-orange-500/40 text-orange-300",
    hover: "hover:bg-orange-600/30 hover:border-orange-500/60",
    glow: "shadow-[0_0_10px_rgba(249,115,22,0.2)]",
  },
  {
    key: "extorsion",
    label: "🔓 Extorsión",
    color: "bg-purple-600/20 border-purple-500/40 text-purple-300",
    hover: "hover:bg-purple-600/30 hover:border-purple-500/60",
    glow: "shadow-[0_0_10px_rgba(168,85,247,0.2)]",
  },
  {
    key: "manipulacion",
    label: "🎭 Manipulación",
    color: "bg-pink-600/20 border-pink-500/40 text-pink-300",
    hover: "hover:bg-pink-600/30 hover:border-pink-500/60",
    glow: "shadow-[0_0_10px_rgba(236,72,153,0.2)]",
  },
];

const difficultyConfig: Record<
  string,
  { label: string; color: string; border: string; points: number }
> = {
  facil: {
    label: "Fácil",
    color: "bg-emerald-500/10 text-emerald-400",
    border: "border-emerald-500/40",
    points: 1,
  },
  medio: {
    label: "Medio",
    color: "bg-amber-500/10 text-amber-400",
    border: "border-amber-500/40",
    points: 2,
  },
  dificil: {
    label: "Difícil",
    color: "bg-red-500/10 text-red-400",
    border: "border-red-500/40",
    points: 3,
  },
};

export default function SeñalesDragDrop({
  mensajes,
  onScore,
  onComplete,
}: SeñalesDragDropProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [showResults, setShowResults] = useState(false);

  const sortedMensajes = useMemo(() => {
    const order = { facil: 0, medio: 1, dificil: 2 };
    return [...mensajes].sort(
      (a, b) => order[a.dificultad] - order[b.dificultad]
    );
  }, [mensajes]);

  const mensaje = sortedMensajes[currentIdx];
  const diffCfg = mensaje
    ? difficultyConfig[mensaje.dificultad]
    : difficultyConfig.facil;

  // Progress by difficulty
  const progress = useMemo(() => {
    const counts = { facil: 0, medio: 0, dificil: 0 };
    const answered = { facil: 0, medio: 0, domicil: 0 };
    for (const msg of sortedMensajes) {
      counts[msg.dificultad as keyof typeof counts]++;
      if (answers.has(msg.id)) {
        answered[msg.dificultad as keyof typeof answered]++;
      }
    }
    return { counts, answered };
  }, [sortedMensajes, answers]);

  const handleClassify = (categoria: string) => {
    if (showResults) return;
    const next = new Map(answers);
    next.set(mensaje.id, categoria);
    setAnswers(next);

    if (currentIdx + 1 < sortedMensajes.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleFinish = () => {
    let totalPoints = 0;
    for (const msg of sortedMensajes) {
      if (answers.get(msg.id) === msg.tipo) {
        totalPoints += difficultyConfig[msg.dificultad]?.points ?? 1;
      }
    }
    onScore(totalPoints, "manipulacion");
    onComplete();
  };

  const getCorrectCount = () => {
    let correct = 0;
    for (const msg of sortedMensajes) {
      if (answers.get(msg.id) === msg.tipo) correct++;
    }
    return correct;
  };

  const getTotalWeightedScore = () => {
    let total = 0;
    for (const msg of sortedMensajes) {
      if (answers.get(msg.id) === msg.tipo) {
        total += difficultyConfig[msg.dificultad]?.points ?? 1;
      }
    }
    return total;
  };

  const getMaxWeightedScore = () => {
    let total = 0;
    for (const msg of sortedMensajes) {
      total += difficultyConfig[msg.dificultad]?.points ?? 1;
    }
    return total;
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white">Resultados</h3>
            <p className="text-slate-400 mt-1">
              Clasificaste correctamente {getCorrectCount()} de{" "}
              {sortedMensajes.length} mensajes
            </p>
          </div>

          {/* Score summary */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-5 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">
                  {getTotalWeightedScore()}
                </p>
                <p className="text-xs text-slate-400">
                  Puntos / {getMaxWeightedScore()} máximos
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  {getCorrectCount()}
                </p>
                <p className="text-xs text-slate-400">
                  Correctos / {sortedMensajes.length}
                </p>
              </div>
            </div>
          </div>

          {/* Per-message results */}
          <div className="space-y-2 mb-6">
            {sortedMensajes.map((msg) => {
              const userAnswer = answers.get(msg.id);
              const isCorrect = userAnswer === msg.tipo;
              const correctCat = categorias.find((c) => c.key === msg.tipo);
              const userCat = categorias.find((c) => c.key === userAnswer);
              const msgDiff = difficultyConfig[msg.dificultad];

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-xl border text-sm ${
                    isCorrect
                      ? "bg-emerald-900/20 border-emerald-500/30"
                      : "bg-red-900/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200">&ldquo;{msg.texto}&rdquo;</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {/* Difficulty badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${msgDiff.color} border ${msgDiff.border}`}
                        >
                          {msgDiff.label} · {msgDiff.points}pt
                        </span>
                        {!isCorrect && (
                          <p className="text-xs text-slate-400">
                            Tu:{" "}
                            <span className="text-red-300">
                              {userCat?.label || "Sin respuesta"}
                            </span>
                            {" → "}
                            Correcto:{" "}
                            <span className="text-emerald-300">
                              {correctCat?.label}
                            </span>
                          </p>
                        )}
                      </div>
                      {/* Research source */}
                      {msg.fuente && (
                        <p className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                          <BookOpen className="w-3 h-3" />
                          📚 Fuente: {msg.fuente}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFinish}
              className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Finalizar actividad
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Progress indicator */}
      <div className="text-center mb-4">
        <p className="text-sm text-slate-400 mb-2">
          Mensaje {currentIdx + 1} de {sortedMensajes.length}
        </p>
        {/* Difficulty progression */}
        <div className="flex items-center justify-center gap-3 mb-2">
          {(["facil", "medio", "dificil"] as const).map((diff) => {
            const cfg = difficultyConfig[diff];
            const total = sortedMensajes.filter(
              (m) => m.dificultad === diff
            ).length;
            const done = sortedMensajes.filter(
              (m) => m.dificultad === diff && answers.has(m.id)
            ).length;
            return (
              <span
                key={diff}
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.color} border ${cfg.border}`}
              >
                {cfg.label}: {done}/{total}
              </span>
            );
          })}
        </div>
        <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
            animate={{
              width: `${(currentIdx / sortedMensajes.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Message card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mensaje.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border p-5 mb-6 text-center ${diffCfg.border}`}
          style={{
            boxShadow: `0 0 15px ${
              mensaje.dificultad === "facil"
                ? "rgba(16,185,129,0.15)"
                : mensaje.dificultad === "medio"
                ? "rgba(245,158,11,0.15)"
                : "rgba(239,68,68,0.15)"
            }`,
          }}
        >
          {/* Difficulty badge */}
          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${diffCfg.color} border ${diffCfg.border}`}
            >
              {diffCfg.label} · {diffCfg.points} punto{diffCfg.points > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-lg text-white font-medium italic">
            &ldquo;{mensaje.texto}&rdquo;
          </p>
          {mensaje.fuente && (
            <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mt-3">
              <BookOpen className="w-3 h-3" />
              📚 {mensaje.fuente}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Classification buttons — 2×3 grid */}
      <div className="grid grid-cols-2 gap-3">
        {categorias.map((cat) => (
          <motion.button
            key={cat.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleClassify(cat.key)}
            className={`border rounded-xl px-4 py-3 text-sm font-semibold transition-all ${cat.color} ${cat.hover}`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
