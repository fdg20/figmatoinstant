import { FigmaNode } from '@/types/figma';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaNodesResponse {
  name: string;
  role: string;
  nodes: Record<string, { document: FigmaNode } | null>;
}

/**
 * Fetch a single frame/node from Figma using the nodes endpoint.
 * GET /v1/files/:key/nodes?ids=:nodeId
 * Only the requested node and its subtree are returned (no full file).
 */
export async function fetchFigmaNode(
  fileKey: string,
  nodeId: string,
  accessToken: string
): Promise<FigmaNode> {
  const url = `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const res = await fetch(url, {
    headers: {
      'X-Figma-Token': accessToken,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error ${res.status}: ${text || res.statusText}`);
  }

  const data: FigmaNodesResponse = await res.json();
  const nodeEntry = data.nodes?.[nodeId];

  if (!nodeEntry || !nodeEntry.document) {
    throw new Error('Figma node not found for the given node id');
  }

  return nodeEntry.document;
}
