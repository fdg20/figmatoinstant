import { InstantBlueprintNode } from '@/types/instant';

interface TwoColumnFeatureProps {
  node: InstantBlueprintNode;
}

export function TwoColumnFeature({ node }: TwoColumnFeatureProps) {
  const children = node.children || [];
  const columns = children.filter(child => child.type === 'column');
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: node.styles?.gap ? `${node.styles.gap}px` : '60px',
    padding: node.styles?.padding ? `${node.styles.padding}px 20px` : '80px 20px',
    backgroundColor: node.styles?.backgroundColor || '#ffffff',
    maxWidth: '1100px',
    margin: '0 auto',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  return (
    <div style={containerStyles}>
      {columns.map((column, index) => {
        const imageNodes = column.children?.filter(child => child.type === 'image') || [];
        const textNodes = column.children?.filter(child => child.type === 'text') || [];
        const hasImage = imageNodes.length > 0;
        
        const columnStyles: React.CSSProperties = {
          flex: '1',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
        };

        if (hasImage) {
          return (
            <div key={index} style={columnStyles}>
              <div style={{
                width: '100%',
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
            </div>
          );
        }

        return (
          <div key={index} style={columnStyles}>
            {textNodes.map((textNode, textIndex) => {
              const fontSize = textNode.styles?.typography?.fontSize 
                ? parseFloat(textNode.styles.typography.fontSize.toString().replace('px', ''))
                : 16;
              const isHeading = fontSize >= 24;
              
              return isHeading ? (
                <h2 key={textIndex} style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: textNode.styles?.typography?.fontWeight || 700,
                  lineHeight: textNode.styles?.typography?.lineHeightPx 
                    ? `${textNode.styles.typography.lineHeightPx}px`
                    : '1.3',
                  color: '#111827',
                  marginBottom: '16px',
                }}>
                  {textNode.properties?.text || textNode.name || ''}
                </h2>
              ) : (
                <p key={textIndex} style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: textNode.styles?.typography?.fontWeight || 400,
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '12px',
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
