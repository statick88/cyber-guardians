/**
 * DebriefDialog — evaluateRubric tests
 *
 * Tests the pure keyword-matching rubric evaluation function.
 * No React rendering needed — pure function tests.
 *
 * Requires: vitest
 * Run: pnpm test components/mediator/__tests__/DebriefDialog.rubric.test.ts
 */
import { describe, it, expect } from 'vitest'
import { evaluateRubric } from '../DebriefDialog'
import type { AssessmentRubric } from '@/types/educational'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const rubric: AssessmentRubric = {
  maxScore: 100,
  criteria: [
    { keyword: 'remitente', points: 20, feedback: 'Identificó el remitente sospechoso' },
    { keyword: 'urgencia', points: 20, feedback: 'Detectó tono de urgencia' },
    { keyword: 'enlace', points: 30, feedback: 'Reconoció enlace peligroso' },
    { keyword: 'credenciales', points: 30, feedback: 'Mencionó robo de credenciales' },
  ],
  feedbackTemplate: 'Buen análisis. Continúa practicando.',
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('evaluateRubric', () => {
  it('should return 0 when no keywords match', () => {
    const result = evaluateRubric('No sé nada sobre esto', rubric)

    expect(result.score).toBe(0)
    expect(result.maxScore).toBe(100)
    expect(result.percentage).toBe(0)
    expect(result.criteria.every((c) => c.matched)).toBe(false)
    expect(result.feedback).toBe(rubric.feedbackTemplate)
  })

  it('should return full score when all keywords match', () => {
    const result = evaluateRubric(
      'El remitente es sospechoso porque hay tono de urgencia y el enlace es peligroso. Piden credenciales.',
      rubric
    )

    expect(result.score).toBe(100)
    expect(result.maxScore).toBe(100)
    expect(result.percentage).toBe(100)
    expect(result.criteria.every((c) => c.matched)).toBe(true)
  })

  it('should be case-insensitive', () => {
    const result = evaluateRubric(
      'El REMITENTE es sospechoso. Hay URGENCIA.',
      rubric
    )

    expect(result.score).toBe(40) // remitente (20) + urgencia (20)
    expect(result.criteria.filter((c) => c.matched)).toHaveLength(2)
  })

  it('should match partial keywords within words', () => {
    const result = evaluateRubric(
      'El remitente desconocido envió un enlace malicioso.',
      rubric
    )

    // 'remitente' matches 'El remitente', 'enlace' matches 'un enlace'
    expect(result.score).toBe(50) // remitente (20) + enlace (30)
    expect(result.criteria.filter((c) => c.matched)).toHaveLength(2)
  })

  it('should compute correct percentage', () => {
    const result = evaluateRubric(
      'urgencia credenciales',
      rubric
    )

    expect(result.score).toBe(50) // urgencia (20) + credenciales (30)
    expect(result.maxScore).toBe(100)
    expect(result.percentage).toBe(50)
  })

  it('should handle empty response', () => {
    const result = evaluateRubric('', rubric)

    expect(result.score).toBe(0)
    expect(result.percentage).toBe(0)
    expect(result.criteria.every((c) => c.matched)).toBe(false)
  })

  it('should handle rubric with single criterion', () => {
    const singleRubric: AssessmentRubric = {
      maxScore: 100,
      criteria: [
        { keyword: 'phishing', points: 100, feedback: 'Identificó phishing' },
      ],
      feedbackTemplate: 'Template.',
    }

    const match = evaluateRubric('Esto es phishing', singleRubric)
    expect(match.score).toBe(100)
    expect(match.percentage).toBe(100)

    const noMatch = evaluateRubric('Esto es seguro', singleRubric)
    expect(noMatch.score).toBe(0)
    expect(noMatch.percentage).toBe(0)
  })

  it('should return criteria with matched boolean per criterion', () => {
    const result = evaluateRubric('remitente urgencia', rubric)

    expect(result.criteria).toHaveLength(4)
    expect(result.criteria[0].matched).toBe(true)  // remitente
    expect(result.criteria[1].matched).toBe(true)  // urgencia
    expect(result.criteria[2].matched).toBe(false) // enlace
    expect(result.criteria[3].matched).toBe(false) // credenciales
  })

  it('should include original criterion properties in results', () => {
    const result = evaluateRubric('remitente', rubric)

    const criterion = result.criteria[0]
    expect(criterion.keyword).toBe('remitente')
    expect(criterion.points).toBe(20)
    expect(criterion.feedback).toBe('Identificó el remitente sospechoso')
    expect(criterion.matched).toBe(true)
  })

  it('should handle response with special characters', () => {
    const result = evaluateRubric(
      '¡El remitente! ¿Es urgencia? Sí: enlace & credenciales.',
      rubric
    )

    expect(result.score).toBe(100) // all keywords match
    expect(result.criteria.every((c) => c.matched)).toBe(true)
  })
})
