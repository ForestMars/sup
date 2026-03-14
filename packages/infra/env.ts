/**
 * @file infra/env.ts
 * @description Load environment first 
 */
const DEFAULT_MODEL = 'qwen3:8b';

export const FACTOTUM_MODEL = 'qwen2.5:1.5b'; 
export const TEMPERATURE = 0;
export const AGENT_MODEL = process.env.SUPPORT_AGENT_MODEL || DEFAULT_MODEL;

if (!process.env.SUPPORT_AGENT_MODEL) {
  process.env.SUPPORT_AGENT_MODEL = AGENT_MODEL;
}