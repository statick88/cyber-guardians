"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuizSound from "@/hooks/useQuizSound";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Code, ListOrdered, Shield } from "lucide-react";
import { Module4Category, MicroActividad } from "@/types/module4";

interface MicroActivitiesProps {
  actividades: MicroActividad[];
  onScore: (points: number, category?: Module4Category) => void;
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
  const { playCorrect, playIncorrect } = useQuizSound();

  const currentActivity = actividades[currentIndex];

  const handleTrueFalse = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentActivity.respuestaCorrecta;
    setIsCorrect(correct);
    correct ? playCorrect() : playIncorrect();
    const points = correct ? currentActivity.puntos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIndex < actividades.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    }, 3000);
  };

  const handleCodeSubmit = () => {
    if (!selectedAnswer && selectedAnswer !== 0) return;

    const correct = Number(selectedAnswer) === currentActivity.respuestaCorrecta;
    setIsCorrect(correct);
    correct ? playCorrect() : playIncorrect();
    const points = correct ? currentActivity.puntos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIndex < actividades.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
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

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (currentIndex < actividades.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    }, 3000);
  };

  const renderActivity = () => {
    switch (currentActivity.tipo) {
      case "verdadero-falso":
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-200 text-center">{currentActivity.pregunta}</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleTrueFalse("verdadero")}
                disabled={!!selectedAnswer}
                className={`min-w-[120px] min-h-[44px] ${
                  selectedAnswer === "verdadero"
                    ? isCorrect
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-rose-500 hover:bg-rose-600"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50"
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                Verdadero
              </Button>
              <Button
                onClick={() => handleTrueFalse("falso")}
                disabled={!!selectedAnswer}
                className={`min-w-[120px] min-h-[44px] ${
                  selectedAnswer === "falso"
                    ? isCorrect
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-rose-500 hover:bg-rose-600"
                    : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50"
                }`}
              >
                <X className="w-4 h-4 mr-2" />
                Falso
              </Button>
            </div>
          </div>
        );

      case "completar-codigo":
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-200 text-center">{currentActivity.pregunta}</p>
            {currentActivity.codigo && (
              <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm text-cyan-400 overflow-x-auto">
                {currentActivity.codigo}
              </div>
            )}
            <div className="flex justify-center">
              <Button
                onClick={handleCodeSubmit}
                disabled={selectedAnswer === null}
                className="bg-purple-500 hover:bg-purple-600 min-h-[44px]"
              >
                <Code className="w-4 h-4 mr-2" />
                Verificar
              </Button>
            </div>
          </div>
        );

      case "ordenar-pasos":
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-200 text-center">{currentActivity.pregunta}</p>
            <OrderSteps
              pasos={currentActivity.pasos || []}
              onSubmit={handleOrderSubmit}
              disabled={isCorrect !== null}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
            Micro-Actividad {currentIndex + 1}/{actividades.length}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-slate-400">Puntos</div>
            <div className="text-xl font-bold text-purple-400">{totalPoints}</div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="bg-slate-900/80 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {currentActivity.tipo === "verdadero-falso" ? "Verdadero o Falso" :
                 currentActivity.tipo === "completar-codigo" ? "Completar Código" :
                 "Ordenar Pasos"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderActivity()}

              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Alert className={isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-rose-500/50 bg-rose-500/10"}>
                    <AlertDescription className={isCorrect ? "text-emerald-400" : "text-rose-400"}>
                      {isCorrect ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          ¡Correcto! +{earnedPoints} puntos
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Incorrecto. {currentActivity.explicacion}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Order steps component with Fisher-Yates shuffle and move up/down reordering
function OrderSteps({
  pasos,
  onSubmit,
  disabled,
}: {
  pasos: Array<{ id: string; texto: string; ordenCorrecto: number }>;
  onSubmit: (order: string[]) => void;
  disabled: boolean;
}) {
  const [items, setItems] = useState(() => {
    const shuffled = [...pasos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const moveUp = (index: number) => {
    if (index === 0 || disabled) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1 || disabled) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit(items.map((item) => item.id));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3.5 min-h-[44px] rounded-lg bg-slate-800/50 border border-slate-700"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded text-white font-mono font-bold">
            {index + 1}
          </div>
          <span className="text-white flex-1">{item.texto}</span>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveUp(index)}
              disabled={disabled || index === 0}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveDown(index)}
              disabled={disabled || index === items.length - 1}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              ↓
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full bg-purple-500 hover:bg-purple-600 min-h-[44px]"
      >
        <ListOrdered className="w-4 h-4 mr-2" />
        Enviar Orden
      </Button>
    </div>
  );
}
