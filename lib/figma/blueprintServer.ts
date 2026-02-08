import { buildBlueprintTree } from '@/lib/parser';
import { applyPatternLabels } from '@/lib/parser/patterns';
import { FigmaNode } from '@/types/figma';
import type { CachedBlueprint } from '@/types/instant';
import { collectLabelsAndTypography } from './cache';

/**
 * Generate cached blueprint from a Figma frame node (server-only).
 * Used after fetching the node via Figma API; result is stored in cache.
 */
export function buildCachedBlueprint(
  frameNode: FigmaNode,
  fileKey: string,
  frameId: string,
  frameName: string
): CachedBlueprint {
  if (!frameNode?.layoutMode || frameNode.layoutMode === 'NONE') {
    throw new Error('Frame must use Auto-layout to convert properly');
  }

  const rootNode = buildBlueprintTree(frameNode);
  if (!rootNode) {
    throw new Error('Failed to generate blueprint from frame');
  }

  applyPatternLabels(rootNode);
  const { semanticLabels, typographyMap } = collectLabelsAndTypography(rootNode);

  return {
    blueprintTree: rootNode,
    semanticLabels,
    typographyMap,
    metadata: {
      figmaFileKey: fileKey,
      figmaFrameId: frameId,
      figmaFrameName: frameName,
      cachedAt: new Date().toISOString(),
    },
  };
}
