import { NextRequest, NextResponse } from 'next/server';
import {
  extractFileKeyFromUrl,
  extractNodeIdFromUrl,
  nodeIdForApi,
  nodeIdForCache,
} from '@/lib/figma/url';
import { fetchFigmaNode } from '@/lib/figma/api';
import { getCachedBlueprint, setCachedBlueprint } from '@/lib/figma/cache';
import { buildCachedBlueprint } from '@/lib/figma/blueprintServer';
import type { InstantBlueprint } from '@/types/instant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, forceRefresh = false } = body as { url?: string; forceRefresh?: boolean };

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "url"' },
        { status: 400 }
      );
    }

    const fileKey = extractFileKeyFromUrl(url);
    const nodeIdFromUrl = extractNodeIdFromUrl(url);

    if (!fileKey || !nodeIdFromUrl) {
      return NextResponse.json(
        { error: 'Invalid Figma URL: need file key and node-id (e.g. ?node-id=1-2-3)' },
        { status: 400 }
      );
    }

    const apiNodeId = nodeIdForApi(nodeIdFromUrl);
    const cacheFrameId = nodeIdForCache(apiNodeId);

    if (!forceRefresh) {
      const cached = await getCachedBlueprint(fileKey, cacheFrameId);
      if (cached) {
        const blueprint: InstantBlueprint = {
          root: cached.blueprintTree,
          metadata: {
            figmaFileKey: cached.metadata.figmaFileKey,
            figmaFrameId: cached.metadata.figmaFrameId,
            figmaFrameName: cached.metadata.figmaFrameName,
            generatedAt: cached.metadata.cachedAt,
          },
        };
        return NextResponse.json(blueprint);
      }
    }

    const token = process.env.FIGMA_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'FIGMA_ACCESS_TOKEN is not configured' },
        { status: 503 }
      );
    }

    const frameNode = await fetchFigmaNode(fileKey, apiNodeId, token);
    const cached = buildCachedBlueprint(
      frameNode,
      fileKey,
      cacheFrameId,
      frameNode.name || 'Frame'
    );

    await setCachedBlueprint(fileKey, cacheFrameId, cached);

    const blueprint: InstantBlueprint = {
      root: cached.blueprintTree,
      metadata: {
        figmaFileKey: cached.metadata.figmaFileKey,
        figmaFrameId: cached.metadata.figmaFrameId,
        figmaFrameName: cached.metadata.figmaFrameName,
        generatedAt: cached.metadata.cachedAt,
      },
    };

    return NextResponse.json(blueprint);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load blueprint';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
