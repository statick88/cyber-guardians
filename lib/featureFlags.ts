// lib/featureFlags.ts
// Feature flags — dead-code eliminated at build when false

export const MEDIATOR_ENABLED =
  process.env.NEXT_PUBLIC_EDUCATIONAL_MEDIATOR === 'true'
