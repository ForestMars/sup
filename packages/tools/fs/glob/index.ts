/**
 * @file packages/tools/fs/glob/index.ts
 * @description List files matching a glob pattern, relative to working directory.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { PROJECT_ROOT } from '@sup/lib';

const CWD = PROJECT_ROOT;

async function walk(dir: string, pattern: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await walk(full, pattern));
    } else {
      results.push(relative(CWD, full));
    }
  }
  return results;
}

export async function run(args: { pattern: string }): Promise<{ files: string[] }> {
  const { pattern } = args;
  if (!pattern) throw new Error('glob: missing required argument "pattern"');

  // For now: list all files and filter by simple suffix match
  // Can swap in micromatch/glob later without changing the interface
  const all = await walk(CWD, pattern);
  const suffix = pattern.replace(/^\*+/, '');
  const files = suffix ? all.filter(f => f.endsWith(suffix)) : all;

  return { files };
}
