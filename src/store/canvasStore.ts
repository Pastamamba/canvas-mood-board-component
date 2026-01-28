import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasState, CanvasActions, CanvasNode, Connection, Position } from '../types';

const useCanvasStore = create<CanvasState & CanvasActions>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],  // Changed from connections to edges
  selectedNodeIds: [],
  mode: 'select',
  clipboard: null,

  // Node operations
  addNode: (node) => {
    const newNode: CanvasNode = {
      ...node,
      id: uuidv4(),
      width: node.width || 200,
      height: node.height || 150,
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
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
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

  // Edge operations (connections)
  addEdge: (fromNodeId, toNodeId) => {
    // Prevent self-connections and duplicate connections
    const { edges } = get();
    const edgeExists = edges.some(
      (edge) =>
        (edge.source === fromNodeId && edge.target === toNodeId) ||
        (edge.source === toNodeId && edge.target === fromNodeId)
    );

    if (fromNodeId !== toNodeId && !edgeExists) {
      const newEdge: Connection = {
        id: uuidv4(),
        source: fromNodeId,
        target: toNodeId,
      };

      set((state) => ({
        edges: [...state.edges, newEdge],
      }));
    }
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
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

    const { nodes } = get();
    const position: Position = {
      x: 100 + nodes.length * 20,
      y: 100 + nodes.length * 20,
    };

    if (urlPattern.test(trimmedContent)) {
      // Determine if it's a video URL
      if (youtubePattern.test(trimmedContent) || vimeoPattern.test(trimmedContent)) {
        get().addNode({
          type: 'video',
          position,
          width: 320,
          height: 240,
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
          width: 300,
          height: 150,
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
        width: 250,
        height: 150,
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
      edges: state.edges,
      selectedNodeIds: state.selectedNodeIds,
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