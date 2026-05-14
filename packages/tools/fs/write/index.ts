/**
 * @file packages/tools/fs/write/index.ts
 * @description Write a file relative to the working directory.
 * Absolute paths and directory traversal are rejected — always.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, normalize } from 'node:path';

const CWD = process.cwd();

export async function run(args: { path: string; content: string }): Promise<{ success: boolean; path: string }> {
  const { path: rawPath, content } = args;

  if (!rawPath) throw new Error('write: missing required argument "path"');
  if (content === undefined) throw new Error('write: missing required argument "content"');

  // Strip leading slash if model ignores us and sends absolute path anyway
  const stripped = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  const resolved = resolve(join(CWD, stripped));

  // Prevent escape via ../
  if (!resolved.startsWith(CWD)) {
    throw new Error(`write: path "${rawPath}" resolves outside working directory`);
  }

  // Create parent dirs if needed
  const dir = resolve(resolved, '..');
  await mkdir(dir, { recursive: true });

  await writeFile(resolved, content, 'utf-8');

  return { success: true, path: resolved };
}
