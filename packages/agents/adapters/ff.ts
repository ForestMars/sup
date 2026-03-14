/**
 * @file /src/agents/adapters/ff.ts
 * @description Adapter to wrap core support agent with feature flag logic.
 */
import type { AgentSession, AgentStep } from '@sup/types/types';
import { supportAgent } from '../support-agent';
import { ProtocolResolver } from '@sup/lib/protocol-resolver';
import { adapters } from '@sup/tools';
import { formatToolResult, type ToolMeta } from '../style';
import { client as featureFlags } from '@sup/infra/flags';
import { repoConfig, validateGitHubCapability } from '#config/repo';

export async function* flaggedSupportAgent(
  userInput: string,
  session: AgentSession,
  opts?: { client?: any; userId?: string }
): AsyncGenerator<AgentStep, void, unknown> {

  const userId = opts?.userId || session.userId;

  // 1. Check basic token existence and FF in one go
  const githubFlag = await featureFlags.getBooleanValue('github_expert', false, { targetingKey: userId }) 
                     && !!repoConfig.token;

  // 2. Perform the actual health check if the flag passed
  const isGithubHealthy = githubFlag && await validateGitHubCapability();

  // 3. Define the status string
  const githubStatus = isGithubHealthy ? 'ACTIVE' : (githubFlag ? 'AUTH_FAILED' : 'DISABLED');

  const agentOpts = {
    ...opts,
    resolver: ProtocolResolver,
    tools: adapters,
    formatter: flags.style // Note: Assuming 'flags' logic for style/web remains if you need them
      ? formatToolResult
      : (s: string, t: ToolMeta, r: any, _i: string) => JSON.stringify(r),
    enableWebSearch: await featureFlags.getBooleanValue('web_search', false, { targetingKey: userId }),
    useAdvancedRouter: await featureFlags.getBooleanValue('advanced_routing', false, { targetingKey: userId }),
    // Pass our new state into the agent
    githubStatus, 
  };

  yield* supportAgent(userInput, session, agentOpts);
}