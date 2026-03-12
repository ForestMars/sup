/**
 * @file /src/agents/adapters/ff.ts
 * @description Adapter to wrap core support agent with feature flag logic.
 */
 import type { AgentSession, AgentStep } from '@sup/types/types';
 import { supportAgent } from '../support-agent';
 import { ProtocolResolver } from '@sup/lib/protocol-resolver';
 import { adapters } from '@sup/tools';
 //import { formatToolResult } from '@sup/lib/tool-formatter';
 import { formatToolResult } from '../style';
 // import { featureFlags } from '@sup/lib/feature-flags';
 import { client as featureFlags } from '@sup/infra/flags';
 import { ToolMeta } from '../style';

export async function* flaggedSupportAgent(
  userInput: string,
  session: AgentSession,
  opts?: { client?: any; userId?: string }
): AsyncGenerator<AgentStep, void, unknown> {

  const userId = opts?.userId || session.userId;

  const flags = {
      routing: await featureFlags.getBooleanValue('advanced_routing', false, { targetingKey: userId }),
      style: await featureFlags.getBooleanValue('styled_formatting', false, { targetingKey: userId }),
      web: await featureFlags.getBooleanValue('web_search', false, { targetingKey: userId }),
    };

  const agentOpts = {
    ...opts,
    resolver: ProtocolResolver,
    tools: adapters,
    formatter: flags.style
      ? formatToolResult
      : (s: string, t: ToolMeta, r: any, _i: string) => JSON.stringify(r),
    enableWebSearch: flags.web,
    useAdvancedRouter: flags.routing,
  };

  yield* supportAgent(userInput, session, agentOpts);
}
