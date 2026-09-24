import { CompileError } from './transpile';

export type SolutionFn = (...args: never[]) => unknown;

interface FakeModule {
  exports: Record<string, unknown>;
}

/**
 * Runs transpiled CommonJS and hands back its exports.
 *
 * `new Function` rather than `eval` so the body cannot reach the enclosing scope, and a `require`
 * that always throws so a stray import fails with a clear message instead of `require is not defined`.
 */
export function evaluateModule(js: string): Record<string, unknown> {
  const module: FakeModule = { exports: {} };
  const require = (specifier: string): never => {
    throw new CompileError(
      `Cannot import "${specifier}" — a submission must be a single self-contained file.`,
    );
  };

  try {
    const factory = new Function('module', 'exports', 'require', `"use strict";\n${js}`) as (
      module: FakeModule,
      exports: Record<string, unknown>,
      require: (specifier: string) => never,
    ) => void;
    factory(module, module.exports, require);
  } catch (error) {
    if (error instanceof CompileError) throw error;
    throw new CompileError(
      `The file threw while loading: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }

  return module.exports;
}

/** Pulls out the entry point, accepting either a named `solution` export or a default export. */
export function getSolution(exports: Record<string, unknown>): SolutionFn {
  const candidate = exports['solution'] ?? exports['default'];
  if (typeof candidate !== 'function') {
    throw new CompileError(
      'No `solution` function was exported. Add `export function solution(...) { ... }`.',
    );
  }
  return candidate as SolutionFn;
}
