"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useQuizSound from "@/hooks/useQuizSound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, Smartphone, Key, Bell, Check, X, AlertTriangle, CheckCircle, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";
import { Module2Category } from "@/types/module2";

interface MFASimulatorProps {
  onScore: (points: number, category?: Module2Category) => void;
  onComplete: () => void;
}

const SCENARIOS = [
  { id: "mfa-1", service: "Email Principal", icon: "mail", description: "Tu email es la llave maestra. Elige el 2FA mas resistente al phishing y SIM swapping.", correctMethod: "hardware", methods: ["sms", "email", "app", "hardware", "passkey"], points: 25 },
  { id: "mfa-2", service: "Banca Online", icon: "bank", description: "Objetivo #1 de atacantes. El banco ofrece SMS, app bancaria y token fisico.", correctMethod: "hardware", methods: ["sms", "app", "hardware"], points: 25 },
  { id: "mfa-3", service: "Red Social (Instagram/TikTok)", icon: "smartphone", description: "Cuenta de creador con miles de seguidores. Necesitas seguridad y recuperabilidad.", correctMethod: "app", methods: ["sms", "app", "push"], points: 20 },
  { id: "mfa-4", service: "Gestor de Contrasenas (Bitwarden/1Password)", icon: "lock", description: "Tu boveda maestra. Si la comprometen, tienen TODO. Prioridad maxima.", correctMethod: "hardware", methods: ["email", "app", "hardware", "passkey"], points: 30 },
];

const METHOD_INFO = {
  sms: { name: "SMS", icon: "phone", level: "bajo", color: "rose", desc: "Vulnerable a SIM swapping, SS7, malware" },
  email: { name: "Email", icon: "mail", level: "bajo", color: "rose", desc: "Si comprometen tu email, comprometen el 2FA" },
  app: { name: "App Autenticadora (TOTP)", icon: "shield", level: "alto", color: "emerald", desc: "Codigos locales, sin red. Backup encriptado (Authy)" },
  push: { name: "Push (Duo, MS Authenticator)", icon: "bell", level: "medio", color: "amber", desc: "Riesgo MFA fatigue/bombing, aprobacion accidental" },
  hardware: { name: "Llave Hardware FIDO2 (YubiKey)", icon: "key", level: "maximo", color: "cyan", desc: "Inmune a phishing. Requiere toque fisico. Estandar oro" },
  passkey: { name: "Passkeys (FaceID/Windows Hello)", icon: "unlock", level: "maximo", color: "purple", desc: "Sin contrasena. WebAuthn. Resistente a phishing" },
} as const;

type Scenario = (typeof SCENARIOS)[number];
type MethodKey = keyof typeof METHOD_INFO;
type MethodInfo = (typeof METHOD_INFO)[MethodKey];

interface LearnPhaseProps {
  totalPoints: number;
  onContinue: () => void;
}

function LearnPhaseContent({ totalPoints, onContinue }: LearnPhaseProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">Fase 1: Aprende los Metodos 2FA</Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">{totalPoints} pts</Badge>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key="learn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <Card className="bg-slate-900/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" />Jerarquia de Seguridad 2FA (Maximo - Minimo)</CardTitle>
              <CardDescription className="text-slate-400">No todos los 2FA son iguales. Elige el mas fuerte que tu servicio soporte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.entries(METHOD_INFO) as [MethodKey, MethodInfo][])
                .sort((a, b) => {
                  const order: Record<string, number> = { maximo: 0, alto: 1, medio: 2, bajo: 3 };
                  return order[a[1].level] - order[b[1].level];
                })
                .map(([id, method]) => (
                  <motion.div key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className={`p-4 rounded-lg border flex items-center gap-4 ${method.color === "rose" ? "border-rose-500/30 bg-rose-500/5" : method.color === "amber" ? "border-amber-500/30 bg-amber-500/5" : method.color === "emerald" ? "border-emerald-500/30 bg-emerald-500/5" : method.color === "cyan" ? "border-cyan-500/30 bg-cyan-500/5" : "border-purple-500/30 bg-purple-500/5"}`}>
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl">{method.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{method.name}</h4>
                        <Badge className={`text-xs ${method.color === "rose" ? "bg-rose-500/20 text-rose-300" : method.color === "amber" ? "bg-amber-500/20 text-amber-300" : method.color === "emerald" ? "bg-emerald-500/20 text-emerald-300" : method.color === "cyan" ? "bg-cyan-500/20 text-cyan-300" : "bg-purple-500/20 text-purple-300"}`}>{method.level.toUpperCase()}</Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{method.desc}</p>
                    </div>
                  </motion.div>
                ))}
            </CardContent>
          </Card>
          <Button onClick={onContinue} className="w-full bg-cyan-600 hover:bg-cyan-700 text-lg py-4" size="lg">Continuar a Practica Interactiva &rarr;</Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PracticePhaseProps {
  scenario: Scenario;
  method: MethodInfo;
  totpCode: string;
  timeLeft: number;
  successfulAuths: number;
  attempts: number;
  fatigueAttackCount: number;
  showFatigueAttack: boolean;
  onTokenSubmit: () => void;
  onFatigueReject: () => void;
  onFinishPractice: () => void;
  totalPoints: number;
}

function PracticePhaseContent({
  scenario,
  method,
  totpCode,
  timeLeft,
  successfulAuths,
  attempts,
  fatigueAttackCount,
  showFatigueAttack,
  onTokenSubmit,
  onFatigueReject,
  onFinishPractice,
  totalPoints,
}: PracticePhaseProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">Practica: {scenario.service}</Badge>
        <div className="flex gap-2">
          <Badge className="bg-purple-500/20 text-purple-300">{scenario.icon} {scenario.service}</Badge>
          <Badge className="bg-cyan-500/20 text-cyan-300">{totalPoints} pts</Badge>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={scenario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Smartphone className="w-5 h-5 text-cyan-400" />Simulador de Autenticacion MFA</CardTitle>
              <CardDescription className="text-slate-400">Intercepta el token TOTP antes de que expire. Cuidado con el MFA Fatigue!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative max-w-xs mx-auto">
                <div className="bg-slate-950 rounded-2xl border-4 border-slate-700 p-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-slate-400 text-xs">Autenticadora</span>
                    </div>
                    <Badge className={`bg-${method.color}-500/20 text-${method.color}-300`}>{method.level.toUpperCase()}</Badge>
                  </div>

                  <motion.div key={totpCode} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs">{scenario.service}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className={`font-mono ${timeLeft <= 3 ? "text-rose-400 animate-pulse" : "text-cyan-400"}`}>{timeLeft.toString().padStart(2, "0")}s</span>
                      </div>
                    </div>
                    <div className="font-mono text-3xl font-bold text-white tracking-widest text-center select-all">
                      {totpCode.slice(0, 3)} {totpCode.slice(3)}
                    </div>
                  </motion.div>

                  <Progress value={(timeLeft / 15) * 100} className="h-2" />

                  <div className="space-y-3 mt-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Ingresa el codigo de 6 digitos"
                      value=""
                      onChange={(e) => {
                        if (e.target.value.length === 6 && /^\d{6}$/.test(e.target.value)) onTokenSubmit();
                      }}
                      onKeyDown={(e) => e.key === "Enter" && onTokenSubmit()}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                    <Button onClick={onTokenSubmit} className="w-full bg-cyan-600 hover:bg-cyan-700" size="lg">
                      <Key className="w-4 h-4 mr-2" />Autenticar
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mt-4">
                    <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-2xl font-bold text-emerald-400">{successfulAuths}</div><div className="text-xs text-slate-400">Exitosos</div></div>
                    <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-2xl font-bold text-amber-400">{attempts}</div><div className="text-xs text-slate-400">Intentos</div></div>
                    <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-2xl font-bold text-rose-400">{fatigueAttackCount}</div><div className="text-xs text-slate-400">Fatiga</div></div>
                  </div>
                </div>
              </div>

              {showFatigueAttack && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-950/95 border-2 border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-center">
                    <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-rose-300 mb-2">MFA FATIGUE DETECTADO!</h3>
                    <p className="text-slate-300 mb-4">Recibes notificaciones push seguidas. El atacante espera que te canses y apruebes por error.</p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={onFatigueReject} className="flex-1 min-h-[44px] border-rose-500 text-rose-300 hover:bg-rose-500/10">
                        <X className="w-4 h-4 mr-2" />DENEGAR (Correcto)
                      </Button>
                      <Button onClick={() => {}} className="flex-1 min-h-[44px] bg-rose-600 hover:bg-rose-700">
                        <Check className="w-4 h-4 mr-2" />Aprobar (TRAMPA!)
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Button onClick={onFinishPractice} className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
        Finalizar Practica
      </Button>
    </div>
  );
}

function CompletePhaseContent({ totalPoints, successfulAuths, fatigueAttackCount, fatigueCount, onFinish, onRetry }: { totalPoints: number; successfulAuths: number; fatigueAttackCount: number; fatigueCount: number; onFinish: () => void; onRetry: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
          <Shield className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-300 mb-2">MFA Completado!</h3>
        <p className="text-slate-400 mb-6">Puntos: <span className="text-white font-bold text-xl">{totalPoints}</span></p>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-slate-800/50 rounded-lg p-3"><div className="text-emerald-400 font-bold">{successfulAuths}</div><div className="text-slate-500">Autenticaciones exitosas</div></div>
          <div className="bg-slate-800/50 rounded-lg p-3"><div className="text-rose-400 font-bold">{fatigueAttackCount > 0 ? "Resististe" : "Sin ataques"}</div><div className="text-slate-500">MFA Fatigue</div></div>
          <div className="bg-slate-800/50 rounded-lg p-3 col-span-2"><div className="text-cyan-400 font-bold">{fatigueCount}</div><div className="text-slate-500">Notificaciones trampa denegadas</div></div>
        </div>
      </motion.div>
      <Button onClick={onFinish} className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">Finalizar</Button>
      <Button variant="outline" onClick={onRetry} className="w-full border-slate-600 text-slate-300">
        <RotateCcw className="w-4 h-4 mr-2" />Reintentar Modulo
      </Button>
    </div>
  );
}

export function MFASimulator({ onScore, onComplete }: MFASimulatorProps) {
  const [phase, setPhase] = useState<"learn" | "practice" | "complete">("learn");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [fatigueCount, setFatigueCount] = useState(0);
  const [totpCode, setTotpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [successfulAuths, setSuccessfulAuths] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFatigueAttack, setShowFatigueAttack] = useState(false);
  const [fatigueAttackCount, setFatigueAttackCount] = useState(0);
  const { playCorrect, playIncorrect } = useQuizSound();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fatigueIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = SCENARIOS[currentScenario];
  const method = METHOD_INFO[scenario.correctMethod as MethodKey];

  const generateNewToken = useCallback(() => {
    const nt = Math.floor(100000 + Math.random() * 900000).toString();
    setTotpCode(nt);
  }, []);

  // TOTP Timer
  useEffect(() => {
    if (phase !== "practice") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewToken();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, generateNewToken]);

  // MFA Fatigue attack simulation
  useEffect(() => {
    if (!showFatigueAttack || phase !== "practice") return;
    fatigueIntervalRef.current = setInterval(() => {
      setFatigueAttackCount((prev) => {
        if (prev >= 5) {
          if (fatigueIntervalRef.current) clearInterval(fatigueIntervalRef.current);
          setShowFatigueAttack(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => { if (fatigueIntervalRef.current) clearInterval(fatigueIntervalRef.current); };
  }, [showFatigueAttack, phase]);

  // Show toast warning when fatigue attack starts
  useEffect(() => {
    if (showFatigueAttack) {
      toast.warning("ATAQUE DE FATIGA MFA", {
        description: "Recibes notificaciones push seguidas. El atacante espera que te canses y apruebes por error. DENEGA inmediatamente.",
        duration: 6000,
        className: "glass-card neon-border",
      });
    }
  }, [showFatigueAttack]);

  const handleLearnContinue = () => {
    setPhase("practice");
    generateNewToken();
  };

  const handleTokenSubmit = () => {
    playCorrect();
    setSuccessfulAuths((p) => p + 1);
    setAttempts((p) => p + 1);
    generateNewToken();
    if (successfulAuths >= 2 && Math.random() > 0.5 && !showFatigueAttack) {
      setTimeout(() => setShowFatigueAttack(true), 1000);
    }
  };

  const handleFatigueReject = () => {
    playIncorrect();
    setFatigueCount((p) => p + 1);
    setFatigueAttackCount((p) => p + 1);
    setShowFatigueAttack(false);
  };

  const handleFinishPractice = () => {
    const bonusPoints = successfulAuths * 5 + (fatigueCount > 0 ? 10 : 0);
    setTotalPoints((p) => p + bonusPoints);
    setPhase("complete");
  };

  const handleFinish = () => {
    onScore(totalPoints, "autenticacion-2fa");
    onComplete();
  };

  const handleRetry = () => {
    setCurrentScenario(0);
    setTotalPoints(0);
    setPhase("learn");
    setSuccessfulAuths(0);
    setAttempts(0);
    setFatigueCount(0);
    setFatigueAttackCount(0);
  };

  if (phase === "learn") return <LearnPhaseContent totalPoints={totalPoints} onContinue={handleLearnContinue} />;
  if (phase === "practice") return (
    <PracticePhaseContent
      scenario={scenario}
      method={method}
      totpCode={totpCode}
      timeLeft={timeLeft}
      successfulAuths={successfulAuths}
      attempts={attempts}
      fatigueAttackCount={fatigueAttackCount}
      showFatigueAttack={showFatigueAttack}
      onTokenSubmit={handleTokenSubmit}
      onFatigueReject={handleFatigueReject}
      onFinishPractice={handleFinishPractice}
      totalPoints={totalPoints}
    />
  );
  if (phase === "complete") return (
    <CompletePhaseContent
      totalPoints={totalPoints}
      successfulAuths={successfulAuths}
      fatigueAttackCount={fatigueAttackCount}
      fatigueCount={fatigueCount}
      onFinish={handleFinish}
      onRetry={handleRetry}
    />
  );
  return null;
}
