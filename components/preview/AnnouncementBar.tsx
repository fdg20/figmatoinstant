import { InstantBlueprintNode } from '@/types/instant';

interface AnnouncementBarProps {
  node: InstantBlueprintNode;
}

export function AnnouncementBar({ node }: AnnouncementBarProps) {
  const textNodes = node.children?.filter(child => child.type === 'text') || [];
  const textContent = textNodes[0]?.properties?.text || textNodes[0]?.name || '';
  
  const styles: React.CSSProperties = {
    backgroundColor: node.styles?.backgroundColor || '#000000',
    color: '#ffffff',
    padding: '12px 20px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 500,
  };

  return (
    <div style={styles}>
      {textContent}
    </div>
  );
}
