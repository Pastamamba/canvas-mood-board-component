import { type Node, type Edge } from '@xyflow/react';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  metadata?: {
    createdAt: string;
    lastModified: string;
    version: string;
  };
}

export class CanvasSerializer {
  static serialize(nodes: Node[], edges: Edge[], viewport?: { x: number; y: number; zoom: number }): string {
    const state: CanvasState = {
      nodes: nodes.map(node => ({
        ...node,
        // Clean up any internal React Flow properties
        selected: false,
        dragging: false,
      })),
      edges: edges.map(edge => ({
        ...edge,
        selected: false,
      })),
      viewport,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0',
      }
    };
    
    return JSON.stringify(state, null, 2);
  }
  
  static deserialize(jsonString: string): CanvasState | null {
    try {
      const state: CanvasState = JSON.parse(jsonString);
      
      // Validate required properties
      if (!state.nodes || !state.edges) {
        throw new Error('Invalid canvas state: missing nodes or edges');
      }
      
      return state;
    } catch (error) {
      console.error('Failed to deserialize canvas state:', error);
      return null;
    }
  }
  
  static exportToFile(nodes: Node[], edges: Edge[], viewport?: { x: number; y: number; zoom: number }, filename: string = 'canvas-export.json') {
    const jsonString = this.serialize(nodes, edges, viewport);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  static importFromFile(): Promise<CanvasState | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const jsonString = e.target?.result as string;
          const state = this.deserialize(jsonString);
          resolve(state);
        };
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  // Extract node data for external integration
  static extractNodeData(nodes: Node[]) {
    return nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      metadata: {
        width: node.width,
        height: node.height,
        style: node.style,
      }
    }));
  }

  // Create nodes from external data
  static createNodesFromData(nodeData: (Partial<Node> & { metadata?: { width?: number; height?: number; style?: any } })[]): Node[] {
    return nodeData.map(item => ({
      id: item.id || crypto.randomUUID(),
      type: item.type || 'textNode',
      position: item.position || { x: 0, y: 0 },
      data: item.data || {},
      width: item.metadata?.width,
      height: item.metadata?.height,
      style: item.metadata?.style,
    }));
  }
}

// Schema integration helper
export interface DocumentSchema {
  id: string;
  title: string;
  content?: string;
  categories?: string[];
  actors?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnail?: string;
  }>;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    tags?: string[];
  };
}

export class DocumentIntegration {
  static createDocumentNode(document: DocumentSchema, position: { x: number; y: number }): Node {
    return {
      id: `doc-${document.id}`,
      type: 'documentNode',
      position,
      data: {
        documentId: document.id,
        title: document.title,
        content: document.content || '',
        categories: document.categories || [],
        actors: document.actors || [],
        attachments: document.attachments || [],
        metadata: document.metadata,
      },
    };
  }
  
  static extractDocumentData(node: Node): Partial<DocumentSchema> | null {
    if (node.type !== 'documentNode') return null;
    
    return {
      id: node.data?.documentId as string,
      title: node.data?.title as string,
      content: node.data?.content as string,
      categories: node.data?.categories as string[],
      actors: node.data?.actors as Array<{id: string; name: string; avatar?: string}>,
      attachments: node.data?.attachments as Array<{id: string; name: string; type: string; url: string; thumbnail?: string}>,
      metadata: node.data?.metadata as {createdAt: string; updatedAt: string; tags?: string[]},
    };
  }
}