import { FigmaFileResponse } from '@/types/figma';
import { extractFileKeyFromUrl } from '@/lib/parser';

/**
 * Fetch frames from Figma API (client-side)
 */
export async function fetchFigmaFrames(
  fileUrl: string,
  accessToken: string
): Promise<{
  fileKey: string;
  frames: Array<{ id: string; name: string; node: any }>;
  document: any;
}> {
  if (!fileUrl || !accessToken) {
    throw new Error('File URL and access token are required');
  }

  const fileKey = extractFileKeyFromUrl(fileUrl);
  if (!fileKey) {
    throw new Error('Invalid Figma file URL');
  }

  // Fetch file from Figma API directly from client
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': accessToken,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API error: ${response.status} ${errorText}`);
  }

  const data: FigmaFileResponse = await response.json();

  // Extract top-level frames
  const frames: Array<{ id: string; name: string; node: any }> = [];
  
  function traverseNodes(node: any) {
    if (node.type === 'FRAME' && node.layoutMode) {
      // Only include frames with auto-layout
      frames.push({
        id: node.id,
        name: node.name,
        node: node,
      });
    }
    
    if (node.children) {
      for (const child of node.children) {
        traverseNodes(child);
      }
    }
  }

  traverseNodes(data.document);

  return {
    fileKey,
    frames,
    document: data.document,
  };
}
