import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
  SelectionMode,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useCanvasStore, { useCanvasSelectors } from "../store/canvasStore";
import {
  useClipboard,
  useKeyboardShortcuts,
} from "../hooks/useCanvasInteraction";
import { useScrollPrevention } from "../hooks/useZoomFix";
import Toolbar from "./Toolbar";
import DocumentNode from "./nodes/DocumentNode";
import LinkNode from "./nodes/LinkNode";
import VideoNode from "./nodes/VideoNode";
import SketchNode from "./nodes/SketchNode";
import TextNode from "./nodes/TextNode";

// Define custom node types for React Flow
const nodeTypes = {
  document: DocumentNode,
  link: LinkNode,
  video: VideoNode,
  sketch: SketchNode,
  text: TextNode,
};

// Inner canvas component that has access to React Flow context
const CanvasInner: React.FC = () => {
  const { nodes, edges } = useCanvasSelectors();
  const updateNode = useCanvasStore((state) => state.updateNode);
  const addCanvasEdge = useCanvasStore((state) => state.addEdge);
  const addNode = useCanvasStore((state) => state.addNode);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  
  // React Flow hooks - these work because we're inside ReactFlowProvider
  const { screenToFlowPosition } = useReactFlow();
  
  // Custom hooks
  useClipboard();
  useKeyboardShortcuts();
  useScrollPrevention();

  // Performance optimized React Flow nodes conversion
  const reactFlowNodes = useMemo(() => 
    nodes.map(node => ({
      ...node,
      type: node.type,
      position: node.position,
      data: node.data,
      selected: node.selected,
      dragHandle: '.node-header',
    }))
  , [nodes]);

  // Performance optimized React Flow edges conversion  
  const reactFlowEdges = useMemo(() => 
    edges.map(edge => ({
      ...edge,
      type: 'default',
      animated: false,
      style: { strokeWidth: 2 },
      markerEnd: "arrowclosed",
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
    onNodesChange(changes as any);
    
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
    onEdgesChange(changes as any);
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

  // Simple drag over handler
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Simple and reliable drop handler
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType) return;

    // Use React Flow's screenToFlowPosition - this should work now!
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    console.log('Drop:', { nodeType, clientPos: { x: event.clientX, y: event.clientY }, flowPos: position });

    // Create new node
    const newNode = {
      type: nodeType,
      position,
      data: getDefaultNodeData(nodeType),
    };

    addNode(newNode as any);
  }, [screenToFlowPosition, addNode]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={handleConnect}
      onPaneClick={handlePaneClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      nodeTypes={nodeTypes}
      connectionMode={ConnectionMode.Loose}
      selectionMode={SelectionMode.Partial}
      fitView
      attributionPosition="bottom-left"
      className="react-flow-canvas"
      minZoom={0.2}
      maxZoom={3}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      deleteKeyCode={["Backspace", "Delete"]}
      multiSelectionKeyCode={["Meta", "Shift"]}
      panOnScroll={false}
      zoomOnScroll={true}
      zoomOnDoubleClick={false}
      preventScrolling={true}
      nodesDraggable
      nodesConnectable
      elementsSelectable
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
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        }}
        zoomable
        pannable
      />
    </ReactFlow>
  );
};

// Helper function to get default data for new nodes
function getDefaultNodeData(nodeType: string) {
  switch (nodeType) {
    case 'document':
      return {
        title: 'New Document',
        content: '',
        url: '',
        categories: [],
        actors: [],
        attachments: [],
      };
    case 'link':
      return {
        url: '',
        title: 'New Link',
        description: '',
        metadata: {
          title: '',
          description: '',
          image: '',
          siteName: '',
        },
      };
    case 'video':
      return {
        url: '',
        title: 'New Video',
        description: '',
      };
    case 'sketch':
      return {
        title: 'New Sketch',
        sketchData: '',
      };
    case 'text':
      return {
        text: 'New Text',
      };
    default:
      return { text: 'New Node' };
  }
}

// Main Canvas component with ReactFlowProvider wrapper
const Canvas: React.FC = () => {
  return (
    <div className="canvas-container" style={{ width: '100%', height: '100vh' }}>
      <Toolbar />
      <div style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
        <ReactFlowProvider>
          <CanvasInner />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default Canvas;