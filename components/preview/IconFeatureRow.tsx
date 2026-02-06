import { InstantBlueprintNode } from '@/types/instant';

interface IconFeatureRowProps {
  node: InstantBlueprintNode;
}

export function IconFeatureRow({ node }: IconFeatureRowProps) {
  const children = node.children || [];
  const columns = children.filter(child => child.type === 'column');
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: node.styles?.gap ? `${node.styles.gap}px` : '40px',
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '80px 20px',
    backgroundColor: node.styles?.backgroundColor || '#ffffff',
    maxWidth: '1100px',
    margin: '0 auto',
    flexWrap: 'wrap',
  };

  const columnStyles: React.CSSProperties = {
    flex: '1',
    minWidth: '250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  };

  return (
    <div style={containerStyles}>
      {columns.map((column, index) => {
        const imageNodes = column.children?.filter(child => child.type === 'image') || [];
        const textNodes = column.children?.filter(child => child.type === 'text') || [];
        
        return (
          <div key={index} style={columnStyles}>
            {imageNodes[0] && (
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '24px' }}>🎯</span>
              </div>
            )}
            {textNodes[0] && (
              <h3 style={{
                fontSize: textNodes[0].styles?.typography?.fontSize 
                  ? `${textNodes[0].styles.typography.fontSize}px`
                  : '20px',
                fontWeight: textNodes[0].styles?.typography?.fontWeight || 600,
                marginBottom: '8px',
                color: '#111827',
              }}>
                {textNodes[0].properties?.text || textNodes[0].name || ''}
              </h3>
            )}
            {textNodes[1] && (
              <p style={{
                fontSize: textNodes[1].styles?.typography?.fontSize 
                  ? `${textNodes[1].styles.typography.fontSize}px`
                  : '16px',
                color: '#6b7280',
                lineHeight: '1.6',
              }}>
                {textNodes[1].properties?.text || textNodes[1].name || ''}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
