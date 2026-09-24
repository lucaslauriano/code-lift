#!/usr/bin/env node
// PostToolUse(Edit|Write): run Prettier on the file that was just written.
// Reads the hook payload from stdin; stays silent unless Prettier itself fails.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';

const FORMATTABLE = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.css',
  '.yaml',
  '.yml',
]);

let raw = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
  process.exit(0);
}

if (!filePath || !existsSync(filePath) || !FORMATTABLE.has(extname(filePath))) process.exit(0);

execFile('pnpm', ['exec', 'prettier', '--write', '--log-level', 'warn', filePath], (error) => {
  // A formatting failure must never block the edit itself.
  if (error) process.stderr.write(`prettier: ${error.message}\n`);
  process.exit(0);
});
