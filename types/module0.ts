export interface Opcion {
  id: string
  texto: string
  esCorrecta: boolean
  puntos: number
  retroalimentacion: string
}

export interface Escenario {
  id: string
  categoria: string
  emoji: string
  situacion: string
  opciones: Opcion[]
}

export interface Categoria {
  id: string
  nombre: string
  emoji: string
  descripcion: string
  color: string
}

export interface ResultadoNivel {
  titulo: string
  subtitulo: string
  emoji: string
  descripcion: string
  color: string
  insignia: string
  recomendacion: string
  microActividades?: MicroActividad[]
}

export interface MicroActividad {
  id: string
  tipo: string
  titulo: string
  descripcion: string
}

export interface ModuloData {
  modulo: {
    id: string
    titulo: string
    subtitulo: string
    descripcion: string
    umbralAprobacion: number
    tiempoEstimado: string
    totalPuntosPosibles: number
  }
  escenarios: Escenario[]
  categorias: Categoria[]
  resultados: {
    nivelAvanzado: ResultadoNivel
    nivelBasico: ResultadoNivel
  }
}

export type GameState = 'WELCOME' | 'PLAYING' | 'FEEDBACK' | 'RESULTS'

export interface GameProgress {
  currentScenarioIndex: number
  totalScore: number
  categoryScores: Record<string, number>
  completedScenarios: string[]
  gameState: GameState
}
