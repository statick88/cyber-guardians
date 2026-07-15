"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, AlertTriangle, CheckCircle, XCircle, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Module3Category, DesinformacionCase } from "@/types/module3";

interface DesinformacionDetectorProps {
  cases: DesinformacionCase[];
  onScore: (points: number, category: Module3Category) => void;
  onComplete: () => void;
}

interface DetectionState {
  selectedIndicators: string[];
  correctIndicators: string[];
  score: number;
  completed: boolean;
}

export function DesinformacionDetector({ cases, onScore, onComplete }: DesinformacionDetectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detectionState, setDetectionState] = useState<DetectionState>({
    selectedIndicators: [],
    correctIndicators: [],
    score: 0,
    completed: false,
  });
  const [showExplanation, setShowExplanation] = useState(false);

  const currentCase = cases[currentIndex];

  const handleIndicatorSelect = useCallback((indicator: string) => {
    if (detectionState.selectedIndicators.includes(indicator) || detectionState.completed) return;

    const isCorrect = currentCase.indicadores.includes(indicator);
    const newSelected = [...detectionState.selectedIndicators, indicator];
    const newCorrect = isCorrect
      ? [...detectionState.correctIndicators, indicator]
      : detectionState.correctIndicators;
    const points = isCorrect ? Math.floor(currentCase.puntos / currentCase.indicadores.length) : 0;
    const newScore = detectionState.score + points;
    const progress = (newCorrect.length / currentCase.indicadores.length) * 100;

    setDetectionState({
      selectedIndicators: newSelected,
      correctIndicators: newCorrect,
      score: newScore,
      completed: progress >= 100,
    });

    if (progress >= 100) {
      onScore(newScore, "desinformacion-ia");
      setTimeout(() => setShowExplanation(true), 1000);
    }
  }, [detectionState, currentCase, onScore]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < cases.length) {
      setCurrentIndex((prev) => prev + 1);
      setDetectionState({
        selectedIndicators: [],
        correctIndicators: [],
        score: 0,
        completed: false,
      });
      setShowExplanation(false);
    } else {
      onComplete();
    }
  }, [currentIndex, cases.length, onComplete]);

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "imagen-sintetica": return "🖼️";
      case "audio-clonado": return "🎵";
      case "noticia-falsa": return "📰";
      case "video-manipulado": return "🎬";
      default: return "🔍";
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "imagen-sintetica": return "Imagen Sintética";
      case "audio-clonado": return "Audio Clonado";
      case "noticia-falsa": return "Noticia Falsa";
      case "video-manipulado": return "Video Manipulado";
      default: return "Contenido";
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
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTypeIcon(currentCase.tipo)}</div>
            <div>
              <h3 className="text-lg font-bold text-rose-400">{currentCase.titulo}</h3>
              <p className="text-sm text-gray-400">{getTypeLabel(currentCase.tipo)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Puntos</div>
            <div className="text-xl font-bold text-purple-400">{detectionState.score}/{currentCase.puntos}</div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!showExplanation ? (
          <motion.div
            key="detect"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-slate-900/80 border-rose-500/30 mb-4">
              <CardHeader>
                <CardTitle className="text-rose-400 flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Detectar Desinformación
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {currentCase.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-rose-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-medium text-rose-400">Fuente Original</span>
                  </div>
                  <p className="text-gray-300 text-sm">{currentCase.fuenteOriginal}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Identifica los indicadores de contenido generado por IA:</h4>
                  {currentCase.indicadores.map((indicador, idx) => {
                    const isSelected = detectionState.selectedIndicators.includes(indicador);
                    const isCorrect = detectionState.correctIndicators.includes(indicador);
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleIndicatorSelect(indicador)}
                        disabled={isSelected || detectionState.completed}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          isCorrect
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : isSelected
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                            : "bg-slate-800/50 border-slate-700/50 text-gray-300 hover:border-rose-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          )}
                          <span className="text-sm">{indicador}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {detectionState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setShowExplanation(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Ver Análisis
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
                  Análisis Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-emerald-500/20">
                  <p className="text-gray-300 text-sm leading-relaxed">{currentCase.explicacion}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span>Puntos ganados: <span className="text-cyan-400 font-bold">{detectionState.score}</span></span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleNext}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                {currentIndex + 1 < cases.length ? "Siguiente Caso" : "Continuar"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
