"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Pen,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Save,
  X,
  Check,
} from "lucide-react";
import { useNotebook, type NotebookEntry } from "@/hooks/useNotebook";
import { MEDIATOR_ENABLED } from "@/lib/featureFlags";

interface NewEntryForm {
  scenarioId: string;
  moduleName: string;
  reflection: string;
  conflictQuestion: string;
  scaffoldingHint: string;
  selfAssessment: number;
}

interface NotebookPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotebookPanel({ isOpen, onClose }: NotebookPanelProps) {
  const { entries, addEntry, clearEntries } =
    useNotebook();

  const [showForm, setShowForm] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [newEntry, setNewEntry] = useState<NewEntryForm>({
    scenarioId: "",
    moduleName: "",
    reflection: "",
    conflictQuestion: "",
    scaffoldingHint: "",
    selfAssessment: 3,
  });

  const totalEntries = entries.length;
  const currentEntry = entries[currentEntryIndex];
  const currentIndex = currentEntryIndex;

  const handleAddEntry = useCallback(() => {
    if (!newEntry.reflection.trim() || !newEntry.moduleName.trim()) return;

    const entry: Omit<NotebookEntry, "id" | "timestamp"> = {
      scenarioId: newEntry.scenarioId || "manual",
      moduleName: newEntry.moduleName,
      reflection: newEntry.reflection,
      conflictQuestion: newEntry.conflictQuestion || "",
      scaffoldingHint: newEntry.scaffoldingHint || "",
      selfAssessment: newEntry.selfAssessment,
    };

    addEntry(entry);
    setNewEntry({
      scenarioId: "",
      moduleName: "",
      reflection: "",
      conflictQuestion: "",
      scaffoldingHint: "",
      selfAssessment: 3,
    });
    setShowForm(false);
  }, [newEntry, addEntry]);

  const handleClearAll = useCallback(() => {
    if (confirm("¿Seguro que quieres borrar todas las entradas del cuaderno?")) {
      clearEntries();
      setCurrentEntryIndex(0);
    }
  }, [clearEntries]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentEntryIndex(currentIndex - 1);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < totalEntries - 1) setCurrentEntryIndex(currentIndex + 1);
  }, [currentIndex, totalEntries]);

  if (!MEDIATOR_ENABLED) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl"
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="absolute right-0 top-0 h-full bg-slate-900 border-l border-slate-700 flex flex-col"
        >
          <Card className="flex-1 flex flex-col h-full m-4">
            <CardHeader className="flex items-center justify-between border-b border-slate-700">
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Cuaderno de Reflexión
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {showForm ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="text-lg font-medium text-white">Nueva Entrada</h4>

                  <input
                    type="text"
                    placeholder="ID del escenario / actividad (ej: email-001)"
                    value={newEntry.scenarioId}
                    onChange={(e) => setNewEntry({ ...newEntry, scenarioId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Módulo (ej: Módulo 1 - Análisis de Correos)"
                    value={newEntry.moduleName}
                    onChange={(e) => setNewEntry({ ...newEntry, moduleName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <textarea
                    placeholder="¿Qué aprendiste? ¿Qué estrategia usaste?"
                    value={newEntry.reflection}
                    onChange={(e) => setNewEntry({ ...newEntry, reflection: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                  <textarea
                    placeholder="¿Qué pregunta o conflicto surgió durante la actividad?"
                    value={newEntry.conflictQuestion}
                    onChange={(e) => setNewEntry({ ...newEntry, conflictQuestion: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                  <textarea
                    placeholder="¿Qué pista o ayuda te habría sido útil?"
                    value={newEntry.scaffoldingHint}
                    onChange={(e) => setNewEntry({ ...newEntry, scaffoldingHint: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 flex items-center justify-between">
                      Autoevaluación: <span className="font-mono text-cyan-400">{newEntry.selfAssessment}</span> / 5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newEntry.selfAssessment}
                      onChange={(e) => setNewEntry({ ...newEntry, selfAssessment: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Confundido</span>
                      <span>Dominado</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleAddEntry} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Entrada
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              ) : totalEntries === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <BookOpen className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Cuaderno vacío</h3>
                  <p className="text-slate-500 mb-6">
                    Cuando completes un módulo con el mediador educativo, se te invitará
                    a reflexionar. Esas reflexiones se guardarán aquí automáticamente.
                  </p>
                  <Button onClick={() => setShowForm(true)} className="w-full max-w-xs">
                    <Pen className="w-4 h-4 mr-2" />
                    Crear primera entrada manual
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Entradas del Cuaderno</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goPrevious}
                        disabled={currentIndex === 0}
                        className="text-slate-400"
                        aria-label="Entrada anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <span className="text-sm text-slate-300 min-w-[60px] text-center">
                        {currentIndex + 1} / {totalEntries}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goNext}
                        disabled={currentIndex === totalEntries - 1}
                        className="text-slate-400"
                        aria-label="Siguiente entrada"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {currentEntry && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {currentEntry.moduleName}
                        </Badge>
                        <Badge variant="outline" className="text-cyan-300 border-cyan-500/50">
                          {currentEntry.scenarioId}
                        </Badge>
                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(currentEntry.timestamp).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="space-y-2 text-slate-300">
                        <p><strong>Reflexión:</strong> {currentEntry.reflection}</p>
                        {currentEntry.conflictQuestion && (
                          <p><strong>Conflicto:</strong> {currentEntry.conflictQuestion}</p>
                        )}
                        {currentEntry.scaffoldingHint && (
                          <p><strong>Pista útil:</strong> {currentEntry.scaffoldingHint}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Autoevaluación:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-6 h-6 flex items-center justify-center text-sm font-mono rounded ${
                                  i < currentEntry.selfAssessment
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                                    : "bg-slate-700 text-slate-500 border border-slate-600"
                                }`}
                              >
                                {i + 1}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-700">
                    <Button onClick={() => setShowForm(true)} className="flex-1">
                      <Pen className="w-4 h-4 mr-2" />
                      Nueva Entrada
                    </Button>
                    {totalEntries > 0 && (
                      <Button variant="destructive" onClick={handleClearAll} className="flex-1">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Borrar Todo
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}