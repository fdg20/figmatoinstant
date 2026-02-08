'use client';

import { useState } from 'react';
import FrameTree from '@/components/FrameTree';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import { InstantBlueprint } from '@/types/instant';
import { parseFigFileInWorker } from '@/lib/figma/parseFigFileInWorker';
import { generateBlueprint } from '@/lib/client/blueprint';
import { FigmaNode } from '@/types/figma';

interface Frame {
  id: string;
  name: string;
  node: any;
}

type Source = 'fig' | 'url';

export default function Home() {
  const [source, setSource] = useState<Source | null>(null);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [blueprint, setBlueprint] = useState<InstantBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFigmaUrlSubmit = async () => {
    const url = figmaUrl.trim();
    if (!url) {
      setError('Please enter a Figma URL');
      return;
    }
    if (!url.includes('node-id=')) {
      setError('URL must include a frame (node-id). In Figma, right‑click the frame → Copy link to selection.');
      return;
    }

    setLoading(true);
    setError(null);
    setSource('url');
    setFrames([]);
    setSelectedFrame(null);
    setBlueprint(null);

    try {
      const res = await fetch('/api/figma/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load blueprint');
      }
      setBlueprint(data as InstantBlueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blueprint');
      setBlueprint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshFromFigma = async () => {
    if (!figmaUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/figma/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: figmaUrl.trim(), forceRefresh: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh');
      }
      setBlueprint(data as InstantBlueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh from Figma');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.fig')) {
      setError('Please upload a .fig file');
      return;
    }

    setLoading(true);
    setError(null);
    setSource('fig');
    setFigmaUrl('');
    setFrames([]);
    setSelectedFrame(null);
    setBlueprint(null);
    setFileName(file.name);

    try {
      await new Promise((r) => setTimeout(r, 0));
      const { document } = await parseFigFileInWorker(file);

      const extractedFrames: Frame[] = [];
      function traverseNodes(node: FigmaNode) {
        if (node.type === 'FRAME' && node.layoutMode) {
          extractedFrames.push({
            id: node.id,
            name: node.name,
            node: node,
          });
        }
        if (node.children) {
          for (const child of node.children) {
            traverseNodes(child);
          }
        }
      }
      traverseNodes(document);

      if (extractedFrames.length === 0) {
        setError('No frames with Auto-layout found in this file');
      } else {
        setFrames(extractedFrames);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse .fig file');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFrame = async (frame: Frame) => {
    setSelectedFrame(frame);
    setLoading(true);
    setError(null);

    try {
      const bp = generateBlueprint(
        frame.node,
        fileName || 'local-file',
        frame.id,
        frame.name
      );
      setBlueprint(bp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint');
      setBlueprint(null);
    } finally {
      setLoading(false);
    }
  };

  const showRefreshButton = source === 'url' && blueprint != null && figmaUrl.trim().length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Figma → Instant Builder Blueprint
          </h1>
          <p className="text-gray-600">
            Convert Figma frames with Auto-layout to Instant Builder blueprints
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-6">
            {/* Figma URL — one call per project, cached on server */}
            <div>
              <label htmlFor="figmaUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Figma URL (frame link)
              </label>
              <div className="flex gap-2">
                <input
                  id="figmaUrl"
                  type="url"
                  placeholder="https://www.figma.com/design/...?node-id=1-2-3"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleFigmaUrlSubmit}
                  disabled={loading || !figmaUrl.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load blueprint
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Paste a link to a specific frame (with node-id). Blueprint is cached — no API calls when you preview or re-open.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <span className="text-sm text-gray-500">Or upload a .fig file</span>
            </div>
            <div>
              <label htmlFor="figFile" className="block text-sm font-medium text-gray-700 mb-2">
                Upload your Figma .fig file
              </label>
              <input
                id="figFile"
                type="file"
                accept=".fig"
                onChange={handleFileUpload}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">
                In Figma: File → Save local copy (.fig)
              </p>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">
                  {source === 'url' ? 'Loading blueprint...' : 'Parsing .fig file...'}
                </p>
                <p className="text-gray-400 text-xs mt-1">Large files may take a moment</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content: from URL = single blueprint, no frame list */}
        {source === 'url' && blueprint != null && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 min-h-[800px]">
            <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden flex flex-col">
              {showRefreshButton && (
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleRefreshFromFigma}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                  >
                    Refresh from Figma
                  </button>
                </div>
              )}
              <BlueprintDisplay blueprint={blueprint} />
            </div>
          </div>
        )}

        {/* Main Content: from .fig = frame tree + blueprint */}
        {source === 'fig' && frames.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
            <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden flex flex-col">
              <FrameTree
                frames={frames}
                onSelectFrame={handleSelectFrame}
                selectedFrameId={selectedFrame?.id}
              />
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 overflow-hidden flex flex-col">
              {loading && selectedFrame ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating blueprint...</p>
                  </div>
                </div>
              ) : (
                <BlueprintDisplay blueprint={blueprint} />
              )}
            </div>
          </div>
        )}

        {!blueprint && frames.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li><strong>Figma URL:</strong> Copy link to a frame (node-id in URL), paste above, click Load blueprint. Cached on server — no API calls when previewing.</li>
              <li><strong>Or .fig file:</strong> File → Save local copy (.fig), upload, then select a frame.</li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only frames with Auto-layout are supported. For URL, set FIGMA_ACCESS_TOKEN in .env.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
