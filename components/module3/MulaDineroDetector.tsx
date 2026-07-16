"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  ExternalLink,
  Zap,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import type { ActividadMula } from "@/types/module3";

interface MulaDineroDetectorProps {
  actividad: ActividadMula;
  onScore: (points: number) => void;
  onComplete: () => void;
}

const riskConfig: Record<
  string,
  { color: string; label: string; glow: string; border: string }
> = {
  bajo: {
    color: "from-amber-500 to-yellow-500",
    label: "Riesgo Bajo",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    border: "border-amber-500/30",
  },
  medio: {
    color: "from-orange-500 to-red-500",
    label: "Riesgo Medio",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
    border: "border-orange-500/30",
  },
  alto: {
    color: "from-red-500 to-rose-600",
    label: "Riesgo Alto",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    border: "border-red-500/30",
  },
};

export default function MulaDineroDetector({
  actividad,
  onScore,
  onComplete,
}: MulaDineroDetectorProps) {
  const [currentPregIdx, setCurrentPregIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"offer" | "quiz" | "conclusion">("offer");
  const [caseExpanded, setCaseExpanded] = useState(false);
  const [signalsRevealed, setSignalsRevealed] = useState(0);

  const pregunta = actividad.preguntas[currentPregIdx];
  const risk = riskConfig[actividad.oferta.nivelRiesgo] || riskConfig.medio;

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === pregunta.respuestaCorrecta) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentPregIdx + 1 < actividad.preguntas.length) {
      setCurrentPregIdx((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      onScore(correctCount * 3);
      setPhase("conclusion");
    }
  };

  const revealSignals = () => {
    if (signalsRevealed < actividad.oferta.señalesRiesgo.length) {
      setSignalsRevealed((s) => s + 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
      <AnimatePresence mode="wait">
        {/* ── Offer Phase ──────────────────────────────────────────── */}
        {phase === "offer" && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Risk badge */}
            <div className="text-center mb-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${risk.color} text-white text-sm font-bold ${risk.glow}`}
              >
                <ShieldAlert className="w-4 h-4" />
                {risk.label}
              </motion.span>
            </div>

            {/* Offer card */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {actividad.oferta.titulo}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {actividad.oferta.descripcion}
                  </p>
                </div>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  📱 {actividad.oferta.plataforma}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  {actividad.oferta.tecnicaUsada}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-600/30 border border-slate-500/30 text-slate-300 text-xs font-semibold">
                  <ExternalLink className="w-3 h-3" />
                  {actividad.oferta.fuente}
                </span>
              </div>

              {/* Technique callout */}
              <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 mb-4 font-mono">
                <p className="text-xs text-cyan-300">
                  <span className="text-cyan-500">&gt;</span> Técnica:{" "}
                  {actividad.oferta.tecnicaUsada}
                </p>
              </div>

              {/* Risk signals — animated pills */}
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2 font-medium">
                  ⚠️ Señales de riesgo detectadas:
                </p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {actividad.oferta.señalesRiesgo
                      .slice(0, signalsRevealed)
                      .map((señal) => (
                        <motion.span
                          key={señal}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold"
                        >
                          {señal}
                        </motion.span>
                      ))}
                  </AnimatePresence>
                </div>
                {signalsRevealed < actividad.oferta.señalesRiesgo.length && (
                  <button
                    onClick={revealSignals}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    + Mostrar siguiente señal
                  </button>
                )}
              </div>

              {/* Expandable real case */}
              {actividad.oferta.victimasReales && (
                <div className="border border-violet-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setCaseExpanded(!caseExpanded)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-violet-900/20 hover:bg-violet-900/30 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-violet-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      📚 Caso real
                    </span>
                    {caseExpanded ? (
                      <ChevronUp className="w-4 h-4 text-violet-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-violet-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {caseExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 py-3 text-xs text-violet-300/80 leading-relaxed">
                          {actividad.oferta.victimasReales}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setPhase("quiz")}
                className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Responder preguntas →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Quiz Phase ───────────────────────────────────────────── */}
        {phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Progress */}
            <div className="text-center mb-4">
              <p className="text-sm text-slate-400">
                Pregunta {currentPregIdx + 1}/{actividad.preguntas.length}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                    animate={{
                      width: `${((currentPregIdx + 1) / actividad.preguntas.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pregunta.pregunta}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5"
              >
                <h4 className="text-white font-semibold text-lg mb-4 leading-relaxed">
                  {pregunta.pregunta}
                </h4>
                <div className="space-y-2">
                  {pregunta.opciones.map((op, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === pregunta.respuestaCorrecta;

                    let style =
                      "bg-slate-800 text-slate-200 border border-slate-700/50 hover:border-slate-500 cursor-pointer";
                    if (showResult) {
                      if (isCorrect) {
                        style =
                          "bg-emerald-900/30 text-emerald-300 border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
                      } else if (isSelected && !isCorrect) {
                        style =
                          "bg-red-900/30 text-red-300 border-2 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                      } else {
                        style =
                          "bg-slate-800/50 text-slate-500 border border-slate-700/30";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!showResult ? { scale: 1.01 } : {}}
                        whileTap={!showResult ? { scale: 0.99 } : {}}
                        onClick={() => handleAnswer(idx)}
                        disabled={showResult}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${style}`}
                      >
                        <span className="font-bold mr-2 opacity-50">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {op}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-700/50 overflow-hidden"
                    >
                      <div className="flex items-start gap-2">
                        {selectedAnswer === pregunta.respuestaCorrecta ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {pregunta.explicacion}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Next button */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-4"
              >
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  {currentPregIdx + 1 < actividad.preguntas.length
                    ? "Siguiente pregunta"
                    : "Ver resultado"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Conclusion Phase ─────────────────────────────────────── */}
        {phase === "conclusion" && (
          <motion.div
            key="conclusion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center"
            >
              <ShieldAlert className="w-8 h-8 text-white" />
            </motion.div>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {actividad.oferta.esTrampa
                  ? "¡Es una trampa!"
                  : "Oferta legítima"}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {actividad.oferta.explicacion}
              </p>

              {/* Technique in terminal style */}
              <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 mb-4 font-mono text-left">
                <p className="text-xs text-cyan-300">
                  <span className="text-cyan-500">&gt;</span> Técnica:{" "}
                  {actividad.oferta.tecnicaUsada}
                </p>
              </div>

              {/* Real victims */}
              {actividad.oferta.victimasReales && (
                <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 mb-4 text-left">
                  <p className="text-xs text-red-300/80 leading-relaxed">
                    <span className="text-red-400 font-semibold">
                      📊 Impacto real:
                    </span>{" "}
                    {actividad.oferta.victimasReales}
                  </p>
                </div>
              )}
            </div>

            {/* Score */}
            <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl p-4 mb-6">
              <p className="text-sm text-slate-400">
                Puntuación:{" "}
                <span className="text-white font-bold">{correctCount}</span> /{" "}
                {actividad.preguntas.length} correctas
              </p>
            </div>

            {/* Source footer */}
            <p className="text-xs text-slate-500 mb-4">
              Fuente: {actividad.oferta.fuente}
            </p>

            <button
              onClick={onComplete}
              className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Continuar →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
            <h4 className="text-sm text-slate-300 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              ¿Cómo Detectar una Mula?
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Ofertas de trabajo que suenan demasiado buenas para ser verdad</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Te piden recibir y transferir dinero de terceros</span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Comisiones por cada transferencia realizada</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Nunca aceptes manejar dinero de desconocidos</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
