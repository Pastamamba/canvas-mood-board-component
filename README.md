# Canvas Mood Board

An interactive React canvas component for visual organization and mood gathering. Built with TypeScript, React, Konva, and Zustand.

## Features

### Core Canvas Functionality
- **Infinite Canvas**: Standard zoom and pan controls
- **Node Manipulation**: Drag, drop, and resize nodes
- **Connections**: Non-directional connections between nodes
- **Multi-selection**: Select multiple nodes with Shift+click
- **Keyboard Shortcuts**: Quick actions and mode switching

### Node Types

1. **Document Node** (Green)
   - Links to existing documents in your database
   - Displays categories as pills
   - Shows actor avatars
   - Attachment indicators

2. **Link Node** (Blue)
   - Auto-fetches OpenGraph data
   - Shows previews with thumbnails
   - Displays site information

3. **Video Node** (Red)
   - Supports YouTube and Vimeo
   - Auto-detects video platform
   - Shows thumbnails when available
   - Generic iframe support for other videos

4. **Sketch Node** (Orange)
   - Freehand drawing tool
   - Multiple stroke support
   - Clear functionality
   - Stroke counter

5. **Text/Markdown Node** (Purple)
   - Plain text or Markdown support
   - Toggle between modes
   - Character counter
   - Auto-formatting for Markdown

### Workflow Features
- **Clipboard Support**: Paste URLs or text to auto-create nodes
- **Auto-Detection**: Automatically identifies content type (URL vs text)
- **Export/Import**: Save and load canvas state as JSON
- **Mode Switching**: Select, Connect modes

## Getting Started

### Prerequisites
- Node.js 16+
- pnpm (recommended) or npm

### Installation

```bash
# Clone and navigate to the project
cd canvas-mood-board

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build for Production

```bash
pnpm build
```

## Usage

### Basic Operations
- **Pan**: Mouse wheel or Shift+drag
- **Zoom**: Ctrl/Cmd + Mouse wheel
- **Select**: Click on nodes
- **Multi-select**: Shift+click additional nodes
- **Delete**: Select nodes and press Delete/Backspace
- **Connect**: Switch to Connect mode (C key) and click two nodes

### Adding Nodes
1. Use toolbar buttons to add specific node types
2. Paste content (Ctrl/Cmd+V) for auto-detection:
   - URLs become Link or Video nodes
   - Text becomes Text nodes

### Keyboard Shortcuts
- `S` - Select mode
- `C` - Connect mode  
- `Escape` - Clear selection and return to select mode
- `Delete/Backspace` - Delete selected nodes
- `Ctrl/Cmd+V` - Paste content
- `Ctrl/Cmd+E` - Export canvas state (logs to console)

## Architecture

### State Management
The application uses Zustand for state management with a clean, predictable API:

```typescript
interface CanvasState {
  nodes: CanvasNode[];
  connections: Connection[];
  selectedNodeIds: string[];
  zoom: number;
  panOffset: Position;
  mode: 'select' | 'connect' | 'draw';
  clipboard: ClipboardData | null;
}
```

### Node Structure
Each node follows a consistent interface:

```typescript
interface BaseNode {
  id: string;
  type: NodeType;
  position: Position;
  size: Size;
  selected: boolean;
  zIndex: number;
}
```

### Serialization
The canvas state is fully serializable and can be exported/imported as JSON:

```typescript
const state = useCanvasStore.getState().exportState();
// Save state to your backend/database
```

## Customization

### Adding New Node Types
1. Define the node type in `src/types/index.ts`
2. Create a component in `src/components/nodes/`
3. Add to the switch statement in `CanvasNode.tsx`
4. Update the toolbar in `Toolbar.tsx`

### Styling
Modify `src/index.css` for global styles. Each node type can be styled individually in their respective components.

### Integration with Existing Systems
The component is designed to integrate with existing document schemas:

```typescript
interface DocumentNodeData {
  documentId?: string;  // Link to your existing documents
  title: string;
  content: string;
  categories: string[];
  actors: Actor[];
  attachments: Attachment[];
}
```

## API Reference

### Store Actions
- `addNode(node)` - Add a new node
- `updateNode(id, updates)` - Update node properties
- `removeNode(id)` - Remove a node
- `selectNode(id, multiSelect?)` - Select/deselect nodes
- `addConnection(fromId, toId)` - Create connection
- `exportState()` - Get serializable state
- `importState(state)` - Load state from JSON

### Utilities
- `fetchOpenGraphData(url)` - Get metadata for links
- `detectContentType(content)` - Identify URL vs text
- `downloadCanvasAsJSON(data)` - Download state as file
- `uploadJSONFile()` - Load state from file

## Dependencies

### Core Dependencies
- **React** - UI framework
- **TypeScript** - Type safety
- **Konva + react-konva** - Canvas rendering
- **Zustand** - State management
- **uuid** - Unique ID generation

### Utility Dependencies
- **lucide-react** - Icons
- **clsx** - Conditional styling
- **react-markdown** - Markdown parsing (if needed for HTML rendering)
- **use-image** - Image loading for Konva

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing
This is a foundational canvas component ready for integration into larger systems. The architecture is designed to be extensible and customizable for specific use cases.

## License
MIT