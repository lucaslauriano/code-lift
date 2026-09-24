import type { Language } from '@code-lift/shared';

const PREFIX = 'codelift:code';

function key(slug: string, language: Language): string {
  return `${PREFIX}:${slug}:${language}`;
}

/**
 * Draft code, per question and per language.
 *
 * localStorage rather than the API: this fires on every keystroke, and losing the last few seconds
 * of an unsaved draft to a refresh is the thing worth preventing. The API only sees code on Submit.
 *
 * Every access is guarded — private windows and blocked site data both throw rather than returning
 * empty, and an editor that crashes because storage is unavailable would be a poor trade.
 */
export function readCode(slug: string, language: Language): string | null {
  try {
    return window.localStorage.getItem(key(slug, language));
  } catch {
    return null;
  }
}

export function writeCode(slug: string, language: Language, code: string): void {
  try {
    window.localStorage.setItem(key(slug, language), code);
  } catch {
    // Storage full or unavailable. The draft is still in memory; nothing to recover here.
  }
}

export function clearCode(slug: string, language: Language): void {
  try {
    window.localStorage.removeItem(key(slug, language));
  } catch {
    // Same as above.
  }
}
