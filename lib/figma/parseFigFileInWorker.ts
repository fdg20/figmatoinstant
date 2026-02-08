'use client';

import { FigmaNode } from '@/types/figma';

/**
 * Parse a .fig file in a Web Worker: file read + parse both run off the main thread
 * so the UI stays responsive and we don't block on disk I/O.
 */
export function parseFigFileInWorker(file: File): Promise<{ document: FigmaNode }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./figParser.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<{ type: string; document?: unknown; message?: string }>) => {
      worker.terminate();
      if (e.data.type === 'result' && e.data.document) {
        resolve({ document: e.data.document as FigmaNode });
      } else if (e.data.type === 'error') {
        reject(new Error(e.data.message ?? 'Parse failed'));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };

    // Pass the File to the worker; it will read arrayBuffer() and parse there
    worker.postMessage({ type: 'parse', file });
  });
}
