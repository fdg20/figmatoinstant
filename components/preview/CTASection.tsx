import { InstantBlueprintNode } from '@/types/instant';

interface CTASectionProps {
  node: InstantBlueprintNode;
}

export function CTASection({ node }: CTASectionProps) {
  const children = node.children || [];
  const textNodes = children.filter(child => child.type === 'text');
  const buttonNodes = children.filter(child => child.type === 'button');
  
  const containerStyles: React.CSSProperties = {
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '100px 20px',
    textAlign: 'center',
    backgroundColor: node.styles?.backgroundColor || '#111827',
    color: '#ffffff',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: textNodes[0]?.styles?.typography?.fontSize 
      ? `${textNodes[0].styles.typography.fontSize}px`
      : '40px',
    fontWeight: textNodes[0]?.styles?.typography?.fontWeight || 700,
    marginBottom: '16px',
    color: '#ffffff',
  };

  const subheadingStyles: React.CSSProperties = {
    fontSize: textNodes[1]?.styles?.typography?.fontSize 
      ? `${textNodes[1].styles.typography.fontSize}px`
      : '18px',
    fontWeight: textNodes[1]?.styles?.typography?.fontWeight || 400,
    color: '#d1d5db',
    marginBottom: '32px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const buttonStyles: React.CSSProperties = {
    backgroundColor: buttonNodes[0]?.styles?.backgroundColor || '#ffffff',
    color: '#111827',
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
        <h2 style={headingStyles}>
          {textNodes[0].properties?.text || textNodes[0].name || ''}
        </h2>
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
