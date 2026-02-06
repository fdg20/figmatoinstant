// Figma API Types
export interface FigmaFileResponse {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  absoluteRenderBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constraints?: {
    vertical: string;
    horizontal: string;
  };
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  strokeAlign?: string;
  effects?: FigmaEffect[];
  characters?: string;
  style?: {
    fontFamily?: string;
    fontPostScriptName?: string;
    paragraphSpacing?: number;
    paragraphIndent?: number;
    listOptions?: any;
    textCase?: string;
    textDecoration?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    lineHeightPercent?: number;
    lineHeightPercentFontSize?: number;
    lineHeightUnit?: string;
    letterSpacing?: number;
    letterSpacingUnit?: string;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutWrap?: string;
  layoutGrow?: number;
  layoutAlign?: string;
  opacity?: number;
  blendMode?: string;
  preserveRatio?: boolean;
  imageHash?: string;
  cornerRadius?: number; // Corner radius for RECTANGLE nodes
  layoutPositioning?: 'AUTO' | 'ABSOLUTE'; // Layout positioning mode
}

export interface FigmaFill {
  type: 'SOLID' | 'IMAGE' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
  visible?: boolean;
  opacity?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  imageRef?: string;
  scaleMode?: string;
  imageTransform?: number[][];
}

export interface FigmaStroke {
  type: string;
  visible?: boolean;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaEffect {
  type: string;
  visible?: boolean;
  radius?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  offset?: {
    x: number;
    y: number;
  };
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: any[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: string;
  description: string;
}
