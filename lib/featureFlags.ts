// lib/featureFlags.ts
// Feature flags — dead-code eliminated at build when false

export const MEDATOR_ENABLED =
  process.env.NEXT_PUBLIC_EDUCATIONAL_MEDIATOR === 'true'
