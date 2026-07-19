"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuizSound from "@/hooks/useQuizSound";
import { Code, CheckCircle, XCircle, AlertTriangle, Zap, Shield, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Module4Category, CodeChallenge, PatchOption } from "@/types/module4";

interface CodeDefuseSandboxProps {
  challenges: CodeChallenge[];
  onScore: (points: number, category: Module4Category) => void;
  onComplete: () => void;
}

interface SandboxState {
  selectedPatch: PatchOption | null;
  isCompiled: boolean;
  compileResult: "success" | "failure" | null;
  score: number;
  completed: boolean;
}

function generatePatches(challenge: CodeChallenge): PatchOption[] {
  const patches: PatchOption[] = [
    {
      id: "correct",
      codigo: challenge.codigoSeguro,
      esCorrecta: true,
      explicacion: "Esta corrección aplica las mejores prácticas de seguridad.",
    },
    {
      id: "partial",
      codigo: challenge.codigoVulnerable.replace(/innerHTML/g, "textContent").replace(/`/g, "'"),
      esCorrecta: false,
      explicacion: "Esta corrección es parcial y no resuelve todas las vulnerabilidades.",
    },
    {
      id: "wrong",
      codigo: "// Agregar validación básica\nif (input) { " + challenge.codigoVulnerable.split("\n")[0] + " }",
      esCorrecta: false,
      explicacion: "Esta corrección no aborda la vulnerabilidad principal.",
    },
  ];
  return patches.sort(() => Math.random() - 0.5);
}

export function CodeDefuseSandbox({ challenges, onScore, onComplete }: CodeDefuseSandboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sandboxState, setSandboxState] = useState<SandboxState>({
    selectedPatch: null,
    isCompiled: false,
    compileResult: null,
    score: 0,
    completed: false,
  });
  const [showExplanation, setShowExplanation] = useState(false);
  const [patches] = useState(() => generatePatches(challenges[0]));
  const { playCorrect, playIncorrect } = useQuizSound();

  const currentChallenge = challenges[currentIndex];

  const handlePatchSelect = useCallback((patch: PatchOption) => {
    if (sandboxState.completed) return;
    setSandboxState((prev) => ({
      ...prev,
      selectedPatch: patch,
      isCompiled: false,
      compileResult: null,
    }));
  }, [sandboxState.completed]);

  const handleCompile = useCallback(() => {
    if (!sandboxState.selectedPatch || sandboxState.completed) return;

    const isCorrect = sandboxState.selectedPatch.esCorrecta;
    const points = isCorrect ? currentChallenge.puntos : 0;
    isCorrect ? playCorrect() : playIncorrect();

    setSandboxState((prev) => ({
      ...prev,
      isCompiled: true,
      compileResult: isCorrect ? "success" : "failure",
      score: prev.score + points,
      completed: true,
    }));

    onScore(points, "vulnerabilidades");
    setTimeout(() => setShowExplanation(true), 1500);
  }, [sandboxState, currentChallenge, onScore]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex((prev) => prev + 1);
      setSandboxState({
        selectedPatch: null,
        isCompiled: false,
        compileResult: null,
        score: 0,
        completed: false,
      });
      setShowExplanation(false);
    } else {
      onComplete();
    }
  }, [currentIndex, challenges.length, onComplete]);

  const getVulnerabilityColor = (tipo: string) => {
    if (tipo.includes("XSS")) return "text-rose-400";
    if (tipo.includes("SQL")) return "text-purple-400";
    if (tipo.includes("contraseña") || tipo.includes("autenticación")) return "text-yellow-400";
    if (tipo.includes("secret")) return "text-cyan-400";
    return "text-emerald-400";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-cyan-400">{currentChallenge.titulo}</h3>
              <p className={`text-sm ${getVulnerabilityColor(currentChallenge.tipoVulnerabilidad)}`}>
                {currentChallenge.tipoVulnerabilidad}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Puntos</div>
            <div className="text-xl font-bold text-purple-400">{sandboxState.score}/{currentChallenge.puntos}</div>
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
            <Card className="bg-slate-900/80 border-cyan-500/30 mb-4">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Código Vulnerable
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {currentChallenge.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-rose-500/30">
                  <pre className="text-rose-400 whitespace-pre-wrap">{currentChallenge.codigoVulnerable}</pre>
                </div>

                {sandboxState.completed && sandboxState.compileResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-lg border ${
                      sandboxState.compileResult === "success"
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-rose-500/10 border-rose-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {sandboxState.compileResult === "success" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span className={`font-medium ${
                        sandboxState.compileResult === "success" ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {sandboxState.compileResult === "success" ? "Compilación exitosa - Vulnerabilidad corregida" : "Error - La vulnerabilidad persiste"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Selecciona el parche correcto:</h4>
              <div className="grid gap-3">
                {patches.map((patch) => {
                  const isSelected = sandboxState.selectedPatch?.id === patch.id;
                  return (
                    <motion.button
                      key={patch.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handlePatchSelect(patch)}
                      disabled={sandboxState.completed}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-cyan-500/50 bg-cyan-500/10"
                          : "border-slate-700/50 bg-slate-800/50 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="bg-slate-950 rounded p-3 font-mono text-xs overflow-x-auto mb-2">
                        <pre className={`whitespace-pre-wrap ${
                          sandboxState.completed
                            ? patch.esCorrecta ? "text-emerald-400" : "text-rose-400"
                            : "text-gray-300"
                        }`}>
                          {patch.codigo}
                        </pre>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {sandboxState.selectedPatch && !sandboxState.completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={handleCompile}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white min-h-[44px]"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Compilar y Verificar
                </Button>
              </motion.div>
            )}

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
                  Análisis de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-emerald-500/20">
                  <p className="text-gray-300 text-sm leading-relaxed">{currentChallenge.explicacion}</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-emerald-500/30">
                  <div className="text-xs text-emerald-400 mb-2">// Código seguro:</div>
                  <pre className="text-emerald-400 whitespace-pre-wrap">{currentChallenge.codigoSeguro}</pre>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 text-center">
              <Button
                onClick={handleNext}
                className="bg-cyan-500 hover:bg-cyan-600 text-white min-h-[44px]"
              >
                {currentIndex + 1 < challenges.length ? "Siguiente Desafío" : "Continuar"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
