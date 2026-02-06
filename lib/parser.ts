import { FigmaNode } from '@/types/figma';
import { InstantBlueprintNode } from '@/types/instant';
import {
  isAbsolutelyPositioned,
  isSectionNode,
  isRowNode,
  isColumnNode,
  mapToSection,
  mapToRow,
  mapToColumn,
  extractAutoLayout,
} from './parser/layout';
import { isButtonNode, mapToButton } from './parser/button';
import { extractTextStyles } from './parser/typography';

/**
 * Check if a rectangle has an image fill
 */
export function hasImageFill(node: FigmaNode): boolean {
  return (
    node.fills?.some(
      fill => (fill.type === 'IMAGE' || fill.imageRef) && fill.visible !== false
    ) || false
  );
}

/**
 * Map a Figma node to an Instant Builder node
 * Enhanced with improved layout detection, smart button detection, and typography mapping
 */
export function mapNodeToInstant(
  node: FigmaNode,
  parentLayout?: 'HORIZONTAL' | 'VERTICAL' | 'NONE',
  parentWidth?: number
): InstantBlueprintNode | null {
  // Skip absolutely positioned nodes
  if (isAbsolutelyPositioned(node)) {
    return null;
  }

  // Skip vectors/icons (we'll handle them separately if needed)
  if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
    return null;
  }

  // PART 1: Enhanced Section Detection
  // If node.type === "FRAME" AND node.layoutMode === "VERTICAL" AND
  // node.paddingTop >= 40 AND node.paddingBottom >= 40 => Treat as Instant Section
  if (isSectionNode(node)) {
    return mapToSection(node);
  }

  // PART 1: Row Detection
  // If node.layoutMode === "HORIZONTAL" => Instant Row
  if (isRowNode(node)) {
    return mapToRow(node);
  }

  // PART 1: Column Detection
  // If parent layout is HORIZONTAL and child is FRAME/GROUP => Column
  if (isColumnNode(node, parentLayout)) {
    return mapToColumn(node, parentWidth);
  }

  // PART 2: Smart Button Detection (check before other RECTANGLE checks)
  if (isButtonNode(node)) {
    return mapToButton(node);
  }

  // PART 3 & 4: TEXT node => Instant Text Block with Typography
  if (node.type === 'TEXT' && node.characters) {
    const typography = extractTextStyles(node);
    const textAlign = typography.textAlignHorizontal?.toLowerCase() || 'left';
    
    return {
      type: 'text',
      name: node.name,
      styles: {
        typography,
      },
      properties: {
        text: node.characters,
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        fontFamily: typography.fontFamily,
      },
    };
  }

  // PART 4: Image Detection with Aspect Ratio
  // RECTANGLE with image fill => Instant Image Block
  if (node.type === 'RECTANGLE' && hasImageFill(node)) {
    const width = node.absoluteBoundingBox?.width || 0;
    const height = node.absoluteBoundingBox?.height || 0;
    const aspectRatio = width > 0 ? height / width : 0;
    
    return {
      type: 'image',
      name: node.name,
      properties: {
        widthPx: width,
        heightPx: height,
      },
      styles: {
        aspectRatio,
      },
    };
  }

  // For other nodes, return null (will be skipped)
  return null;
}

/**
 * Build the blueprint tree recursively
 */
export function buildBlueprintTree(
  node: FigmaNode,
  parentLayout?: 'HORIZONTAL' | 'VERTICAL' | 'NONE',
  parentWidth?: number
): InstantBlueprintNode | null {
  const autoLayout = extractAutoLayout(node);
  const currentLayout = autoLayout?.layoutMode || parentLayout || 'NONE';
  const currentWidth = node.absoluteBoundingBox?.width || parentWidth;

  // Map the current node
  const instantNode = mapNodeToInstant(node, parentLayout, parentWidth);

  if (!instantNode) {
    // If node can't be mapped but has children, try to process children
    if (node.children && node.children.length > 0) {
      const children: InstantBlueprintNode[] = [];
      for (const child of node.children) {
        const childNode = buildBlueprintTree(child, currentLayout, currentWidth);
        if (childNode) {
          children.push(childNode);
        }
      }
      // If we found children, return a container for them
      if (children.length > 0) {
        // Determine container type based on layout
        if (currentLayout === 'VERTICAL') {
          return {
            type: 'section',
            name: node.name,
            styles: {},
            children,
          };
        } else if (currentLayout === 'HORIZONTAL') {
          return {
            type: 'row',
            name: node.name,
            styles: {},
            children,
          };
        }
      }
    }
    return null;
  }

  // Process children if they exist
  if (node.children && node.children.length > 0) {
    const children: InstantBlueprintNode[] = [];
    for (const child of node.children) {
      const childNode = buildBlueprintTree(child, currentLayout, currentWidth);
      if (childNode) {
        children.push(childNode);
      }
    }
    instantNode.children = children.length > 0 ? children : undefined;
  }

  return instantNode;
}

/**
 * Format blueprint for human-readable display (legacy format)
 * Kept for backward compatibility
 */
export function formatBlueprintForDisplay(
  node: InstantBlueprintNode,
  indent: number = 0
): string {
  const indentStr = '  '.repeat(indent);
  const lines: string[] = [];

  // Format node header
  const props: string[] = [];
  
  if (node.styles) {
    if (node.styles.padding !== undefined) {
      props.push(`padding: ${node.styles.padding}px`);
    }
    
    if (node.styles.gap !== undefined) {
      props.push(`gap: ${node.styles.gap}px`);
    }
    
    if (node.styles.backgroundColor) {
      props.push(`backgroundColor: ${node.styles.backgroundColor}`);
    }
    
    if (node.styles.borderRadius !== undefined) {
      props.push(`borderRadius: ${node.styles.borderRadius}px`);
    }
    
    if (node.styles.typography) {
      const typo = node.styles.typography;
      if (typo.label) props.push(`typography: ${typo.label}`);
      if (typo.fontSize) props.push(`fontSize: ${typo.fontSize}px`);
      if (typo.fontWeight) props.push(`fontWeight: ${typo.fontWeight}`);
    }
  }
  
  if (node.widthPercent !== undefined) {
    props.push(`width: ${node.widthPercent}%`);
  }
  
  if (node.properties) {
    if (node.properties.text) {
      const textPreview = node.properties.text.length > 50 
        ? node.properties.text.substring(0, 50) + '...'
        : node.properties.text;
      props.push(`text: "${textPreview}"`);
    }
    
    if (node.properties.widthPx && node.properties.heightPx) {
      props.push(`size: ${node.properties.widthPx}x${node.properties.heightPx}`);
    }
  }

  const propsStr = props.length > 0 ? ` (${props.join(', ')})` : '';
  const nameStr = node.name ? ` "${node.name}"` : '';
  const labelStr = node.label ? ` [${node.label}]` : '';
  
  lines.push(`${indentStr}${node.type.toUpperCase()}${nameStr}${labelStr}${propsStr}`);

  // Format children
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      lines.push(formatBlueprintForDisplay(child, indent + 1));
    }
  }

  return lines.join('\n');
}

/**
 * Extract file key from Figma URL
 */
export function extractFileKeyFromUrl(url: string): string | null {
  // Figma URLs can be:
  // https://www.figma.com/file/FILE_KEY/...
  // https://www.figma.com/design/FILE_KEY/...
  // https://figma.com/file/FILE_KEY/...
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}
