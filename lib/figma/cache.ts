import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import type { CachedBlueprint, InstantBlueprintNode, TypographyStyle } from '@/types/instant';

const CACHE_DIR = join(process.cwd(), 'data', 'figma-cache');

function cacheFilePath(fileKey: string, frameIdForCache: string): string {
  const safeKey = `${fileKey}-${frameIdForCache}.json`;
  return join(CACHE_DIR, safeKey);
}

export function getCachePath(fileKey: string, frameIdForCache: string): string {
  return cacheFilePath(fileKey, frameIdForCache);
}

export async function getCachedBlueprint(
  fileKey: string,
  frameIdForCache: string
): Promise<CachedBlueprint | null> {
  const path = cacheFilePath(fileKey, frameIdForCache);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as CachedBlueprint;
  } catch {
    return null;
  }
}

export async function setCachedBlueprint(
  fileKey: string,
  frameIdForCache: string,
  data: CachedBlueprint
): Promise<void> {
  const path = cacheFilePath(fileKey, frameIdForCache);
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 0), 'utf-8');
}

/**
 * Collect semanticLabels and typographyMap from a blueprint tree (for cache storage)
 */
export function collectLabelsAndTypography(root: InstantBlueprintNode): {
  semanticLabels: Record<string, string>;
  typographyMap: Record<string, TypographyStyle>;
} {
  const semanticLabels: Record<string, string> = {};
  const typographyMap: Record<string, TypographyStyle> = {};

  function walk(node: InstantBlueprintNode, path: string) {
    const name = node.name || node.type;
    const nodePath = path ? `${path}/${name}` : name;

    if (node.label) {
      semanticLabels[nodePath] = node.label;
    }
    if (node.styles?.typography) {
      const t = node.styles.typography;
      const key = t.label || `font-${t.fontSize}-${t.fontWeight || 400}`;
      if (!typographyMap[key]) {
        typographyMap[key] = t;
      }
    }
    (node.children || []).forEach((child, i) => {
      walk(child, `${nodePath}[${i}]`);
    });
  }

  walk(root, '');
  return { semanticLabels, typographyMap };
}
