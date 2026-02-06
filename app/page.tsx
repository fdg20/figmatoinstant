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

export default function Home() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [blueprint, setBlueprint] = useState<InstantBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
    setFrames([]);
    setSelectedFrame(null);
    setBlueprint(null);
    setFileName(file.name);

    try {
      // Yield so the loading UI can paint before we block on file read
      await new Promise((r) => setTimeout(r, 0));

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Parse .fig file in a Web Worker to keep the page responsive
      const { document } = await parseFigFileInWorker(arrayBuffer);

      // Extract frames with auto-layout
      const extractedFrames: Frame[] = [];
      
      function traverseNodes(node: FigmaNode) {
        if (node.type === 'FRAME' && node.layoutMode) {
          // Only include frames with auto-layout
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
      // Generate blueprint from frame node
      // Use fileName as fileKey since we don't have a Figma file key anymore
      const blueprint = generateBlueprint(
        frame.node,
        fileName || 'local-file',
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
                <p className="text-gray-600 text-sm">Parsing .fig file...</p>
                <p className="text-gray-400 text-xs mt-1">Large files may take a moment</p>
              </div>
            )}
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
              <li>In Figma: File → Save local copy (.fig)</li>
              <li>Upload your .fig file using the file input above</li>
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
