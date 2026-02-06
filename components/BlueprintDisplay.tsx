'use client';

import { useState } from 'react';
import { InstantBlueprint } from '@/types/instant';
import { formatBlueprintForDisplay } from '@/lib/parser';
import { blueprintToMarkdown } from '@/lib/export/markdown';

interface BlueprintDisplayProps {
  blueprint: InstantBlueprint | null;
}

export default function BlueprintDisplay({ blueprint }: BlueprintDisplayProps) {
  const [viewMode, setViewMode] = useState<'blueprint' | 'markdown' | 'json'>('blueprint');

  if (!blueprint) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No blueprint generated yet</p>
          <p className="text-sm">Select a frame to generate the blueprint</p>
        </div>
      </div>
    );
  }

  const blueprintOutput = formatBlueprintForDisplay(blueprint.root);
  const markdownOutput = blueprintToMarkdown(blueprint.root);
  const jsonOutput = JSON.stringify(blueprint, null, 2);

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${blueprint.metadata?.figmaFrameName || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${blueprint.metadata?.figmaFrameName || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Instant Builder Blueprint</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('blueprint')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'blueprint'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Blueprint View
          </button>
          <button
            onClick={() => setViewMode('markdown')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'markdown'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Markdown
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'json'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {blueprint.metadata && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <div><strong>Frame:</strong> {blueprint.metadata.figmaFrameName}</div>
          <div><strong>Generated:</strong> {new Date(blueprint.metadata.generatedAt || '').toLocaleString()}</div>
        </div>
      )}

      <div className="flex-1 overflow-auto border rounded-lg p-4 bg-gray-50">
        {viewMode === 'blueprint' && (
          <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
            {blueprintOutput}
          </pre>
        )}
        {viewMode === 'markdown' && (
          <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
            {markdownOutput}
          </pre>
        )}
        {viewMode === 'json' && (
          <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
            {jsonOutput}
          </pre>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {viewMode === 'markdown' && (
          <button
            onClick={handleDownloadMarkdown}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download Markdown
          </button>
        )}
        {viewMode === 'json' && (
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download JSON
          </button>
        )}
        <button
          onClick={() => {
            const text = viewMode === 'markdown' ? markdownOutput : 
                       viewMode === 'json' ? jsonOutput : 
                       blueprintOutput;
            navigator.clipboard.writeText(text);
            alert('Blueprint copied to clipboard!');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Copy {viewMode === 'markdown' ? 'Markdown' : viewMode === 'json' ? 'JSON' : 'Blueprint'}
        </button>
      </div>
    </div>
  );
}
