import { InstantBlueprintNode } from '@/types/instant';

interface HeroSectionProps {
  node: InstantBlueprintNode;
}

export function HeroSection({ node }: HeroSectionProps) {
  const children = node.children || [];
  const textNodes = children.filter(child => child.type === 'text');
  const buttonNodes = children.filter(child => child.type === 'button');
  
  const containerStyles: React.CSSProperties = {
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '120px 20px',
    textAlign: 'center',
    backgroundColor: node.styles?.backgroundColor || '#ffffff',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: textNodes[0]?.styles?.typography?.fontSize 
      ? `${textNodes[0].styles.typography.fontSize}px`
      : '56px',
    fontWeight: textNodes[0]?.styles?.typography?.fontWeight || 700,
    lineHeight: textNodes[0]?.styles?.typography?.lineHeightPx 
      ? `${textNodes[0].styles.typography.lineHeightPx}px`
      : '1.2',
    color: '#111827',
    marginBottom: '24px',
    fontFamily: textNodes[0]?.styles?.typography?.fontFamily || 'inherit',
  };

  const subheadingStyles: React.CSSProperties = {
    fontSize: textNodes[1]?.styles?.typography?.fontSize 
      ? `${textNodes[1].styles.typography.fontSize}px`
      : '20px',
    fontWeight: textNodes[1]?.styles?.typography?.fontWeight || 400,
    color: '#6b7280',
    marginBottom: '32px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const buttonStyles: React.CSSProperties = {
    backgroundColor: buttonNodes[0]?.styles?.backgroundColor || '#111827',
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
  };

  return (
    <section style={containerStyles}>
      {textNodes[0] && (
        <h1 style={headingStyles}>
          {textNodes[0].properties?.text || textNodes[0].name || ''}
        </h1>
      )}
      {textNodes[1] && (
        <p style={subheadingStyles}>
          {textNodes[1].properties?.text || textNodes[1].name || ''}
        </p>
      )}
      {buttonNodes[0] && (
        <button style={buttonStyles}>
          {buttonNodes[0].properties?.text || buttonNodes[0].name || 'Get Started'}
        </button>
      )}
    </section>
  );
}
