"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { Check, X, Shield, ArrowRightLeft, RotateCcw } from "lucide-react";
import { Module2Category, EjercicioDefensa, DragItemDefense, DragTargetDefense } from "@/types/module2";

interface DragDropDefenseProps {
  ejercicios: EjercicioDefensa[];
  onScore: (points: number, category?: Module2Category) => void;
  onComplete: () => void;
}

export function DragDropDefense({ ejercicios, onScore, onComplete }: DragDropDefenseProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const currentExercise = ejercicios[currentExerciseIndex];

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem) return;
    setAssignments((prev) => ({ ...prev, [draggedItem]: targetId }));
    setDraggedItem(null);
  };

  const handleItemClick = (itemId: string) => {
    setDraggedItem((prev) => (prev === itemId ? null : itemId));
  };

  const handleTargetClick = (targetId: string) => {
    if (!draggedItem) return;
    setAssignments((prev) => ({ ...prev, [draggedItem]: targetId }));
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    if (!currentExercise) return;

    let correct = 0;
    currentExercise.items.forEach((item) => {
      const assignedTarget = assignments[item.id];
      if (assignedTarget) {
        const target = currentExercise.targets.find((t) => t.id === assignedTarget);
        if (target && target.tipo === item.tipo) {
          correct++;
        }
      }
    });

    const totalItems = currentExercise.items.length;
    const points = Math.round((correct / totalItems) * currentExercise.puntos);
    setScore(points);
    setTotalPoints((prev) => prev + points);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setAssignments({});
    setDraggedItem(null);

    if (currentExerciseIndex < ejercicios.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      onScore(totalPoints, "defensa-activa");
      onComplete();
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setAssignments({});
    setDraggedItem(null);
    setScore(0);
  };

  if (!currentExercise) return null;

  const unassignedItems = currentExercise.items.filter(
    (item) => !assignments[item.id]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">
          Ejercicio {currentExerciseIndex + 1} de {ejercicios.length}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">
          {totalPoints} pts
        </Badge>
      </div>

      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            {currentExercise.titulo}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {currentExercise.descripcion}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Unassigned items */}
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium">
              Elementos para clasificar {showResult ? "(Resultado abajo)" : ""}:
            </p>
            <div className="flex flex-wrap gap-2">
              {unassignedItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={draggedItem === item.id ? "opacity-50" : ""}
                >
                  <div
                    draggable={!showResult}
                    onDragStart={() => handleDragStart(item.id)}
                    onClick={() => handleItemClick(item.id)}
                    className={`cursor-grab active:cursor-grabbing p-3 rounded-lg border-2 transition-all ${
                      draggedItem === item.id
                        ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30"
                        : "border-slate-600 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icono}</span>
                      <span className="text-white text-sm">{item.conteudo}</span>
                      {draggedItem === item.id && (
                        <RotateCcw className="w-4 h-4 text-cyan-400 animate-spin ml-1" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {unassignedItems.length === 0 && !showResult && (
                <div className="text-center py-4 text-slate-500">
                  <Check className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p>Todos los elementos asignados. ¡Verifica!</p>
                </div>
              )}
            </div>
          </div>

          {/* Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentExercise.targets.map((target) => {
              const assignedItems = currentExercise.items.filter(
                (item) => assignments[item.id] === target.id
              );

              return (
                <div
                  key={target.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(target.id)}
                  onClick={() => handleTargetClick(target.id)}
                  className={`rounded-lg border-2 border-dashed p-4 min-h-[140px] cursor-pointer transition-all ${
                    target.color === "rose"
                      ? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/50"
                      : target.color === "emerald"
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                      : target.color === "cyan"
                      ? "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/50"
                      : target.color === "purple"
                      ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50"
                      : target.color === "amber"
                      ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50"
                      : "border-slate-600 hover:border-cyan-500/50"
                  } ${draggedItem ? "ring-2 ring-cyan-500/30" : ""}`}
                >
                  <p
                    className={`font-medium mb-3 ${
                      target.color === "rose" ? "text-rose-300" :
                      target.color === "emerald" ? "text-emerald-300" :
                      target.color === "cyan" ? "text-cyan-300" :
                      target.color === "purple" ? "text-purple-300" :
                      target.color === "amber" ? "text-amber-300" :
                      "text-slate-300"
                    }`}
                  >
                    {target.label}
                  </p>
                  <div className={`text-xs text-slate-500 mb-3 ${showResult ? "hidden" : ""}`}>
                    {target.descripcion}
                  </div>
                  <div className="space-y-1 min-h-[80px]">
                    {assignedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="bg-slate-800/50 rounded px-2 py-1 text-sm text-white flex items-center gap-1"
                      >
                        <span>{item.icono}</span>
                        <span>{item.conteudo}</span>
                        {!showResult && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignments((prev) => {
                                const next = { ...prev };
                                delete next[item.id];
                                return next;
                              });
                            }}
                            className="text-slate-400 hover:text-rose-400 h-6 w-6 p-0 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                    {assignedItems.length === 0 && !showResult && (
                      <div className="text-center text-slate-600 py-6">
                        <ArrowRightLeft className="w-6 h-6 mx-auto mb-1 opacity-30" />
                        <p className="text-xs">Arrastra elementos aquí<br />o haz clic en elemento + zona</p>
                      </div>
                    )}
                  </div>
                  {showResult && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-400">
                        {assignedItems.filter(item => {
                          const target = currentExercise.targets.find(t => t.id === assignments[item.id]);
                          return target && target.tipo === item.tipo;
                        }).length} / {assignedItems.length} correctos
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Result */}
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(assignments).length < currentExercise.items.length}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
              size="lg"
            >
              Verificar Clasificación
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Alert
                className={
                  score === currentExercise.puntos
                    ? "bg-emerald-500/10 border-emerald-500"
                    : score > 0
                    ? "bg-amber-500/10 border-amber-500"
                    : "bg-rose-500/10 border-rose-500"
                }
              >
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    {score === currentExercise.puntos ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : score > 0 ? (
                      <Shield className="w-5 h-5 text-amber-400" />
                    ) : (
                      <X className="w-5 h-5 text-rose-400" />
                    )}
                    <span
                      className={
                        score === currentExercise.puntos
                          ? "text-emerald-300"
                          : score > 0
                          ? "text-amber-300"
                          : "text-rose-300"
                      }
                    >
                      {score === currentExercise.puntos
                        ? `¡Perfecto! +${score} pts`
                        : score > 0
                        ? `Parcial: ${score}/${currentExercise.puntos} pts`
                        : `Incorrecto: 0/${currentExercise.puntos} pts`}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Show correct assignments */}
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <h5 className="text-cyan-300 text-sm font-medium mb-3">Clasificación Correcta:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentExercise.targets.map((target) => (
                    <div key={target.id} className="space-y-1">
                      <p className={`text-xs font-medium ${
                        target.color === "rose" ? "text-rose-300" :
                        target.color === "emerald" ? "text-emerald-300" :
                        target.color === "cyan" ? "text-cyan-300" :
                        target.color === "purple" ? "text-purple-300" :
                        target.color === "amber" ? "text-amber-300" : "text-slate-300"
                      }`}>
                        {target.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {currentExercise.items
                          .filter((item) => item.tipo === target.tipo)
                          .map((item) => (
                            <Badge
                              key={item.id}
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-300"
                            >
                              {item.icono} {item.conteudo}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:border-rose-500 hover:text-rose-300"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reintentar
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {currentExerciseIndex < ejercicios.length - 1 ? "Siguiente Ejercicio" : "Ver Resultados Finales"}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}