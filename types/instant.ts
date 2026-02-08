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
  label?: string; // Semantic pattern label (e.g., "announcement-bar", "navbar", "hero-section")
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

/** Stored in /data/figma-cache/{fileKey}-{frameId}.json — parsed blueprint only, never raw Figma JSON */
export interface CachedBlueprint {
  blueprintTree: InstantBlueprintNode;
  semanticLabels: Record<string, string>; // node name/path -> label
  typographyMap: Record<string, TypographyStyle>; // key -> typography style
  metadata: {
    figmaFileKey: string;
    figmaFrameId: string;
    figmaFrameName: string;
    cachedAt: string;
  };
}
