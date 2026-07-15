"use client";

import { useState, useEffect } from "react";
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
import { Email, Module1Category } from "@/types/module1";

interface EmailAnalysisProps {
  emails: Email[];
  onScore: (points: number, category?: Module1Category) => void;
  onComplete: () => void;
}

export function EmailAnalysis({
  emails,
  onScore,
  onComplete,
}: EmailAnalysisProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showPhishingCheck, setShowPhishingCheck] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [completedEmails, setCompletedEmails] = useState<Set<string>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);

  const currentEmail = emails[currentIndex];

  useEffect(() => {
    if (isCorrect !== null && isCorrect) {
      onScore(earnedPoints);
    }
  }, [isCorrect, earnedPoints, onScore]);

  const handleEmailClick = (emailId: string) => {
    if (showPhishingCheck) return;
    setSelectedEmail(emailId);
    setShowPhishingCheck(true);
  };

  const handleVeredicto = (verdicto: "phishing" | "legitimo") => {
    if (!selectedEmail) return;

    const email = emails.find((e) => e.id === selectedEmail);
    if (!email) return;

    const isPhishing =
      email.remetente.email.includes("netfIix") ||
      email.remetente.email.includes("mercadoliire") ||
      email.remetente.email.includes("banco-nacional") ||
      email.assunto.includes("comprometida") ||
      email.assunto.includes("cupón");

    const correct = (verdicto === "phishing" && isPhishing) ||
      (verdicto === "legitimo" && !isPhishing);

    setIsCorrect(correct);
    const points = correct ? 15 : 0;
    setEarnedPoints(points);
    setTotalPoints((prev) => prev + points);
    setCompletedEmails((prev) => new Set(prev).add(selectedEmail));

    setTimeout(() => {
      setShowPhishingCheck(false);
      setSelectedEmail(null);
      setIsCorrect(null);

      if (currentIndex < emails.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    }, 2500);
  };

  if (!currentEmail) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-300">No hay más correos para analizar.</p>
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
          Correo {currentIndex + 1} de {emails.length}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300">
          {totalPoints} puntos
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentEmail.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`bg-slate-900/50 border-slate-700 cursor-pointer transition-all hover:border-cyan-500/50 ${
              selectedEmail === currentEmail.id
                ? "border-cyan-500 ring-2 ring-cyan-500/20"
                : ""
            }`}
            onClick={() => handleEmailClick(currentEmail.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {currentEmail.remetente.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-white text-lg">
                    {currentEmail.remetente.nome}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {currentEmail.remetente.email}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-slate-400">
                  {currentEmail.dataEnvio}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">
                  {currentEmail.assunto}
                </h3>
                <div className="bg-slate-800/50 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-line">
                  {currentEmail.corpo}
                </div>
              </div>

              {currentEmail.links.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">
                    Enlaces encontrados:
                  </p>
                  {currentEmail.links.map((link, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/30 rounded-lg p-3 border border-slate-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 text-sm">
                          {link.texto}
                        </span>
                        {link.https && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                            HTTPS
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs">
                        Mostrado: {link.urlExibida}
                      </p>
                      <p className="text-amber-400 text-xs">
                        Real: {link.urlReal}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">
                  Señales de alerta:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentEmail.dicasVisuais.map((dica, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-amber-300 border-amber-500/30"
                    >
                      ⚠️ {dica}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {showPhishingCheck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-slate-800/50 border-cyan-500/30">
            <CardContent className="p-6">
              <h4 className="text-white font-semibold mb-4 text-center">
                ¿Qué tipo de correo es este?
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleVeredicto("phishing")}
                  className="bg-rose-600 hover:bg-rose-700 text-white py-6 text-lg"
                >
                  🎣 Phishing
                </Button>
                <Button
                  onClick={() => handleVeredicto("legitimo")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
                >
                  ✅ Legítimo
                </Button>
              </div>
            </CardContent>
          </Card>

          {isCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert
                className={
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500"
                    : "bg-rose-500/10 border-rose-500"
                }
              >
                <AlertDescription className="text-center">
                  {isCorrect ? (
                    <span className="text-emerald-300">
                      ✅ ¡Correcto! +{earnedPoints} puntos
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      ❌ Incorrecto. Este correo era phishing.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
