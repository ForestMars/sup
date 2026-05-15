/**
 * @file packages/tools/fs/bash/index.ts
 * @description Run a shell command in the working directory.
 */
import { spawn } from 'node:child_process';
import { PROJECT_ROOT } from '@coda/lib';

const CWD = PROJECT_ROOT;

const DENY = [/rm\s+-rf\s+\//, /sudo/, />\s*\/etc/, />\s*\/usr/, />\s*\/bin/];

export async function run(args: { command: string }): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { command } = args;

  if (!command) throw new Error('bash: missing required argument "command"');

  for (const pattern of DENY) {
    if (pattern.test(command)) {
      throw new Error(`bash: command rejected by policy: "${command}"`);
    }
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('bash', ['-c', command], {
      cwd: CWD,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (exitCode) => resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: exitCode ?? 1 }));
    proc.on('error', reject);
  });
}
