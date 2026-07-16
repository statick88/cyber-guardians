"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Target,
  ExternalLink,
  Flag,
  MessageCircle,
} from "lucide-react";
import type { EscenarioChat, MensajeChat } from "@/types/module3";

interface ChatSimulatorProps {
  scenario: EscenarioChat;
  onScore: (points: number) => void;
  onComplete: () => void;
}

const authorLabels: Record<string, string> = {
  reclutador: "Reclutador",
  amigo: "Amigo",
  victima: "Tú",
  sospechoso: "Desconocido",
};

const authorColors: Record<string, string> = {
  reclutador: "from-cyan-600 to-cyan-500",
  amigo: "from-emerald-600 to-emerald-500",
  victima: "from-blue-600 to-blue-500",
  sospechoso: "from-amber-600 to-amber-500",
};

export default function ChatSimulator({
  scenario,
  onScore,
  onComplete,
}: ChatSimulatorProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [flaggedMessages, setFlaggedMessages] = useState<Set<string>>(
    new Set()
  );
  const [phase, setPhase] = useState<"intro" | "chat" | "select" | "result">(
    "intro"
  );

  const visibleMessages = useMemo(
    () => scenario.mensajes.slice(0, revealedCount),
    [scenario.mensajes, revealedCount]
  );

  const redFlagIds = useMemo(
    () =>
      new Set(
        scenario.mensajes.filter((m) => m.esSeñal).map((m) => m.id)
      ),
    [scenario.mensajes]
  );

  const platform = useMemo(() => {
    for (const msg of scenario.mensajes) {
      if (msg.plataforma) return msg.plataforma;
    }
    return "Red social";
  }, [scenario.mensajes]);

  const handleReveal = useCallback(() => {
    setRevealedCount((prev) => {
      const next = prev + 1;
      if (next >= scenario.mensajes.length) {
        setTimeout(() => setPhase("select"), 600);
      }
      return next;
    });
  }, [scenario.mensajes.length]);

  const toggleFlag = useCallback(
    (msgId: string) => {
      if (phase !== "select") return;
      setFlaggedMessages((prev) => {
        const next = new Set(prev);
        if (next.has(msgId)) next.delete(msgId);
        else next.add(msgId);
        return next;
      });
    },
    [phase]
  );

  const handleCheck = () => {
    let correct = 0;
    let falsePositives = 0;

    for (const msgId of Array.from(flaggedMessages)) {
      if (redFlagIds.has(msgId)) correct++;
      else falsePositives++;
    }

    const points = Math.max(0, correct - falsePositives);
    onScore(Math.min(points, scenario.puntuacionMaxima));
    setPhase("result");
  };

  const getCorrectFlags = (): MensajeChat[] =>
    scenario.mensajes.filter((m) => m.esSeñal && flaggedMessages.has(m.id));

  const getMissedFlags = (): MensajeChat[] =>
    scenario.mensajes.filter((m) => m.esSeñal && !flaggedMessages.has(m.id));

  const getFalsePositives = (): MensajeChat[] =>
    scenario.mensajes.filter((m) => !m.esSeñal && flaggedMessages.has(m.id));

  const totalCorrect = getCorrectFlags().length;
  const totalMissed = getMissedFlags().length;
  const totalFP = getFalsePositives().length;
  const score = Math.max(0, totalCorrect - totalFP);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
      <AnimatePresence mode="wait">
        {/* ── Intro Phase ──────────────────────────────────────────── */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {scenario.titulo}
              </h3>
              <p className="text-slate-300 text-sm mt-2 max-w-lg mx-auto">
                {scenario.contexto}
              </p>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                📱 {platform}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                <ExternalLink className="w-3 h-3" />
                {scenario.fuente}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Target className="w-3 h-3" />
                Edad: {scenario.edadObjetivo}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Clock className="w-3 h-3" />
                {scenario.duracionEstimada}
              </span>
            </div>

            {/* Research callout */}
            <div className="bg-slate-800/60 border border-violet-500/20 rounded-2xl p-4 mb-6 max-w-lg mx-auto">
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-violet-400 font-semibold">
                  📚 Investigación:{" "}
                </span>
                Este escenario se basa en patrones documentados por{" "}
                <span className="text-violet-300">{scenario.fuente}</span>.
                Los menores de {scenario.edadObjetivo} años son el grupo de mayor
                riesgo para este tipo de{" "}
                {scenario.categoria === "reclutamiento"
                  ? "reclutamiento criminal"
                  : "manipulación digital"}
                .
              </p>
            </div>

            <button
              onClick={() => setPhase("chat")}
              className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Iniciar conversación →
            </button>
          </motion.div>
        )}

        {/* ── Chat Phase — progressive reveal ──────────────────────── */}
        {phase === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center mb-4">
              <p className="text-sm text-slate-400">
                Lee cada mensaje con atención. Luego detectarás las señales de
                peligro.
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs text-slate-500">
                  {revealedCount}/{scenario.mensajes.length}
                </span>
                <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(revealedCount / scenario.mensajes.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Chat container */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 mb-4 space-y-3 min-h-[300px]">
              {/* Chat header bar */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                  {scenario.titulo[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {scenario.titulo}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {scenario.contexto.slice(0, 60)}...
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                  En línea
                </span>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {visibleMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      msg.autor === "victima" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.autor === "victima"
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md"
                          : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-md"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                        {authorLabels[msg.autor] || msg.autor}
                      </span>
                      {msg.texto}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {revealedCount < scenario.mensajes.length && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reveal button */}
            {revealedCount < scenario.mensajes.length && (
              <div className="flex justify-center">
                <button
                  onClick={handleReveal}
                  className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  {revealedCount === 0
                    ? "Iniciar chat"
                    : "Siguiente mensaje →"}
                </button>
              </div>
            )}

            {revealedCount >= scenario.mensajes.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-4"
              >
                <button
                  onClick={() => setPhase("select")}
                  className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  🔍 Identificar señales de peligro
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Select Phase — tap to flag ───────────────────────────── */}
        {phase === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white">
                ¿Cuáles mensajes son señales de peligro?
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Toca los mensajes que contengan señales de alerta
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Flag className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">
                  {flaggedMessages.size} seleccionados
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                  {scenario.titulo[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {scenario.titulo}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Selecciona los mensajes peligrosos
                  </p>
                </div>
              </div>

              {scenario.mensajes.map((msg) => {
                const isFlagged = flaggedMessages.has(msg.id);
                const isVictim = msg.autor === "victima";

                return (
                  <motion.div
                    key={msg.id}
                    whileTap={!isVictim ? { scale: 0.98 } : undefined}
                    onClick={() => !isVictim && toggleFlag(msg.id)}
                    className={`flex ${
                      isVictim ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm transition-all select-none ${
                        isVictim
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md"
                          : isFlagged
                          ? "bg-red-900/40 text-red-200 border-2 border-red-500/60 rounded-bl-md shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-md hover:border-slate-500 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {authorLabels[msg.autor] || msg.autor}
                        </span>
                        {!isVictim && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isFlagged
                                ? "bg-red-500/30 text-red-300"
                                : "bg-slate-700 text-slate-500"
                            }`}
                          >
                            {isFlagged ? "⚠️ Señal" : "Toca para marcar"}
                          </span>
                        )}
                      </div>
                      <p className={isVictim ? "" : "mt-1"}>{msg.texto}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleCheck}
                disabled={flaggedMessages.size === 0}
                className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none"
              >
                Verificar ({flaggedMessages.size} seleccionadas)
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Result Phase ─────────────────────────────────────────── */}
        {phase === "result" && (
          <motion.div
            key="result"
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
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white">
                Análisis completo
              </h3>
              <p className="text-slate-400 mt-1">
                {totalCorrect} de {redFlagIds.size} señales detectadas
              </p>
            </div>

            {/* Score summary */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-5 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {totalCorrect}
                  </p>
                  <p className="text-xs text-slate-400">Detectadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">
                    {totalMissed}
                  </p>
                  <p className="text-xs text-slate-400">Perdidas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{totalFP}</p>
                  <p className="text-xs text-slate-400">Falsos +</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 text-center">
                <p className="text-sm text-slate-400">
                  Puntuación:{" "}
                  <span className="text-white font-bold">{score}</span> /{" "}
                  {scenario.puntuacionMaxima}
                </p>
              </div>
            </div>

            {/* Per-message breakdown */}
            <div className="space-y-2 mb-4">
              {scenario.mensajes.map((msg) => {
                const wasFlagged = flaggedMessages.has(msg.id);
                const isSignal = msg.esSeñal;
                let status: "correct" | "missed" | "false-positive" | "safe";
                if (isSignal && wasFlagged) status = "correct";
                else if (isSignal && !wasFlagged) status = "missed";
                else if (!isSignal && wasFlagged) status = "false-positive";
                else status = "safe";

                const statusConfig = {
                  correct: {
                    icon: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
                    border: "border-emerald-500/30",
                    bg: "bg-emerald-900/20",
                  },
                  missed: {
                    icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />,
                    border: "border-amber-500/30",
                    bg: "bg-amber-900/20",
                  },
                  "false-positive": {
                    icon: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />,
                    border: "border-red-500/30",
                    bg: "bg-red-900/20",
                  },
                  safe: {
                    icon: <CheckCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />,
                    border: "border-slate-700/30",
                    bg: "bg-slate-800/30",
                  },
                };

                const cfg = statusConfig[status];

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${cfg.bg} ${cfg.border}`}
                  >
                    {cfg.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm">
                        &ldquo;{msg.texto}&rdquo;
                      </p>
                      {msg.razon && status !== "safe" && (
                        <p className="text-xs text-slate-400 mt-1">
                          {msg.razon}
                        </p>
                      )}
                    </div>
                    {status !== "safe" && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                          status === "correct"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : status === "missed"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {status === "correct"
                          ? "✓ Detectada"
                          : status === "missed"
                          ? "✗ Perdida"
                          : "✗ Falso +"}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Señales summary */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-4 mb-6">
              <h4 className="text-sm font-semibold text-violet-400 mb-2">
                Señales que detectaste
              </h4>
              <div className="flex flex-wrap gap-2">
                {scenario.señales.map((señal) => (
                  <span
                    key={señal}
                    className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold"
                  >
                    {señal}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onComplete}
                className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Continuar <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
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
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              Señales de Alerta
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Urgencia excesiva o presión para actuar rápido</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Promesas de dinero fácil o trabajos demasiado buenos</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Solicitudes de información personal o bancaria</span>
              </div>
              <div className="flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">Enlaces a sitios no verificados o sospechosos</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
