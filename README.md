# Figma → Instant Builder Blueprint

A web-based tool that parses local Figma .fig files, reads a selected Frame that uses Auto-layout, and converts it into a structured "Instant Builder Blueprint" describing exactly how to recreate the design using Instant.so sections, rows, columns, text blocks, images, spacing, and buttons.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

If port 3000 is already in use, you can use port 3001 instead:
```bash
npm run dev:3001
```

3. Open [http://localhost:3000](http://localhost:3000) (or [http://localhost:3001](http://localhost:3001) if using the alternative port) in your browser.

## Usage

1. In Figma: File → Save local copy (.fig)
2. Upload your .fig file using the file input
3. Select a frame from the list
4. View the generated Instant Builder Blueprint

## Features

- Parses .fig files locally in the browser (no server calls)
- No Figma API token required
- Parses auto-layout structures
- Maps Figma nodes to Instant Builder concepts
- Generates human-readable and JSON blueprints
- Clean, minimal UI with TailwindCSS
