/**
 * ConceptCard tests
 *
 * Tests the concept introduction card: renders question, context,
 * contradicting evidence, buttons call correct handlers.
 *
 * Requires: vitest, @testing-library/react, @testing-library/jest-dom
 * Run: pnpm test components/mediator/__tests__/ConceptCard.test.tsx
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConceptCard from '../ConceptCard'
import type { EducationalLayer, ActivityType } from '@/types/educational'

// ─── Mock framer-motion ──────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockEducationalLayer: EducationalLayer = {
  scenarioId: 'test-scenario',
  moduleId: 1,
  activityType: 'email_analysis',
  conflictQuestion: {
    question: '¿Qué señales indican que un email es phishing?',
    followUp: 'Observa las siguientes señales de alerta en el email.',
    expectedInsight: 'El remitente no coincide con el dominio oficial.',
    contradictingEvidence: [
      'Los emails legítimos siempre muestran el dominio completo del remitente.',
    ],
  },
  scaffoldingTip: {
    level: 'guided',
    hint: 'Observa el dominio del remitente.',
  },
  metacognitiveDebrief: {
    prompts: [],
  },
  mediatorHook: 'onIntro',
}

const defaultProps = {
  activityType: 'email_analysis' as ActivityType,
  educationalLayer: mockEducationalLayer,
  onDismiss: vi.fn(),
  onViewExample: vi.fn(),
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ConceptCard', () => {
  it('renders the activity type label', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(screen.getByText('Análisis de Email')).toBeDefined()
  })

  it('renders the question as title', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(
      screen.getByText('¿Qué señales indican que un email es phishing?')
    ).toBeDefined()
  })

  it('renders the follow-up context', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(
      screen.getByText('Observa las siguientes señales de alerta en el email.')
    ).toBeDefined()
  })

  it('renders contradicting evidence as teaching material', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(
      screen.getByText(
        'Los emails legítimos siempre muestran el dominio completo del remitente.'
      )
    ).toBeDefined()
  })

  it('renders "Ver ejemplo" button', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(screen.getByText('Ver ejemplo')).toBeDefined()
  })

  it('renders "Comenzar" button', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(screen.getByText('Comenzar')).toBeDefined()
  })

  it('calls onDismiss when "Comenzar" is clicked', () => {
    const onDismiss = vi.fn()
    render(<ConceptCard {...defaultProps} onDismiss={onDismiss} />)

    fireEvent.click(screen.getByText('Comenzar'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onViewExample when "Ver ejemplo" is clicked', () => {
    const onViewExample = vi.fn()
    render(<ConceptCard {...defaultProps} onViewExample={onViewExample} />)

    fireEvent.click(screen.getByText('Ver ejemplo'))
    expect(onViewExample).toHaveBeenCalledTimes(1)
  })

  it('renders evidence sources', () => {
    render(<ConceptCard {...defaultProps} />)
    expect(screen.getByText('Señales a observar')).toBeDefined()
    expect(
      screen.getByText(
        'Los emails legítimos siempre muestran el dominio completo del remitente.'
      )
    ).toBeDefined()
  })

  it('renders without crashing for different activity types', () => {
    const { unmount } = render(
      <ConceptCard
        {...defaultProps}
        activityType="url_inspection"
        educationalLayer={{
          ...mockEducationalLayer,
          activityType: 'url_inspection',
        }}
      />
    )
    expect(screen.getByText('Inspección de URL')).toBeDefined()
    unmount()
  })
})
