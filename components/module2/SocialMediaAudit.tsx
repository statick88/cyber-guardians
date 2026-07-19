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
import { Lock, Unlock, Eye, EyeOff, Users, User, Globe, AlertTriangle, Check, X, Shield } from "lucide-react";
import { Module2Category, SocialMediaProfile, ConfiguracionPrivacidad } from "@/types/module2";

interface SocialMediaAuditProps {
  perfiles: SocialMediaProfile[];
  onScore: (points: number, category?: Module2Category) => void;
  onComplete: () => void;
}

export function SocialMediaAudit({ perfiles, onScore, onComplete }: SocialMediaAuditProps) {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [configStates, setConfigStates] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [profilePoints, setProfilePoints] = useState(0);
  const { playCorrect, playIncorrect } = useQuizSound();

  const currentProfile = perfiles[currentProfileIndex];
  const configs = currentProfile?.configuraciones || [];

  const handleConfigChange = (configId: string, newState: string) => {
    setConfigStates((prev) => ({ ...prev, [configId]: newState }));
  };

  const handleEvaluate = () => {
    if (!currentProfile) return;

    let points = 0;
    configs.forEach((config) => {
      const userChoice = configStates[config.id];
      if (userChoice === config.estadoRecomendado) {
        points += config.puntos;
      }
    });

    setProfilePoints(points);
    points > 0 ? playCorrect() : playIncorrect();
    setTotalPoints((prev) => prev + points);
    setShowResults(true);
  };

  const handleNext = () => {
    setShowResults(false);
    setConfigStates({});
    setProfilePoints(0);

    if (currentProfileIndex < perfiles.length - 1) {
      setCurrentProfileIndex((prev) => prev + 1);
    } else {
      onScore(totalPoints, "auditoria-redes-sociales");
      onComplete();
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "publico": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "amigos": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "amigos-cercanos": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "solo-yo": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "personalizado": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "publico": return <Globe className="w-4 h-4" />;
      case "amigos": return <Users className="w-4 h-4" />;
      case "amigos-cercanos": return <User className="w-4 h-4" />;
      case "solo-yo": return <Lock className="w-4 h-4" />;
      case "personalizado": return <Shield className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case "publico": return "Público";
      case "amigos": return "Amigos";
      case "amigos-cercanos": return "Mejores Amigos";
      case "solo-yo": return "Solo Yo";
      case "personalizado": return "Personalizado";
      default: return state;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critica": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "alto": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "medio": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "bajo": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "critica": return "🔴 CRÍTICA";
      case "alto": return "🟠 ALTA";
      case "medio": return "🟡 MEDIA";
      case "bajo": return "🟢 BAJA";
      default: return risk.toUpperCase();
    }
  };

  if (!currentProfile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">
          Red Social {currentProfileIndex + 1} de {perfiles.length}
        </Badge>
        <div className="flex gap-2">
          <Badge className="bg-purple-500/20 text-purple-300">
            {currentProfile.icono} {currentProfile.plataforma}
          </Badge>
          <Badge className="bg-cyan-500/20 text-cyan-300">
            {totalPoints} pts
          </Badge>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentProfile.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">{currentProfile.icono}</span>
                Auditoría de Privacidad: {currentProfile.plataforma}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Revisa cada configuración y selecciona la opción más segura
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!showResults ? (
                <div className="space-y-4">
                  {configs.map((config) => {
                    const userChoice = configStates[config.id];
                    const isCorrect = userChoice === config.estadoRecomendado;
                    const states = [
                      { value: "publico", label: "Público", icon: <Globe className="w-4 h-4" /> },
                      { value: "amigos", label: "Amigos", icon: <Users className="w-4 h-4" /> },
                      { value: "amigos-cercanos", label: "Mejores Amigos", icon: <User className="w-4 h-4" /> },
                      { value: "solo-yo", label: "Solo Yo", icon: <Lock className="w-4 h-4" /> },
                      { value: "personalizado", label: "Personalizado", icon: <Shield className="w-4 h-4" /> },
                    ];

                    return (
                      <motion.div
                        key={config.id}
                        whileHover={{ y: -2 }}
                        className={`p-4 rounded-lg border transition-all ${
                          userChoice
                            ? isCorrect
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "border-rose-500/50 bg-rose-500/5"
                            : "border-slate-700 hover:border-cyan-500/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-white font-medium">{config.nombre}</h5>
                              <Badge
                                className={`text-xs ${getRiskColor(config.riesgo)}`}
                              >
                                {getRiskLabel(config.riesgo)}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{config.descripcion}</p>
                          </div>
                          {userChoice && (
                            <Badge
                              className={`text-xs ${isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}
                            >
                              {isCorrect ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                              {isCorrect ? "Óptima" : "Revisar"}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {states.map((state) => {
                            const isRecommended = state.value === config.estadoRecomendado;
                            const isCurrent = state.value === config.estadoActual;
                            const isSelected = state.value === userChoice;

                            return (
                              <Button
                                key={state.value}
                                variant="outline"
                                onClick={() => handleConfigChange(config.id, state.value)}
                                disabled={!!userChoice}
                                className={`h-auto py-3 text-xs ${
                                  isSelected
                                    ? isCorrect
                                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                                      : "border-rose-500 bg-rose-500/10 text-rose-300"
                                    : isRecommended
                                    ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500"
                                    : isCurrent
                                    ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-500"
                                    : "border-slate-600 text-slate-300 hover:border-cyan-500/50"
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  {state.icon}
                                  <span>{state.label}</span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}

                  <Button
                    onClick={handleEvaluate}
                    disabled={Object.keys(configStates).length < configs.length}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                    size="lg"
                  >
                    Evaluar Configuración
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Alert
                    className={
                      profilePoints > 0
                        ? "bg-emerald-500/10 border-emerald-500"
                        : "bg-rose-500/10 border-rose-500"
                    }
                  >
                    <AlertDescription className="flex items-center gap-2">
                      {profilePoints > 0 ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-300">¡Buen trabajo! +{profilePoints} pts</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-rose-400" />
                          <span className="text-rose-300">Configuración insegura. Revisa las recomendaciones.</span>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {configs.map((config) => {
                      const userChoice = configStates[config.id];
                      const isCorrect = userChoice === config.estadoRecomendado;
                      const earned = isCorrect ? config.puntos : 0;

                      return (
                        <div
                          key={config.id}
                          className={`p-4 rounded-lg border ${
                            isCorrect
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : "border-rose-500/30 bg-rose-500/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h5 className="text-white font-medium">{config.nombre}</h5>
                              <Badge
                                className={`text-xs ${getRiskColor(config.riesgo)}`}
                              >
                                {getRiskLabel(config.riesgo)}
                              </Badge>
                              {earned > 0 && (
                                <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                                  +{earned} pts
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                className={`text-xs ${getStateColor(config.estadoRecomendado)}`}
                              >
                                {getStateIcon(config.estadoRecomendado)}
                                Recomendado: {getStateLabel(config.estadoRecomendado)}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  isCorrect
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-rose-500/20 text-rose-300"
                                }`}
                              >
                                {getStateIcon(userChoice || config.estadoActual)}
                                Tu elección: {getStateLabel(userChoice || config.estadoActual)}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm">{config.explicacion}</p>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    size="lg"
                  >
                    {currentProfileIndex < perfiles.length - 1 ? "Siguiente Red Social" : "Ver Resultados Finales"}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}