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
import { URLItem, Module1Category } from "@/types/module1";

interface URLInspectorProps {
  urls: URLItem[];
  onScore: (points: number, category?: Module1Category) => void;
  onComplete: () => void;
}

export function URLInspector({ urls, onScore, onComplete }: URLInspectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showComponents, setShowComponents] = useState(false);

  const currentURL = urls[currentIndex];

  const handleAnswer = (answer: "phishing" | "suspeita" | "segura") => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentURL.classificacao;
    setIsCorrect(correct);
    const points = correct ? currentURL.pontos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);

      if (currentIndex < urls.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    }, 3000);
  };

  if (!currentURL) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-300">No hay más URLs para analizar.</p>
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
          URL {currentIndex + 1} de {urls.length}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">
          {totalPoints} puntos
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentURL.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🔍 Analiza esta URL
              </CardTitle>
              <CardDescription className="text-slate-400">
                Clasifica la URL como phishing, sospechosa o segura
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-cyan-400 font-mono text-sm break-all">
                  {currentURL.urlCompleta}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowComponents(!showComponents)}
                className="w-full border-slate-600 text-slate-300"
              >
                {showComponents ? "Ocultar" : "Mostrar"} componentes de la URL
              </Button>

              <AnimatePresence>
                {showComponents && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-800/30 rounded p-2">
                        <span className="text-slate-400">Protocolo:</span>
                        <span className="text-white ml-2">
                          {currentURL.componentes.protocolo}
                        </span>
                      </div>
                      <div className="bg-slate-800/30 rounded p-2">
                        <span className="text-slate-400">Dominio:</span>
                        <span className="text-white ml-2">
                          {currentURL.componentes.dominio}
                        </span>
                      </div>
                      <div className="bg-slate-800/30 rounded p-2">
                        <span className="text-slate-400">Ruta:</span>
                        <span className="text-white ml-2">
                          {currentURL.componentes.caminho}
                        </span>
                      </div>
                      {currentURL.componentes.parametros && (
                        <div className="bg-slate-800/30 rounded p-2">
                          <span className="text-slate-400">Parámetros:</span>
                          <span className="text-white ml-2">
                            {currentURL.componentes.parametros}
                          </span>
                        </div>
                      )}
                      {currentURL.componentes.porta && (
                        <div className="bg-slate-800/30 rounded p-2">
                          <span className="text-slate-400">Puerto:</span>
                          <span className="text-amber-400 ml-2">
                            {currentURL.componentes.porta}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <p className="text-slate-400 text-sm font-medium text-center">
                  ¿Qué tipo de URL es esta?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleAnswer("phishing")}
                    disabled={!!selectedAnswer}
                    className={`py-6 ${
                      selectedAnswer === "phishing"
                        ? isCorrect
                          ? "bg-emerald-600"
                          : "bg-rose-600"
                        : "bg-rose-600/50 hover:bg-rose-600"
                    }`}
                  >
                    🎣 Phishing
                  </Button>
                  <Button
                    onClick={() => handleAnswer("suspeita")}
                    disabled={!!selectedAnswer}
                    className={`py-6 ${
                      selectedAnswer === "suspeita"
                        ? isCorrect
                          ? "bg-emerald-600"
                          : "bg-amber-600"
                        : "bg-amber-600/50 hover:bg-amber-600"
                    }`}
                  >
                    ⚠️ Sospechosa
                  </Button>
                  <Button
                    onClick={() => handleAnswer("segura")}
                    disabled={!!selectedAnswer}
                    className={`py-6 ${
                      selectedAnswer === "segura"
                        ? isCorrect
                          ? "bg-emerald-600"
                          : "bg-rose-600"
                        : "bg-emerald-600/50 hover:bg-emerald-600"
                    }`}
                  >
                    ✅ Segura
                  </Button>
                </div>
              </div>

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
                            : `❌ Incorrecto. Era: ${currentURL.classificacao}`}
                        </p>
                        <p className="text-slate-300 text-sm">
                          {currentURL.elementoSuspeito}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {currentURL.explicacao}
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
    </div>
  );
}
