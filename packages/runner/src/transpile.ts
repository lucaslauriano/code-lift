import { transform } from 'sucrase';
import type { Language } from '@code-lift/shared';

/** Thrown when the submitted source cannot be turned into runnable JavaScript. */
export class CompileError extends Error {
  override readonly name = 'CompileError';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

/**
 * TypeScript (or modern JS) to CommonJS, via sucrase.
 *
 * Sucrase only strips types — it does not type-check. That is the right trade here: the editor
 * already reports type errors through Monaco, and the runner needs to be synchronous and fast.
 * If we ever need real bundling (imports across files, npm packages), `esbuild-wasm` is the upgrade.
 */
export function transpile(code: string, language: Language): string {
  try {
    const result = transform(code, {
      transforms: language === 'typescript' ? ['typescript', 'imports'] : ['imports'],
      disableESTransforms: true,
      preserveDynamicImport: false,
      filePath: language === 'typescript' ? 'submission.ts' : 'submission.js',
    });
    return result.code;
  } catch (error) {
    throw new CompileError(error instanceof Error ? error.message : String(error), {
      cause: error,
    });
  }
}
