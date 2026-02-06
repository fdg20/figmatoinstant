import { InstantBlueprintNode } from '@/types/instant';

interface CardGridProps {
  node: InstantBlueprintNode;
}

export function CardGrid({ node }: CardGridProps) {
  const children = node.children || [];
  const columns = children.filter(child => child.type === 'column');
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: node.styles?.gap ? `${node.styles.gap}px` : '30px',
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '80px 20px',
    backgroundColor: node.styles?.backgroundColor || '#f9fafb',
    maxWidth: '1100px',
    margin: '0 auto',
    flexWrap: 'wrap',
  };

  const cardStyles: React.CSSProperties = {
    flex: '1',
    minWidth: '280px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  };

  return (
    <div style={containerStyles}>
      {columns.map((column, index) => {
        const textNodes = column.children?.filter(child => child.type === 'text') || [];
        const imageNodes = column.children?.filter(child => child.type === 'image') || [];
        
        return (
          <div key={index} style={cardStyles}>
            {imageNodes[0] && (
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e5e7eb',
              }}>
                <span style={{ fontSize: '32px' }}>🖼️</span>
              </div>
            )}
            {textNodes.map((textNode, textIndex) => {
              const fontSize = textNode.styles?.typography?.fontSize 
                ? parseFloat(textNode.styles.typography.fontSize.toString().replace('px', ''))
                : 16;
              const isHeading = fontSize >= 18;
              
              return isHeading ? (
                <h3 key={textIndex} style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: textNode.styles?.typography?.fontWeight || 600,
                  color: '#111827',
                  marginBottom: '8px',
                }}>
                  {textNode.properties?.text || textNode.name || ''}
                </h3>
              ) : (
                <p key={textIndex} style={{
                  fontSize: `${fontSize}px`,
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '4px',
                }}>
                  {textNode.properties?.text || textNode.name || ''}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
