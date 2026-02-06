import { InstantBlueprintNode } from '@/types/instant';

interface TrustBadgeRowProps {
  node: InstantBlueprintNode;
}

export function TrustBadgeRow({ node }: TrustBadgeRowProps) {
  const children = node.children || [];
  const imageNodes = children.filter(child => child.type === 'image');
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: node.styles?.gap ? `${node.styles.gap}px` : '40px',
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '60px 20px',
    backgroundColor: node.styles?.backgroundColor || '#f9fafb',
    maxWidth: '1100px',
    margin: '0 auto',
    flexWrap: 'wrap',
  };

  const imageStyles: React.CSSProperties = {
    width: '120px',
    height: '60px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
    opacity: 0.7,
  };

  return (
    <div style={containerStyles}>
      {imageNodes.map((imageNode, index) => (
        <div key={index} style={imageStyles}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            {imageNode.name || 'Logo'}
          </span>
        </div>
      ))}
    </div>
  );
}
