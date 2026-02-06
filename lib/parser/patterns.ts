import { InstantBlueprintNode } from '@/types/instant';

/**
 * Detect Announcement Bar pattern
 * Heuristics:
 * - Single text node
 * - fontSize <= 12
 * - Full width (or close to it)
 */
export function detectAnnouncementBar(node: InstantBlueprintNode): boolean {
  if (node.type !== 'section' && node.type !== 'row') {
    return false;
  }

  // Should have exactly one text child
  const textChildren = node.children?.filter(child => child.type === 'text') || [];
  if (textChildren.length !== 1) {
    return false;
  }

  const textNode = textChildren[0];
  const fontSize = textNode.properties?.fontSize || textNode.styles?.typography?.fontSize;

  // Font size should be <= 12
  if (!fontSize || fontSize > 12) {
    return false;
  }

  // Check if it's full width (widthPercent >= 90 or no widthPercent set)
  if (node.widthPercent !== undefined && node.widthPercent < 90) {
    return false;
  }

  return true;
}

/**
 * Detect Navbar pattern
 * Heuristics:
 * - Horizontal row
 * - Multiple small text nodes spaced
 * - Usually 2-6 text/button elements
 */
export function detectNavbar(node: InstantBlueprintNode): boolean {
  if (node.type !== 'row') {
    return false;
  }

  const children = node.children || [];
  if (children.length < 2 || children.length > 8) {
    return false;
  }

  // Count text and button nodes
  const interactiveNodes = children.filter(
    child => child.type === 'text' || child.type === 'button'
  );

  if (interactiveNodes.length < 2) {
    return false;
  }

  // Check if text nodes are relatively small (navbar items are usually small)
  const textNodes = children.filter(child => child.type === 'text');
  const avgFontSize = textNodes.length > 0
    ? textNodes.reduce((sum, n) => {
        const fontSize = n.properties?.fontSize || n.styles?.typography?.fontSize || 16;
        return sum + fontSize;
      }, 0) / textNodes.length
    : 16;

  // Navbar text is usually 14-16px
  if (avgFontSize > 18) {
    return false;
  }

  // Should have spacing between items
  if (node.styles?.gap === undefined || node.styles.gap < 8) {
    return false;
  }

  return true;
}

/**
 * Detect Hero Section pattern
 * Heuristics:
 * - Section with large heading
 * - Usually has heading + paragraph + button
 * - Large padding (top/bottom >= 80)
 */
export function detectHeroSection(node: InstantBlueprintNode): boolean {
  if (node.type !== 'section') {
    return false;
  }

  const children = node.children || [];
  if (children.length === 0) {
    return false;
  }

  // Look for large heading
  const textNodes = children.filter(child => child.type === 'text');
  const hasLargeHeading = textNodes.some(textNode => {
    const fontSize = textNode.properties?.fontSize || textNode.styles?.typography?.fontSize;
    const label = textNode.styles?.typography?.label;
    return (fontSize && fontSize >= 40) || label === 'Heading XL' || label === 'Heading L';
  });

  if (!hasLargeHeading) {
    return false;
  }

  // Should have substantial padding
  const padding = node.styles?.padding;
  if (padding !== undefined && padding < 60) {
    return false;
  }

  // Usually has button or CTA
  const hasButton = children.some(child => child.type === 'button');

  return true;
}

/**
 * Detect Trust Badge Row pattern
 * Heuristics:
 * - Horizontal row
 * - Multiple small images or logos
 * - Usually 3-6 items
 * - Small gap between items
 */
export function detectTrustBadgeRow(node: InstantBlueprintNode): boolean {
  if (node.type !== 'row') {
    return false;
  }

  const children = node.children || [];
  if (children.length < 3 || children.length > 8) {
    return false;
  }

  // Should be mostly images or small logos
  const imageNodes = children.filter(child => child.type === 'image');
  const imageRatio = imageNodes.length / children.length;

  // At least 50% should be images
  if (imageRatio < 0.5) {
    return false;
  }

  // Images should be relatively small (badges/logos)
  const avgImageWidth = imageNodes.length > 0
    ? imageNodes.reduce((sum, n) => sum + (n.properties?.widthPx || 0), 0) / imageNodes.length
    : 0;

  // Trust badges are usually small (50-200px)
  if (avgImageWidth > 300 || avgImageWidth < 30) {
    return false;
  }

  return true;
}

/**
 * Detect Icon Feature Row pattern
 * Heuristics:
 * - Horizontal row
 * - 2-4 columns
 * - Each column has icon + heading + text
 */
export function detectIconFeatureRow(node: InstantBlueprintNode): boolean {
  if (node.type !== 'row') {
    return false;
  }

  const children = node.children || [];
  if (children.length < 2 || children.length > 4) {
    return false;
  }

  // Check if children are columns
  const columnChildren = children.filter(child => child.type === 'column');
  if (columnChildren.length < 2) {
    return false;
  }

  // Each column should have similar structure (icon/image + text)
  const hasConsistentStructure = columnChildren.every(column => {
    const colChildren = column.children || [];
    // Should have at least an image/icon and text
    const hasImage = colChildren.some(child => child.type === 'image');
    const hasText = colChildren.some(child => child.type === 'text');
    return hasImage && hasText;
  });

  return hasConsistentStructure;
}

/**
 * Detect Two Column Feature pattern
 * Heuristics:
 * - Row with exactly 2 columns
 * - One column has image, other has text content
 */
export function detectTwoColumnFeature(node: InstantBlueprintNode): boolean {
  if (node.type !== 'row') {
    return false;
  }

  const children = node.children || [];
  if (children.length !== 2) {
    return false;
  }

  const [col1, col2] = children;

  // Check if one has image and other has text
  const col1HasImage = col1.children?.some(child => child.type === 'image') || false;
  const col1HasText = col1.children?.some(child => child.type === 'text') || false;
  const col2HasImage = col2.children?.some(child => child.type === 'image') || false;
  const col2HasText = col2.children?.some(child => child.type === 'text') || false;

  // One column should have image, other should have text
  return (col1HasImage && col2HasText) || (col2HasImage && col1HasText);
}

/**
 * Detect Image Feature List pattern
 * Heuristics:
 * - Section with multiple rows
 * - Each row has image + text side by side
 * - Alternating layout
 */
export function detectImageFeatureList(node: InstantBlueprintNode): boolean {
  if (node.type !== 'section') {
    return false;
  }

  const children = node.children || [];
  if (children.length < 2) {
    return false;
  }

  // Should have multiple rows
  const rows = children.filter(child => child.type === 'row');
  if (rows.length < 2) {
    return false;
  }

  // Each row should have image + text
  const hasImageTextPattern = rows.every(row => {
    const rowChildren = row.children || [];
    const hasImage = rowChildren.some(child => child.type === 'image');
    const hasText = rowChildren.some(child => child.type === 'text');
    return hasImage && hasText;
  });

  return hasImageTextPattern;
}

/**
 * Detect Card Grid pattern
 * Heuristics:
 * - Row with 3 columns
 * - Columns have identical children structure
 */
export function detectCardGrid(node: InstantBlueprintNode): boolean {
  if (node.type !== 'row') {
    return false;
  }

  const children = node.children || [];
  if (children.length !== 3) {
    return false;
  }

  // All should be columns
  const columns = children.filter(child => child.type === 'column');
  if (columns.length !== 3) {
    return false;
  }

  // Check if columns have similar structure
  const firstColChildren = columns[0].children || [];
  const firstColTypes = firstColChildren.map(child => child.type).join(',');

  const allHaveSameStructure = columns.every(column => {
    const colChildren = column.children || [];
    const colTypes = colChildren.map(child => child.type).join(',');
    return colTypes === firstColTypes;
  });

  return allHaveSameStructure && firstColTypes.length > 0;
}

/**
 * Detect CTA Section pattern
 * Heuristics:
 * - Heading + paragraph + button stack
 * - Centered alignment
 * - Usually in a section
 */
export function detectCTASection(node: InstantBlueprintNode): boolean {
  if (node.type !== 'section') {
    return false;
  }

  const children = node.children || [];
  if (children.length < 2) {
    return false;
  }

  // Should have heading
  const textNodes = children.filter(child => child.type === 'text');
  const hasHeading = textNodes.some(textNode => {
    const fontSize = textNode.properties?.fontSize || textNode.styles?.typography?.fontSize;
    const label = textNode.styles?.typography?.label;
    return (fontSize && fontSize >= 20) || 
           label === 'Heading XL' || 
           label === 'Heading L' || 
           label === 'Heading M';
  });

  if (!hasHeading) {
    return false;
  }

  // Should have button
  const hasButton = children.some(child => child.type === 'button');
  if (!hasButton) {
    return false;
  }

  // Check for centered alignment (textAlignHorizontal === 'center')
  const hasCenteredText = textNodes.some(textNode => {
    const align = textNode.styles?.typography?.textAlignHorizontal?.toLowerCase();
    return align === 'center';
  });

  return true;
}

/**
 * Detect Email Form pattern
 * Heuristics:
 * - Height 48-64px
 * - Text like "enter email" or placeholder text
 * - Arrow text node or button
 */
export function detectEmailForm(node: InstantBlueprintNode): boolean {
  // Could be a row or button-like structure
  if (node.type !== 'row' && node.type !== 'button') {
    return false;
  }

  // Check height
  const height = node.properties?.heightPx;
  if (!height || height < 48 || height > 64) {
    return false;
  }

  // Check for email-related text
  const children = node.children || [];
  const textNodes = children.filter(child => child.type === 'text');
  
  const emailKeywords = ['email', 'enter', 'subscribe', 'sign up', 'newsletter'];
  const hasEmailText = textNodes.some(textNode => {
    const text = (textNode.properties?.text || '').toLowerCase();
    return emailKeywords.some(keyword => text.includes(keyword));
  });

  if (!hasEmailText) {
    return false;
  }

  // Should have arrow or button indicator
  const hasArrow = textNodes.some(textNode => {
    const text = (textNode.properties?.text || '').toLowerCase();
    return text.includes('→') || text.includes('arrow') || text.includes('>');
  });

  const hasButton = children.some(child => child.type === 'button');

  return hasArrow || hasButton;
}

/**
 * Apply pattern labels to a blueprint node recursively
 */
export function applyPatternLabels(node: InstantBlueprintNode): void {
  // Don't override existing labels
  if (node.label) {
    return;
  }

  // Run detectors in order of specificity
  if (detectEmailForm(node)) {
    node.label = 'email-form';
  } else if (detectAnnouncementBar(node)) {
    node.label = 'announcement-bar';
  } else if (detectNavbar(node)) {
    node.label = 'navbar';
  } else if (detectHeroSection(node)) {
    node.label = 'hero-section';
  } else if (detectTrustBadgeRow(node)) {
    node.label = 'trust-badge-row';
  } else if (detectIconFeatureRow(node)) {
    node.label = 'icon-feature-row';
  } else if (detectTwoColumnFeature(node)) {
    node.label = 'two-column-feature';
  } else if (detectImageFeatureList(node)) {
    node.label = 'image-feature-list';
  } else if (detectCardGrid(node)) {
    node.label = 'card-grid';
  } else if (detectCTASection(node)) {
    node.label = 'cta-section';
  }

  // Recursively apply to children
  if (node.children) {
    for (const child of node.children) {
      applyPatternLabels(child);
    }
  }
}
