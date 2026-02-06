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
    styles.flexShrink = 0;
    styles.flexGrow = 0;
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
  
  // Show pattern label above sections
  const showLabel = node.label && (node.type === 'section' || node.type === 'row');

  switch (node.type) {
    case 'section': {
      const sectionStyles: React.CSSProperties = {
        ...baseStyles,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      };
      
      return (
        <div key={node.name || 'section'} style={sectionStyles}>
          {showLabel && node.label && (
            <div className="mb-1 px-2">
              <span className="inline-block text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded border border-blue-200">
                {formatPatternLabel(node.label)}
              </span>
            </div>
          )}
          {node.children?.map((child, index) => (
            <div key={index}>{renderNode(child)}</div>
          ))}
        </div>
      );
    }

    case 'row': {
      const rowContainerStyles: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      };
      
      const rowStyles: React.CSSProperties = {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
      };
      
      return (
        <div key={node.name || 'row'} style={rowContainerStyles}>
          {showLabel && node.label && (
            <div className="mb-1 px-2">
              <span className="inline-block text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded border border-blue-200">
                {formatPatternLabel(node.label)}
              </span>
            </div>
          )}
          <div style={rowStyles}>
            {node.children?.map((child, index) => (
              <div key={index} style={{ display: 'flex' }}>{renderNode(child)}</div>
            ))}
          </div>
        </div>
      );
    }

    case 'column': {
      const columnStyles: React.CSSProperties = {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
      };
      
      return (
        <div key={node.name || 'column'} style={columnStyles}>
          {node.children?.map((child, index) => (
            <div key={index}>{renderNode(child)}</div>
          ))}
        </div>
      );
    }

    case 'text': {
      const textContent = node.properties?.text || node.name || '';
      const textStyles: React.CSSProperties = {
        ...typographyStyles,
        margin: 0,
        padding: 0,
        wordWrap: 'break-word',
        ...baseStyles,
      };
      
      // Apply default font weight if not specified
      if (!textStyles.fontWeight && !typographyStyles.fontWeight) {
        const fontSize = typographyStyles.fontSize 
          ? parseFloat(typographyStyles.fontSize.toString().replace('px', ''))
          : 16;
        if (fontSize >= 24) {
          textStyles.fontWeight = 700;
        } else if (fontSize >= 18) {
          textStyles.fontWeight = 600;
        } else {
          textStyles.fontWeight = 400;
        }
      }
      
      return (
        <p key={node.name || 'text'} style={textStyles}>
          {textContent}
        </p>
      );
    }

    case 'image': {
      const width = node.properties?.widthPx;
      const height = node.properties?.heightPx;
      const aspectRatio = node.styles?.aspectRatio;
      
      const imageStyles: React.CSSProperties = {
        ...baseStyles,
        maxWidth: '100%',
        minWidth: width ? `${width}px` : '60px',
        minHeight: height ? `${height}px` : '60px',
        backgroundColor: baseStyles.backgroundColor || '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '12px',
        fontWeight: 500,
        border: '2px dashed #d1d5db',
        borderRadius: baseStyles.borderRadius || '4px',
        overflow: 'hidden',
        position: 'relative',
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
        >
          <span style={{ textAlign: 'center', padding: '8px' }}>
            {node.name || 'Image'}
          </span>
        </div>
      );
    }

    case 'button': {
      const buttonText = node.properties?.text || node.name || 'Button';
      const buttonStyles: React.CSSProperties = {
        ...baseStyles,
        ...typographyStyles,
        padding: baseStyles.padding || '12px 24px',
        backgroundColor: baseStyles.backgroundColor || '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: baseStyles.borderRadius || '6px',
        cursor: 'pointer',
        fontWeight: typographyStyles.fontWeight || 600,
        fontSize: typographyStyles.fontSize || '16px',
        display: 'inline-block',
        textAlign: typographyStyles.textAlign || 'center',
        transition: 'all 0.2s ease',
      };
      
      return (
        <button
          key={node.name || 'button'}
          style={buttonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
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
    <div 
      className="w-full" 
      style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#ffffff',
        minHeight: '100%',
      }}
    >
      {renderNode(tree)}
    </div>
  );
}
