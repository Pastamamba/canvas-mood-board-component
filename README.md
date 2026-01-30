# Canvas Mood Board - React Flow Application

Interactive React Flow application with custom node and edge types for creating visual mood boards and organizing content.

## Features

- **9 Custom Node Types:**
  - TextNode - Rich text with font size and color options
  - LinkNode - URL preview with OpenGraph metadata
  - ImageNode - Image display with captions
  - NoteNode - Sticky notes in 5 different colors
  - DocumentNode - Complex document structure with actors and attachments
  - VideoNode - YouTube/Vimeo video embedding
  - IframeNode - Embedded web content
  - MarkdownNode - Markdown rendering support
  - SketchNode - Drawing functionality (available)

- **Custom Edge Types:**
  - ButtonEdge - Clickable edges with delete buttons

- **Advanced Features:**
  - Drag & drop functionality
  - Node resizing with NodeResizer
  - Clipboard integration (Ctrl+V to paste URLs, images, text)
  - JSON export/import (Ctrl+E/Ctrl+O)
  - OpenGraph metadata fetching for links
  - Content type auto-detection
  - Zoom and pan
  - Minimap and controls
  - Background grid
  - TypeScript support
  - ESLint configuration

## Usage

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run ESLint
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## Technologies

- React 19
- TypeScript 5.9
- @xyflow/react (React Flow) 12.10
- Vite 7.2
- ESLint 9
- Custom CSS styling

## Project Structure

```
src/
├── node components/
│   ├── TextNode.tsx           # Rich text node
│   ├── LinkNode.tsx          # URL preview with metadata
│   ├── ImageNode.tsx         # Image display
│   ├── NoteNode.tsx          # Colored sticky notes
│   ├── DocumentNode.tsx      # Complex document node
│   ├── VideoNode.tsx         # Video embedding
│   ├── IframeNode.tsx        # Web content embedding
│   ├── MarkdownNode.tsx      # Markdown rendering
│   └── SketchNode.tsx        # Drawing functionality
├── services/
│   ├── ClipboardService.ts   # Clipboard integration
│   ├── CanvasSerializer.ts   # JSON export/import
│   └── MetadataService.ts    # OpenGraph metadata
├── OverviewFlow.tsx          # Main React Flow component
├── ButtonEdge.tsx            # Custom edge with delete button
├── Sidebar.tsx               # Drag & drop sidebar
├── initial-elements.ts       # Sample data
├── index.css                 # Global styles
└── App.tsx                   # Main application
```

## Keyboard Shortcuts

- **Ctrl+V**: Paste from clipboard (URLs, images, text)
- **Ctrl+E**: Export canvas to JSON
- **Ctrl+O**: Import canvas from JSON file

The application starts automatically at http://localhost:5174/
```
