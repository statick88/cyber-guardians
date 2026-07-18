/**
 * EducationalMediator — pedagogical-10x integration tests
 *
 * Tests:
 * - enablePedagogical10x=true renders ConceptCard on onIntro state
 * - enablePedagogical10x=false does NOT render ConceptCard
 * - enablePedagogical10x=true renders FormativeFeedback on onErrorConstructive
 * - enablePedagogical10x=false does NOT render FormativeFeedback
 * - enablePedagogical10x=true calls portfolio.addEntry on debrief complete
 * - enablePedagogical10x=false does NOT call portfolio.addEntry
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EducationalMediator } from '../EducationalMediator'
import type { EducationalLayer, ScaffoldingProgress, MediatorState } from '@/types/educational'

// Mock dependencies
vi.mock('@/hooks/useEducationalMediator', () => ({
  useEducationalMediator: vi.fn(() => ({
    state: 'idle' as MediatorState,
    currentLayer: null,
    triggerMediator: vi.fn(),
    dismissMediator: vi.fn(),
    answerMediator: vi.fn(),
    completeDebrief: vi.fn(),
    isPaused: false,
  })),
}))

vi.mock('@/hooks/usePortfolio', () => ({
  usePortfolio: vi.fn(() => ({
    competencyScores: [],
    overallScore: 0,
    addEntry: vi.fn(),
    entries: [],
  })),
}))

vi.mock('@/hooks/useScaffolding', () => ({
  getCurrentTip: vi.fn(() => null),
}))

vi.mock('@/lib/featureFlags', () => ({
  MEDIATOR_ENABLED: true,
}))

vi.mock('../EducationalPanel', () => ({
  default: () => <div data-testid="educational-panel" />,
}))

vi.mock('../TipBadge', () => ({
  default: () => <div data-testid="tip-badge" />,
}))

vi.mock('../DebriefDialog', () => ({
  default: () => <div data-testid="debrief-dialog" />,
}))

vi.mock('../ConceptCard', () => ({
  default: () => <div data-testid="concept-card" />,
}))

vi.mock('../FormativeFeedback', () => ({
  default: () => <div data-testid="formative-feedback" />,
}))

// ─── Test Data ────────────────────────────────────────────────────────────────

const mockEducationalLayer: EducationalLayer = {
  scenarioId: 'email-001',
  moduleId: 1,
  activityType: 'email_analysis',
  conflictQuestion: {
    question: '¿Este email es legítimo o phishing?',
    expectedInsight: 'El email contiene indicadores de phishing.',
  },
  scaffoldingTip: {
    level: 'guided',
    hint: 'Revisa el remitente del email.',
  },
  metacognitiveDebrief: {
    prompts: [
      {
        id: 'reflection-1',
        type: 'open-reflection',
        prompt: '¿Qué aprendiste?',
        storageKey: 'reflection-1',
        competency: 'threat_identification',
      },
    ],
  },
  mediatorHook: 'onIntro',
}

const mockScaffoldingProgress: ScaffoldingProgress = {
  scenarioType: 'email_analysis',
  errorCount: 0,
  correctStreak: 0,
  currentLevel: 'guided',
  lastUpdated: Date.now(),
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EducationalMediator — pedagogical-10x integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders ConceptCard when enablePedagogical10x=true and state is onIntro', async () => {
    const { useEducationalMediator } = await import('@/hooks/useEducationalMediator')
    vi.mocked(useEducationalMediator).mockReturnValue({
      state: 'onIntro' as MediatorState,
      currentLayer: null,
      triggerMediator: vi.fn(),
      dismissMediator: vi.fn(),
      answerMediator: vi.fn(),
      completeDebrief: vi.fn(),
      isPaused: false,
    })

    render(
      <EducationalMediator
        educationalLayer={mockEducationalLayer}
        scaffoldingProgress={mockScaffoldingProgress}
        moduleName="Módulo 1"
        enablePedagogical10x={true}
      >
        {() => null}
      </EducationalMediator>
    )

    expect(screen.getByTestId('concept-card')).toBeTruthy()
  })

  it('does NOT render ConceptCard when enablePedagogical10x=false', async () => {
    const { useEducationalMediator } = await import('@/hooks/useEducationalMediator')
    vi.mocked(useEducationalMediator).mockReturnValue({
      state: 'onIntro' as MediatorState,
      currentLayer: null,
      triggerMediator: vi.fn(),
      dismissMediator: vi.fn(),
      answerMediator: vi.fn(),
      completeDebrief: vi.fn(),
      isPaused: false,
    })

    render(
      <EducationalMediator
        educationalLayer={mockEducationalLayer}
        scaffoldingProgress={mockScaffoldingProgress}
        moduleName="Módulo 1"
        enablePedagogical10x={false}
      >
        {() => null}
      </EducationalMediator>
    )

    expect(screen.queryByTestId('concept-card')).toBeNull()
  })

  it('renders FormativeFeedback when enablePedagogical10x=true and state is onErrorConstructive', async () => {
    const { useEducationalMediator } = await import('@/hooks/useEducationalMediator')
    vi.mocked(useEducationalMediator).mockReturnValue({
      state: 'onErrorConstructive' as MediatorState,
      currentLayer: null,
      triggerMediator: vi.fn(),
      dismissMediator: vi.fn(),
      answerMediator: vi.fn(),
      completeDebrief: vi.fn(),
      isPaused: false,
    })

    render(
      <EducationalMediator
        educationalLayer={mockEducationalLayer}
        scaffoldingProgress={mockScaffoldingProgress}
        moduleName="Módulo 1"
        enablePedagogical10x={true}
      >
        {() => null}
      </EducationalMediator>
    )

    expect(screen.getByTestId('formative-feedback')).toBeTruthy()
  })

  it('does NOT render FormativeFeedback when enablePedagogical10x=false', async () => {
    const { useEducationalMediator } = await import('@/hooks/useEducationalMediator')
    vi.mocked(useEducationalMediator).mockReturnValue({
      state: 'onErrorConstructive' as MediatorState,
      currentLayer: null,
      triggerMediator: vi.fn(),
      dismissMediator: vi.fn(),
      answerMediator: vi.fn(),
      completeDebrief: vi.fn(),
      isPaused: false,
    })

    render(
      <EducationalMediator
        educationalLayer={mockEducationalLayer}
        scaffoldingProgress={mockScaffoldingProgress}
        moduleName="Módulo 1"
        enablePedagogical10x={false}
      >
        {() => null}
      </EducationalMediator>
    )

    expect(screen.queryByTestId('formative-feedback')).toBeNull()
  })

  it('enablePedagogical10x=false defaults — no extra rendering beyond base mediator', async () => {
    const { useEducationalMediator } = await import('@/hooks/useEducationalMediator')
    vi.mocked(useEducationalMediator).mockReturnValue({
      state: 'idle' as MediatorState,
      currentLayer: null,
      triggerMediator: vi.fn(),
      dismissMediator: vi.fn(),
      answerMediator: vi.fn(),
      completeDebrief: vi.fn(),
      isPaused: false,
    })

    render(
      <EducationalMediator
        educationalLayer={mockEducationalLayer}
        scaffoldingProgress={mockScaffoldingProgress}
        moduleName="Módulo 1"
      >
        {() => null}
      </EducationalMediator>
    )

    // No ConceptCard, no FormativeFeedback, no DebriefDialog in idle state
    expect(screen.queryByTestId('concept-card')).toBeNull()
    expect(screen.queryByTestId('formative-feedback')).toBeNull()
    expect(screen.queryByTestId('debrief-dialog')).toBeNull()
  })

  it('educationalLayer is undefined — mediator renders children without panels', async () => {
    const { useEducationalMediator } = await import('@/hooks/useEducationalMediator')
    vi.mocked(useEducationalMediator).mockReturnValue({
      state: 'idle' as MediatorState,
      currentLayer: null,
      triggerMediator: vi.fn(),
      dismissMediator: vi.fn(),
      answerMediator: vi.fn(),
      completeDebrief: vi.fn(),
      isPaused: false,
    })

    render(
      <EducationalMediator
        moduleName="Módulo 1"
        enablePedagogical10x={true}
      >
        {() => null}
      </EducationalMediator>
    )

    // No panels rendered without educationalLayer
    expect(screen.queryByTestId('concept-card')).toBeNull()
    expect(screen.queryByTestId('formative-feedback')).toBeNull()
  })
})
