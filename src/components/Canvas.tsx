import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useCanvasStore from '../store/canvasStore';
import { useClipboard, useKeyboardShortcuts } from '../hooks/useCanvasInteraction';
import Toolbar from './Toolbar';
import DocumentNode from './nodes/DocumentNode';
import LinkNode from './nodes/LinkNode';
import VideoNode from './nodes/VideoNode';
import SketchNode from './nodes/SketchNode';
import TextNode from './nodes/TextNode';
import type { CanvasNode as CanvasNodeType } from '../types';

// Define custom node types for React Flow
const nodeTypes = {
  document: DocumentNode,
  link: LinkNode,
  video: VideoNode,
  sketch: SketchNode,
  text: TextNode,
};

const Canvas: React.FC = () => {
  // Store subscriptions
  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);
  const mode = useCanvasStore((state) => state.mode);
  const updateNode = useCanvasStore((state) => state.updateNode);
  const addCanvasEdge = useCanvasStore((state) => state.addEdge);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

  // Custom hooks
  useClipboard();
  useKeyboardShortcuts();

  // Convert store nodes/edges to React Flow format
  const reactFlowNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      type: node.type,
      position: node.position,
      data: node.data,
      selected: node.selected,
    }))
  , [nodes]);

  const reactFlowEdges = useMemo(() => 
    edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
    }))
  , [edges]);

  // React Flow state
  const [rfNodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Sync React Flow nodes with store when store changes
  React.useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Sync React Flow edges with store when store changes
  React.useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  // Handle node changes (position, selection, etc.)
  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    
    // Update store when nodes change
    changes.forEach((change) => {
      if (change.type === 'position' && change.dragging === false) {
        const node = rfNodes.find(n => n.id === change.id);
        if (node && change.position) {
          updateNode(change.id, { position: change.position });
        }
      }
    });
  }, [onNodesChange, rfNodes, updateNode]);

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Handle new connections
  const handleConnect: OnConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      addCanvasEdge(connection.source, connection.target);
    }
  }, [addCanvasEdge]);

  // Handle pane click (deselect all)
  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="canvas-container" style={{ width: '100%', height: '100vh' }}>
      <Toolbar />
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="react-flow-canvas"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor="#333"
          nodeColor="#fff"
          nodeBorderRadius={8}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default Canvas;