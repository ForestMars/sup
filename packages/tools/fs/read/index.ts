/**
 * @file packages/tools/fs/read/index.ts
 * @description Read a file relative to the working directory.
 */
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const CWD = process.cwd();

export async function run(args: { path: string }): Promise<{ content: string; path: string }> {
  const { path: rawPath } = args;

  if (!rawPath) throw new Error('read: missing required argument "path"');

  const stripped = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  const resolved = resolve(join(CWD, stripped));

  if (!resolved.startsWith(CWD)) {
    throw new Error(`read: path "${rawPath}" resolves outside working directory`);
  }

  const content = await readFile(resolved, 'utf-8');
  return { content, path: resolved };
}
