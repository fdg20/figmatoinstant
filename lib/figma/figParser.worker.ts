/**
 * Web Worker: reads file and runs .fig parsing off the main thread.
 * File read happens here too so the main thread never blocks on disk I/O.
 */
import { parseFigFile } from './parseFigFile';

export type FigParserRequest = { type: 'parse'; file: File };
export type FigParserResult = { type: 'result'; document: unknown };
export type FigParserError = { type: 'error'; message: string };

self.onmessage = async (e: MessageEvent<FigParserRequest>) => {
  if (e.data?.type !== 'parse') return;
  try {
    const buffer = await e.data.file.arrayBuffer();
    const { document } = parseFigFile(buffer);
    self.postMessage({ type: 'result', document } as FigParserResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse failed';
    self.postMessage({ type: 'error', message } as FigParserError);
  }
};
