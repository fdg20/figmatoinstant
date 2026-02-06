'use client';

import { useState } from 'react';

interface Frame {
  id: string;
  name: string;
  node: any;
}

interface FrameTreeProps {
  frames: Frame[];
  onSelectFrame: (frame: Frame) => void;
  selectedFrameId?: string;
}

export default function FrameTree({ frames, onSelectFrame, selectedFrameId }: FrameTreeProps) {
  const [expandedFrames, setExpandedFrames] = useState<Set<string>>(new Set());

  const toggleExpand = (frameId: string) => {
    const newExpanded = new Set(expandedFrames);
    if (newExpanded.has(frameId)) {
      newExpanded.delete(frameId);
    } else {
      newExpanded.add(frameId);
    }
    setExpandedFrames(newExpanded);
  };

  const renderNode = (node: any, depth: number = 0): React.ReactNode => {
    const indent = depth * 20;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedFrames.has(node.id);

    return (
      <div key={node.id} className="mb-1">
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="mr-6 w-4" />}
          <span className="text-sm text-gray-700">
            {node.type === 'FRAME' && node.layoutMode && (
              <span className="text-blue-600 font-semibold">[Frame]</span>
            )}{' '}
            {node.name || 'Unnamed'}
            {node.layoutMode && (
              <span className="text-gray-400 ml-2">
                ({node.layoutMode === 'VERTICAL' ? 'V' : 'H'})
              </span>
            )}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Frame Structure</h3>
      {frames.length === 0 ? (
        <p className="text-gray-500 text-sm">No frames found. Load a Figma file first.</p>
      ) : (
        <div className="space-y-2">
          {frames.map((frame) => (
            <div
              key={frame.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedFrameId === frame.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSelectFrame(frame)}
            >
              <div className="font-medium text-gray-800 mb-2">
                {frame.name}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Layout: {frame.node.layoutMode || 'NONE'}
              </div>
              <div className="border-t pt-2">
                {renderNode(frame.node)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
