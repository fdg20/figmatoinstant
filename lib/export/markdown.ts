import { InstantBlueprintNode } from '@/types/instant';

/**
 * Convert a blueprint node to markdown format
 */
export function blueprintToMarkdown(node: InstantBlueprintNode, depth: number = 0): string {
  const lines: string[] = [];
  
  // Format node header
  const props: string[] = [];
  
  // Add padding info
  if (node.styles?.padding !== undefined) {
    props.push(`padding: ${node.styles.padding}px`);
  }
  
  // Add gap info
  if (node.styles?.gap !== undefined) {
    props.push(`gap: ${node.styles.gap}px`);
  }
  
  // Add width percent for columns
  if (node.widthPercent !== undefined) {
    props.push(`${node.widthPercent}%`);
  }
  
  // Add typography info for text nodes
  if (node.type === 'text' && node.styles?.typography) {
    const typo = node.styles.typography;
    const typoParts: string[] = [];
    if (typo.label) typoParts.push(typo.label);
    if (typo.fontSize) typoParts.push(`${typo.fontSize}px`);
    if (typo.fontWeight) {
      const weightLabel = typo.fontWeight >= 700 ? 'Bold' : 
                         typo.fontWeight >= 600 ? 'Semibold' : 
                         typo.fontWeight >= 500 ? 'Medium' : 'Regular';
      typoParts.push(weightLabel);
    }
    props.push(typoParts.join(' — '));
  }
  
  // Add button info
  if (node.type === 'button') {
    const sizeParts: string[] = [];
    if (node.properties?.widthPx && node.properties?.heightPx) {
      sizeParts.push(`${node.properties.widthPx}x${node.properties.heightPx}`);
    }
    if (node.styles?.borderRadius) {
      sizeParts.push(`radius ${node.styles.borderRadius}`);
    }
    if (sizeParts.length > 0) {
      props.push(sizeParts.join(' — '));
    }
  }
  
  // Add image info
  if (node.type === 'image') {
    const aspectRatio = node.styles?.aspectRatio;
    if (aspectRatio !== undefined && node.properties?.widthPx && node.properties?.heightPx) {
      const aspectStr = aspectRatio > 0.9 ? '1:1' :
                       aspectRatio > 0.7 ? '4:5' :
                       aspectRatio > 0.5 ? '3:4' :
                       aspectRatio > 0.3 ? '9:16' : '16:9';
      props.push(`aspect ${aspectStr}`);
    }
  }
  
  const propsStr = props.length > 0 ? ` (${props.join(', ')})` : '';
  const nameStr = node.name ? ` "${node.name}"` : '';
  
  // Format based on node type and depth
  let header = '';
  const indent = '  '.repeat(Math.max(0, depth - (node.type === 'section' ? 0 : 1)));
  
  switch (node.type) {
    case 'section':
      header = `${indent}## Section${nameStr}${propsStr}`;
      break;
    case 'row':
      header = `${indent}- Row${nameStr}${propsStr}`;
      break;
    case 'column':
      header = `${indent}  - Column${nameStr}${propsStr}`;
      break;
    case 'text':
      header = `${indent}    - Text${nameStr}${propsStr}`;
      break;
    case 'button':
      header = `${indent}    - Button${nameStr}${propsStr}`;
      break;
    case 'image':
      header = `${indent}    - Image${nameStr}${propsStr}`;
      break;
  }
  
  lines.push(header);
  
  // Format children
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      lines.push(blueprintToMarkdown(child, depth + 1));
    }
  }
  
  return lines.join('\n');
}
