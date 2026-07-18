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
import { Escenario, Indicador, Module1Category } from "@/types/module1";

interface PhishingSimulatorProps {
  escenarios: Escenario[];
  onScore: (points: number, category?: Module1Category) => void;
  onComplete: () => void;
}

export function PhishingSimulator({
  escenarios,
  onScore,
  onComplete,
}: PhishingSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [foundIndicators, setFoundIndicators] = useState<Set<string>>(new Set());
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showIndicators, setShowIndicators] = useState(false);
  const [phase, setPhase] = useState<"action" | "indicators" | "result">(
    "action"
  );

  const currentScenario = escenarios[currentIndex];

  const handleAction = (action: string) => {
    if (selectedAction) return;

    setSelectedAction(action);
    const correct = action === currentScenario.accionCorrecta;
    setIsCorrect(correct);
    const basePoints = correct ? currentScenario.puntos : 0;
    setEarnedPoints(basePoints);
    setPhase("indicators");
  };

  const handleIndicatorClick = (indicatorId: string) => {
    const newFound = new Set(foundIndicators);
    if (newFound.has(indicatorId)) {
      newFound.delete(indicatorId);
    } else {
      newFound.add(indicatorId);
    }
    setFoundIndicators(newFound);
  };

  const handleFinishIndicators = () => {
    const allFound =
      foundIndicators.size === currentScenario.indicadores.length;
    const indicatorBonus = allFound ? 10 : foundIndicators.size * 2;
    const finalPoints = earnedPoints + indicatorBonus;
    setEarnedPoints(finalPoints);
    setTotalPoints((prev) => prev + finalPoints);
    setPhase("result");

    setTimeout(() => {
      if (currentIndex < escenarios.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAction(null);
        setFoundIndicators(new Set());
        setIsCorrect(null);
        setEarnedPoints(0);
        setPhase("action");
      } else {
        onComplete();
      }
    }, 3500);
  };

  if (!currentScenario) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-300">No hay más escenarios.</p>
          <Button onClick={onComplete} className="mt-4">
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">
          Escenario {currentIndex + 1} de {escenarios.length}
        </Badge>
        <div className="flex gap-2">
          <Badge className="bg-purple-500/20 text-purple-300">
            {currentScenario.tipo.toUpperCase()}
          </Badge>
          <Badge className="bg-cyan-500/20 text-cyan-300">
            {totalPoints} puntos
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
                {currentScenario.tipo === "email" && "📧"}
                {currentScenario.tipo === "sms" && "💬"}
                {currentScenario.tipo === "web" && "🌐"}
                {currentScenario.tipo === "redes-sociales" && "📱"}
                {currentScenario.titulo}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {currentScenario.descripcion}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 text-sm whitespace-pre-line">
                  {currentScenario.contenido}
                </p>
              </div>

              {phase === "action" && (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm font-medium text-center">
                    ¿Qué harías ante esta situación?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleAction("reportar")}
                      className="bg-rose-600 hover:bg-rose-700 py-4"
                    >
                      🚨 Reportar
                    </Button>
                    <Button
                      onClick={() => handleAction("verificar")}
                      className="bg-amber-600 hover:bg-amber-700 py-4"
                    >
                      🔍 Verificar
                    </Button>
                    <Button
                      onClick={() => handleAction("bloquear")}
                      className="bg-slate-600 hover:bg-slate-700 py-4"
                    >
                      🚫 Bloquear
                    </Button>
                    <Button
                      onClick={() => handleAction("ignorar")}
                      className="bg-slate-700 hover:bg-slate-800 py-4"
                    >
                      👻 Ignorar
                    </Button>
                  </div>
                </div>
              )}

              {phase === "indicators" && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm font-medium text-center">
                    Encuentra los indicadores de peligro:
                  </p>
                  <div className="space-y-2">
                    {currentScenario.indicadores.map((ind) => (
                      <motion.div
                        key={ind.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => handleIndicatorClick(ind.id)}
                          className={`w-full text-left justify-start h-auto py-3 ${
                            foundIndicators.has(ind.id)
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-slate-600"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">
                              {foundIndicators.has(ind.id) ? "✅" : "🔍"}
                            </span>
                            <div className="flex-1">
                              <p className="text-white text-sm">
                                {ind.descripcion}
                              </p>
                              <p className="text-slate-400 text-xs mt-1">
                                Ubicación: {ind.ubicacion}
                              </p>
                            </div>
                            <Badge
                              className={`text-xs ${
                                ind.gravedad === "alta"
                                  ? "bg-rose-500/20 text-rose-300"
                                  : ind.gravedad === "media"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-slate-500/20 text-slate-300"
                              }`}
                            >
                              {ind.gravedad}
                            </Badge>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <Button
                    onClick={handleFinishIndicators}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    Continuar ({foundIndicators.size}/
                    {currentScenario.indicadores.length} encontrados)
                  </Button>
                </div>
              )}

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
                    <AlertDescription>
                      <p
                        className={
                          isCorrect ? "text-emerald-300" : "text-rose-300"
                        }
                      >
                        {isCorrect
                          ? `✅ ¡Excelente! +${earnedPoints} puntos`
                          : `❌ Acción incorrecta. Deberías: ${currentScenario.accionCorrecta}`}
                      </p>
                    </AlertDescription>
                  </Alert>
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <p className="text-slate-300 text-sm">
                      {currentScenario.explicacion}
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
