/**
 * @file packages/agents/coding-agent.ts
 * @description Coding agent. Knows where it is. Writes files correctly.
 */
import { generateText } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import { z } from 'zod';

import type { AgentConfig, AgentSession, AgentEvent, AgentStep } from '@sup/types/types';
import { logger } from '@sup/infra/logger';
import { tools as registry, runTool } from '@sup/tools';

const DEFAULT_MODEL = 'qwen2.5-coder:14b';
const TEMPERATURE = 0;
const CWD = process.cwd();

const codingAgentConfig: AgentConfig = {
  name: 'CodingAgent',
  model: process.env.CODING_AGENT_MODEL || DEFAULT_MODEL,
  instructions: '',
  temperature: TEMPERATURE,
  tools: [],
};

// FS tools only — the coding agent doesn't need support tools
const FS_TOOLS = ['fs/write', 'fs/read', 'fs/bash', 'fs/glob'];
const fsRegistry = registry.filter((t) => FS_TOOLS.includes(t.name));

function buildConversationHistory(events: AgentEvent[]): string {
  return events
    .filter((e) => e.type === 'USER_UPDATE' || e.type === 'TOOL_RESULT')
    .map((e) => {
      if (e.type === 'USER_UPDATE') return `User: ${e.payload.text}`;
      if (e.type === 'TOOL_RESULT') {
        return `System: [Tool: ${e.payload.toolId}] → ${JSON.stringify(e.payload.result)}`;
      }
      return null;
    })
    .filter(Boolean)
    .join('\n');
}

export async function* codingAgent(
  userInput: string,
  session: AgentSession,
  opts?: { client?: any }
): AsyncGenerator<AgentStep, void, unknown> {
  if (!session) throw new Error('No session provided to codingAgent.');
  if (!session.events) session.events = [];

  const model = opts?.client || ollama(codingAgentConfig.model);

  session.events.push({
    type: 'USER_UPDATE',
    payload: { text: userInput },
    timestamp: Date.now(),
  });

  yield {
    type: 'thinking',
    timestamp: Date.now(),
    message: 'Reading task...',
  };

  /**
   * SYSTEM PROMPT — CWD is first, non-negotiable.
   * Small models latch onto whatever is most salient at the top.
   * We exploit that. The working directory is always first.
   */
  const systemPrompt = [
    `WORKING DIRECTORY: ${CWD}`,
    `All file paths must be RELATIVE to the working directory above.`,
    `Never use absolute paths. Never use /path/to/ placeholders.`,
    `If you need to write a file called test.txt, the path argument is: test.txt`,
    ``,
    `You are a coding agent. You have the following tools:`,
    `- fs/write: write a file (relative path + content)`,
    `- fs/read: read a file (relative path)`,
    `- fs/bash: run a shell command`,
    `- fs/glob: list files matching a pattern`,
    ``,
    `Complete the user's task using these tools. Be direct. No commentary unless asked.`,
  ].join('\n');

  const conversationHistory = buildConversationHistory(session.events);
  const fullPrompt = conversationHistory
    ? `${conversationHistory}\nUser: ${userInput}`
    : userInput;

  const response = await generateText({
    model,
    system: systemPrompt,
    temperature: codingAgentConfig.temperature,
    tools: Object.fromEntries(
      fsRegistry.map((t) => [
        t.name,
        {
          description: t.description,
          parameters: t.parameters,
          execute: async (args: any) => await runTool(t.name, args),
        },
      ])
    ),
    prompt: fullPrompt,
  });

  logger.debug(
    { toolCalls: JSON.stringify(response.toolCalls), toolResults: JSON.stringify(response.toolResults) },
    'coding-agent raw response'
  );

  let toolResults: { toolName: string; result: any; args: any }[] = [];

  // PATH A: Native tool results
  if (response.toolResults && response.toolResults.length > 0) {
    toolResults = await Promise.all(
      response.toolResults.map(async (tr) => {
        let finalResult = tr.output;
        if (finalResult === undefined) {
          logger.warn({ tool: tr.toolName }, '[FIX] SDK returned undefined, forcing manual execution');
          const toolCall = response.toolCalls?.find((tc) => tc.toolName === tr.toolName);
          finalResult = await runTool(tr.toolName, toolCall?.args ?? tr.args);
        }
        return { toolName: tr.toolName, result: finalResult, args: tr.args };
      })
    );
  }
  // PATH B: Regex fallback for models that dump JSON instead of native tool calls
  else {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const toolName = parsed.name || parsed.tool || parsed.toolName;
        if (toolName && fsRegistry.find((t) => t.name === toolName)) {
          const args = parsed.arguments || parsed.parameters || parsed.args || parsed;
          const result = await runTool(toolName, args);
          toolResults.push({ toolName, result, args });
        }
      } catch (e) {
        logger.debug('Regex fallback parsing failed.');
      }
    }
  }

  if (toolResults.length > 0) {
    for (const tr of toolResults) {
      yield { type: 'tool_call', timestamp: Date.now(), toolId: tr.toolName, parameters: tr.args };

      session.events.push({
        type: 'TOOL_RESULT',
        payload: { toolId: tr.toolName, result: tr.result, args: tr.args },
        timestamp: Date.now(),
      });

      yield { type: 'tool_result', timestamp: Date.now(), toolId: tr.toolName, result: tr.result };
    }

    const updatedHistory = buildConversationHistory(session.events);
    const finalResponse = await generateText({
      model,
      system: systemPrompt,
      temperature: codingAgentConfig.temperature,
      prompt: `${updatedHistory}\n\nBriefly confirm what was done.`,
    });

    yield { type: 'final', timestamp: Date.now(), text: finalResponse.text };
  } else {
    yield { type: 'final', timestamp: Date.now(), text: response.text.trim() };
  }
}

export const codingAgentModelSpec = codingAgentConfig.model;
