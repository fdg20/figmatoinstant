import { NextRequest, NextResponse } from 'next/server';
import { buildBlueprintTree } from '@/lib/parser';
import { FigmaNode } from '@/types/figma';
import { InstantBlueprint } from '@/types/instant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { frameNode, fileKey, frameId, frameName } = body;

    if (!frameNode) {
      return NextResponse.json(
        { error: 'Frame node is required' },
        { status: 400 }
      );
    }

    // Check if frame has auto-layout
    if (!frameNode.layoutMode || frameNode.layoutMode === 'NONE') {
      return NextResponse.json(
        { error: 'Frame must use Auto-layout to convert properly' },
        { status: 400 }
      );
    }

    // Build blueprint tree
    const rootNode = buildBlueprintTree(frameNode as FigmaNode);

    if (!rootNode) {
      return NextResponse.json(
        { error: 'Failed to generate blueprint from frame' },
        { status: 500 }
      );
    }

    const blueprint: InstantBlueprint = {
      root: rootNode,
      metadata: {
        figmaFileKey: fileKey,
        figmaFrameId: frameId,
        figmaFrameName: frameName,
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error('Error generating blueprint:', error);
    return NextResponse.json(
      { error: 'Failed to generate blueprint' },
      { status: 500 }
    );
  }
}
