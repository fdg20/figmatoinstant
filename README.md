# Figma → Instant Builder Blueprint

A web-based tool that converts Figma frames (with Auto-layout) into a structured "Instant Builder Blueprint" for Instant.so using a **Figma URL** (API + server cache).

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

1. **Copy a link to your frame:** In Figma, select the frame you want (in the layers panel or on the canvas) → right‑click → **Copy link to selection**. The URL will include `node-id=...`. You can also use the Share button and copy the link that includes the frame.
2. **Paste and load:** Paste the URL in the app and click **Load blueprint**.
3. Blueprint is fetched once (or read from server cache) and cached under `data/figma-cache/`. Preview and re-opening use the cache — **no Figma API calls**.
4. Use **Refresh from Figma** only when you want to re-fetch that frame from the API.

## Features

- **Figma API**: Uses `GET /files/:key/nodes?ids=FRAME_ID` — only the selected frame is fetched, not the full file.
- **Server cache**: Blueprints stored in `data/figma-cache/{fileKey}-{frameId}.json` (parsed blueprint only, never raw Figma JSON). Eliminates rate limits after the first load.
- **Refresh from Figma**: Manual button to call the API again when the design has changed.
- Parses auto-layout; maps to Instant Builder sections, rows, columns, text, images, buttons; human-readable and JSON export.
