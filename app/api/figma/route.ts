import { NextRequest, NextResponse } from 'next/server';
import { FigmaFileResponse } from '@/types/figma';
import { extractFileKeyFromUrl } from '@/lib/parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUrl, accessToken } = body;

    if (!fileUrl || !accessToken) {
      return NextResponse.json(
        { error: 'File URL and access token are required' },
        { status: 400 }
      );
    }

    const fileKey = extractFileKeyFromUrl(fileUrl);
    if (!fileKey) {
      return NextResponse.json(
        { error: 'Invalid Figma file URL' },
        { status: 400 }
      );
    }

    // Fetch file from Figma API
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Figma API error: ${response.status} ${errorText}` },
        { status: response.status }
      );
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

    return NextResponse.json({
      fileKey,
      frames,
      document: data.document,
    });
  } catch (error) {
    console.error('Error fetching Figma file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Figma file' },
      { status: 500 }
    );
  }
}
