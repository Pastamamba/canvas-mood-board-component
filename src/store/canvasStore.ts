import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasState, CanvasActions, CanvasNode, Connection, Position } from '../types';

const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  // Initial state
  nodes: [],
  connections: [],
  selectedNodeIds: [],
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  mode: 'select',
  clipboard: null,

  // Node operations
  addNode: (node) => {
    const newNode: CanvasNode = {
      ...node,
      id: uuidv4(),
      zIndex: Math.max(...get().nodes.map(n => n.zIndex || 0), 0) + 1,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeIds: [newNode.id],
    }));
  },

  updateNode: (id, updates) => {
      set((state) => {
        const nodeIndex = state.nodes.findIndex(node => node.id === id);
        if (nodeIndex === -1) return state;
        
        // Create new array with updated node
        const newNodes = [...state.nodes];
        newNodes[nodeIndex] = { ...newNodes[nodeIndex], ...updates };
        
        return { nodes: newNodes };
      });
    },

    removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      connections: state.connections.filter(
        (conn) => conn.fromNodeId !== id && conn.toNodeId !== id
      ),
      selectedNodeIds: state.selectedNodeIds.filter((nodeId) => nodeId !== id),
    }));
  },

  selectNode: (id, multiSelect = false) => {
    set((state) => {
      let newSelectedIds: string[];
      
      if (multiSelect) {
        newSelectedIds = state.selectedNodeIds.includes(id)
          ? state.selectedNodeIds.filter((nodeId) => nodeId !== id)
          : [...state.selectedNodeIds, id];
      } else {
        newSelectedIds = [id];
      }

      return {
        selectedNodeIds: newSelectedIds,
        nodes: state.nodes.map((node) => ({
          ...node,
          selected: newSelectedIds.includes(node.id),
        })),
      };
    });
  },

  clearSelection: () => {
    set((state) => ({
      selectedNodeIds: [],
      nodes: state.nodes.map((node) => ({ ...node, selected: false })),
    }));
  },

  // Connection operations
  addConnection: (fromNodeId, toNodeId) => {
    // Prevent self-connections and duplicate connections
    const { connections } = get();
    const connectionExists = connections.some(
      (conn) =>
        (conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId) ||
        (conn.fromNodeId === toNodeId && conn.toNodeId === fromNodeId)
    );

    if (fromNodeId !== toNodeId && !connectionExists) {
      const newConnection: Connection = {
        id: uuidv4(),
        fromNodeId,
        toNodeId,
      };

      set((state) => ({
        connections: [...state.connections, newConnection],
      }));
    }
  },

  removeConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id),
    }));
  },

  // Canvas operations
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(3, zoom)) });
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  setMode: (mode) => {
    set({ mode });
  },

  // Clipboard operations
  handlePaste: (content) => {
    const trimmedContent = content.trim();
    
    // Detect URL pattern
    const urlPattern = /^https?:\/\/[^\s]+$/;
    const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
    const vimeoPattern = /vimeo\.com\/(\d+)/;

    const { nodes, panOffset } = get();
    const position: Position = {
      x: 100 - panOffset.x + nodes.length * 20,
      y: 100 - panOffset.y + nodes.length * 20,
    };

    if (urlPattern.test(trimmedContent)) {
      // Determine if it's a video URL
      if (youtubePattern.test(trimmedContent) || vimeoPattern.test(trimmedContent)) {
        get().addNode({
          type: 'video',
          position,
          size: { width: 320, height: 240 },
          selected: false,
          data: {
            url: trimmedContent,
            embedType: youtubePattern.test(trimmedContent) ? 'youtube' : 'vimeo',
          },
        });
      } else {
        // Regular link
        get().addNode({
          type: 'link',
          position,
          size: { width: 300, height: 150 },
          selected: false,
          data: {
            url: trimmedContent,
          },
        });
      }
    } else {
      // Plain text
      get().addNode({
        type: 'text',
        position,
        size: { width: 250, height: 150 },
        selected: false,
        data: {
          content: trimmedContent,
          isMarkdown: false,
        },
      });
    }

    set({ clipboard: { type: urlPattern.test(trimmedContent) ? 'url' : 'text', content: trimmedContent } });
  },

  // Serialization
  exportState: () => {
    const state = get();
    return {
      nodes: state.nodes,
      connections: state.connections,
      selectedNodeIds: state.selectedNodeIds,
      zoom: state.zoom,
      panOffset: state.panOffset,
      mode: state.mode,
      clipboard: state.clipboard,
    };
  },

  importState: (newState) => {
    set((state) => ({
      ...state,
      ...newState,
    }));
  },
}));

export default useCanvasStore;