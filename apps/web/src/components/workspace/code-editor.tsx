'use client';

import Editor, { type Monaco } from '@monaco-editor/react';
import { useCallback } from 'react';
import type { Language } from '@code-lift/shared';

interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
  /** Fired by the editor's own keybindings so the shortcuts work with focus inside Monaco. */
  onRun: () => void;
  onSubmit: () => void;
}

export function CodeEditor({
  language,
  value,
  onChange,
  onRun,
  onSubmit,
}: CodeEditorProps): React.ReactElement {
  const beforeMount = useCallback((monaco: Monaco) => {
    // The submission is a standalone module evaluated by the runner, not part of a project, so the
    // editor should not complain about module resolution or a missing tsconfig.
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2022,
      lib: ['es2023'],
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      strict: true,
      noEmit: true,
      allowNonTsExtensions: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      // 2307: cannot find module. The runner rejects imports anyway, with a clearer message.
      diagnosticCodesToIgnore: [2307],
    });
  }, []);

  const onMount = useCallback<NonNullable<React.ComponentProps<typeof Editor>['onMount']>>(
    (editor, monaco) => {
      // Registered on the editor as well as on the window: with focus inside Monaco, Monaco
      // consumes the keystroke first and a window listener alone would never see it.
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        onSubmit,
      );
    },
    [onRun, onSubmit],
  );

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={language === 'typescript' ? 'typescript' : 'javascript'}
      path={`submission.${language === 'typescript' ? 'ts' : 'js'}`}
      value={value}
      beforeMount={beforeMount}
      onMount={onMount}
      onChange={(next) => onChange(next ?? '')}
      loading={<EditorLoading />}
      options={{
        fontSize: 13,
        fontFamily: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: 'line',
        smoothScrolling: true,
        fixedOverflowWidgets: true,
      }}
    />
  );
}

function EditorLoading(): React.ReactElement {
  return (
    <div className="grid h-full place-items-center text-sm text-[var(--muted-foreground)]">
      Loading editor…
    </div>
  );
}
