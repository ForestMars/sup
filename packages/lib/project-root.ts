/**
 * @file project-root.ts
 * @description Resolves, validates, and exposes the target project's working directory 
 * to ensure the agent remains securely anchored inside the target workspace.
 */
import { resolve, dirname } from "path";
import { existsSync } from "fs";

/**
 * Resolves the working project directory for the agent.
 * Priority order:
 *   1. CODA_PROJECT_DIR env var (explicit override)
 *   2. --project <path> CLI arg
 *   3. Walk up from process.cwd() until we find a .git or package.json
 *      that is NOT Coda2's own root
 */
export function resolveProjectRoot(): string {
  // 1. Explicit env override
  if (process.env.CODA_PROJECT_DIR) {
    const dir = resolve(process.env.CODA_PROJECT_DIR);
    if (!existsSync(dir)) {
      throw new Error(`CODA_PROJECT_DIR="${dir}" does not exist`);
    }
    return dir;
  }

  // 2. CLI arg: --project /some/path
  const projectArgIdx = process.argv.indexOf("--project");
  if (projectArgIdx !== -1 && process.argv[projectArgIdx + 1]) {
    return resolve(process.argv[projectArgIdx + 1]);
  }

  // 3. Walk up from CWD, skip our own repo root
  const codaRoot = resolve(import.meta.dir, "../../.."); // packages/lib/src -> repo root
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (dir !== codaRoot && existsSync(`${dir}/.git`)) {
      return dir;
    }
    dir = dirname(dir);
  }

  // Fallback: use process.cwd() and warn loudly
  console.warn(
    `[Coda] WARNING: Could not determine project root. ` +
    `Defaulting to process.cwd()="${process.cwd()}". ` +
    `Set CODA_PROJECT_DIR or pass --project <path>.`
  );
  return process.cwd();
}

// Singleton — resolved once at startup
export const PROJECT_ROOT = resolveProjectRoot();