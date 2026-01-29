import { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type NodeType = 'document' | 'link' | 'video' | 'sketch' | 'text';

export interface Connection extends FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface DocumentNodeData extends Record<string, unknown> {
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

export interface LinkNodeData extends Record<string, unknown> {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface VideoNodeData extends Record<string, unknown> {
  url: string;
  title?: string;
  thumbnail?: string;
  embedType: 'youtube' | 'vimeo' | 'iframe';
}

export interface SketchNodeData extends Record<string, unknown> {
  title?: string;
  paths: Array<Array<{ x: number; y: number }>>;
  backgroundColor?: string;
}

export interface TextNodeData extends Record<string, unknown> {
  content: string;
  isMarkdown: boolean;
}

export interface DocumentNode extends FlowNode {
  id: string;
  type: 'document';
  position: Position;
  data: DocumentNodeData;
}

export interface LinkNode extends FlowNode {
  id: string;
  type: 'link';
  position: Position;
  data: LinkNodeData;
}

export interface VideoNode extends FlowNode {
  id: string;
  type: 'video';
  position: Position;
  data: VideoNodeData;
}

export interface SketchNode extends FlowNode {
  id: string;
  type: 'sketch';
  position: Position;
  data: SketchNodeData;
}

export interface TextNode extends FlowNode {
  id: string;
  type: 'text';
  position: Position;
  data: TextNodeData;
}

export type CanvasNode = DocumentNode | LinkNode | VideoNode | SketchNode | TextNode;

export interface CanvasState {
  nodes: CanvasNode[];
  edges: Connection[];  // Changed from connections to edges (React Flow standard)
  selectedNodeIds: string[];
  mode: 'select' | 'connect' | 'draw';
  clipboard: {
    type: 'text' | 'url' | null;
    content: string;
  } | null;
}

export interface CanvasActions {
  // Node operations
  addNode: (node: Omit<CanvasNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  // Edge operations (connections)
  addEdge: (fromNodeId: string, toNodeId: string) => void;
  removeEdge: (id: string) => void;
  
  // Mode operations
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