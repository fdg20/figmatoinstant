# Figma → Instant Builder Blueprint

A web-based tool that converts Figma frames (with Auto-layout) into a structured "Instant Builder Blueprint" for Instant.so — either from a **Figma URL** (API + server cache) or from an uploaded **.fig file** (local only).

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. (Optional) For **Figma URL** flow, add a Figma access token:
```bash
cp .env.example .env
# Edit .env and set FIGMA_ACCESS_TOKEN (Figma → Settings → Account → Personal access tokens)
```

3. Run the development server:
```bash
npm run dev
```

If port 3000 is already in use:
```bash
npm run dev:3001
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Option A: Figma URL (recommended — cached, one API call per frame)

1. In Figma, select the frame you want, then right‑click → **Copy link to selection** (URL will include `node-id=...`).
2. Paste the URL in the app and click **Load blueprint**.
3. Blueprint is fetched once (or read from server cache) and cached under `data/figma-cache/`. Preview and re-opening use the cache — **no Figma API calls**.
4. Use **Refresh from Figma** only when you want to re-fetch that frame from the API.

### Option B: Upload .fig file

1. In Figma: File → Save local copy (.fig).
2. Upload the file and select a frame from the list.
3. View the generated blueprint (all processing is local; no API or cache).

## Features

- **Figma API**: Uses `GET /files/:key/nodes?ids=FRAME_ID` — only the selected frame is fetched, not the full file.
- **Server cache**: Blueprints stored in `data/figma-cache/{fileKey}-{frameId}.json` (parsed blueprint only, never raw Figma JSON). Eliminates rate limits after the first load.
- **Refresh from Figma**: Manual button to call the API again when the design has changed.
- **.fig upload**: No token or API; parses and converts locally.
- Parses auto-layout; maps to Instant Builder sections, rows, columns, text, images, buttons; human-readable and JSON export.
