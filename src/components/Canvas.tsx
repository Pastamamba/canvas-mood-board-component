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
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useCanvasStore, { useCanvasSelectors } from '../store/canvasStore';
import { useClipboard, useKeyboardShortcuts } from '../hooks/useCanvasInteraction';
import { useScrollPrevention } from '../hooks/useZoomFix';
import Toolbar from './Toolbar';
import DocumentNode from './nodes/DocumentNode';
import LinkNode from './nodes/LinkNode';
import VideoNode from './nodes/VideoNode';
import SketchNode from './nodes/SketchNode';
import TextNode from './nodes/TextNode';
import LoadingSpinner from './LoadingSpinner';
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
  // Use optimized selectors
  const { nodes, edges, mode } = useCanvasSelectors();
  const updateNode = useCanvasStore((state) => state.updateNode);
  const addCanvasEdge = useCanvasStore((state) => state.addEdge);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

  // Custom hooks
  useClipboard();
  useKeyboardShortcuts();
  useScrollPrevention(); // Prevent scroll conflicts

  // Performance optimized React Flow nodes conversion
  const reactFlowNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      type: node.type,
      position: node.position,
      data: node.data,
      selected: node.selected,
      dragHandle: '.node-header', // Only allow dragging from header
    }))
  , [nodes]);

  // Performance optimized edges conversion  
  const reactFlowEdges = useMemo(() => 
    edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { 
        strokeWidth: 2,
        stroke: '#3b82f6',
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#3b82f6',
      },
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
        selectionMode={SelectionMode.Partial}
        fitView
        attributionPosition="bottom-left"
        className="react-flow-canvas"
        minZoom={0.2}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Shift']}
        panOnScroll={false}
        panOnScrollMode="free"
        panOnScrollSpeed={0.5}
        zoomOnScroll={true}
        zoomOnDoubleClick={true}
        zoomOnPinch={true}
        zoomActivationKeyCode={null}
        preventScrolling={true}
        zoomOnScrollSpeed={0.3}
        elevateEdgesOnSelect
        nodesDraggable
        nodesConnectable
        elementsSelectable
        selectNodesOnDrag={false}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="bottom-right"
        />
        <MiniMap
          nodeStrokeColor="#6b7280"
          nodeColor="#f3f4f6"
          nodeBorderRadius={8}
          maskColor="rgba(255, 255, 255, 0.2)"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};

export default Canvas;