"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuizSound from "@/hooks/useQuizSound";
import { Terminal, Lock, Unlock, Key, CheckCircle, XCircle, Zap, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Module4Category, CryptoChallenge, ChallengeOption } from "@/types/module4";

interface CryptoSandboxProps {
  challenges: CryptoChallenge[];
  onScore: (points: number, category: Module4Category) => void;
  onComplete: () => void;
}

interface SandboxState {
  selectedOption: ChallengeOption | null;
  isDecrypted: boolean;
  decryptResult: "success" | "failure" | null;
  score: number;
  completed: boolean;
}

function getCipherIcon(type: CryptoChallenge["cipherType"]) {
  switch (type) {
    case "caesar": return "🏛️";
    case "xor": return "⚡";
    case "aes-simulado": return "🔐";
    default: return "🔑";
  }
}

function getCipherColor(type: CryptoChallenge["cipherType"]) {
  switch (type) {
    case "caesar": return "amber";
    case "xor": return "cyan";
    case "aes-simulado": return "emerald";
    default: return "cyan";
  }
}

export function CryptoSandbox({ challenges, onScore, onComplete }: CryptoSandboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sandboxState, setSandboxState] = useState<SandboxState>({
    selectedOption: null,
    isDecrypted: false,
    decryptResult: null,
    score: 0,
    completed: false,
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const { playCorrect, playIncorrect } = useQuizSound();

  const currentChallenge = challenges[currentIndex];
  const cipherColor = getCipherColor(currentChallenge.cipherType);

  const handleOptionSelect = useCallback((option: ChallengeOption) => {
    if (sandboxState.completed) return;
    setSandboxState((prev) => ({
      ...prev,
      selectedOption: option,
      isDecrypted: false,
      decryptResult: null,
    }));
  }, [sandboxState.completed]);

  const handleDecrypt = useCallback(() => {
    if (!sandboxState.selectedOption || sandboxState.completed) return;

    const isCorrect = sandboxState.selectedOption.esCorrecta;
    const points = isCorrect ? currentChallenge.puntos : 0;
    isCorrect ? playCorrect() : playIncorrect();

    setSandboxState((prev) => ({
      ...prev,
      isDecrypted: true,
      decryptResult: isCorrect ? "success" : "failure",
      score: prev.score + points,
      completed: true,
    }));

    onScore(points, "criptografia");
    setTimeout(() => setShowExplanation(true), 1500);
  }, [sandboxState, currentChallenge, onScore]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
      setSandboxState({
        selectedOption: null,
        isDecrypted: false,
        decryptResult: null,
        score: 0,
        completed: false,
      });
      setShowExplanation(false);
    } else {
      onComplete();
    }
  }, [currentIndex, challenges.length, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCipherIcon(currentChallenge.cipherType)}</span>
            <div>
              <h3 className={`text-lg font-bold text-${cipherColor}-400`}>{currentChallenge.titulo}</h3>
              <Badge variant="outline" className={`text-${cipherColor}-400 border-${cipherColor}-500/50 mt-1`}>
                {currentChallenge.cipherType.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Puntos</div>
            <div className={`text-xl font-bold text-${cipherColor}-400`}>{sandboxState.score}/{currentChallenge.puntos}</div>
          </div>
        </div>

        <Progress value={sandboxState.completed ? 100 : 0} className="h-2 bg-slate-800" />
      </motion.div>

      <AnimatePresence mode="wait">
        {!showExplanation ? (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Terminal-style cipher display */}
            <Card className={`bg-slate-900/80 border-${cipherColor}-500/30 mb-4`}>
              <CardHeader>
                <CardTitle className={`text-${cipherColor}-400 flex items-center gap-2`}>
                  <Terminal className="w-5 h-5" />
                  Terminal de Descifrado
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {currentChallenge.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Cipher terminal */}
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-500 text-xs">crypto-terminal</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-400">
                      <span className="text-cyan-400">$</span> cipher --type {currentChallenge.cipherType}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-cyan-400">$</span> encrypted = "{currentChallenge.mensajeCifrado}"
                    </div>
                    <div className="text-slate-400">
                      <span className="text-cyan-400">$</span> key = "{currentChallenge.clave}"
                    </div>
                    <div className={`text-${cipherColor}-400 font-bold mt-2`}>
                      <span className="text-cyan-400">$</span> decrypt --encrypted "{currentChallenge.mensajeCifrado}" --key "{currentChallenge.clave}"
                    </div>
                    {sandboxState.isDecrypted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-2 p-2 rounded ${
                          sandboxState.decryptResult === "success"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {sandboxState.decryptResult === "success" ? (
                          <span>✓ Descifrado exitoso: {sandboxState.selectedOption?.etiqueta}</span>
                        ) : (
                          <span>✗ Descifrado fallido: resultado incorrecto</span>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Hints */}
                <div className={`mt-4 p-3 rounded-lg bg-${cipherColor}-500/5 border border-${cipherColor}-500/20`}>
                  <div className={`text-xs font-medium text-${cipherColor}-400 mb-2`}>💡 Pistas:</div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {currentChallenge.pistas.map((pista, i) => (
                      <li key={i}>• {pista}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">¿Cuál es el resultado del descifrado?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentChallenge.opciones.map((option) => {
                  const isSelected = sandboxState.selectedOption?.id === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(option)}
                      disabled={sandboxState.completed}
                      className={`p-4 rounded-lg border text-left transition-all font-mono ${
                        isSelected
                          ? `border-${cipherColor}-500/50 bg-${cipherColor}-500/10`
                          : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? `border-${cipherColor}-400 bg-${cipherColor}-500/20` : "border-slate-600"
                        }`}>
                          {isSelected && <div className={`w-3 h-3 rounded-full bg-${cipherColor}-400`} />}
                        </div>
                        <span className={`text-sm ${
                          sandboxState.completed
                            ? option.esCorrecta ? "text-emerald-400" : "text-rose-400"
                            : "text-gray-300"
                        }`}>
                          {option.etiqueta}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Decrypt button */}
            {sandboxState.selectedOption && !sandboxState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={handleDecrypt}
                  className={`bg-${cipherColor}-500 hover:bg-${cipherColor}-600 text-white min-h-[44px]`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Descifrar
                </Button>
              </motion.div>
            )}

            {/* Post-decrypt button */}
            {sandboxState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={() => setShowExplanation(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white min-h-[44px]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Ver Explicación
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
                  Análisis Criptográfico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-emerald-500/20">
                  <p className="text-gray-300 text-sm leading-relaxed">{currentChallenge.explicacion}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Key className="w-4 h-4" />
                  <span>Cifrado: {currentChallenge.cipherType.toUpperCase()} | Puntos: {currentChallenge.puntos}</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleNext}
                className={`bg-${cipherColor}-500 hover:bg-${cipherColor}-600 text-white min-h-[44px]`}
              >
                {currentIndex + 1 < challenges.length ? "Siguiente Desafío" : "Continuar"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
