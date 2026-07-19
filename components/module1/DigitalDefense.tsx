"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuizSound from "@/hooks/useQuizSound";
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

import { Module1Category } from "@/types/module1";

interface DigitalDefenseProps {
  onScore: (points: number, category?: Module1Category) => void;
  onComplete: () => void;
}

const defenseTopics = [
  {
    id: "mfa",
    titulo: "Autenticación de dos factores (2FA)",
    icono: "🔐",
    pregunta: "¿Cuál es la mejor forma de proteger tu cuenta con 2FA?",
    opciones: [
      { id: "sms", texto: "Código por SMS", correcta: false },
      { id: "app", texto: "App de autenticación (Google Authenticator, Authy)", correcta: true },
      { id: "email", texto: "Código por email", correcta: false },
      { id: "none", texto: "No necesito 2FA", correcta: false },
    ],
    explicacion: "Las apps de autenticación son más seguras que SMS porque no pueden ser interceptadas por ataques SIM swapping. Los códigos SMS también pueden ser vulnerables a SS7.",
    puntos: 15,
  },
  {
    id: "passwords",
    titulo: "Gestión de contraseñas",
    icono: "🔑",
    pregunta: "¿Cuál es la práctica correcta de contraseñas?",
    opciones: [
      { id: "same", texto: "Usar la misma contraseña en todos lados", correcta: false },
      { id: "simple", texto: "Usar algo fácil de recordar: mi nombre + 123", correcta: false },
      { id: "manager", texto: "Usar un gestor de contraseñas con contraseñas únicas", correcta: true },
      { id: "write", texto: "Escribirla en un papel guardado en casa", correcta: false },
    ],
    explicacion: "Un gestor de contraseñas genera y almacena contraseñas únicas y fuertes. Si un sitio es comprometido, las otras cuentas siguen seguras.",
    puntos: 15,
  },
  {
    id: "updates",
    titulo: "Actualizaciones de software",
    icono: "🔄",
    pregunta: "¿Por qué son importantes las actualizaciones de seguridad?",
    opciones: [
      { id: "features", texto: "Solo para nuevas funciones", correcta: false },
      { id: "fix", texto: "Parchean vulnerabilidades que los atacantes pueden explotar", correcta: true },
      { id: "slow", texto: "No son importantes, ralentizan el equipo", correcta: false },
      { id: "auto", texto: "Siempre se actualizan solas, no tengo que hacer nada", correcta: false },
    ],
    explicacion: "Las actualizaciones de seguridad corrigen vulnerabilidades conocidas. Los atacantes buscan activamente sistemas desactualizados.",
    puntos: 15,
  },
  {
    id: "wifi",
    titulo: "Redes WiFi públicas",
    icono: "📶",
    pregunta: "¿Qué debes hacer en una red WiFi pública (café, aeropuerto)?",
    opciones: [
      { id: "free", texto: "Conectarse libremente, es gratis", correcta: false },
      { id: "vpn", texto: "Usar una VPN para cifrar tu tráfico", correcta: true },
      { id: "bank", texto: "Hacer transferencias bancarias normalmente", correcta: false },
      { id: "share", texto: "Compartir archivos con otros usuarios de la red", correcta: false },
    ],
    explicacion: "Las redes públicas pueden ser interceptadas (man-in-the-middle). Una VPN cifra tu tráfico y protege tus datos.",
    puntos: 15,
  },
];

export function DigitalDefense({ onScore, onComplete }: DigitalDefenseProps) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const { playCorrect, playIncorrect } = useQuizSound();

  const currentTopic = defenseTopics[currentTopicIndex];

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption) return;

    setSelectedOption(optionId);
    const option = currentTopic.opciones.find((o) => o.id === optionId);
    const correct = option?.correcta || false;
    setIsCorrect(correct);
    correct ? playCorrect() : playIncorrect();
    const points = correct ? currentTopic.puntos : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);

      if (currentTopicIndex < defenseTopics.length - 1) {
        setCurrentTopicIndex(currentTopicIndex + 1);
      } else {
        onComplete();
      }
    }, 3000);
  };

  if (!currentTopic) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-300">No hay más temas.</p>
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
          Tema {currentTopicIndex + 1} de {defenseTopics.length}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">
          {totalPoints} puntos
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTopic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">{currentTopic.icono}</span>
                {currentTopic.titulo}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Selecciona la mejor respuesta
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-white font-medium">
                  {currentTopic.pregunta}
                </p>
              </div>

              <div className="space-y-3">
                {currentTopic.opciones.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleOptionSelect(option.id)}
                      disabled={!!selectedOption}
                      className={`w-full text-left justify-start h-auto py-4 ${
                        selectedOption === option.id
                          ? option.correcta
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-rose-500 bg-rose-500/10"
                          : selectedOption && option.correcta
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-600"
                      }`}
                    >
                      <span className="text-white">{option.texto}</span>
                    </Button>
                  </motion.div>
                ))}
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
                            : "❌ Incorrecto"}
                        </p>
                        <p className="text-slate-300 text-sm">
                          {currentTopic.explicacion}
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
