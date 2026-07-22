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
import { Ejercicio, DragItem, DragTarget, Module1Category } from "@/types/module1";
import type { MIAEmotionCallback } from "@/types/mia";

interface DragDropActivityProps {
  ejercicios: Ejercicio[];
  onScore: (points: number, category?: Module1Category) => void;
  onComplete: () => void;
  onMIAEmotion?: MIAEmotionCallback;
}

export function DragDropActivity({
  ejercicios,
  onScore,
  onComplete,
  onMIAEmotion,
}: DragDropActivityProps) {
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

    setAssignments((prev) => ({
      ...prev,
      [draggedItem]: targetId,
    }));
    setDraggedItem(null);
  };

  const handleItemClick = (itemId: string) => {
    setDraggedItem(draggedItem === itemId ? null : itemId);
  };

  const handleTargetClick = (targetId: string) => {
    if (!draggedItem) return;

    setAssignments((prev) => ({
      ...prev,
      [draggedItem]: targetId,
    }));
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    if (!currentExercise) return;

    let correct = 0;
    currentExercise.items.forEach((item) => {
      const assignedTarget = assignments[item.id];
      if (assignedTarget) {
        const target = currentExercise.objetivos.find(
          (t) => t.id === assignedTarget
        );
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
    onMIAEmotion?.(correct === totalItems ? 'CORRECT' : 'INCORRECT', 1);
  };

  const handleNext = () => {
    setShowResult(false);
    setAssignments({});

    if (currentExerciseIndex < ejercicios.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!currentExercise) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-300">No hay más ejercicios.</p>
          <Button onClick={onComplete} className="mt-4">
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          {totalPoints} puntos
        </Badge>
      </div>

      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{currentExercise.titulo}</CardTitle>
          <CardDescription className="text-slate-400">
            {currentExercise.descripcion}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Unassigned items */}
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium">
              Elementos para clasificar:
            </p>
            <div className="flex flex-wrap gap-2">
              {unassignedItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => handleItemClick(item.id)}
                    className={`border-slate-600 ${
                      draggedItem === item.id
                        ? "border-cyan-500 bg-cyan-500/10"
                        : ""
                    }`}
                  >
                    <span className="mr-2">{item.icono}</span>
                    {item.contenido}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Targets */}
          <div className="grid grid-cols-2 gap-4">
            {currentExercise.objetivos.map((target) => {
              const assignedItems = currentExercise.items.filter(
                (item) => assignments[item.id] === target.id
              );

              return (
                <div
                  key={target.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(target.id)}
                  onClick={() => handleTargetClick(target.id)}
                  className={`rounded-lg border-2 border-dashed p-4 min-h-[120px] cursor-pointer transition-colors ${
                    target.color === "rose"
                      ? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10"
                      : "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                  } ${draggedItem ? "ring-2 ring-cyan-500/30" : ""}`}
                >
                  <p
                    className={`font-medium mb-2 ${
                      target.color === "rose" ? "text-rose-300" : "text-emerald-300"
                    }`}
                  >
                    {target.etiqueta}
                  </p>
                  <div className="space-y-1">
                    {assignedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-800/50 rounded px-2 py-1 text-sm text-white"
                      >
                        {item.icono} {item.contenido}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit / Result */}
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(assignments).length < currentExercise.items.length}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              Verificar respuestas
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
                    : "bg-amber-500/10 border-amber-500"
                }
              >
                <AlertDescription>
                  <p
                    className={
                      score === currentExercise.puntos
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }
                  >
                    {score === currentExercise.puntos
                      ? `✅ ¡Perfecto! +${score} puntos`
                      : `⚠️ ${score}/${currentExercise.puntos} puntos`}
                  </p>
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleNext}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {currentExerciseIndex < ejercicios.length - 1
                  ? "Siguiente ejercicio"
                  : "Continuar"}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
