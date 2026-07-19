import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Mock useMIA before importing the component
const mockUseMIA = vi.fn()
vi.mock('@/hooks/useMIA', () => ({
  useMIA: () => mockUseMIA(),
}))

// Mock useReducedMotion to return false by default
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => false,
  }
})

import MIAAgent from '@/components/mia/MIAAgent'

// ── Helpers ───────────────────────────────────────────────────────────────────

function stubMIA(overrides: Partial<ReturnType<typeof mockUseMIA>> = {}) {
  mockUseMIA.mockReturnValue({
    emotion: 'IDLE',
    currentDialogue: null,
    isVisible: false,
    triggerMIA: vi.fn(),
    dismissMIA: vi.fn(),
    ...overrides,
  })
}

function makeDialogue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dlg-test-1',
    moduleId: 0,
    emotion: 'IDLE' as const,
    text: 'Hola, soy MIA.',
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MIAAgent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when isVisible is false', () => {
    stubMIA({ isVisible: false, currentDialogue: null })
    const { container } = render(<MIAAgent />)
    // Clip-path bubble is only rendered when visible; the fixed container is always present
    const bubble = container.querySelector('[style*="clip-path"]')
    expect(bubble).toBeNull()
  })

  it('renders nothing when there is no dialogue', () => {
    stubMIA({ isVisible: true, currentDialogue: null })
    const { container } = render(<MIAAgent />)
    const bubble = container.querySelector('[style*="clip-path"]')
    expect(bubble).toBeNull()
  })

  it('renders dialogue text when visible', () => {
    const dialogue = makeDialogue()
    stubMIA({ isVisible: true, currentDialogue: dialogue })
    render(<MIAAgent />)
    // Typewriter will display full text after timer completes
    act(() => {
      vi.advanceTimersByTime(30 * dialogue.text.length + 100)
    })
    expect(screen.getByText('Hola, soy MIA.')).toBeTruthy()
  })

  it('displays emotion label', () => {
    const dialogue = makeDialogue({ emotion: 'EXCITED' })
    stubMIA({
      isVisible: true,
      currentDialogue: dialogue,
      emotion: 'EXCITED',
    })
    render(<MIAAgent />)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('Entusiasmado')).toBeTruthy()
  })

  it('calls dismissMIA when bubble is clicked after typewriter completes', () => {
    const dismissMIA = vi.fn()
    const dialogue = makeDialogue()
    stubMIA({ isVisible: true, currentDialogue: dialogue, dismissMIA })
    render(<MIAAgent />)

    // Advance past typewriter in increments to flush React state
    const totalMs = 30 * dialogue.text.length + 100
    for (let t = 0; t <= totalMs; t += 50) {
      act(() => {
        vi.advanceTimersByTime(50)
      })
    }

    // The bubble div has title="Clic para cerrar"
    const bubble = screen.getByTitle('Clic para cerrar')
    fireEvent.click(bubble)
    expect(dismissMIA).toHaveBeenCalledOnce()
  })

  it('shows correct emoji for SAMPLED_ERROR emotion', () => {
    const dialogue = makeDialogue({ emotion: 'SAMPLED_ERROR' })
    stubMIA({
      isVisible: true,
      currentDialogue: dialogue,
      emotion: 'SAMPLED_ERROR',
    })
    render(<MIAAgent />)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('Preocupado')).toBeTruthy()
  })

  it('has aria-live="polite" for accessibility', () => {
    stubMIA({ isVisible: false })
    const { container } = render(<MIAAgent />)
    const region = container.querySelector('[aria-live="polite"]')
    expect(region).toBeTruthy()
  })

  it('renders the avatar with aria label', () => {
    stubMIA({ isVisible: false, emotion: 'IDLE' })
    render(<MIAAgent />)
    const avatar = screen.getByLabelText(/MIA avatar/)
    expect(avatar).toBeTruthy()
  })

  it('dismisses on avatar click', () => {
    const dismissMIA = vi.fn()
    stubMIA({ isVisible: false, emotion: 'IDLE', dismissMIA })
    render(<MIAAgent />)
    const avatar = screen.getByLabelText(/MIA avatar/)
    fireEvent.click(avatar)
    expect(dismissMIA).toHaveBeenCalledOnce()
  })
})
