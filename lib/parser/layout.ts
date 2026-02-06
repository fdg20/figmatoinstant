import { FigmaNode } from '@/types/figma';
import { InstantBlueprintNode } from '@/types/instant';

/**
 * Extract auto-layout properties from a Figma node
 */
export function extractAutoLayout(node: FigmaNode): {
  layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  padding: { top: number; right: number; bottom: number; left: number };
  itemSpacing: number;
} | null {
  if (!node.layoutMode || node.layoutMode === 'NONE') {
    return null;
  }

  return {
    layoutMode: node.layoutMode,
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    itemSpacing: node.itemSpacing || 0,
  };
}

/**
 * Check if a node is absolutely positioned
 */
export function isAbsolutelyPositioned(node: FigmaNode): boolean {
  // Check layoutPositioning property if available
  if (node.layoutPositioning === 'ABSOLUTE') {
    return true;
  }
  
  // Fallback: check constraints
  if (node.constraints) {
    return node.constraints.horizontal === 'MIN' || node.constraints.vertical === 'MIN';
  }
  return false;
}

/**
 * Calculate width percentage based on node and parent dimensions
 */
export function calculateWidthPercentage(
  node: FigmaNode,
  parentWidth?: number
): number {
  if (!node.absoluteBoundingBox || !parentWidth) {
    return 100;
  }

  const nodeWidth = node.absoluteBoundingBox.width;
  const percentage = (nodeWidth / parentWidth) * 100;
  
  return Math.round(percentage * 10) / 10; // Round to 1 decimal place
}

/**
 * Detect if a node should be treated as an Instant Section
 * Rules:
 * - node.type === "FRAME"
 * - node.layoutMode === "VERTICAL"
 * - node.paddingTop >= 40 AND node.paddingBottom >= 40
 */
export function isSectionNode(node: FigmaNode): boolean {
  if (node.type !== 'FRAME') {
    return false;
  }
  
  const autoLayout = extractAutoLayout(node);
  if (autoLayout?.layoutMode !== 'VERTICAL') {
    return false;
  }
  
  const padding = autoLayout.padding;
  return padding.top >= 40 && padding.bottom >= 40;
}

/**
 * Detect if a node should be treated as an Instant Row
 * Rules:
 * - node.layoutMode === "HORIZONTAL"
 */
export function isRowNode(node: FigmaNode): boolean {
  const autoLayout = extractAutoLayout(node);
  return autoLayout?.layoutMode === 'HORIZONTAL' || false;
}

/**
 * Detect if a node should be treated as an Instant Column
 * Rules:
 * - parent layout is HORIZONTAL
 * - child is FRAME or GROUP
 */
export function isColumnNode(
  node: FigmaNode,
  parentLayout?: 'HORIZONTAL' | 'VERTICAL' | 'NONE'
): boolean {
  if (parentLayout !== 'HORIZONTAL') {
    return false;
  }
  
  return node.type === 'FRAME' || node.type === 'GROUP';
}

/**
 * Map a Figma node to an Instant Section
 */
export function mapToSection(node: FigmaNode): InstantBlueprintNode {
  const autoLayout = extractAutoLayout(node);
  const padding = autoLayout?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  
  const paddingValue = padding.top === padding.right && 
                       padding.right === padding.bottom && 
                       padding.bottom === padding.left
    ? padding.top
    : undefined;
  
  return {
    type: 'section',
    name: node.name,
    styles: {
      padding: paddingValue,
      gap: autoLayout?.itemSpacing,
    },
    children: [],
  };
}

/**
 * Map a Figma node to an Instant Row
 */
export function mapToRow(node: FigmaNode): InstantBlueprintNode {
  const autoLayout = extractAutoLayout(node);
  const padding = autoLayout?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const paddingValue = padding.top === padding.right && 
                       padding.right === padding.bottom && 
                       padding.bottom === padding.left
    ? padding.top
    : undefined;
  
  return {
    type: 'row',
    name: node.name,
    styles: {
      gap: autoLayout?.itemSpacing,
      padding: paddingValue,
    },
    children: [],
  };
}

/**
 * Map a Figma node to an Instant Column
 */
export function mapToColumn(
  node: FigmaNode,
  parentWidth?: number
): InstantBlueprintNode {
  const widthPercent = calculateWidthPercentage(node, parentWidth);
  
  return {
    type: 'column',
    name: node.name,
    widthPercent,
    children: [],
  };
}
