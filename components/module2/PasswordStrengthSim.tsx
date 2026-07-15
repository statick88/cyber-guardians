"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, XCircle, Zap, Key, Eye, EyeOff, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Module2Category } from "@/types/module2";

interface PasswordStrengthSimProps {
  onScore: (points: number, category?: Module2Category) => void;
  onComplete: () => void;
}

interface PasswordAnalysis {
  entropy: number;
  crackTime: string;
  crackTimeSeconds: number;
  strength: "muy-debil" | "debil" | "media" | "fuerte" | "muy-fuerte";
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommonPatterns: boolean;
    noSequential: boolean;
    noRepeated: boolean;
  };
  feedback: string[];
}

const WEAK_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "welcome",
  "letmein",
  "monkey",
  "dragon",
];

const COMMON_PATTERNS = [
  /(.)\1{2,}/, // repeated chars
  /(012|123|234|345|456|567|678|789|890)/, // sequential numbers
  /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // sequential letters
  /(qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|jklz|zxcv|xcvb|cvbn|vbnm)/i, // keyboard patterns
];

function calculateEntropy(password: string): PasswordAnalysis {
  if (!password) {
    return {
      entropy: 0,
      crackTime: "Instantáneo",
      crackTimeSeconds: 0,
      strength: "muy-debil",
      checks: {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
        noCommonPatterns: true,
        noSequential: true,
        noRepeated: true,
      },
      feedback: ["Escribe una contraseña para analizar"],
    };
  }

  const length = password.length;
  let poolSize = 0;
  const checks = {
    length: length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
    noCommonPatterns: !WEAK_PASSWORDS.some(w => password.toLowerCase().includes(w)),
    noSequential: !COMMON_PATTERNS.some(p => p.test(password)),
    noRepeated: !/(.)\1{2,}/.test(password),
  };

  if (checks.lowercase) poolSize += 26;
  if (checks.uppercase) poolSize += 26;
  if (checks.numbers) poolSize += 10;
  if (checks.symbols) poolSize += 32;

  const entropy = poolSize > 0 ? Math.log2(Math.pow(poolSize, length)) : 0;

  const guessesPerSecond = 1e12; // 1 trillion guesses/second (modern GPU cluster)
  const crackTimeSeconds = Math.pow(2, entropy) / (2 * guessesPerSecond);

  let crackTime: string;
  if (crackTimeSeconds < 1) crackTime = "Instantáneo";
  else if (crackTimeSeconds < 60) crackTime = `${Math.round(crackTimeSeconds)} segundos`;
  else if (crackTimeSeconds < 3600) crackTime = `${Math.round(crackTimeSeconds / 60)} minutos`;
  else if (crackTimeSeconds < 86400) crackTime = `${Math.round(crackTimeSeconds / 3600)} horas`;
  else if (crackTimeSeconds < 31536000) crackTime = `${Math.round(crackTimeSeconds / 86400)} días`;
  else if (crackTimeSeconds < 3153600000) crackTime = `${Math.round(crackTimeSeconds / 31536000)} años`;
  else crackTime = "Siglos";

  let strength: PasswordAnalysis["strength"] = "muy-debil";
  if (entropy >= 80) strength = "muy-fuerte";
  else if (entropy >= 60) strength = "fuerte";
  else if (entropy >= 40) strength = "media";
  else if (entropy >= 25) strength = "debil";

  const feedback: string[] = [];
  if (!checks.length) feedback.push("Mínimo 12 caracteres (ideal 16+)");
  if (!checks.lowercase) feedback.push("Añade minúsculas");
  if (!checks.uppercase) feedback.push("Añade mayúsculas");
  if (!checks.numbers) feedback.push("Añade números");
  if (!checks.symbols) feedback.push("Añade símbolos (!@#$%...)");
  if (!checks.noCommonPatterns) feedback.push("Evita palabras comunes (password, 123456, etc.)");
  if (!checks.noSequential) feedback.push("Evita secuencias (abc, 123, qwerty)");
  if (!checks.noRepeated) feedback.push("Evita caracteres repetidos (aaa, 111)");

  return {
    entropy: Math.round(entropy * 10) / 10,
    crackTime,
    crackTimeSeconds,
    strength,
    checks,
    feedback,
  };
}

const CHALLENGE_PASSWORDS = [
  { weak: "password", label: "Contraseña #1" },
  { weak: "12345678", label: "Contraseña #2" },
  { weak: "qwerty123", label: "Contraseña #3" },
  { weak: "juan2024", label: "Contraseña #4" },
];

const STRENGTH_CONFIG = {
  "muy-debil": { color: "rose", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", label: "MUY DÉBIL" },
  "debil": { color: "rose", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", label: "DÉBIL" },
  "media": { color: "amber", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "MEDIA" },
  "fuerte": { color: "emerald", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "FUERTE" },
  "muy-fuerte": { color: "cyan", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", label: "INQUEBRANTABLE" },
};

export function PasswordStrengthSim({ onScore, onComplete }: PasswordStrengthSimProps) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const challenge = CHALLENGE_PASSWORDS[currentChallenge];

  useEffect(() => {
    setPassword(challenge.weak);
    setAnalysis(calculateEntropy(challenge.weak));
    setShowPassword(false);
  }, [currentChallenge]);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setAnalysis(calculateEntropy(value));
  }, []);

  const handleStrengthen = useCallback(() => {
    if (!analysis) return;
    
    const passedChecks = Object.values(analysis.checks).filter(Boolean).length;
    const totalChecks = Object.keys(analysis.checks).length;
    const percentage = passedChecks / totalChecks;
    
    let points = 0;
    if (analysis.strength === "muy-fuerte") points = 25;
    else if (analysis.strength === "fuerte") points = 20;
    else if (analysis.strength === "media") points = 10;
    else if (analysis.strength === "debil") points = 5;
    else points = 0;

    setEarnedPoints(points);
    setTotalPoints(prev => prev + points);
    setCompleted(prev => new Set(prev).add(currentChallenge));
    setShowResults(true);

    setTimeout(() => {
      if (points > 0) onScore(points, "boveda-contrasenas");
    }, 100);
  }, [analysis, currentChallenge, onScore]);

  const handleNext = useCallback(() => {
    setShowResults(false);
    setEarnedPoints(0);
    setPassword("");
    
    if (currentChallenge + 1 < CHALLENGE_PASSWORDS.length) {
      setCurrentChallenge(prev => prev + 1);
    } else {
      onScore(totalPoints, "boveda-contrasenas");
      onComplete();
    }
  }, [currentChallenge, totalPoints, onScore, onComplete]);

  const handleRetry = useCallback(() => {
    setShowResults(false);
    setEarnedPoints(0);
    setPassword(challenge.weak);
    setAnalysis(calculateEntropy(challenge.weak));
  }, [challenge.weak]);

  const config = STRENGTH_CONFIG[analysis?.strength || "muy-debil"];

  if (!challenge) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-slate-300">
          Reto {currentChallenge + 1} de {CHALLENGE_PASSWORDS.length}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">
          {totalPoints} pts
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentChallenge}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                {challenge.label}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Fortalece esta contraseña débil hasta que sea inquebrantable
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Password Input */}
              <div className="space-y-3">
                <label className="block text-slate-300 text-sm font-medium">Contraseña actual:</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Escribe tu contraseña..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 font-mono text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    autoComplete="new-password"
                    aria-label="Contraseña a analizar"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-mono font-bold ${config.text}`}>
                    {config.label}
                  </span>
                  <span className="text-slate-400 text-sm font-mono">
                    Entropía: {analysis?.entropy || 0} bits
                  </span>
                </div>
                <Progress 
                  value={Math.min((analysis?.entropy || 0) / 80 * 100, 100)} 
                  className="h-3"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>0 bits</span>
                  <span>80+ bits (Inquebrantable)</span>
                </div>
              </div>

              {/* Crack Time Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
              >
                <div className="flex items-center gap-3">
                  <Zap className={`w-6 h-6 ${config.text}`} />
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm">Tiempo estimado para descifrar por fuerza bruta:</p>
                    <p className={`${config.text} text-2xl font-bold font-mono`}>
                      {analysis?.crackTime || "Instantáneo"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Basado en 1 billón de intentos/segundo (cluster GPU moderno)
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Security Checks */}
              {analysis && (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm font-medium">Comprobaciones de seguridad:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(analysis.checks).map(([key, passed]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          passed 
                            ? "bg-emerald-500/10 border border-emerald-500/30" 
                            : "bg-rose-500/10 border border-rose-500/30"
                        }`}
                      >
                        {passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${passed ? "text-emerald-300" : "text-rose-300"}`}>
                          {key === "length" && "Longitud ≥ 12"}
                          {key === "lowercase" && "Minúsculas"}
                          {key === "uppercase" && "Mayúsculas"}
                          {key === "numbers" && "Números"}
                          {key === "symbols" && "Símbolos"}
                          {key === "noCommonPatterns" && "Sin patrones comunes"}
                          {key === "noSequential" && "Sin secuencias"}
                          {key === "noRepeated" && "Sin repeticiones"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {analysis && analysis.feedback.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Sugerencias para mejorar:
                  </p>
                  <ul className="space-y-1 text-slate-300 text-sm">
                    {analysis.feedback.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-amber-400">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={showResults}
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reiniciar
                </Button>
                <Button
                  onClick={handleStrengthen}
                  disabled={showResults || !analysis || analysis.strength !== "muy-fuerte"}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
                  size="lg"
                >
                  {analysis?.strength === "muy-fuerte" 
                    ? <> <CheckCircle className="w-4 h-4 mr-2" /> ¡Inquebrantable! </> 
                    : <> <Target className="w-4 h-4 mr-2" /> Fortalecer </>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Results Modal */}
      {showResults && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleNext}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/95 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                earnedPoints > 0 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-rose-500/10 border border-rose-500/30"
              }`}>
                {earnedPoints > 0 ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${earnedPoints > 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {earnedPoints > 0 ? "¡Contraseña Inquebrantable!" : "Sigue intentándolo"}
              </h3>
              <p className="text-slate-400 mb-4">
                {earnedPoints > 0 
                  ? `Ganaste ${earnedPoints} puntos. La contraseña tardaría ${analysis?.crackTime} en descifrarse.`
                  : "Necesitas alcanzar el nivel 'Inquebrantable' (80+ bits de entropía)."
                }
              </p>
              <Button 
                onClick={handleNext}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                size="lg"
              >
                {currentChallenge + 1 < CHALLENGE_PASSWORDS.length ? "Siguiente Reto" : "Ver Resultados Finales"}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}