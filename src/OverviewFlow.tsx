import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {
  nodes as initialNodes,
  edges as initialEdges,
} from './initial-elements';

import AnnotationNode from './AnnotationNode';
import ToolbarNode from './ToolbarNode';
import ResizerNode from './ResizerNode';
import CircleNode from './CircleNode';
import TextInputNode from './TextInputNode';
import ButtonEdge from './ButtonEdge';
import TextNode from './TextNode';
import LinkNode from './LinkNode';
import ImageNode from './ImageNode';
import NoteNode from './NoteNode';
import DocumentNode from './DocumentNode';
import VideoNode from './VideoNode';
import IframeNode from './IframeNode';
import SketchNode from './SketchNode';
import MarkdownNode from './MarkdownNode';
import GroupNode from './GroupNode';
import Sidebar from './Sidebar';
import { clipboardService } from './ClipboardService';
import { CanvasSerializer } from './CanvasSerializer';

const nodeTypes = {
  annotation: AnnotationNode,
  tools: ToolbarNode,
  resizer: ResizerNode,
  circle: CircleNode,
  textinput: TextInputNode,
  textNode: TextNode,
  linkNode: LinkNode,
  imageNode: ImageNode,
  noteNode: NoteNode,
  documentNode: DocumentNode,
  videoNode: VideoNode,
  iframeNode: IframeNode,
  sketchNode: SketchNode,
  markdownNode: MarkdownNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  button: ButtonEdge,
};

const nodeClassName = (node: any) => node.type;

const OverviewFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onPaneClick = useCallback(() => {
    // Deselect all nodes when clicking on empty pane
    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        const newNode: Node = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: getDefaultNodeData(type),
          // Add default styles for different node types
          style: type === 'sketchNode' ? { width: 450, height: 400 } : 
                 type === 'textNode' ? { width: 300, height: 200 } :
                 type === 'noteNode' ? { width: 200, height: 120 } :
                 type === 'imageNode' ? { width: 300, height: 250 } :
                 type === 'linkNode' ? { width: 350, height: 150 } :
                 type === 'videoNode' ? { width: 400, height: 300 } :
                 type === 'documentNode' ? { width: 350, height: 400 } :
                 type === 'iframeNode' ? { width: 400, height: 300 } :
                 type === 'markdownNode' ? { width: 350, height: 250 } :
                 type === 'groupNode' ? { width: 400, height: 300 } :
                 undefined
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, setNodes],
  );

  // Export/Import functions
  const exportCanvas = useCallback(() => {
    const viewport = reactFlowInstance?.getViewport();
    CanvasSerializer.exportToFile(nodes, edges, viewport);
  }, [nodes, edges, reactFlowInstance]);

  const importCanvas = useCallback(async () => {
    const state = await CanvasSerializer.importFromFile();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      if (state.viewport && reactFlowInstance) {
        reactFlowInstance.setViewport(state.viewport);
      }
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'v' && reactFlowInstance) {
        event.preventDefault();
        
        try {
          const clipboardData = await clipboardService.readFromClipboard();
          if (clipboardData && clipboardData.content.trim()) {
            const rect = reactFlowWrapper.current?.getBoundingClientRect();
            if (rect) {
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const position = reactFlowInstance.screenToFlowPosition({
                x: centerX,
                y: centerY,
              });
              
              const newNode = clipboardService.createNodeFromClipboard(
                clipboardData.content, 
                position, 
                clipboardData.type === 'image'
              );
              setNodes((nds) => nds.concat(newNode));
            }
          }
        } catch (error) {
          console.warn('Failed to paste from clipboard:', error);
        }
      } else if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        exportCanvas();
      } else if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        importCanvas();
      }
    },
    [reactFlowInstance, setNodes, exportCanvas, importCanvas],
  );

  // Add event listeners for keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getDefaultNodeData = (nodeType: string) => {
    switch (nodeType) {
      case 'textNode':
        return { text: 'New text node' };
      case 'linkNode':
        return { url: 'https://example.com', title: 'New Link' };
      case 'imageNode':
        return { imageUrl: '', caption: 'New image' };
      case 'noteNode':
        return { note: 'New note...', color: 'yellow' };
      case 'documentNode':
        return { 
          title: 'New Document',
          categories: [],
          actors: [],
          attachments: [],
          content: ''
        };
      case 'videoNode':
        return { url: '', title: 'New Video' };
      case 'iframeNode':
        return { url: '', title: 'Web View' };
      case 'sketchNode':
        return { title: 'New Sketch', drawing: '' };
      case 'markdownNode':
        return { content: '# New Note\\n\\nClick to edit...', title: 'Markdown Note' };
      case 'groupNode':
        return { label: 'Group', backgroundColor: 'rgba(99, 102, 241, 0.1)' };
      default:
        return {};
    }
  };

  // Node drag and drop grouping functionality
  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    // Check if node was dropped on a group node
    const groupNodes = nodes.filter(n => n.type === 'groupNode' && n.id !== node.id);
    
    for (const groupNode of groupNodes) {
      const groupBounds = {
        x: groupNode.position.x,
        y: groupNode.position.y,
        width: (groupNode.style?.width as number) || 300,
        height: (groupNode.style?.height as number) || 200
      };
      
      // Check if node is inside group bounds
      if (
        node.position.x >= groupBounds.x &&
        node.position.x <= groupBounds.x + groupBounds.width &&
        node.position.y >= groupBounds.y &&
        node.position.y <= groupBounds.y + groupBounds.height
      ) {
        // Set the node as child of the group
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  parentId: groupNode.id,
                  expandParent: true,
                  extent: 'parent',
                  position: {
                    x: node.position.x - groupBounds.x,
                    y: node.position.y - groupBounds.y,
                  },
                }
              : n
          )
        );
        break;
      }
    }
  }, [nodes, setNodes]);

  return (
    <div className="flow-container">
      <Sidebar />
      <div className="canvas-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          fitView
          attributionPosition="top-right"
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <MiniMap zoomable pannable nodeClassName={nodeClassName} />
          <Controls />
          <Background />
        </ReactFlow>
        
        {/* Export/Import Actions */}
        <div className="canvas-actions">
          <button 
            className="canvas-action-button"
            onClick={exportCanvas}
            title="Export Canvas (Ctrl+S)"
          >
            💾 Export
          </button>
          <button 
            className="canvas-action-button"
            onClick={importCanvas}
            title="Import Canvas (Ctrl+O)"
          >
            📁 Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewFlow;