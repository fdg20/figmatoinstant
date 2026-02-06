import { InstantBlueprintNode } from '@/types/instant';

interface ImageFeatureListProps {
  node: InstantBlueprintNode;
}

export function ImageFeatureList({ node }: ImageFeatureListProps) {
  const children = node.children || [];
  const rows = children.filter(child => child.type === 'row');
  
  const containerStyles: React.CSSProperties = {
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '80px 20px',
    backgroundColor: node.styles?.backgroundColor || '#ffffff',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  return (
    <div style={containerStyles}>
      {rows.map((row, rowIndex) => {
        const rowChildren = row.children || [];
        const imageNodes = rowChildren.filter(child => child.type === 'image');
        const textNodes = rowChildren.filter(child => child.type === 'text');
        
        const rowStyles: React.CSSProperties = {
          display: 'flex',
          flexDirection: 'row',
          gap: row.styles?.gap ? `${row.styles.gap}px` : '40px',
          marginBottom: '60px',
          alignItems: 'center',
          flexWrap: 'wrap',
        };

        return (
          <div key={rowIndex} style={rowStyles}>
            {imageNodes[0] && (
              <div style={{
                flex: '0 0 300px',
                aspectRatio: '4/3',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e5e7eb',
              }}>
                <span style={{ fontSize: '48px' }}>🖼️</span>
              </div>
            )}
            <div style={{ flex: '1', minWidth: '300px' }}>
              {textNodes.map((textNode, textIndex) => {
                const fontSize = textNode.styles?.typography?.fontSize 
                  ? parseFloat(textNode.styles.typography.fontSize.toString().replace('px', ''))
                  : 16;
                const isHeading = fontSize >= 20;
                
                return isHeading ? (
                  <h3 key={textIndex} style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: textNode.styles?.typography?.fontWeight || 600,
                    color: '#111827',
                    marginBottom: '12px',
                  }}>
                    {textNode.properties?.text || textNode.name || ''}
                  </h3>
                ) : (
                  <p key={textIndex} style={{
                    fontSize: `${fontSize}px`,
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '8px',
                  }}>
                    {textNode.properties?.text || textNode.name || ''}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
