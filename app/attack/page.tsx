'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MODULE_ATTACK_MAPPINGS, ALL_UNIQUE_TECHNIQUES } from '@/data/attack-mapping';
import { TACTIC_LABELS } from '@/types/attack';
import type { AttackTactic } from '@/types/attack';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

// ─── Tactic Badge Color Map ───────────────────────────────────────────────────

const TACTIC_COLORS: Record<AttackTactic, string> = {
  'initial-access': 'bg-red-900/60 text-red-200 border-red-700/50',
  'execution': 'bg-orange-900/60 text-orange-200 border-orange-700/50',
  'persistence': 'bg-yellow-900/60 text-yellow-200 border-yellow-700/50',
  'privilege-escalation': 'bg-amber-900/60 text-amber-200 border-amber-700/50',
  'defense-evasion': 'bg-lime-900/60 text-lime-200 border-lime-700/50',
  'credential-access': 'bg-green-900/60 text-green-200 border-green-700/50',
  'lateral-movement': 'bg-cyan-900/60 text-cyan-200 border-cyan-700/50',
  'exfiltration': 'bg-blue-900/60 text-blue-200 border-blue-700/50',
  'impact': 'bg-purple-900/60 text-purple-200 border-purple-700/50',
  'reconnaissance': 'bg-pink-900/60 text-pink-200 border-pink-700/50',
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AttackReferencePage() {
  const [selectedTactic, setSelectedTactic] = useState<AttackTactic | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  // Filtered techniques based on active filters
  const filteredTechniques = useMemo(() => {
    let result = ALL_UNIQUE_TECHNIQUES;

    if (selectedTactic) {
      result = result.filter((t) => t.tactic === selectedTactic);
    }

    if (selectedModule !== null) {
      result = result.filter((t) => t.moduleIds.includes(selectedModule));
    }

    return result;
  }, [selectedTactic, selectedModule]);

  // Collect all unique tactics from the data
  const allTactics = useMemo(() => {
    const set = new Set<AttackTactic>();
    ALL_UNIQUE_TECHNIQUES.forEach((t) => set.add(t.tactic));
    return Array.from(set).sort();
  }, []);

  const clearFilters = () => {
    setSelectedTactic(null);
    setSelectedModule(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              MITRE ATT&CK — Referencia
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-6">
              Técnicas de adversarios mapeadas al framework MITRE ATT&CK v19,
              organizadas por módulo del curso.
            </p>
            <p className="text-sm text-slate-400">
              {ALL_UNIQUE_TECHNIQUES.length} técnicas únicas ·{' '}
              {MODULE_ATTACK_MAPPINGS.length} módulos ·{' '}
              {allTactics.length} tácticas
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Tactic filter chips */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
              <Filter className="w-4 h-4" />
              <span>Filtrar por táctica:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTactics.map((tactic) => (
                <motion.button
                  key={tactic}
                  variants={fadeInUp}
                  onClick={() =>
                    setSelectedTactic(selectedTactic === tactic ? null : tactic)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedTactic === tactic
                      ? 'ring-2 ring-white/50 scale-105 ' + TACTIC_COLORS[tactic]
                      : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                >
                  {TACTIC_LABELS[tactic]}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Module filter chips */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
              <Filter className="w-4 h-4" />
              <span>Filtrar por módulo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MODULE_ATTACK_MAPPINGS.map((m) => (
                <motion.button
                  key={m.moduleId}
                  variants={fadeInUp}
                  onClick={() =>
                    setSelectedModule(selectedModule === m.moduleId ? null : m.moduleId)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedModule === m.moduleId
                      ? 'ring-2 ring-white/50 scale-105 bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                >
                  Módulo {m.moduleId}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(selectedTactic || selectedModule !== null) && (
            <motion.div variants={fadeInUp} className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-400 hover:text-white"
              >
                Limpiar filtros
              </Button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Technique Table */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg">
                {filteredTechniques.length} técnicas encontradas
              </CardTitle>
              <CardDescription className="text-slate-400">
                {selectedTactic
                  ? `Táctica: ${TACTIC_LABELS[selectedTactic]}`
                  : 'Todas las tácticas'}
                {selectedModule !== null
                  ? ` · Módulo ${selectedModule}`
                  : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Táctica</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Módulos</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTechniques.map((technique, i) => (
                      <motion.tr
                        key={technique.id}
                        variants={fadeInUp}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-red-300 font-bold">
                          {technique.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {technique.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs border ${TACTIC_COLORS[technique.tactic]}`}
                          >
                            {TACTIC_LABELS[technique.tactic]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {technique.moduleIds.map((mid) => (
                              <span
                                key={mid}
                                className="inline-block px-1.5 py-0.5 rounded text-xs bg-slate-700/50 text-slate-300"
                              >
                                M{mid}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                          {technique.description}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* MITRE ATT&CK attribution */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mt-8 text-center text-xs text-slate-500"
        >
          <p>
            Datos del framework MITRE ATT&CK® —{' '}
            <a
              href="https://attack.mitre.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-300"
            >
              attack.mitre.org
            </a>
          </p>
          <p className="mt-1">
            MITRE ATT&CK es una marca registrada de The MITRE Corporation.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
