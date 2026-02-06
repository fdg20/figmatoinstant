'use client';

import { useState } from 'react';
import FrameTree from '@/components/FrameTree';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import { InstantBlueprint } from '@/types/instant';
import { fetchFigmaFrames } from '@/lib/client/figma';
import { generateBlueprint } from '@/lib/client/blueprint';

interface Frame {
  id: string;
  name: string;
  node: any;
}

export default function Home() {
  const [fileUrl, setFileUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [blueprint, setBlueprint] = useState<InstantBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);

  const handleLoadFrames = async () => {
    if (!fileUrl || !accessToken) {
      setError('Please provide both Figma File URL and Access Token');
      return;
    }

    setLoading(true);
    setError(null);
    setFrames([]);
    setSelectedFrame(null);
    setBlueprint(null);

    try {
      const data = await fetchFigmaFrames(fileUrl, accessToken);
      setFrames(data.frames);
      setFileKey(data.fileKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load frames');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFrame = async (frame: Frame) => {
    setSelectedFrame(frame);
    setLoading(true);
    setError(null);

    try {
      if (!fileKey) {
        throw new Error('File key is missing');
      }

      const blueprint = generateBlueprint(
        frame.node,
        fileKey,
        frame.id,
        frame.name
      );

      setBlueprint(blueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint');
      setBlueprint(null);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="space-y-4">
            <div>
              <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Figma File URL
              </label>
              <input
                id="fileUrl"
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
                Figma Personal Access Token
              </label>
              <input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your Figma access token"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Get your token from{' '}
                <a
                  href="https://www.figma.com/developers/api#access-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Figma Settings
                </a>
              </p>
            </div>
            <button
              onClick={handleLoadFrames}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Load Frames'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {frames.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
            {/* Left Side: Frame Tree */}
            <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden flex flex-col">
              <FrameTree
                frames={frames}
                onSelectFrame={handleSelectFrame}
                selectedFrameId={selectedFrame?.id}
              />
            </div>

            {/* Right Side: Blueprint Display (takes 2 columns) */}
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

        {/* Instructions */}
        {frames.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Paste your Figma File URL (from the browser address bar)</li>
              <li>Enter your Figma Personal Access Token</li>
              <li>Click "Load Frames" to fetch all frames with Auto-layout</li>
              <li>Select a frame from the left panel</li>
              <li>View the generated Instant Builder Blueprint on the right</li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only frames with Auto-layout are supported. Frames without Auto-layout will be skipped.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
