import fs from 'node:fs';
import path from 'node:path';

export function parseEnv(text: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }
  return entries;
}

function applyEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const parsed = parseEnv(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadEnvFiles(): void {
  const serverRoot = path.resolve(import.meta.dirname, '..');
  const repoRoot = path.resolve(serverRoot, '..');
  applyEnvFile(path.join(repoRoot, '.env'));
  applyEnvFile(path.join(serverRoot, '.env'));
}
