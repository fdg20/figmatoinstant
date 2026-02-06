'use client';

import { InstantBlueprintNode } from '@/types/instant';

interface PreviewRendererProps {
  tree: InstantBlueprintNode;
}

/**
 * Convert typography styles to inline CSS
 */
function getTypographyStyles(node: InstantBlueprintNode): React.CSSProperties {
  const styles: React.CSSProperties = {};
  const typography = node.styles?.typography;
  const properties = node.properties;

  if (typography) {
    if (typography.fontSize) {
      styles.fontSize = `${typography.fontSize}px`;
    }
    if (typography.fontWeight) {
      styles.fontWeight = typography.fontWeight;
    }
    if (typography.lineHeightPx) {
      styles.lineHeight = `${typography.lineHeightPx}px`;
    }
    if (typography.letterSpacing !== undefined) {
      styles.letterSpacing = `${typography.letterSpacing}px`;
    }
    if (typography.textAlignHorizontal) {
      styles.textAlign = typography.textAlignHorizontal.toLowerCase() as 'left' | 'center' | 'right';
    }
    if (typography.fontFamily) {
      styles.fontFamily = typography.fontFamily;
    }
  }

  // Fallback to properties if typography not available
  if (properties) {
    if (properties.fontSize && !styles.fontSize) {
      styles.fontSize = `${properties.fontSize}px`;
    }
    if (properties.fontWeight && !styles.fontWeight) {
      styles.fontWeight = properties.fontWeight;
    }
    if (properties.fontFamily && !styles.fontFamily) {
      styles.fontFamily = properties.fontFamily;
    }
  }

  return styles;
}

/**
 * Convert node styles to inline CSS
 */
function getNodeStyles(node: InstantBlueprintNode): React.CSSProperties {
  const styles: React.CSSProperties = {};
  const nodeStyles = node.styles || {};

  // Padding
  if (nodeStyles.padding !== undefined) {
    styles.padding = `${nodeStyles.padding}px`;
  }

  // Gap
  if (nodeStyles.gap !== undefined) {
    styles.gap = `${nodeStyles.gap}px`;
  }

  // Background color
  if (nodeStyles.backgroundColor) {
    styles.backgroundColor = nodeStyles.backgroundColor;
  }

  // Border radius
  if (nodeStyles.borderRadius !== undefined) {
    styles.borderRadius = `${nodeStyles.borderRadius}px`;
  }

  // Width percent (for columns)
  if (node.widthPercent !== undefined) {
    styles.width = `${node.widthPercent}%`;
  }

  return styles;
}

/**
 * Format pattern label for display
 */
function formatPatternLabel(label: string): string {
  const labelMap: Record<string, string> = {
    'announcement-bar': 'Announcement Bar',
    'navbar': 'Navbar',
    'hero-section': 'Hero Section',
    'trust-badge-row': 'Trust Badge Row',
    'icon-feature-row': 'Icon Feature Row',
    'two-column-feature': 'Two Column Feature',
    'image-feature-list': 'Image + Feature List',
    'card-grid': 'Card Grid (reviews)',
    'cta-section': 'CTA Section',
    'email-form': 'Email Form',
  };
  return labelMap[label] || label;
}

/**
 * Recursively render a BlueprintNode tree
 */
function renderNode(node: InstantBlueprintNode): React.ReactNode {
  const baseStyles = getNodeStyles(node);
  const typographyStyles = getTypographyStyles(node);
  const combinedStyles = { ...baseStyles, ...typographyStyles };

  // Show pattern label above sections
  const showLabel = node.label && (node.type === 'section' || node.type === 'row');

  switch (node.type) {
    case 'section': {
      return (
        <div key={node.name || 'section'} className="w-full flex flex-col" style={combinedStyles}>
          {showLabel && node.label && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              {formatPatternLabel(node.label)}
            </div>
          )}
          {node.children?.map((child, index) => (
            <div key={index}>{renderNode(child)}</div>
          ))}
        </div>
      );
    }

    case 'row': {
      return (
        <div key={node.name || 'row'} className="w-full flex flex-col">
          {showLabel && node.label && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              {formatPatternLabel(node.label)}
            </div>
          )}
          <div className="flex flex-row" style={combinedStyles}>
            {node.children?.map((child, index) => (
              <div key={index}>{renderNode(child)}</div>
            ))}
          </div>
        </div>
      );
    }

    case 'column': {
      return (
        <div key={node.name || 'column'} className="flex flex-col" style={combinedStyles}>
          {node.children?.map((child, index) => (
            <div key={index}>{renderNode(child)}</div>
          ))}
        </div>
      );
    }

    case 'text': {
      const textContent = node.properties?.text || node.name || '';
      return (
        <p key={node.name || 'text'} style={combinedStyles}>
          {textContent}
        </p>
      );
    }

    case 'image': {
      const width = node.properties?.widthPx;
      const height = node.properties?.heightPx;
      const aspectRatio = node.styles?.aspectRatio;
      
      const imageStyles: React.CSSProperties = {
        ...combinedStyles,
        maxWidth: '100%',
        height: 'auto',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: '14px',
      };

      if (width) {
        imageStyles.width = `${width}px`;
      }
      if (height) {
        imageStyles.height = `${height}px`;
      }
      if (aspectRatio) {
        imageStyles.aspectRatio = aspectRatio.toString();
      }

      return (
        <div
          key={node.name || 'image'}
          style={imageStyles}
          className="border border-gray-300 rounded"
        >
          <span>{node.name || 'Image'}</span>
        </div>
      );
    }

    case 'button': {
      const buttonText = node.properties?.text || node.name || 'Button';
      return (
        <button
          key={node.name || 'button'}
          style={combinedStyles}
          className="px-4 py-2 rounded cursor-pointer"
        >
          {buttonText}
        </button>
      );
    }

    default:
      // Ignore unsupported nodes
      return null;
  }
}

export default function PreviewRenderer({ tree }: PreviewRendererProps) {
  return (
    <div className="w-full" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {renderNode(tree)}
    </div>
  );
}
