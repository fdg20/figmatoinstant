// Instant Builder Blueprint Types

export type InstantNodeType = 'section' | 'row' | 'column' | 'text' | 'image' | 'button';

export interface TypographyStyle {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
  textAlignHorizontal?: string;
  label?: 'Heading XL' | 'Heading L' | 'Heading M' | 'Body Large' | 'Body';
}

export interface InstantBlueprintNode {
  type: InstantNodeType;
  name?: string;
  widthPercent?: number; // For columns
  styles?: {
    padding?: number; // Single value for uniform padding, or object for individual sides
    gap?: number;
    backgroundColor?: string;
    borderRadius?: number;
    typography?: TypographyStyle;
    aspectRatio?: number; // For images
  };
  properties?: {
    text?: string;
    widthPx?: number;
    heightPx?: number;
    fontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
  };
  children?: InstantBlueprintNode[];
}

export interface InstantBlueprint {
  root: InstantBlueprintNode;
  metadata?: {
    figmaFileKey?: string;
    figmaFrameId?: string;
    figmaFrameName?: string;
    generatedAt?: string;
  };
}
