import { InstantBlueprintNode } from '@/types/instant';

interface NavbarProps {
  node: InstantBlueprintNode;
}

export function Navbar({ node }: NavbarProps) {
  const children = node.children || [];
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: node.styles?.backgroundColor || '#ffffff',
    borderBottom: '1px solid #e5e7eb',
  };

  const linkStyles: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 500,
    color: '#111827',
    textDecoration: 'none',
    padding: '8px 16px',
    cursor: 'pointer',
  };

  return (
    <nav style={containerStyles}>
      {children.map((child, index) => {
        if (child.type === 'text') {
          const text = child.properties?.text || child.name || '';
          return (
            <a key={index} style={linkStyles}>
              {text}
            </a>
          );
        }
        if (child.type === 'image') {
          return (
            <div key={index} style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
          );
        }
        return null;
      })}
    </nav>
  );
}
