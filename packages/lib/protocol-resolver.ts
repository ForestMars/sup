/**
 * @file protocol-resolver.ts
 * @description Pure expertise/domain router.
 *
 * This module is intentionally responsible ONLY for selecting
 * operational expertise based on runtime context.
 *
 * It does NOT:
 * - load tools
 * - compose prompts
 * - load markdown
 * - apply styles
 * - construct runtimes
 */

import type {
  ExpertStrategy,
  ExpertiseResolverPort,
} from '@sup/domain/expertise-types';

/**
 * Expertise registry.
 *
 * NOTE:
 * These are DOMAIN-LOCAL expertise descriptors,
 * not globally shared framework concepts.
 */
export const Registry = {
  resolution: {
    key: 'resolution',
    name: 'Conflict Resolution',
    skillPath: 'entity-resolution.md',
    rules:
      'Prioritize resolving conflicting entity state before continuing.',
  },

  billing: {
    key: 'billing',
    name: 'Billing',
    skillPath: 'billing.md',
  },

  default: {
    key: 'default',
    name: 'General Support',
    skillPath: '',
  },
} satisfies Record<string, ExpertStrategy>;

export const ProtocolResolver: ExpertiseResolverPort = {
  resolve(graphContext: string): ExpertStrategy {
    /**
     * Expertise routing ONLY.
     * No runtime composition.
     */

    if (graphContext.includes('UNRESOLVED_CONFLICT')) {
      return Registry.resolution;
    }

    if (graphContext.includes('BILLING')) {
      return Registry.billing;
    }

    return Registry.default;
  },
};

/**
 * Backwards-compatible helper.
 */
export function resolveProtocol(
  graphContext: string,
): ExpertStrategy {
  return ProtocolResolver.resolve(graphContext);
}