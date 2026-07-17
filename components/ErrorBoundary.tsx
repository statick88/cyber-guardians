'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback UI shown when an error is caught */
  fallback?: ReactNode
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — class component that catches JS errors in its subtree.
 *
 * Renders a fallback UI (or default cyber-themed error card) when a child
 * component throws. Provides a retry button to reset the error state.
 *
 * Required as class component per React API (no hook equivalent exists).
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="glass-card neon-border-rose mx-auto max-w-sm rounded-xl p-6 text-center">
          <div className="mb-3 text-4xl">⚠️</div>
          <h3 className="mb-2 text-lg font-bold text-rose-300">
            Error en el módulo
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            Algo salió mal. Tu progreso no se ha perdido.
          </p>
          {this.state.error && (
            <p className="mb-4 font-mono text-xs text-gray-600">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-300 transition-all hover:bg-rose-500/30"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
