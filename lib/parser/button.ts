import { FigmaNode } from '@/types/figma';
import { InstantBlueprintNode } from '@/types/instant';

/**
 * Check if a rectangle has a solid background fill
 */
function hasSolidFill(node: FigmaNode): boolean {
  if (!node.fills || node.fills.length === 0) {
    return false;
  }
  
  return node.fills.some(
    fill => fill.type === 'SOLID' && fill.visible !== false
  );
}

/**
 * Get corner radius from a node
 * Checks cornerRadius property and effects
 */
function getCornerRadius(node: FigmaNode): number {
  // Check for cornerRadius property (available in Figma API for RECTANGLE nodes)
  if (node.cornerRadius !== undefined) {
    return node.cornerRadius;
  }
  
  // Check effects for corner radius (fallback)
  if (node.effects) {
    const cornerEffect = node.effects.find(
      effect => effect.type === 'CORNER_RADIUS' || effect.type === 'INNER_SHADOW'
    );
    if (cornerEffect && cornerEffect.radius) {
      return cornerEffect.radius;
    }
  }
  
  return 0;
}

/**
 * Extract background color from fills
 */
function extractBackgroundColor(node: FigmaNode): string | undefined {
  const solidFill = node.fills?.find(
    fill => fill.type === 'SOLID' && fill.visible !== false
  );
  
  if (!solidFill || !solidFill.color) {
    return undefined;
  }
  
  const { r, g, b, a } = solidFill.color;
  const opacity = solidFill.opacity !== undefined ? solidFill.opacity : a;
  
  // Convert to hex or rgba
  const toHex = (val: number) => Math.round(val * 255).toString(16).padStart(2, '0');
  
  if (opacity === 1) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
}

/**
 * Extract text style from button's text child
 */
function extractButtonTextStyle(node: FigmaNode): {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
} {
  const textChild = node.children?.find(child => child.type === 'TEXT');
  if (!textChild) {
    return {};
  }
  
  return {
    text: textChild.characters,
    fontSize: textChild.style?.fontSize,
    fontWeight: textChild.style?.fontWeight,
    fontFamily: textChild.style?.fontFamily,
  };
}

/**
 * Smart button detection
 * A node is a Button if ALL are true:
 * - node.type === "FRAME" or "RECTANGLE"
 * - Has solid background fill
 * - Height between 36px and 80px
 * - Contains a TEXT child
 * - Corner radius > 4
 * - Width < 400px
 */
export function isButtonNode(node: FigmaNode): boolean {
  // Check type
  if (node.type !== 'FRAME' && node.type !== 'RECTANGLE') {
    return false;
  }
  
  // Check dimensions
  if (!node.absoluteBoundingBox) {
    return false;
  }
  
  const { width, height } = node.absoluteBoundingBox;
  
  // Height between 36px and 80px
  if (height < 36 || height > 80) {
    return false;
  }
  
  // Width < 400px
  if (width >= 400) {
    return false;
  }
  
  // Has solid background fill
  if (!hasSolidFill(node)) {
    return false;
  }
  
  // Contains a TEXT child
  const hasTextChild = node.children?.some(child => child.type === 'TEXT') || false;
  if (!hasTextChild) {
    return false;
  }
  
  // Corner radius > 4 (for RECTANGLE) or any corner radius (for FRAME)
  // FRAME nodes might not have corner radius set directly, so we're more lenient
  if (node.type === 'RECTANGLE') {
    const cornerRadius = getCornerRadius(node);
    if (cornerRadius <= 4) {
      return false;
    }
  } else if (node.type === 'FRAME') {
    // For FRAME nodes, check if any child has corner radius, or allow if no corner radius check needed
    // FRAME buttons might not have corner radius set on the frame itself
    const cornerRadius = getCornerRadius(node);
    // Allow FRAME buttons even without corner radius, as they might be styled differently
    // But if corner radius exists and is <= 4, it's probably not a button
    if (cornerRadius > 0 && cornerRadius <= 4) {
      return false;
    }
  }
  
  return true;
}

/**
 * Map a Figma node to an Instant Button Block
 */
export function mapToButton(node: FigmaNode): InstantBlueprintNode {
  const { width, height } = node.absoluteBoundingBox || { width: 0, height: 0 };
  const cornerRadius = getCornerRadius(node);
  const backgroundColor = extractBackgroundColor(node);
  const textStyle = extractButtonTextStyle(node);
  
  return {
    type: 'button',
    name: node.name,
    styles: {
      backgroundColor,
      borderRadius: cornerRadius,
    },
    properties: {
      widthPx: width,
      heightPx: height,
      text: textStyle.text,
      fontSize: textStyle.fontSize,
      fontWeight: textStyle.fontWeight,
    },
  };
}
