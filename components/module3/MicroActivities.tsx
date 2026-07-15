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
import { Check, X, Code, ListOrdered, Shield, AlertTriangle } from "lucide-react";
import { Module3Category, MicroActividad } from "@/types/module3";

interface MicroActivitiesProps {
  actividades: MicroActividad[];
  onScore: (points: number, category?: Module3Category) => void;
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

  const currentActivity = actividades[currentIndex];

  const handleTrueFalse = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentActivity.respuestaCorrecta;
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

  const handleCodeSubmit = () => {
    if (!selectedAnswer && selectedAnswer !== 0) return;

    const correct = Number(selectedAnswer) === currentActivity.respuestaCorrecta;
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
            <div className="space-y-2">
              {currentActivity.pasos?.map((paso, idx) => (
                <div
                  key={paso.id}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-gray-300"
                >
                  <span className="text-cyan-400 mr-2">{idx + 1}.</span>
                  {paso.texto}
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => handleOrderSubmit(currentActivity.pasos?.map(p => p.texto) || [])}
                className="bg-purple-500 hover:bg-purple-600 min-h-[44px]"
              >
                <ListOrdered className="w-4 h-4 mr-2" />
                Verificar Orden
              </Button>
            </div>
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
