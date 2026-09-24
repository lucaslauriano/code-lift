#!/usr/bin/env node
// PreToolUse: refuse two things that are painful to undo.
//   1. `git push --force` — rewrites history someone may already have pulled.
//   2. Editing a migration that has already been applied — Prisma records a checksum, so a changed
//      file makes every later `migrate deploy` fail with a drift error. Add a new migration.
// Exit code 2 blocks the call and shows stderr to the model.
let raw = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) raw += chunk;

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0);
}

const { tool_name: tool, tool_input: input = {} } = payload;

if (tool === 'Bash') {
  const command = String(input.command ?? '');
  if (/git\s+push\b[^\n]*(--force(?!-with-lease)|(^|\s)-f(\s|$))/.test(command)) {
    process.stderr.write(
      'Blocked: `git push --force` rewrites published history.\n' +
        'Use --force-with-lease, or ask the user first.\n',
    );
    process.exit(2);
  }
  process.exit(0);
}

if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') {
  const filePath = String(input.file_path ?? '');
  if (/packages\/db\/prisma\/migrations\/.+\/migration\.sql$/.test(filePath)) {
    process.stderr.write(
      'Blocked: that migration has already been applied.\n' +
        'Prisma stores a checksum, so editing it makes every later `migrate deploy` fail with a\n' +
        'drift error. Change schema.prisma and generate a new migration instead.\n',
    );
    process.exit(2);
  }
}

process.exit(0);
