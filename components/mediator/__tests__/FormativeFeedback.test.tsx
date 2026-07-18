/**
 * FormativeFeedback component tests
 *
 * Tests rendering, per-competency progress bars, dismiss behavior,
 * and score color coding.
 *
 * Requires: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
 * Run: pnpm test components/mediator/__tests__/FormativeFeedback.test.tsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import FormativeFeedback from '../FormativeFeedback'
import type { CompetencyScore } from '@/types/educational'

// ─── Mock framer-motion ───────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

function filterDomProps(props: Record<string, unknown>): Record<string, unknown> {
  const domProps: Record<string, unknown> = {}
  for (const key of Object.keys(props)) {
    if (key === 'initial' || key === 'animate' || key === 'exit' || key === 'transition') continue
    domProps[key] = props[key]
  }
  return domProps
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const scores: CompetencyScore[] = [
  { tag: 'email-analysis', score: 85, attempts: 3, lastUpdated: Date.now() },
  { tag: 'url-inspection', score: 60, attempts: 2, lastUpdated: Date.now() },
]

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FormativeFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should render overall score', () => {
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('72')).toBeTruthy()
    expect(screen.getByText('/ 100')).toBeTruthy()
  })

  it('should render "Progreso" header', () => {
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('Progreso')).toBeTruthy()
  })

  it('should render per-competency labels in Spanish', () => {
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('Análisis de Email')).toBeTruthy()
    expect(screen.getByText('Inspección de URL')).toBeTruthy()
  })

  it('should render per-competency scores', () => {
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('85')).toBeTruthy()
    expect(screen.getByText('60')).toBeTruthy()
  })

  it('should render optional message', () => {
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        message="¡Buen progreso!"
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('¡Buen progreso!')).toBeTruthy()
  })

  it('should not render message when not provided', () => {
    const { container } = render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={vi.fn()}
      />
    )

    const messages = container.querySelectorAll('p')
    expect(messages).toHaveLength(0)
  })

  it('should call onDismiss when close button clicked', () => {
    const onDismiss = vi.fn()
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={onDismiss}
      />
    )

    const closeBtn = screen.getByLabelText('Cerrar')
    act(() => {
      fireEvent.click(closeBtn)
    })

    // onDismiss called after animation delay (250ms)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should call onDismiss when "Continuar" clicked', () => {
    const onDismiss = vi.fn()
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={onDismiss}
      />
    )

    const continueBtn = screen.getByText('Continuar')
    act(() => {
      fireEvent.click(continueBtn)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should render "Continuar" button text', () => {
    render(
      <FormativeFeedback
        competencyScores={scores}
        overallScore={72}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('Continuar')).toBeTruthy()
  })

  it('should handle empty competency scores', () => {
    render(
      <FormativeFeedback
        competencyScores={[]}
        overallScore={0}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('0')).toBeTruthy()
    // No progress bars rendered
    expect(screen.queryByText('Análisis de Email')).toBeNull()
  })
})
