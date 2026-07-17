"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, XCircle, AlertTriangle, Zap, Terminal, ChevronRight, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Module4Category, HardeningScenario } from "@/types/module4";

interface HardeningChecklistProps {
  scenarios: HardeningScenario[];
  onScore: (points: number, category: Module4Category) => void;
  onComplete: () => void;
}

interface ToggleState {
  [key: string]: boolean;
}

interface ScenarioState {
  toggles: ToggleState;
  isVerified: boolean;
  passedCount: number;
  score: number;
  completed: boolean;
}

function getScenarioIcon(type: HardeningScenario["systemType"]) {
  switch (type) {
    case "linux": return "🐧";
    case "windows": return "🪟";
    case "web-server": return "🌐";
    default: return "💻";
  }
}

function getScenarioColor(type: HardeningScenario["systemType"]) {
  switch (type) {
    case "linux": return "emerald";
    case "windows": return "cyan";
    case "web-server": return "amber";
    default: return "cyan";
  }
}

export function HardeningChecklist({ scenarios, onScore, onComplete }: HardeningChecklistProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarioState, setScenarioState] = useState<ScenarioState>({
    toggles: {},
    isVerified: false,
    passedCount: 0,
    score: 0,
    completed: false,
  });
  const [showExplanation, setShowExplanation] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const scenarioColor = getScenarioColor(currentScenario.systemType);

  const handleToggle = useCallback((checkId: string) => {
    if (scenarioState.completed) return;
    setScenarioState((prev) => ({
      ...prev,
      toggles: {
        ...prev.toggles,
        [checkId]: !prev.toggles[checkId],
      },
    }));
  }, [scenarioState.completed]);

  const handleVerify = useCallback(() => {
    if (scenarioState.completed) return;

    let passed = 0;
    let total = 0;
    const allCorrect = currentScenario.checks.every((check) => {
      total++;
      const userEnabled = !!scenarioState.toggles[check.id];
      if (userEnabled === check.correctState) {
        passed++;
        return true;
      }
      return false;
    });

    const points = allCorrect ? currentScenario.puntos : Math.floor((passed / total) * currentScenario.puntos * 0.5);

    setScenarioState((prev) => ({
      ...prev,
      isVerified: true,
      passedCount: passed,
      score: prev.score + points,
      completed: true,
    }));

    onScore(points, "hardening");
    setTimeout(() => setShowExplanation(true), 1500);
  }, [scenarioState, currentScenario, onScore]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex((prev) => prev + 1);
      setScenarioState({
        toggles: {},
        isVerified: false,
        passedCount: 0,
        score: 0,
        completed: false,
      });
      setShowExplanation(false);
    } else {
      onComplete();
    }
  }, [currentIndex, scenarios.length, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getScenarioIcon(currentScenario.systemType)}</span>
            <div>
              <h3 className={`text-lg font-bold text-${scenarioColor}-400`}>{currentScenario.titulo}</h3>
              <Badge variant="outline" className={`text-${scenarioColor}-400 border-${scenarioColor}-500/50 mt-1`}>
                {currentScenario.systemType.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Puntos</div>
            <div className={`text-xl font-bold text-${scenarioColor}-400`}>{scenarioState.score}/{currentScenario.puntos}</div>
          </div>
        </div>

        <Progress value={scenarioState.completed ? 100 : 0} className="h-2 bg-slate-800" />
      </motion.div>

      <AnimatePresence mode="wait">
        {!showExplanation ? (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* System panel */}
            <Card className={`bg-slate-900/80 border-${scenarioColor}-500/30 mb-4`}>
              <CardHeader>
                <CardTitle className={`text-${scenarioColor}-400 flex items-center gap-2`}>
                  <Terminal className="w-5 h-5" />
                  Panel de Configuración
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {currentScenario.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-500 text-xs">system-hardening</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-400">
                      <span className="text-cyan-400">$</span> system-config --type {currentScenario.systemType}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-cyan-400">$</span> load --scenario "{currentScenario.id}"
                    </div>
                    <div className={`text-${scenarioColor}-400`}>
                      <span className="text-cyan-400">$</span> hardening --status active --checks {currentScenario.checks.length}
                    </div>
                    {scenarioState.isVerified && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-2 p-2 rounded ${
                          scenarioState.passedCount === currentScenario.checks.length
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {scenarioState.passedCount === currentScenario.checks.length ? (
                          <span>✓ Hardening completo: {scenarioState.passedCount}/{currentScenario.checks.length} verificados</span>
                        ) : (
                          <span>⚠ Parcial: {scenarioState.passedCount}/{currentScenario.checks.length} verificados</span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist toggles */}
            <Card className={`bg-slate-900/80 border-${scenarioColor}-500/20 mb-4`}>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Configuraciones de Hardening:</h4>
                <div className="space-y-3">
                  {currentScenario.checks.map((check) => {
                    const isToggled = !!scenarioState.toggles[check.id];
                    const isVerified = scenarioState.isVerified;
                    const isCorrect = isToggled === check.correctState;

                    return (
                      <motion.button
                        key={check.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleToggle(check.id)}
                        disabled={scenarioState.completed}
                        className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isVerified
                            ? isCorrect
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "border-rose-500/50 bg-rose-500/5"
                            : isToggled
                              ? `border-${scenarioColor}-500/50 bg-${scenarioColor}-500/10`
                              : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-6 rounded-full relative transition-colors ${
                            isToggled
                              ? isVerified && !isCorrect ? "bg-rose-500" : `bg-${scenarioColor}-500`
                              : "bg-slate-700"
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              isToggled ? "translate-x-5" : "translate-x-1"
                            }`} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-300">{check.descripcion}</span>
                            {isVerified && !isCorrect && (
                              <div className="text-xs text-rose-400 mt-1">
                                {check.correctState ? "Debería estar activado" : "Debería estar desactivado"}
                              </div>
                            )}
                          </div>
                        </div>
                        {isVerified && (
                          isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Verify button */}
            {!scenarioState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={handleVerify}
                  className={`bg-${scenarioColor}-500 hover:bg-${scenarioColor}-600 text-white min-h-[44px]`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Verificar Configuración
                </Button>
              </motion.div>
            )}

            {/* Post-verify button */}
            {scenarioState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setShowExplanation(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white min-h-[44px]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Ver Explicación
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="explanation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-900/80 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Análisis de Hardening
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-emerald-500/20">
                  <p className="text-gray-300 text-sm leading-relaxed">{currentScenario.explicacion}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Sistema: {currentScenario.systemType} | Puntos: {currentScenario.puntos}</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleNext}
                className={`bg-${scenarioColor}-500 hover:bg-${scenarioColor}-600 text-white min-h-[44px]`}
              >
                {currentIndex + 1 < scenarios.length ? "Siguiente Escenario" : "Continuar"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
