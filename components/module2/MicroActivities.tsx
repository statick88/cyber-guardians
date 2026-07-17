"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Code, ListOrdered, Shield, AlertTriangle } from "lucide-react";
import { Module2Category, MicroActividad } from "@/types/module2";
import { MEDATOR_ENABLED } from "@/lib/featureFlags";
import { useEducationalMediator } from "@/hooks/useEducationalMediator";
import { EducationalPanel } from "@/components/mediator";
import type { EducationalLayer } from "@/types/educational";

interface MicroActivitiesProps {
  actividades: MicroActividad[];
  onScore: (points: number, category?: Module2Category) => void;
  onComplete: () => void;
}

export function MicroActivities({
  actividades,
  onScore,
  onComplete,
}: MicroActivitiesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const mediator = useEducationalMediator();

  const currentActivity = actividades[currentIndex];

  const triggerErrorMediator = useCallback(() => {
    if (MEDATOR_ENABLED) {
      mediator.triggerMediator('onError');
    }
  }, [mediator]);

  const triggerCompleteMediator = useCallback(() => {
    if (MEDATOR_ENABLED) {
      mediator.triggerMediator('onModuleComplete');
    }
  }, [mediator]);

  const handleTrueFalse = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentActivity.respuestaCorrecta;
    setIsCorrect(correct);
    const points = correct ? currentActivity.puntos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    if (!correct) {
      triggerErrorMediator();
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIndex < actividades.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        triggerCompleteMediator();
        onComplete();
      }
    }, 3000);
  };

  const handleCodeSubmit = () => {
    if (!selectedAnswer && selectedAnswer !== 0) return;

    const correct = Number(selectedAnswer) === currentActivity.respuestaCorrecta;
    setIsCorrect(correct);
    const points = correct ? currentActivity.puntos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    if (!correct) {
      triggerErrorMediator();
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIndex < actividades.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        triggerCompleteMediator();
        onComplete();
      }
    }, 3000);
  };

  const handleOrderSubmit = (order: string[]) => {
    const correct = JSON.stringify(order) === JSON.stringify(currentActivity.respuestaCorrecta);
    setIsCorrect(correct);
    const points = correct ? currentActivity.puntos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    if (!correct) {
      triggerErrorMediator();
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIndex < actividades.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        triggerCompleteMediator();
        onComplete();
      }
    }, 3000);
  };

  if (!currentActivity) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-300">No hay más actividades.</p>
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
          Actividad {currentIndex + 1} de {actividades.length}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">
          {totalPoints} pts
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Badge
                  className={`bg-purple-500/20 text-purple-300 ${
                    currentActivity.tipo === "verdadero-falso"
                      ? ""
                      : currentActivity.tipo === "completar-codigo"
                      ? ""
                      : ""
                  }`}
                >
                  {currentActivity.tipo === "verdadero-falso"
                    ? "V/F"
                    : currentActivity.tipo === "completar-codigo"
                    ? "Código"
                    : "Ordenar"}
                </Badge>
                Micro-actividad
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-white">{currentActivity.pregunta}</p>
              </div>

              {/* True/False */}
              {currentActivity.tipo === "verdadero-falso" && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleTrueFalse("verdadero")}
                    disabled={!!selectedAnswer}
                    className={`py-8 text-lg ${
                      selectedAnswer === "verdadero"
                        ? isCorrect
                          ? "bg-emerald-600"
                          : "bg-rose-600"
                        : "bg-emerald-600/50 hover:bg-emerald-600"
                    }`}
                  >
                    <Check className="w-5 h-5 mr-2" /> Verdadero
                  </Button>
                  <Button
                    onClick={() => handleTrueFalse("falso")}
                    disabled={!!selectedAnswer}
                    className={`py-8 text-lg ${
                      selectedAnswer === "falso"
                        ? isCorrect
                          ? "bg-emerald-600"
                          : "bg-rose-600"
                        : "bg-rose-600/50 hover:bg-rose-600"
                    }`}
                  >
                    <X className="w-5 h-5 mr-2" /> Falso
                  </Button>
                </div>
              )}

              {/* Code completion */}
              {currentActivity.tipo === "completar-codigo" &&
                currentActivity.codigo && (
                  <div className="space-y-4">
                    <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                      <pre>{currentActivity.codigo}</pre>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-slate-400">Respuesta (número):</label>
                      <input
                        type="number"
                        value={selectedAnswer ?? ""}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        disabled={isCorrect !== null}
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white w-24"
                      />
                      <Button
                        onClick={handleCodeSubmit}
                        disabled={isCorrect !== null || selectedAnswer === null}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        Verificar
                      </Button>
                    </div>
                  </div>
                )}

              {/* Order steps */}
              {currentActivity.tipo === "ordenar-pasos" &&
                currentActivity.pasos && (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-sm">
                      Arrastra los pasos al orden correcto:
                    </p>
                    <OrderSteps
                      pasos={currentActivity.pasos}
                      onSubmit={handleOrderSubmit}
                      disabled={isCorrect !== null}
                    />
                  </div>
                )}

              {/* Results */}
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert
                    className={
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500"
                        : "bg-rose-500/10 border-rose-500"
                    }
                  >
                    <AlertDescription>
                      <div className="space-y-2">
                        <p
                          className={
                            isCorrect ? "text-emerald-300" : "text-rose-300"
                          }
                        >
                          {isCorrect
                            ? `✅ ¡Correcto! +${earnedPoints} puntos`
                            : "❌ Incorrecto"}
                        </p>
                        <p className="text-slate-300 text-sm">
                          {currentActivity.explicacion}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      {MEDATOR_ENABLED && (
        <EducationalPanel
          state={mediator.state}
          educationalLayer={mediator.currentLayer ?? undefined}
          onDismiss={mediator.dismissMediator}
        />
      )}
    </div>
  );
}

// Order steps component for drag-and-drop ordering
function OrderSteps({
  pasos,
  onSubmit,
  disabled,
}: {
  pasos: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  onSubmit: (order: string[]) => void;
  disabled: boolean;
}) {
  const [items, setItems] = useState(
    [...pasos].sort(() => Math.random() - 0.5)
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    if (disabled) return;
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (disabled || !draggedId) return;
    setItems((prev) => {
      const draggedIndex = prev.findIndex((item) => item.id === draggedId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      const next = [...prev];
      const [draggedItem] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, draggedItem);
      return next;
    });
    setDraggedId(null);
  };

  const handleSubmit = () => {
    onSubmit(items.map((item) => item.id));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          draggable={!disabled}
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(item.id)}
          whileDrag={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
          className={`flex items-center gap-3 p-3.5 min-h-[44px] rounded-lg bg-slate-800/50 border ${
            draggedId === item.id ? "border-cyan-500 opacity-50" : "border-slate-700"
          }`}
        >
          <div
            className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded text-white font-mono font-bold"
          >
            {index + 1}
          </div>
          <span className="text-white flex-1">{item.texto}</span>
          <span className="text-slate-500 text-sm">Correcto: {item.ordenCorrecto}</span>
        </motion.div>
      ))}
      <Button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full bg-cyan-600 hover:bg-cyan-700"
      >
        Enviar Orden
      </Button>
    </div>
  );
}