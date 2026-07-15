"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, MessageCircle, AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Module3Category, VishingScenario } from "@/types/module3";

interface VishingCallSimulatorProps {
  scenarios: VishingScenario[];
  onScore: (points: number, category: Module3Category) => void;
  onComplete: () => void;
}

interface CallState {
  isAnswered: boolean;
  currentDialogueIndex: number;
  suspicionLevel: number;
  selectedQuestions: string[];
  completed: boolean;
  score: number;
}

export function VishingCallSimulator({ scenarios, onScore, onComplete }: VishingCallSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [callState, setCallState] = useState<CallState>({
    isAnswered: false,
    currentDialogueIndex: 0,
    suspicionLevel: 0,
    selectedQuestions: [],
    completed: false,
    score: 0,
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRinging, setIsRinging] = useState(true);

  const currentScenario = scenarios[currentIndex];

  useEffect(() => {
    if (isRinging && !callState.isAnswered) {
      const timer = setTimeout(() => setIsRinging(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRinging, callState.isAnswered]);

  const handleAnswer = useCallback(() => {
    setCallState((prev) => ({
      ...prev,
      isAnswered: true,
      currentDialogueIndex: 0,
    }));
  }, []);

  const handleDecline = useCallback(() => {
    if (currentScenario.tipo === "amigo" || currentScenario.tipo === "autoridad") {
      const points = Math.floor(currentScenario.puntos * 0.5);
      setCallState((prev) => ({
        ...prev,
        score: points,
        completed: true,
      }));
      onScore(points, "vishing-simulado");
      setTimeout(() => setShowExplanation(true), 1000);
    }
  }, [currentScenario, onScore]);

  const handleQuestionSelect = useCallback((question: string) => {
    if (callState.selectedQuestions.includes(question) || callState.completed) return;

    const isCorrectQuestion = !question.includes("Transferir") && !question.includes("datos solicitados") && !question.includes("acceso remoto");
    const newSelected = [...callState.selectedQuestions, question];
    const suspicionIncrease = isCorrectQuestion ? -10 : 15;
    const newSuspicion = Math.max(0, Math.min(100, callState.suspicionLevel + suspicionIncrease));
    const points = isCorrectQuestion ? Math.floor(currentScenario.puntos / currentScenario.preguntasSeguridad.length) : 0;
    const newScore = callState.score + points;

    setCallState((prev) => ({
      ...prev,
      selectedQuestions: newSelected,
      suspicionLevel: newSuspicion,
      score: newScore,
      completed: newSelected.length >= currentScenario.preguntasSeguridad.length || newSuspicion >= 80,
    }));

    if (newSelected.length >= currentScenario.preguntasSeguridad.length || newSuspicion >= 80) {
      onScore(newScore, "vishing-simulado");
      setTimeout(() => setShowExplanation(true), 1000);
    }
  }, [callState, currentScenario, onScore]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex((prev) => prev + 1);
      setCallState({
        isAnswered: false,
        currentDialogueIndex: 0,
        suspicionLevel: 0,
        selectedQuestions: [],
        completed: false,
        score: 0,
      });
      setShowExplanation(false);
      setIsRinging(true);
    } else {
      onComplete();
    }
  }, [currentIndex, scenarios.length, onComplete]);

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "amigo": return "📱 Contacto";
      case "banco": return "🏦 Banco";
      case "soporte-tecnico": return "💻 Soporte";
      case "autoridad": return "👮 Autoridad";
      default: return "📞 Llamada";
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
          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
            {getTypeLabel(currentScenario.tipo)}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-gray-400">Nivel de Sospecha</div>
            <div className={`text-xl font-bold ${callState.suspicionLevel > 50 ? "text-rose-400" : "text-emerald-400"}`}>
              {callState.suspicionLevel}%
            </div>
          </div>
        </div>

        <Progress value={callState.suspicionLevel} className="h-2 bg-slate-800" />
      </motion.div>

      <AnimatePresence mode="wait">
        {!showExplanation ? (
          <motion.div
            key="call"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="bg-slate-900/80 border-purple-500/30 mb-4">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {currentScenario.titulo}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {currentScenario.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!callState.isAnswered ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      📞
                    </motion.div>
                    <p className="text-gray-400 mb-4">
                      {isRinging ? "Llamando..." : "Llamada entrante"}
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={handleAnswer}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contestar
                      </Button>
                      <Button
                        onClick={handleDecline}
                        variant="outline"
                        className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
                      >
                        <PhoneOff className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {currentScenario.dialogo.slice(0, callState.currentDialogueIndex + 1).map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.hablante === "Tú" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.hablante === "Tú"
                                ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300"
                                : msg.esSospechoso
                                ? "bg-rose-500/20 border border-rose-500/30 text-rose-300"
                                : "bg-slate-800/50 border border-slate-700/50 text-gray-300"
                            }`}
                          >
                            <div className="text-xs text-gray-400 mb-1">{msg.hablante}</div>
                            <div className="text-sm">{msg.texto}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {callState.currentDialogueIndex < currentScenario.dialogo.length - 1 && !callState.completed && (
                      <Button
                        onClick={() => setCallState((prev) => ({
                          ...prev,
                          currentDialogueIndex: prev.currentDialogueIndex + 1,
                        }))}
                        variant="outline"
                        className="w-full border-cyan-500/50 text-cyan-400"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                    )}

                    {!callState.completed && callState.currentDialogueIndex >= 2 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400">Preguntas de seguridad:</h4>
                        {currentScenario.preguntasSeguridad.map((question, idx) => {
                          const isSelected = callState.selectedQuestions.includes(question);
                          const isGoodQuestion = !question.includes("Transferir") && !question.includes("datos solicitados") && !question.includes("acceso remoto");
                          return (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleQuestionSelect(question)}
                              disabled={isSelected || callState.completed}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? isGoodQuestion
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                    : "bg-rose-500/20 border-rose-500/50 text-rose-400"
                                  : "bg-slate-800/50 border-slate-700/50 text-gray-300 hover:border-purple-500/50"
                              }`}
                            >
                              <span className="text-sm">{question}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {callState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setShowExplanation(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
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
                  Análisis de Llamada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-emerald-500/20">
                  <p className="text-gray-300 text-sm leading-relaxed">{currentScenario.explicacion}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Sospecha final: <span className="text-rose-400 font-bold">{callState.suspicionLevel}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-400">Puntos: <span className="text-cyan-400 font-bold">{callState.score}</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleNext}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {currentIndex + 1 < scenarios.length ? "Siguiente Escenario" : "Continuar"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
