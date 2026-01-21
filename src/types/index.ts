export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}

export type NodeType = 'document' | 'link' | 'video' | 'sketch' | 'text';

export interface BaseNode {
  id: string;
  type: NodeType;
  position: Position;
  size: Size;
  selected: boolean;
  zIndex: number;
}

export interface DocumentNodeData {
  documentId?: string;
  title: string;
  content: string;
  categories: string[];
  actors: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  attachments: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    thumbnail?: string;
    name: string;
  }>;
}

export interface LinkNodeData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface VideoNodeData {
  url: string;
  title?: string;
  thumbnail?: string;
  embedType: 'youtube' | 'vimeo' | 'iframe';
}

export interface SketchNodeData {
  strokes: Array<{
    points: number[];
    color: string;
    width: number;
  }>;
  backgroundColor?: string;
}

export interface TextNodeData {
  content: string;
  isMarkdown: boolean;
}

export interface DocumentNode extends BaseNode {
  type: 'document';
  data: DocumentNodeData;
}

export interface LinkNode extends BaseNode {
  type: 'link';
  data: LinkNodeData;
}

export interface VideoNode extends BaseNode {
  type: 'video';
  data: VideoNodeData;
}

export interface SketchNode extends BaseNode {
  type: 'sketch';
  data: SketchNodeData;
}

export interface TextNode extends BaseNode {
  type: 'text';
  data: TextNodeData;
}

export type CanvasNode = DocumentNode | LinkNode | VideoNode | SketchNode | TextNode;

export interface CanvasState {
  nodes: CanvasNode[];
  connections: Connection[];
  selectedNodeIds: string[];
  zoom: number;
  panOffset: Position;
  mode: 'select' | 'connect' | 'draw';
  clipboard: {
    type: 'text' | 'url' | null;
    content: string;
  } | null;
}

export interface CanvasActions {
  // Node operations
  addNode: (node: Omit<CanvasNode, 'id' | 'zIndex'>) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  // Connection operations
  addConnection: (fromNodeId: string, toNodeId: string) => void;
  removeConnection: (id: string) => void;
  
  // Canvas operations
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: Position) => void;
  setMode: (mode: CanvasState['mode']) => void;
  
  // Clipboard operations
  handlePaste: (content: string) => void;
  
  // Serialization
  exportState: () => CanvasState;
  importState: (state: Partial<CanvasState>) => void;
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}