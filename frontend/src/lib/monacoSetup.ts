// Monaco Editor setup for Vite.
// Workers are bundled through Vite's `?worker` imports so no CDN or
// external AMD loader is required at runtime.
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    // JavaScript/TypeScript get full language-service IntelliSense;
    // every other language falls back to the core editor worker.
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker();
    }
    return new EditorWorker();
  },
};

export const MONACO_DARK_THEME = 'vs-dark';
export const MONACO_LIGHT_THEME = 'vs';

export { monaco };
