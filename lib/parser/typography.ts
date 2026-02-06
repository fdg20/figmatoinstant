import { FigmaNode } from '@/types/figma';

export interface TypographyStyle {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
  textAlignHorizontal?: string;
  // Instant-friendly label
  label: 'Heading XL' | 'Heading L' | 'Heading M' | 'Body Large' | 'Body';
}

/**
 * Extract text styles from a text node
 * Maps to Instant-friendly labels based on fontSize
 */
export function extractTextStyles(textNode: FigmaNode): TypographyStyle {
  const style = textNode.style;
  const fontSize = style?.fontSize || 16;
  
  // Map to Instant-friendly labels
  let label: 'Heading XL' | 'Heading L' | 'Heading M' | 'Body Large' | 'Body';
  if (fontSize >= 40) {
    label = 'Heading XL';
  } else if (fontSize >= 28 && fontSize <= 39) {
    label = 'Heading L';
  } else if (fontSize >= 20 && fontSize <= 27) {
    label = 'Heading M';
  } else if (fontSize >= 16 && fontSize <= 19) {
    label = 'Body Large';
  } else {
    label = 'Body';
  }
  
  return {
    fontFamily: style?.fontFamily,
    fontWeight: style?.fontWeight,
    fontSize,
    lineHeightPx: style?.lineHeightPx,
    letterSpacing: style?.letterSpacing,
    textAlignHorizontal: style?.textAlignHorizontal,
    label,
  };
}
