'use client';

import { InstantBlueprintNode } from '@/types/instant';
import { AnnouncementBar } from './preview/AnnouncementBar';
import { Navbar } from './preview/Navbar';
import { HeroSection } from './preview/HeroSection';
import { TrustBadgeRow } from './preview/TrustBadgeRow';
import { IconFeatureRow } from './preview/IconFeatureRow';
import { TwoColumnFeature } from './preview/TwoColumnFeature';
import { ImageFeatureList } from './preview/ImageFeatureList';
import { CardGrid } from './preview/CardGrid';
import { CTASection } from './preview/CTASection';
import { EmailForm } from './preview/EmailForm';

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
 * Map label to component name
 */
function normalizeLabel(label: string): string {
  const labelMap: Record<string, string> = {
    'announcement-bar': 'announcement-bar',
    'navbar': 'navbar',
    'hero-section': 'hero-section',
    'trust-badge-row': 'trust-badge-row',
    'icon-feature-row': 'icon-feature-row',
    'two-column-feature': 'two-column-feature',
    'image-feature-list': 'image-feature-list',
    'card-grid': 'card-grid',
    'cta-section': 'cta-section',
    'email-form': 'email-form',
  };
  return labelMap[label.toLowerCase()] || label.toLowerCase();
}

/**
 * Render semantic component based on label
 */
function renderSemanticComponent(node: InstantBlueprintNode): React.ReactNode {
  if (!node.label) return null;
  
  const normalizedLabel = normalizeLabel(node.label);
  
  switch (normalizedLabel) {
    case 'announcement-bar':
      return <AnnouncementBar node={node} />;
    case 'navbar':
      return <Navbar node={node} />;
    case 'hero-section':
      return <HeroSection node={node} />;
    case 'trust-badge-row':
      return <TrustBadgeRow node={node} />;
    case 'icon-feature-row':
      return <IconFeatureRow node={node} />;
    case 'two-column-feature':
      return <TwoColumnFeature node={node} />;
    case 'image-feature-list':
      return <ImageFeatureList node={node} />;
    case 'card-grid':
      return <CardGrid node={node} />;
    case 'cta-section':
      return <CTASection node={node} />;
    case 'email-form':
      return <EmailForm node={node} />;
    default:
      return null;
  }
}

/**
 * Render generic node (for nodes without semantic labels)
 */
export function renderGenericNode(node: InstantBlueprintNode): React.ReactNode {
  const baseStyles = getNodeStyles(node);
  const typographyStyles = getTypographyStyles(node);

  switch (node.type) {
    case 'section': {
      const sectionStyles: React.CSSProperties = {
        ...baseStyles,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: baseStyles.padding || '80px 20px',
        backgroundColor: baseStyles.backgroundColor || '#ffffff',
        maxWidth: '1100px',
        margin: '0 auto',
      };
      
      return (
        <section key={node.name || 'section'} style={sectionStyles}>
          {node.children?.map((child, index) => (
            <div key={index}>{renderGenericNode(child)}</div>
          ))}
        </section>
      );
    }

    case 'row': {
      const rowStyles: React.CSSProperties = {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: baseStyles.gap || '20px',
        flexWrap: 'wrap',
      };
      
      return (
        <div key={node.name || 'row'} style={rowStyles}>
          {node.children?.map((child, index) => (
            <div key={index} style={{ display: 'flex' }}>{renderGenericNode(child)}</div>
          ))}
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
            <div key={index}>{renderGenericNode(child)}</div>
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
        borderRadius: baseStyles.borderRadius || '8px',
        overflow: 'hidden',
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
        backgroundColor: baseStyles.backgroundColor || '#111827',
        color: '#ffffff',
        border: 'none',
        borderRadius: baseStyles.borderRadius || '8px',
        cursor: 'pointer',
        fontWeight: typographyStyles.fontWeight || 600,
        fontSize: typographyStyles.fontSize || '16px',
        display: 'inline-block',
        textAlign: typographyStyles.textAlign || 'center',
      };
      
      return (
        <button
          key={node.name || 'button'}
          style={buttonStyles}
        >
          {buttonText}
        </button>
      );
    }

    default:
      return null;
  }
}

/**
 * Recursively render a BlueprintNode tree
 */
function renderNode(node: InstantBlueprintNode): React.ReactNode {
  // Try to render semantic component first
  const semanticComponent = renderSemanticComponent(node);
  if (semanticComponent) {
    return semanticComponent;
  }

  // Fall back to generic rendering
  return renderGenericNode(node);
}

export default function PreviewRenderer({ tree }: PreviewRendererProps) {
  return (
    <div 
      className="w-full" 
      style={{ 
        maxWidth: '1100px', 
        margin: '0 auto',
        backgroundColor: '#ffffff',
        minHeight: '100%',
      }}
    >
      {renderNode(tree)}
    </div>
  );
}
