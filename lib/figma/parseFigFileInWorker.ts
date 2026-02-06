'use client';

import { FigmaNode } from '@/types/figma';

/**
 * Parse a .fig file in a Web Worker so the main thread stays responsive.
 */
export function parseFigFileInWorker(buffer: ArrayBuffer): Promise<{ document: FigmaNode }> {
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

    // Transfer the buffer to the worker so main thread doesn't hold a copy
    worker.postMessage({ type: 'parse', buffer }, [buffer]);
  });
}
