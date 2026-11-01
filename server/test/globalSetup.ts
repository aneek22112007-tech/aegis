import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const databaseFile = path.join(serverRoot, 'prisma', 'test.db');

export default function setup(): void {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    fs.rmSync(databaseFile + suffix, { force: true });
  }
  execSync('npx prisma migrate deploy', {
    cwd: serverRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:${databaseFile}` },
  });
}
