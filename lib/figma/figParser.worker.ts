/**
 * Web Worker: runs .fig parsing off the main thread to keep the UI responsive.
 */
import { parseFigFile } from './parseFigFile';

export type FigParserRequest = { type: 'parse'; buffer: ArrayBuffer };
export type FigParserResult = { type: 'result'; document: unknown };
export type FigParserError = { type: 'error'; message: string };

self.onmessage = (e: MessageEvent<FigParserRequest>) => {
  if (e.data?.type !== 'parse') return;
  try {
    const { document } = parseFigFile(e.data.buffer);
    self.postMessage({ type: 'result', document } as FigParserResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse failed';
    self.postMessage({ type: 'error', message } as FigParserError);
  }
};
