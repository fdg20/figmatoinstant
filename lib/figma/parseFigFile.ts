import { ByteBuffer, compileSchema, decodeBinarySchema } from "kiwi-schema";
import * as UZIP from "uzip";
import { FigmaNode } from "@/types/figma";

const transfer8to32 = function (fileByte: Uint8Array, start: number, cache: Uint8Array) {
  cache[0] = fileByte[start + 0];
  cache[1] = fileByte[start + 1];
  cache[2] = fileByte[start + 2];
  cache[3] = fileByte[start + 3];
};

// buffers to work with for convenience
const int32 = new Int32Array(1); // 32 bit word
const uint8 = new Uint8Array(int32.buffer); // 4 slots of 8 bits
const uint32 = new Uint32Array(int32.buffer); // 1 unsigned 32 bit word

const calcEnd = function (fileByte: Uint8Array, start: number) {
  transfer8to32(fileByte, start, uint8);
  return uint32[0];
};

function convertBlobsToBase64(json: any): object {
  if (!json.blobs) return json;

  return {
    ...json,
    blobs: json.blobs.map((blob: any) => {
      return btoa(String.fromCharCode(...blob.bytes));
    }),
  };
}

// note fileBuffer is mutated inside
function figToBinaryParts(fileBuffer: ArrayBuffer | Buffer): Uint8Array[] {
  // Convert Buffer to ArrayBuffer if needed
  let arrayBuffer: ArrayBuffer;
  if (fileBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileBuffer;
  } else {
    // Handle Node.js Buffer type
    const buffer = fileBuffer as any;
    if (buffer.buffer instanceof ArrayBuffer) {
      arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    } else {
      // Fallback: create new ArrayBuffer from Buffer
      arrayBuffer = new Uint8Array(buffer).buffer;
    }
  }

  let fileByte: Uint8Array = new Uint8Array(arrayBuffer);

  // check bytes for figma comment "fig-kiwi" if doesn't exist, we first need to unzip the file
  if (
    fileByte[0] !== 102 ||
    fileByte[1] !== 105 ||
    fileByte[2] !== 103 ||
    fileByte[3] !== 45 ||
    fileByte[4] !== 107 ||
    fileByte[5] !== 105 ||
    fileByte[6] !== 119 ||
    fileByte[7] !== 105
  ) {
    const unzipped = UZIP.parse(arrayBuffer);
    const file = unzipped["canvas.fig"];
    arrayBuffer = file.buffer as ArrayBuffer;
    fileByte = new Uint8Array(arrayBuffer);
  }

  // 8 bytes for figma comment "fig-kiwi"
  let start = 8;

  // jumps 4 bytes over delimiter
  calcEnd(fileByte, start);
  start += 4;

  const result: Uint8Array[] = [];
  while (start < fileByte.length) {
    let end = calcEnd(fileByte, start);
    start += 4;

    let byteTemp: Uint8Array = fileByte.slice(start, start + end);

    // TODO: we might not need to check for this
    // Decompress everything other than PNG bytes (they remain compressed and are handled by image-loaders)
    // WARN: it is possible this byte is not png, maybe I need to check a few more bytes?
    if (!(fileByte[start] == 137 && fileByte[start + 1] == 80)) {
      const inflated = UZIP.inflateRaw(byteTemp);
      // Create a new Uint8Array to ensure proper type
      byteTemp = new Uint8Array(inflated);
    }

    result.push(byteTemp);
    start += end;
  }

  return result;
}

/**
 * Parse a .fig file ArrayBuffer and return the document structure
 * This extracts document.children which gives the same structure as Figma API
 */
export function parseFigFile(fileBuffer: ArrayBuffer): { document: FigmaNode } {
  const [schemaByte, dataByte] = figToBinaryParts(fileBuffer);

  const schemaBB = new ByteBuffer(schemaByte);
  const schema = decodeBinarySchema(schemaBB);
  const dataBB = new ByteBuffer(dataByte);
  const schemaHelper = compileSchema(schema);

  const json = schemaHelper[`decodeMessage`](dataBB);
  const convertedJson = convertBlobsToBase64(json);

  // Extract document from the parsed JSON
  // The structure should match FigmaFileResponse format
  const document = (convertedJson as any).document as FigmaNode;

  if (!document) {
    throw new Error("Failed to parse .fig file: document not found");
  }

  return { document };
}
