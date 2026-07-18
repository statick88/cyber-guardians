"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, AlertTriangle, CheckCircle, XCircle, Clock, Zap, ChevronRight } from "lucide-react";
import type {
  VishingCall,
  VishingLine,
  VishingRedFlag,
  VishingDecisionPoint,
  PhoneticDecoderState,
  PhoneticDecoderConfig,
} from "@/types/module2";

interface PhoneticDecoderProps {
  calls: VishingCall[];
  config: PhoneticDecoderConfig;
  onComplete: (xp: number, score: number) => void;
  onShieldDamage: (damage: number) => void;
}

const DEFAULT_CONFIG: PhoneticDecoderConfig = {
  timeLimit: 120,
  autoRevealInterval: 4,
  xpPerFlag: 15,
  damagePerWrongDecision: 15,
  callCount: 2,
};

export default function PhoneticDecoder({
  calls,
  config = DEFAULT_CONFIG,
  onComplete,
  onShieldDamage,
}: PhoneticDecoderProps) {
  const [state, setState] = useState<PhoneticDecoderState>({
    currentCall: null,
    callQueue: [],
    currentIndex: 0,
    totalCalls: Math.min(config.callCount, calls.length),
    visibleLines: [],
    nextLineIndex: 0,
    activeDecisionPoint: null,
    choicesMade: [],
    redFlagsFound: [],
    timeRemaining: config.timeLimit,
    xpEarned: 0,
    score: 0,
    maxScore: 0,
    isGameOver: false,
    isVictory: false,
    isAutoScrolling: true,
    impatienceLevel: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRevealRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Initialize first call
  useEffect(() => {
    if (calls.length === 0) return;
    const shuffled = [...calls].sort(() => Math.random() - 0.5);
    const queue = shuffled.slice(0, config.callCount);
    const first = queue[0];
    const maxXp = queue.reduce((sum, c) => sum + c.totalXp, 0);
    setState((s) => ({
      ...s,
      currentCall: first,
      callQueue: queue,
      maxScore: maxXp,
    }));
  }, [calls, config.callCount]);

  // Auto-reveal transcript lines
  useEffect(() => {
    if (!state.currentCall || state.isGameOver || state.activeDecisionPoint) return;

    autoRevealRef.current = setInterval(() => {
      setState((s) => {
        if (!s.currentCall || s.activeDecisionPoint) return s;
        if (s.nextLineIndex >= s.currentCall.transcript.length) return s;

        const nextLine = s.currentCall.transcript[s.nextLineIndex];
        const newVisible = [...s.visibleLines, nextLine];
        let newDecisionPoint: VishingDecisionPoint | null = s.activeDecisionPoint;

        if (nextLine.decisionPointId) {
          const dp = s.currentCall.decisionPoints.find(
            (d) => d.id === nextLine.decisionPointId
          );
          if (dp) newDecisionPoint = dp;
        }

        return {
          ...s,
          visibleLines: newVisible,
          nextLineIndex: s.nextLineIndex + 1,
          activeDecisionPoint: newDecisionPoint,
        };
      });
    }, config.autoRevealInterval * 1000);

    return () => {
      if (autoRevealRef.current) clearInterval(autoRevealRef.current);
    };
  }, [state.currentCall?.id, state.isGameOver, state.activeDecisionPoint, config.autoRevealInterval]);

  // Main timer
  useEffect(() => {
    if (state.isGameOver) return;
    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.timeRemaining <= 1) {
          return { ...s, timeRemaining: 0, isGameOver: true, isVictory: false };
        }
        return { ...s, timeRemaining: s.timeRemaining - 1 };
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isGameOver]);

  // Impatience increases over time
  useEffect(() => {
    if (state.isGameOver) return;
    const impTimer = setInterval(() => {
      setState((s) => ({
        ...s,
        impatienceLevel: Math.min(10, s.impatienceLevel + 0.1),
      }));
    }, 5000);
    return () => clearInterval(impTimer);
  }, [state.isGameOver]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current && state.isAutoScrolling) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [state.visibleLines, state.isAutoScrolling]);

  // Complete game
  useEffect(() => {
    if (state.isGameOver) {
      onComplete(state.xpEarned, state.score);
    }
  }, [state.isGameOver]);

  const handleRedFlagClick = useCallback(
    (flagId: string) => {
      setState((s) => {
        if (!s.currentCall || s.redFlagsFound.includes(flagId)) return s;
        const flag = s.currentCall.redFlags.find((f) => f.id === flagId);
        if (!flag || flag.discovered) return s;

        const updatedFlags = s.currentCall.redFlags.map((f) =>
          f.id === flagId ? { ...f, discovered: true } : f
        );
        const updatedCall = { ...s.currentCall, redFlags: updatedFlags };

        return {
          ...s,
          currentCall: updatedCall,
          redFlagsFound: [...s.redFlagsFound, flagId],
          xpEarned: s.xpEarned + flag.xpValue,
          score: s.score + flag.xpValue,
        };
      });
    },
    []
  );

  const handleDecision = useCallback(
    (choiceId: string) => {
      setState((s) => {
        if (!s.currentCall || !s.activeDecisionPoint) return s;

        const choice = s.activeDecisionPoint.choices.find(
          (c) => c.id === choiceId
        );
        if (!choice) return s;

        if (!choice.isSafe) {
          onShieldDamage(choice.shieldDamage);
        }

        // Find next line to reveal
        const nextLineId = choice.followUpLineId;
        const nextLineIdx = s.currentCall.transcript.findIndex(
          (l) => l.id === nextLineId
        );

        const newVisible =
          nextLineIdx >= 0
            ? s.visibleLines.concat(
                s.currentCall.transcript.slice(
                  s.nextLineIndex,
                  nextLineIdx + 1
                )
              )
            : s.visibleLines;

        const newNextIdx =
          nextLineIdx >= 0 ? nextLineIdx + 1 : s.nextLineIndex;

        // Check if game should end
        const allLinesRevealed =
          newNextIdx >= s.currentCall.transcript.length;
        const allFlagsFound =
          s.redFlagsFound.length + (choice.isSafe ? 0 : 0) >=
          s.currentCall.redFlags.length;
        const shouldEnd = allLinesRevealed;

        return {
          ...s,
          visibleLines: newVisible,
          nextLineIndex: newNextIdx,
          activeDecisionPoint: null,
          choicesMade: [
            ...s.choicesMade,
            {
              decisionPointId: s.activeDecisionPoint.id,
              choiceId,
              safe: choice.isSafe,
            },
          ],
          xpEarned: s.xpEarned + choice.xpDelta,
          score: s.score + Math.max(0, choice.xpDelta),
          isGameOver: shouldEnd,
          isVictory: shouldEnd && allFlagsFound,
        };
      });
    },
    [onShieldDamage]
  );

  const handleSkipToEnd = useCallback(() => {
    setState((s) => ({
      ...s,
      isGameOver: true,
      isVictory: false,
    }));
  }, []);

  // Render transcript line with clickable red flags
  const renderLine = useMemo(() => {
    return (line: VishingLine, idx: number) => {
      const isCaller = line.speaker === "caller";
      const hasUndiscoveredFlags =
        isCaller &&
        line.redFlags?.some((fId) => !state.redFlagsFound.includes(fId));

      return (
        <motion.div
          key={line.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${isCaller ? "justify-start" : "justify-end"} mb-3`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              isCaller
                ? "bg-slate-800/80 border border-slate-600/50 text-slate-200"
                : "bg-cyan-900/40 border border-cyan-500/30 text-cyan-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCaller ? (
                <Phone className="w-3 h-3 text-red-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-cyan-400" />
              )}
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                {isCaller ? "LLAMANTE" : "TÚ"}
              </span>
              {hasUndiscoveredFlags && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{line.text}</p>
            {isCaller && line.redFlags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {line.redFlags.map((fId) => {
                  const flag = state.currentCall?.redFlags.find(
                    (f) => f.id === fId
                  );
                  if (!flag) return null;
                  const found = state.redFlagsFound.includes(fId);
                  return (
                    <button
                      key={fId}
                      onClick={() => handleRedFlagClick(fId)}
                      disabled={found}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        found
                          ? "bg-green-900/50 border-green-500/50 text-green-300 cursor-default"
                          : "bg-red-900/30 border-red-500/40 text-red-300 hover:bg-red-800/50 hover:border-red-400 cursor-pointer animate-pulse"
                      }`}
                    >
                      {found ? "✓" : "🎯"} {flag.technique}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      );
    };
  }, [state.redFlagsFound, state.currentCall, handleRedFlagClick]);

  if (state.isGameOver) {
    return (
      <Card className="bg-slate-900/90 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="text-5xl mb-4">
              {state.isVictory ? "🛡️" : "⚠️"}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {state.isVictory
                ? "¡Vishing Neutralizado!"
                : "Llamada Interceptada"}
            </h3>
            <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
              {state.currentCall?.summary}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-cyan-400">
                  {state.xpEarned}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">
                  XP Ganado
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">
                  {state.redFlagsFound.length}/
                  {state.currentCall?.redFlags.length ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">
                  Banderas Rojas
                </div>
              </div>
            </div>
            {state.choicesMade.length > 0 && (
              <div className="text-left bg-slate-800/30 rounded-lg p-3 mb-4">
                <div className="text-xs text-slate-400 uppercase mb-2">
                  Decisiones
                </div>
                {state.choicesMade.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {c.safe ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                    <span className={c.safe ? "text-green-300" : "text-red-300"}>
                      {c.safe ? "Decisión correcta" : "Datos filtrados"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (!state.currentCall) {
    return (
      <Card className="bg-slate-900/90 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <Phone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Cargando llamadas...</p>
        </CardContent>
      </Card>
    );
  }

  const flagsDiscovered = state.redFlagsFound.length;
  const flagsTotal = state.currentCall.redFlags.length;
  const progressPercent = (flagsDiscovered / flagsTotal) * 100;
  const timerPercent = (state.timeRemaining / config.timeLimit) * 100;
  const timerColor =
    timerPercent > 50
      ? "text-green-400"
      : timerPercent > 25
        ? "text-amber-400"
        : "text-red-400";

  return (
    <Card className="bg-slate-900/90 border-slate-700/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-400" />
            Decodificador de Voces Fantasma
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="text-xs border-slate-600 text-slate-400"
            >
              {state.currentIndex + 1}/{state.totalCalls}
            </Badge>
            <div className={`flex items-center gap-1 ${timerColor}`}>
              <Clock className="w-3 h-3" />
              <span className="text-xs font-mono">{state.timeRemaining}s</span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              timerPercent > 50
                ? "bg-green-500"
                : timerPercent > 25
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Caller info bar */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center">
              <Phone className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">LLAMADA EN CURSO</p>
              <p className="text-sm text-white font-medium">
                {state.currentCall.callerIdentity}
              </p>
              <p className="text-[10px] text-slate-500">
                {state.currentCall.organization}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">
              Señal del Estafador
            </p>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full ${
                    i < Math.ceil(state.impatienceLevel)
                      ? "bg-red-500"
                      : "bg-slate-700"
                  }`}
                  style={{ height: `${8 + i * 3}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Flags progress */}
        <div className="flex items-center gap-2 mt-2">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] text-slate-400 uppercase">
            Banderas Rojas
          </span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-amber-400 font-mono">
            {flagsDiscovered}/{flagsTotal}
          </span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 mt-1">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span className="text-xs text-cyan-400 font-mono">
            {state.xpEarned} XP
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Transcript area */}
        <div
          ref={transcriptRef}
          className="h-64 overflow-y-auto px-4 py-3 bg-slate-950/50 border-t border-slate-800/50"
        >
          <AnimatePresence>
            {state.visibleLines.map((line, idx) => renderLine(line, idx))}
          </AnimatePresence>

          {state.nextLineIndex >= state.currentCall.transcript.length &&
            !state.activeDecisionPoint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <PhoneOff className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Fin de la transmisión</p>
              </motion.div>
            )}
        </div>

        {/* Decision point overlay */}
        <AnimatePresence>
          {state.activeDecisionPoint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="border-t border-cyan-500/30 bg-cyan-950/30 p-4"
            >
              <p className="text-xs text-cyan-300 uppercase mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Decisión Requerida
              </p>
              <p className="text-sm text-white mb-3">
                {state.activeDecisionPoint.prompt}
              </p>
              <div className="flex gap-2">
                {state.activeDecisionPoint.choices.map((choice) => (
                  <Button
                    key={choice.id}
                    onClick={() => handleDecision(choice.id)}
                    size="sm"
                    className={`flex-1 text-xs ${
                      choice.isSafe
                        ? "bg-green-900/50 border-green-500/50 text-green-300 hover:bg-green-800/50"
                        : "bg-red-900/30 border-red-500/40 text-red-300 hover:bg-red-800/50"
                    }`}
                    variant="outline"
                  >
                    {choice.etiqueta}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action bar */}
        <div className="border-t border-slate-800/50 p-3 flex justify-between items-center">
          <Button
            onClick={handleSkipToEnd}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Colgar llamada
          </Button>
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="animate-pulse">●</span>
            Grabando...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
