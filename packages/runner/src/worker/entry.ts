import { runCode } from '../run';
import type { WorkerEvent, WorkerRunRequest } from '../protocol';

interface WorkerScope {
  postMessage(message: WorkerEvent): void;
  onmessage: ((event: { data: WorkerRunRequest }) => void) | null;
}

// `globalThis` rather than `self` so this file does not need the WebWorker lib, which collides
// with DOM in the same compilation.
const scope = globalThis as unknown as WorkerScope;

scope.onmessage = (event): void => {
  void execute(event.data);
};

async function execute(request: WorkerRunRequest): Promise<void> {
  if (request.type !== 'run') return;

  const result = await runCode({
    code: request.code,
    language: request.language,
    cases: request.cases,
    // Stream each case out the moment it settles. If a later case hangs and the main thread has to
    // terminate us, everything already finished has survived.
    onCase: (caseResult) => scope.postMessage({ type: 'case', result: caseResult }),
    onLog: (entry) => scope.postMessage({ type: 'log', entry }),
  });

  if (result.compileError !== null) {
    scope.postMessage({ type: 'compile-error', message: result.compileError });
    return;
  }
  scope.postMessage({ type: 'done', status: result.status, durationMs: result.durationMs });
}
