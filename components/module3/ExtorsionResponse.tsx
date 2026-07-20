"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuizSound from "@/hooks/useQuizSound";
import { shuffleArray, mulberry32 } from "@/lib/shuffle";
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  ExternalLink,
  Phone,
} from "lucide-react";
import type { EscenarioExtorsion, RECURSOS_APOYO } from "@/types/module3";
import { RECURSOS_APOYO as recursosData } from "@/types/module3";

interface ExtorsionResponseProps {
  scenario: EscenarioExtorsion;
  onScore: (points: number) => void;
  onComplete: () => void;
}

const typeConfig: Record<
  string,
  { label: string; color: string; glow: string; border: string }
> = {
  sextorsion: {
    label: "Sextorsión",
    color: "from-purple-500 to-violet-600",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    border: "border-purple-500/30",
  },
  ransom: {
    label: "Ransomware",
    color: "from-red-500 to-rose-600",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    border: "border-red-500/30",
  },
  amenazas: {
    label: "Amenazas",
    color: "from-orange-500 to-red-500",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
    border: "border-orange-500/30",
  },
};

export default function ExtorsionResponse({
  scenario,
  onScore,
  onComplete,
}: ExtorsionResponseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { playCorrect, playIncorrect } = useQuizSound();

  // Pre-shuffle options once per session
  const [shuffled] = useState(() => {
    const seed = (() => {
      if (typeof window === "undefined") return Date.now();
      const key = "quiz-shuffle-seed";
      let s = sessionStorage.getItem(key);
      if (!s) {
        s = String(Math.floor(Math.random() * 2 ** 32));
        sessionStorage.setItem(key, s);
      }
      return Number(s);
    })();
    const rng = mulberry32(seed);
    const opcionesShuffled = shuffleArray(scenario.opciones, rng);
    const newCorrectIdx = opcionesShuffled.indexOf(
      scenario.opciones[scenario.respuestaCorrecta]
    );
    return { opciones: opcionesShuffled, correctIdx: newCorrectIdx };
  });

  const typeCfg = typeConfig[scenario.tipo] || typeConfig.amenazas;

  const matchedResources = recursosData.filter((r) =>
    scenario.recursosApoyo.some(
      (name) =>
        r.nombre.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(r.nombre.toLowerCase())
    )
  );

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
  };

  const handleFinish = () => {
    const isCorrect = selectedAnswer === shuffled.correctIdx;
    const points = isCorrect
        ? scenario.puntuacionMaxima
        : 0;
    isCorrect ? playCorrect() : playIncorrect();
    onScore(points);
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-sm text-slate-400 mb-2">Ciberextorsión</p>
          </div>

          {/* Scenario card */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {scenario.titulo}
                </h3>
              </div>
            </div>

            {/* Type badge + age */}
            <div className="flex flex-wrap gap-2 mb-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${typeCfg.color} text-white text-xs font-semibold ${typeCfg.glow}`}
              >
                <ShieldAlert className="w-3 h-3" />
                {typeCfg.label}
              </motion.span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                Edad: {scenario.edadObjetivo}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                <ExternalLink className="w-3 h-3" />
                {scenario.fuente}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {scenario.descripcion}
            </p>
          </div>

          {/* Options as decision tree */}
          <div className="space-y-2 mb-4">
            {shuffled.opciones.map((opcion, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === shuffled.correctIdx;

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
                  {opcion}
                </motion.button>
              );
            })}
          </div>

          {/* After answer: explanation + consequences + resources */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Explanation */}
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-4">
                  <div className="flex items-start gap-2">
                    {selectedAnswer === shuffled.correctIdx ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">
                        {selectedAnswer === shuffled.correctIdx
                          ? "¡Correcto!"
                          : "Respuesta incorrecta"}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {scenario.explicacion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consequences panel */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">
                        ⚠️ Consecuencias reales
                      </p>
                      <p className="text-sm text-red-200/80 leading-relaxed">
                        {scenario.consecuenciasReales}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support resources */}
                {matchedResources.length > 0 && (
                  <div className="bg-slate-800/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 mb-4">
                    <p className="text-xs font-semibold text-cyan-400 mb-3">
                      🆘 Recursos de apoyo
                    </p>
                    <div className="space-y-2">
                      {matchedResources.map((recurso) => (
                        <a
                          key={recurso.nombre}
                          href={recurso.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-700/30 hover:border-cyan-500/30 transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 group-hover:text-cyan-300" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-cyan-300 font-medium group-hover:text-cyan-200 truncate">
                              {recurso.nombre}
                            </p>
                            {recurso.telefono && (
                              <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {recurso.telefono}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                    {/* Show resource names that didn't match */}
                    {scenario.recursosApoyo.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/30">
                        <p className="text-xs text-slate-500">
                          También:{" "}
                          {scenario.recursosApoyo
                            .filter(
                              (name) =>
                                !matchedResources.some(
                                  (r) =>
                                    r.nombre
                                      .toLowerCase()
                                      .includes(name.toLowerCase()) ||
                                    name
                                      .toLowerCase()
                                      .includes(r.nombre.toLowerCase())
                                )
                            )
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Finish button */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-4"
            >
              <button
                onClick={handleFinish}
                className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Finalizar
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
