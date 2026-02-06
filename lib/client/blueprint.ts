import { buildBlueprintTree } from '@/lib/parser';
import { applyPatternLabels } from '@/lib/parser/patterns';
import { FigmaNode } from '@/types/figma';
import { InstantBlueprint } from '@/types/instant';

/**
 * Generate blueprint from frame node (client-side)
 */
export function generateBlueprint(
  frameNode: FigmaNode,
  fileKey: string,
  frameId: string,
  frameName: string
): InstantBlueprint {
  if (!frameNode) {
    throw new Error('Frame node is required');
  }

  // Check if frame has auto-layout
  if (!frameNode.layoutMode || frameNode.layoutMode === 'NONE') {
    throw new Error('Frame must use Auto-layout to convert properly');
  }

  // Build blueprint tree
  const rootNode = buildBlueprintTree(frameNode);

  if (!rootNode) {
    throw new Error('Failed to generate blueprint from frame');
  }

  // Apply pattern recognition labels
  applyPatternLabels(rootNode);

  const blueprint: InstantBlueprint = {
    root: rootNode,
    metadata: {
      figmaFileKey: fileKey,
      figmaFrameId: frameId,
      figmaFrameName: frameName,
      generatedAt: new Date().toISOString(),
    },
  };

  return blueprint;
}
