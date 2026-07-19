'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActivityType } from '@/types/educational'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkedExampleStep {
  /** Step title (Spanish) */
  title: string
  /** Step description (Spanish) */
  description: string
  /** Optional visual cue — URL or emoji */
  cue?: string
}

export interface WorkedExampleTemplate {
  /** Activity type this template applies to */
  activityType: ActivityType
  /** Display label (Spanish) */
  label: string
  /** 3–5 steps for the worked example */
  steps: WorkedExampleStep[]
  /** Summary / takeaway (Spanish) */
  summary: string
}

// ─── Hardcoded templates per ActivityType ─────────────────────────────────────

const WORKED_EXAMPLE_TEMPLATES: Record<ActivityType, WorkedExampleTemplate> = {
  email_analysis: {
    activityType: 'email_analysis',
    label: 'Análisis de Email',
    steps: [
      {
        title: '1. Revisa el remitente',
        description:
          'Verifica que la dirección del remitente coincida con el dominio legítimo de la empresa. Busca caracteres sospechosos o sustituciones.',
        cue: '🔍',
      },
      {
        title: '2. Analiza el asunto',
        description:
          'Los asuntos de phishing suelen crear urgencia ("Tu cuenta será bloqueada") o usar emojis excesivos. Un asunto legítimo suele ser específico y contextual.',
        cue: '⚠️',
      },
      {
        title: '3. Examina los enlaces',
        description:
          'Pasa el cursor sobre cada enlace SIN hacer clic. Observa si el dominio real coincide con lo que se muestra. Busca homoglifos y subdominios sospechosos.',
        cue: '🔗',
      },
      {
        title: '4. Revisa el contenido',
        description:
          'Busca errores gramaticales, tono inusual, solicitudes de datos personales o credenciales. Las organizaciones legítimas NUNCA piden contraseñas por email.',
        cue: '📝',
      },
    ],
    summary:
      'Un email legítimo tiene un remitente consistente, asunto contextual, enlaces que apuntan al dominio real y contenido profesional sin solicitudes de credenciales.',
  },
  url_inspection: {
    activityType: 'url_inspection',
    label: 'Inspección de URL',
    steps: [
      {
        title: '1. Identifica el dominio principal',
        description:
          'Extrae el dominio raíz después del protocolo (https://). Ignora subdominios y enfócate en el dominio de segundo nivel.',
        cue: '🌐',
      },
      {
        title: '2. Busca homoglifos',
        description:
          'Caracteres como "a" cirílico (а) o "o" cirílico (о) parecen idénticos al latino pero apuntan a dominios diferentes.',
        cue: '👀',
      },
      {
        title: '3. Verifica el protocolo',
        description:
          'HTTPS no garantiza legitimidad — muchos sitios phishing usan certificados válidos. Pero HTTP siempre es una bandera roja.',
        cue: '🔒',
      },
      {
        title: '4. Consulta la reputación',
        description:
          'Usa herramientas como VirusTotal o urlscan.io para verificar si el dominio ha sido reportado como malicioso recientemente.',
        cue: '🛡️',
      },
    ],
    summary:
      'Una URL segura usa HTTPS, tiene un dominio legítimo sin homoglifos, no contiene rutas sospechosas y tiene buena reputación en bases de datos de amenazas.',
  },
  phishing_scenario: {
    activityType: 'phishing_scenario',
    label: 'Escenario de Phishing',
    steps: [
      {
        title: '1. Reconoce la urgencia',
        description:
          'El phishing usa presión temporal: "Actúa ahora o pierde tu cuenta". Esto te impide pensar con claridad. Detente y respira.',
        cue: '⏰',
      },
      {
        title: '2. Identifica la petición',
        description:
          '¿Qué te piden hacer? Ingresar credenciales, descargar un archivo, transferir dinero. Cada una tiene un nivel de riesgo diferente.',
        cue: '🎯',
      },
      {
        title: '3. Valida por canal separado',
        description:
          'Si el email dice ser de tu banco, llama al número oficial (no el del email) o entra directamente a la app. Nunca uses los enlaces del mensaje sospechoso.',
        cue: '📞',
      },
      {
        title: '4. Reporta y bloquea',
        description:
          'Marca como phishing en tu cliente de email, reporta al equipo de seguridad y bloquea el remitente. Esto protege a otros usuarios.',
        cue: '🚨',
      },
    ],
    summary:
      'Ante cualquier solicitud sospechosa: detente, valida por canal separado, nunca compartas credenciales y reporta el intento.',
  },
  security_quiz: {
    activityType: 'security_quiz',
    label: 'Quiz de Seguridad',
    steps: [
      {
        title: '1. Lee la pregunta completa',
        description:
          'No te apresures. Identifica qué se pregunta exactamente y qué opciones ofrece. A veces la diferencia entre opciones es sutil.',
        cue: '📖',
      },
      {
        title: '2. Elimina opciones incorrectas',
        description:
          'Usa el proceso de eliminación. Si una opción claramente no aplica, descártala. Esto mejora tus probabilidades.',
        cue: '❌',
      },
      {
        title: '3. Piensa en el por qué',
        description:
          'No solo busques la respuesta correcta — entiende POR QUÉ es correcta. Esto construye conocimiento transferible.',
        cue: '💡',
      },
    ],
    summary:
      'Lee bien, elimina lo incorrecto y entiende el razonamiento detrás de cada respuesta.',
  },
  drag_drop_classification: {
    activityType: 'drag_drop_classification',
    label: 'Clasificación Drag & Drop',
    steps: [
      {
        title: '1. Revisa las categorías',
        description:
          'Antes de arrastrar, entiende qué significa cada categoría. ¿Cuáles son las diferencias clave entre ellas?',
        cue: '📂',
      },
      {
        title: '2. Analiza el elemento',
        description:
          'Examina cada elemento antes de clasificarlo. ¿Qué características tiene? ¿Qué evidencia te da para decidir?',
        cue: '🔎',
      },
      {
        title: '3. Usa el feedback',
        description:
          'Si te equivocas, el sistema te mostrará por qué. Lee el feedback — es donde está el aprendizaje real.',
        cue: '✅',
      },
    ],
    summary:
      'Clasificar requiere entender las categorías, analizar la evidencia y aprender de los errores.',
  },
  micro_activity: {
    activityType: 'micro_activity',
    label: 'Micro-actividad',
    steps: [
      {
        title: '1. Lee el contexto rápido',
        description:
          'Cada micro-actividad tiene un escenario conciso. Asegúrate de entender la situación antes de responder.',
        cue: '⚡',
      },
      {
        title: '2. Responde con precisión',
        description:
          'No necesitas una respuesta larga. Sé específico y directo. La precisión importa más que la extensión.',
        cue: '🎯',
      },
    ],
    summary:
      'Las micro-actividades miden comprensión instantánea. Lee, entiende, responde con precisión.',
  },
  password_strength: {
    activityType: 'password_strength',
    label: 'Fortaleza de Contraseña',
    steps: [
      {
        title: '1. Mide la entropía',
        description:
          'Una contraseña fuerte tiene longitud (12+ caracteres), diversidad (mayúsculas, minúsculas, números, símbolos) y es impredecible.',
        cue: '🔢',
      },
      {
        title: '2. Verifica contra diccionarios',
        description:
          'Las contraseñas basadas en palabras comunes, nombres o fechas se crackean en segundos. Usa frases aleatorias o generador de contraseñas.',
        cue: '📚',
      },
      {
        title: '3. Comprueba si fue comprometida',
        description:
          'Busca tu contraseña en haveibeenpwned.com. Si aparece, cámbiala inmediatamente — no importa qué tan fuerte sea.',
        cue: '🏴',
      },
    ],
    summary:
      'Una contraseña segura es larga, diversa, no basada en diccionario y no aparece en brechas de datos.',
  },
  mfa_simulation: {
    activityType: 'mfa_simulation',
    label: 'Simulación MFA',
    steps: [
      {
        title: '1. Entiende los factores',
        description:
          'MFA combina: algo que sabes (contraseña), algo que tienes (teléfono/token), algo que eres (biometría). Necesitas al menos dos.',
        cue: '🔐',
      },
      {
        title: '2. Evalúa la resistencia',
        description:
          'SMS es vulnerable a SIM swapping. Authenticator apps son mejores. Hardware keys (YubiKey) son las más seguras.',
        cue: '📱',
      },
    ],
    summary:
      'MFA efectivo combina factores independientes. Prioriza hardware keys, luego apps de autenticación, y evita SMS cuando sea posible.',
  },
  social_media_audit: {
    activityType: 'social_media_audit',
    label: 'Auditoría de Redes Sociales',
    steps: [
      {
        title: '1. Revisa tu información pública',
        description:
          '¿Qué puede ver cualquier persona sin seguirte? Revisa perfil, publicaciones, ubicaciones y amigos/seguidores.',
        cue: '👁️',
      },
      {
        title: '2. Evalúa la configuración de privacidad',
        description:
          'Configura quién puede ver tus publicaciones, quién puede etiquetarte, y si tu perfil es searchable desde buscadores.',
        cue: '⚙️',
      },
      {
        title: '3. Identifica señales de suplantación',
        description:
          'Busca perfiles que usen tu foto o nombre. Reporta suplantaciones a la plataforma y alerta a tus contactos.',
        cue: '🎭',
      },
    ],
    summary:
      'Tu presencia digital es tu primera línea de defensa. Controla qué compartes y quién puede verlo.',
  },
  identity_theft_response: {
    activityType: 'identity_theft_response',
    label: 'Respuesta a Robo de Identidad',
    steps: [
      {
        title: '1. Confirma la suplantación',
        description:
          'Revisa tus cuentas financieras, reportes de crédito y notificaciones inusuales. Documenta toda evidencia.',
        cue: '📋',
      },
      {
        title: '2. Contén el daño',
        description:
          'Congela tu crédito, cambia credenciales comprometidas, habilita alertas de fraude y contacta a tu banco.',
        cue: '🧊',
      },
      {
        title: '3. Reporta oficialmente',
        description:
          'Presenta denuncia en la policía, reporta a la FTC (o equivalente local), y notifica a las agencias de crédito.',
        cue: '👮',
      },
    ],
    summary:
      'Ante robo de identidad: confirma, contiene (freeze + cambios de contraseña) y reporta oficialmente.',
  },
  vishing_decoder: {
    activityType: 'vishing_decoder',
    label: 'Decodificador Vishing',
    steps: [
      {
        title: '1. Identifica la presión',
        description:
          'El vishing usa urgencia artificial: "Tu cuenta será bloqueada", "Activa ahora". Esto es una táctica de manipulación.',
        cue: '🗣️',
      },
      {
        title: '2. No compartas información',
        description:
          'Nunca proporciones datos personales, credenciales o códigos de verificación por teléfono a llamadas no solicitadas.',
        cue: '🚫',
      },
      {
        title: '3. Cuelga y verifica',
        description:
          'Cuelga, busca el número oficial de la entidad y llámalos tú. Si la llamada era legítima, ellos tendrán registro.',
        cue: '📵',
      },
    ],
    summary:
      'El vishing explota la confianza telefónica. Nunca compartas datos en llamadas no solicitadas. Verifica por canal oficial.',
  },
  chat_simulation: {
    activityType: 'chat_simulation',
    label: 'Simulación de Chat',
    steps: [
      {
        title: '1. Analiza el patrón de mensajes',
        description:
          'Los chats maliciosos suelen ser amigables al principio, luego piden información o acción. Identifica la transición.',
        cue: '💬',
      },
      {
        title: '2. Verifica la identidad',
        description:
          'Un contacto legítimo no te pedirá credenciales, transferencias o datos sensibles por chat. Si hay duda, verifica por otro canal.',
        cue: '🪪',
      },
    ],
    summary:
      'Los chats maliciosos crean confianza gradualmente. Desconfía de solicitudes inesperadas y verifica identidad por canal separado.',
  },
  money_mule_analysis: {
    activityType: 'money_mule_analysis',
    label: 'Análisis de Mulero',
    steps: [
      {
        title: '1. Reconoce la oferta',
        description:
          'Trabajo desde casa, transferencia de fondos, comisión por recibir dinero. Si suena demasiado bueno, es una trampa.',
        cue: '💸',
      },
      {
        title: '2. Entiende las consecuencias',
        description:
          'Ser mulero es un delito. Aunque no sepas que el dinero es ilegal, puedes enfrentar cargos penales y pérdida de tu cuenta bancaria.',
        cue: '⚖️',
      },
      {
        title: '3. Rechaza y reporta',
        description:
          'Nunca aceptes mover dinero para terceros. Reporta la oferta a las autoridades y a la plataforma donde fue recibida.',
        cue: '🛑',
      },
    ],
    summary:
      'Ser mulero es un delito aunque no lo sepas. Nunca aceptes mover dinero para terceros. Rechaza y reporta.',
  },
  extortion_response: {
    activityType: 'extortion_response',
    label: 'Respuesta a Extorsión',
    steps: [
      {
        title: '1. No pagues ni respondas',
        description:
          'Pagar no detiene la extorsión — la alimenta. Nunca respondas a las amenazas ni cumplas las demandas.',
        cue: '🚫',
      },
      {
        title: '2. Documenta todo',
        description:
          'Guarda capturas de pantalla, correos, mensajes. Preserva la evidencia con marcas de tiempo.',
        cue: '📸',
      },
      {
        title: '3. Busca ayuda profesional',
        description:
          'Contacta a las autoridades, un abogado o líneas de ayuda especializadas. No enfrentes esto solo.',
        cue: '🤝',
      },
    ],
    summary:
      'Nunca pagues extorsión. Documenta, no respondas y busca ayuda profesional de inmediato.',
  },
  signal_classification: {
    activityType: 'signal_classification',
    label: 'Clasificación de Señales',
    steps: [
      {
        title: '1. Identifica la categoría de señal',
        description:
          '¿Es una señal de phishing, malware, social engineering o dato legítimo? Cada categoría tiene patrones distintivos.',
        cue: '🚦',
      },
      {
        title: '2. Evalúa la confianza',
        description:
          'No todas las señales son iguales. Evalúa la fuente, el contexto y la frecuencia antes de clasificar.',
        cue: '📊',
      },
    ],
    summary:
      'Clasificar señales requiere entender categorías, evaluar confianza y aprender de la experiencia acumulada.',
  },
  code_defuse: {
    activityType: 'code_defuse',
    label: 'Desarmar Código',
    steps: [
      {
        title: '1. Identifica el tipo de código',
        description:
          '¿Es HTML, JavaScript, shell, o un formato ofuscado? El tipo determina la estrategia de análisis.',
        cue: '💻',
      },
      {
        title: '2. Desofusca paso a paso',
        description:
          'Busca patrones: entities HTML, escape sequences, encoding Base64, concatenaciones. Revierte cada capa.',
        cue: '🔓',
      },
      {
        title: '3. Evalúa el impacto',
        description:
          'Una vez visible el código original, determina qué haría: robo de credenciales, redirección, inyección.',
        cue: '💥',
      },
    ],
    summary:
      'Desarmar código es un proceso metódico: identificar formato, desofuscar capas y evaluar impacto.',
  },
  crypto_challenge: {
    activityType: 'crypto_challenge',
    label: 'Desafío Cripto',
    steps: [
      {
        title: '1. Identifica el cifrado',
        description:
          '¿Es César, Base64, XOR, o un cifrado moderno? Busca patrones de longitud, caracteres y frecuencia.',
        cue: '🔐',
      },
      {
        title: '2. Prueba ataques conocidos',
        description:
          'Fuerza bruta para cifrados simples, análisis de frecuencia para sustitución, known-plaintext para modernos.',
        cue: '⚙️',
      },
    ],
    summary:
      'Los desafíos cripto se resuelven identificando el cifrado y aplicando el ataque apropiado.',
  },
  hardening_checklist: {
    activityType: 'hardening_checklist',
    label: 'Checklist de Hardening',
    steps: [
      {
        title: '1. Inventario de servicios',
        description:
          'Lista todos los servicios expuestos. Cada uno es un vector de ataque potencial. Menos servicios = menos superficie.',
        cue: '📋',
      },
      {
        title: '2. Aplica configuración segura',
        description:
          'Para cada servicio: cambia credenciales por defecto, aplica parches, configura firewall, habilita logging.',
        cue: '🔧',
      },
      {
        title: '3. Verifica y monitorea',
        description:
          'Usa escaneos de vulnerabilidades periódicos y monitorea logs para detectar intentos de acceso no autorizado.',
        cue: '📡',
      },
    ],
    summary:
      'Hardening es un ciclo: inventariar, asegurar, verificar y monitorear continuamente.',
  },
  cookie_sweeper: {
    activityType: 'cookie_sweeper',
    label: 'Barrido de Cookies',
    steps: [
      {
        title: '1. Identifica cookies de rastreo',
        description:
          'Las cookies de terceros (analytics, ads) te rastrean entre sitios. Las first-party son para funcionalidad del sitio.',
        cue: '🍪',
      },
      {
        title: '2. Evalúa la exposición',
        description:
          '¿Qué información captura cada cookie? ¿Cuánto tiempo persiste? ¿Se comparte con terceros?',
        cue: '🔍',
      },
      {
        title: '3. Limpia y configura',
        description:
          'Elimina cookies de rastreo, configura bloqueadores y preferencias de privacidad en tu navegador.',
        cue: '🧹',
      },
    ],
    summary:
      'Las cookies de rastreo te siguen entre sitios. Identifícalas, evalúa su impacto y limpia periódicamente.',
  },
  metadata_extractor: {
    activityType: 'metadata_extractor',
    label: 'Extracción de Metadata',
    steps: [
      {
        title: '1. Entiende qué es la metadata',
        description:
          'Los archivos contienen información oculta: autor, fecha, ubicación GPS, software usado. Esto puede revelar datos sensibles.',
        cue: '📊',
      },
      {
        title: '2. Extrae y analiza',
        description:
          'Usa herramientas como exiftool para leer metadata de imágenes, documentos y archivos. Busca información no intencionada.',
        cue: '🔬',
      },
      {
        title: '3. Limpia antes de compartir',
        description:
          'Elimina metadata sensible (ubicación, nombre, dispositivo) antes de publicar archivos. Muchas plataformas la eliminan automáticamente.',
        cue: '🗑️',
      },
    ],
    summary:
      'Los archivos ocultan metadata que puede filtrar información sensible. Extrae, analiza y limpia antes de compartir.',
  },
  email_deconstructor: {
    activityType: 'email_deconstructor',
    label: 'Desconstructor de Email',
    steps: [
      {
        title: '1. Analiza los headers',
        description:
          'Los headers revelan la ruta real del email, servidores por los que pasó y si autenticación SPF/DKIM/DMARC pasó.',
        cue: '📨',
      },
      {
        title: '2. Identifica elementos sospechosos',
        description:
          'URLs en texto vs. display, imágenes de rastreo, archivos adjuntos ejecutables, remitente display-name vs. real.',
        cue: '🔎',
      },
      {
        title: '3. Traza la cadena de confianza',
        description:
          '¿Quién lo envió realmente? ¿El dominio de retorno coincide? ¿Los headers son consistentes o manipulados?',
        cue: '🔗',
      },
    ],
    summary:
      'Desconstruir un email es rastrear su cadena de confianza: headers, autenticación, URLs y remitente real.',
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkedExampleProps {
  /** Activity type to show worked example for */
  activityType: ActivityType
  /** Called when student completes or dismisses the walkthrough */
  onComplete: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WorkedExample — Step-by-step walkthrough showing how to approach
 * each ActivityType. Shows 3–5 steps with navigation.
 *
 * - Step navigation (Siguiente/Anterior)
 * - Progress indicator
 * - "Entendido" dismiss button after first step
 */
export default function WorkedExample({
  activityType,
  onComplete,
}: WorkedExampleProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const template = WORKED_EXAMPLE_TEMPLATES[activityType]

  if (!template) return null

  const { steps, label, summary } = template
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="max-w-sm"
    >
      <div className="glass-card rounded-xl p-5 neon-border">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            {label}
          </span>
          <button
            onClick={onComplete}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1 w-full rounded-full bg-gray-800">
          <motion.div
            className="h-full rounded-full bg-cyan-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-1 text-lg">{steps[currentStep].cue}</div>
            <h4 className="text-sm font-semibold text-white mb-1">
              {steps[currentStep].title}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Summary on last step */}
        {isLastStep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-3 rounded-lg bg-cyan-900/30 p-3 border border-cyan-800"
          >
            <p className="text-xs text-cyan-300 leading-relaxed">
              <span className="font-semibold">Resumen:</span> {summary}
            </p>
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="mt-4 flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-3 py-2 text-xs font-medium text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Anterior
            </button>
          )}

          {isLastStep ? (
            <button
              onClick={onComplete}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Entendido
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex-1 px-3 py-2 text-xs font-medium text-cyan-300 border border-cyan-700 rounded-lg hover:bg-cyan-900/30 transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>

        {/* Step indicator */}
        <p className="mt-2 text-center text-xs text-gray-600">
          {currentStep + 1} / {steps.length}
        </p>
      </div>
    </motion.div>
  )
}
