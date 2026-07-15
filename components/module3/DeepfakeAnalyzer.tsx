"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Eye, AlertTriangle, CheckCircle, XCircle, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Module3Category, DeepfakeCase } from "@/types/module3";

interface DeepfakeAnalyzerProps {
  cases: DeepfakeCase[];
  onScore: (points: number, category: Module3Category) => void;
  onComplete: () => void;
}

interface ScanState {
  selectedClues: string[];
  revealedClues: string[];
  score: number;
  completed: boolean;
}

export function DeepfakeAnalyzer({ cases, onScore, onComplete }: DeepfakeAnalyzerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scanState, setScanState] = useState<ScanState>({
    selectedClues: [],
    revealedClues: [],
    score: 0,
    completed: false,
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const currentCase = cases[currentIndex];

  const handleClueSelect = useCallback((clue: string) => {
    if (scanState.selectedClues.includes(clue) || scanState.completed) return;

    const isCorrect = currentCase.pistas.includes(clue);
    const newSelected = [...scanState.selectedClues, clue];
    const newRevealed = isCorrect
      ? [...scanState.revealedClues, clue]
      : scanState.revealedClues;
    const points = isCorrect ? Math.floor(currentCase.puntos / currentCase.pistas.length) : 0;
    const newScore = scanState.score + points;
    const progress = (newRevealed.length / currentCase.pistas.length) * 100;

    setScanState({
      selectedClues: newSelected,
      revealedClues: newRevealed,
      score: newScore,
      completed: progress >= 100,
    });
    setScanProgress(progress);

    if (progress >= 100) {
      onScore(newScore, "analisis-deepfake");
      setTimeout(() => setShowExplanation(true), 1000);
    }
  }, [scanState, currentCase, onScore]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < cases.length) {
      setCurrentIndex((prev) => prev + 1);
      setScanState({
        selectedClues: [],
        revealedClues: [],
        score: 0,
        completed: false,
      });
      setShowExplanation(false);
      setScanProgress(0);
    } else {
      onComplete();
    }
  }, [currentIndex, cases.length, onComplete]);

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "imagen": return "🖼️";
      case "audio": return "🎵";
      case "video": return "🎬";
      default: return "🔍";
    }
  };

  const getDifficultyColor = (nivel: string) => {
    switch (nivel) {
      case "basico": return "text-emerald-400";
      case "intermedio": return "text-yellow-400";
      case "avanzado": return "text-rose-400";
      default: return "text-gray-400";
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
              <h3 className="text-lg font-bold text-cyan-400">{currentCase.titulo}</h3>
              <p className={`text-sm ${getDifficultyColor(currentCase.nivelDificultad)}`}>
                {currentCase.nivelDificultad.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Puntos</div>
            <div className="text-xl font-bold text-purple-400">{scanState.score}/{currentCase.puntos}</div>
          </div>
        </div>

        <Progress value={scanProgress} className="h-2 bg-slate-800" />
      </motion.div>

      <AnimatePresence mode="wait">
        {!showExplanation ? (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-slate-900/80 border-cyan-500/30 mb-4">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Análisis de Contenido
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {currentCase.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">Zona Sospechosa</span>
                  </div>
                  <p className="text-gray-300 text-sm">{currentCase.zonaSospechosa}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Selecciona las pistas que detectas:</h4>
                  {currentCase.pistas.map((pista, idx) => {
                    const isSelected = scanState.selectedClues.includes(pista);
                    const isRevealed = scanState.revealedClues.includes(pista);
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleClueSelect(pista)}
                        disabled={isSelected || scanState.completed}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          isRevealed
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : isSelected
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                            : "bg-slate-800/50 border-slate-700/50 text-gray-300 hover:border-cyan-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isRevealed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                          ) : (
                            <Eye className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          )}
                          <span className="text-sm">{pista}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {scanState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setShowExplanation(true)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
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
                  <span>Puntos ganados: <span className="text-cyan-400 font-bold">{scanState.score}</span></span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleNext}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
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
