'use client';

import { useState } from 'react';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import { InstantBlueprint } from '@/types/instant';

export default function Home() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [blueprint, setBlueprint] = useState<InstantBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlueprint = async (url: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/figma/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, forceRefresh }),
      });

      const contentType = res.headers.get('content-type');
      const text = await res.text();

      if (!contentType?.includes('application/json')) {
        setError(
          'Could not reach the server. The Figma URL feature needs a running server. ' +
            'If you’re on the static site (e.g. GitHub Pages), run the app locally: npm run dev — and set FIGMA_ACCESS_TOKEN in .env.'
        );
        setBlueprint(null);
        return;
      }

      let data: { error?: string } & InstantBlueprint;
      try {
        data = JSON.parse(text);
      } catch {
        setError(
          'Server returned an invalid response. Run the app locally (npm run dev) with FIGMA_ACCESS_TOKEN set for the Figma URL feature.'
        );
        setBlueprint(null);
        return;
      }

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

  const handleFigmaUrlSubmit = async () => {
    const url = figmaUrl.trim();
    if (!url) {
      setError('Please enter a Figma URL');
      return;
    }
    if (!url.includes('node-id=')) {
      setError(
        'URL must include a frame (node-id). In Figma, select your frame → right‑click → Copy link to selection.'
      );
      return;
    }
    setBlueprint(null);
    await loadBlueprint(url, false);
  };

  const handleRefreshFromFigma = async () => {
    if (!figmaUrl.trim()) return;
    await loadBlueprint(figmaUrl.trim(), true);
  };

  const showRefreshButton = blueprint != null && figmaUrl.trim().length > 0;

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
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
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading blueprint…</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {blueprint != null && (
          <div className="grid grid-cols-1 gap-6 min-h-[800px]">
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

        {!blueprint && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>
                <strong>Copy a link to your frame:</strong> In Figma, select the frame you want in the layers panel or on the canvas → right‑click → <strong>Copy link to selection</strong>. (You can also use the Share button and copy the link that includes the frame.)
              </li>
              <li>
                <strong>Paste and load:</strong> Paste the link above and click <strong>Load blueprint</strong>. The blueprint is cached on the server — no extra API calls when you preview or re-open.
              </li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only frames with Auto-layout are supported. Set <code className="bg-yellow-100 px-1 rounded">FIGMA_ACCESS_TOKEN</code> in <code className="bg-yellow-100 px-1 rounded">.env</code> when running locally.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
