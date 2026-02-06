import { InstantBlueprintNode } from '@/types/instant';

interface EmailFormProps {
  node: InstantBlueprintNode;
}

export function EmailForm({ node }: EmailFormProps) {
  const children = node.children || [];
  const textNodes = children.filter(child => child.type === 'text');
  const buttonNodes = children.filter(child => child.type === 'button');
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    padding: node.styles?.padding ? `${node.styles.padding}px` : '12px',
    backgroundColor: node.styles?.backgroundColor || '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    maxWidth: '500px',
    margin: '0 auto',
    alignItems: 'center',
  };

  const inputStyles: React.CSSProperties = {
    flex: '1',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
  };

  const buttonStyles: React.CSSProperties = {
    backgroundColor: buttonNodes[0]?.styles?.backgroundColor || '#111827',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <form style={containerStyles}>
      <input
        type="email"
        placeholder={textNodes[0]?.properties?.text || 'Enter your email'}
        style={inputStyles}
      />
      {buttonNodes[0] && (
        <button type="submit" style={buttonStyles}>
          {buttonNodes[0].properties?.text || buttonNodes[0].name || 'Subscribe'}
        </button>
      )}
    </form>
  );
}
