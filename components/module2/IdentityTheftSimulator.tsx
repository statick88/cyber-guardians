"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, UserCheck, UserX, Search, CreditCard, FileText, Bell, Lock, Unlock, Check, X } from "lucide-react";
import { Module2Category, IdentityTheftScenario, IndicadorRiesgo } from "@/types/module2";

interface IdentityTheftSimulatorProps {
  escenarios: IdentityTheftScenario[];
  onScore: (points: number, category?: Module2Category) => void;
  onComplete: () => void;
}

export function IdentityTheftSimulator({ escenarios, onScore, onComplete }: IdentityTheftSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [foundIndicators, setFoundIndicators] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"situation" | "indicators" | "action" | "result">("situation");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showIndicatorHint, setShowIndicatorHint] = useState(false);

  const currentScenario = escenarios[currentIndex];
  const actions: { id: string; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "congelar-credito", label: "Congelar Crédito", icon: <Lock className="w-5 h-5" />, color: "bg-purple-600 hover:bg-purple-700" },
    { id: "cambiar-contrasenas", label: "Cambiar Contraseñas", icon: <Shield className="w-5 h-5" />, color: "bg-cyan-600 hover:bg-cyan-700" },
    { id: "reportar-autoridades", label: "Reportar Autoridades", icon: <Bell className="w-5 h-5" />, color: "bg-rose-600 hover:bg-rose-700" },
    { id: "monitorear-cuentas", label: "Monitorear Cuentas", icon: <Search className="w-5 h-5" />, color: "bg-amber-600 hover:bg-amber-700" },
    { id: "contactar-soporte", label: "Contactar Soporte", icon: <UserCheck className="w-5 h-5" />, color: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critica": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "alta": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "media": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "baja": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critica": return <AlertTriangle className="w-4 h-4" />;
      case "alta": return <AlertTriangle className="w-4 h-4" />;
      case "media": return <Bell className="w-4 h-4" />;
      case "baja": return <Search className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const handlePhaseChange = (newPhase: "situation" | "indicators" | "action" | "result") => {
    setPhase(newPhase);
  };

  const handleIndicatorClick = (indicatorId: string) => {
    setFoundIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(indicatorId)) next.delete(indicatorId);
      else next.add(indicatorId);
      return next;
    });
  };

  const handleActionSelect = (actionId: string) => {
    if (selectedAction) return;
    setSelectedAction(actionId);
    const correct = actionId === currentScenario.accionCorrecta;
    setIsCorrect(correct);
    const basePoints = correct ? currentScenario.puntos : 0;
    const indicatorBonus = foundIndicators.size * 2;
    const finalPoints = basePoints + indicatorBonus;
    setEarnedPoints(finalPoints);
    setTotalPoints((prev) => prev + finalPoints);
    setPhase("result");
  };

  const handleNext = () => {
    setSelectedAction(null);
    setFoundIndicators(new Set());
    setIsCorrect(null);
    setEarnedPoints(0);
    setPhase("situation");

    if (currentIndex < escenarios.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onScore(totalPoints, "proteccion-identidad");
      onComplete();
    }
  };

  if (!currentScenario) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">
          Caso {currentIndex + 1} de {escenarios.length}
        </Badge>
        <div className="flex gap-2">
          <Badge className="bg-purple-500/20 text-purple-300">
            {currentScenario.tipo.toUpperCase()}
          </Badge>
          <Badge className="bg-cyan-500/20 text-cyan-300">
            {totalPoints} pts
          </Badge>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                {currentScenario.titulo}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Dificultad: {currentScenario.dificultad} · {currentScenario.puntos} pts base
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Phase 1: Situation */}
              {phase === "situation" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-5">
                    <h4 className="text-rose-300 font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Situación Detectada
                    </h4>
                    <p className="text-slate-300 text-lg whitespace-pre-line">{currentScenario.descripcion}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h5 className="text-cyan-300 text-sm font-medium mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      ¿Qué indicadores de alerta identificas?
                    </h5>
                    <p className="text-slate-400 text-sm mb-4">
                      Examina la situación y haz clic en los indicadores que detectas. Encuentra al menos {Math.ceil(currentScenario.indicadores.length * 0.6)} de {currentScenario.indicadores.length} para bonificación.
                    </p>
                    <Button
                      onClick={() => handlePhaseChange("indicators")}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      size="lg"
                    >
                      Analizar Indicadores →
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Phase 2: Indicators */}
              {phase === "indicators" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-cyan-300 font-medium flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Indicadores de Riesgo Detectados
                    </h4>
                    <Badge className={`bg-cyan-500/20 text-cyan-300 ${foundIndicators.size >= Math.ceil(currentScenario.indicadores.length * 0.6) ? "bg-emerald-500/20 text-emerald-300" : ""}`}>
                      {foundIndicators.size} / {currentScenario.indicadores.length} encontrados
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {currentScenario.indicadores.map((ind) => (
                      <motion.div
                        key={ind.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => handleIndicatorClick(ind.id)}
                          className={`w-full text-left justify-start h-auto py-3 ${
                            foundIndicators.has(ind.id)
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-slate-600 hover:border-cyan-500/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5">
                              {foundIndicators.has(ind.id) ? "✅" : "🔍"}
                            </span>
                            <div className="flex-1">
                              <p className="text-white text-sm">{ind.descripcion}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={`text-xs ${getSeverityColor(ind.severidad)}`}
                                >
                                  {getSeverityIcon(ind.severidad)}
                                  {ind.severidad.toUpperCase()}
                                </Badge>
                                <span className="text-slate-500 text-xs">Ubicación: {ind.tipo}</span>
                              </div>
                            </div>
                            <Badge
                              className={`text-xs ${foundIndicators.has(ind.id) ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}
                            >
                              {foundIndicators.has(ind.id) ? "Detectado" : "Pendiente"}
                            </Badge>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePhaseChange("action")}
                    disabled={foundIndicators.size === 0}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                    size="lg"
                  >
                    Elegir Acción →
                  </Button>
                </motion.div>
              )}

              {/* Phase 3: Action */}
              {phase === "action" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="text-cyan-300 font-medium text-center">
                    ¿Cuál es tu ACCIÓN INMEDIATA?
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {actions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        onClick={() => handleActionSelect(action.id)}
                        className={`h-auto py-4 ${action.color} text-white ${selectedAction === action.id ? "ring-2 ring-cyan-400" : ""}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {action.icon}
                          <span>{action.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Phase 4: Result */}
              {phase === "result" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Alert
                    className={
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500"
                        : "bg-rose-500/10 border-rose-500"
                    }
                  >
                    <AlertDescription className="flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <UserCheck className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-300">¡Acción correcta! +{earnedPoints} pts (base: {currentScenario.puntos} + indicadores: {foundIndicators.size * 2})</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-5 h-5 text-rose-400" />
                          <span className="text-rose-300">Acción incorrecta. La respuesta óptima era: {actions.find(a => a.id === currentScenario.accionCorrecta)?.label}</span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                    <h5 className="text-cyan-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Explicación Completa:
                    </h5>
                    <p className="text-slate-300 text-sm">{currentScenario.explicacion}</p>
                  </div>

                  {foundIndicators.size > 0 && (
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                      <h5 className="text-amber-300 text-sm font-medium mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Indicadores que detectaste ({foundIndicators.size}):
                      </h5>
                      <ul className="space-y-1 text-slate-300 text-sm">
                        {currentScenario.indicadores
                          .filter((ind) => foundIndicators.has(ind.id))
                          .map((ind) => (
                            <li key={ind.id} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              {ind.descripcion} <Badge className={`text-xs ${getSeverityColor(ind.severidad)}`}>{ind.severidad}</Badge>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={handleNext}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    size="lg"
                  >
                    {currentIndex < escenarios.length - 1 ? "Siguiente Caso" : "Ver Resultados Finales"}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}