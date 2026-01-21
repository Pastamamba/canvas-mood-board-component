import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import useCanvasStore from '../store/canvasStore';
import { useClipboard, useKeyboardShortcuts } from '../hooks/useCanvasInteraction';
import CanvasNode from './CanvasNode';
import Toolbar from './Toolbar';
import type { CanvasNode as CanvasNodeType } from '../types';

const Canvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const connectingFrom = useRef<string | null>(null);

  // Optimized store subscriptions - only subscribe to what we need
  const nodes = useCanvasStore((state) => state.nodes);
  const connections = useCanvasStore((state) => state.connections);
  const mode = useCanvasStore((state) => state.mode);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const addConnection = useCanvasStore((state) => state.addConnection);

  // Canvas boundaries
  const CANVAS_WIDTH = 3000;
  const CANVAS_HEIGHT = 2000;

  useClipboard();
  useKeyboardShortcuts();

  // Zoom controls from store
  const zoom = useCanvasStore((state) => state.zoom);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const setPanOffset = useCanvasStore((state) => state.setPanOffset);

  // Update stage when zoom changes from toolbar
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const currentScale = stage.scaleX();
    if (Math.abs(currentScale - zoom) > 0.01) {
      const stageCenter = {
        x: stage.width() / 2,
        y: stage.height() / 2
      };
      
      stage.scale({ x: zoom, y: zoom });
      const newPos = {
        x: stageCenter.x - (stageCenter.x * zoom),
        y: stageCenter.y - (stageCenter.y * zoom)
      };
      stage.position(newPos);
    }
  }, [zoom]);

  // Mouse wheel zoom with larger increment and state sync
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const stage = stageRef.current;
      if (!stage) return;

      const scaleBy = 1.15; // Much larger increment as requested
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.2, Math.min(2, newScale)); // Match toolbar limits

      // Apply to Konva stage immediately
      stage.scale({ x: clampedScale, y: clampedScale });
      
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };
      
      stage.position(newPos);
      
      // Update store state for toolbar sync
      setZoom(clampedScale);
      setPanOffset(newPos);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
      connectingFrom.current = null;
    }
  }, [clearSelection]);

  const handleNodeClick = useCallback((nodeId: string, event: any) => {
    event.cancelBubble = true;
    
    if (mode === 'connect') {
      if (connectingFrom.current === null) {
        connectingFrom.current = nodeId;
      } else if (connectingFrom.current !== nodeId) {
        addConnection(connectingFrom.current, nodeId);
        connectingFrom.current = null;
      }
    }
  }, [mode, addConnection]);

  // Highly optimized connection memoization
  const connectionPaths = useMemo(() => {
    if (connections.length === 0) return [];
    
    return connections.map(connection => {
      const fromNode = nodes.find(n => n.id === connection.fromNodeId);
      const toNode = nodes.find(n => n.id === connection.toNodeId);
      
      if (!fromNode || !toNode) return { id: connection.id, points: [] };

      const fromCenter = {
        x: fromNode.position.x + fromNode.size.width / 2,
        y: fromNode.position.y + fromNode.size.height / 2,
      };
      
      const toCenter = {
        x: toNode.position.x + toNode.size.width / 2,
        y: toNode.position.y + toNode.size.height / 2,
      };

      return {
        id: connection.id,
        points: [fromCenter.x, fromCenter.y, toCenter.x, toCenter.y]
      };
    });
  }, [connections, nodes]);

  // Static grid - no need to recalculate every render
  const gridLines = useMemo(() => {
    const verticalLines = Array.from({ length: Math.ceil(CANVAS_WIDTH / 50) }, (_, i) => (
      <Line
        key={`v-${i}`}
        points={[i * 50, 0, i * 50, CANVAS_HEIGHT]}
        stroke="rgba(0,0,0,0.05)"
        strokeWidth={1}
        perfectDrawEnabled={false}
        listening={false}
      />
    ));

    const horizontalLines = Array.from({ length: Math.ceil(CANVAS_HEIGHT / 50) }, (_, i) => (
      <Line
        key={`h-${i}`}
        points={[0, i * 50, CANVAS_WIDTH, i * 50]}
        stroke="rgba(0,0,0,0.05)"
        strokeWidth={1}
        perfectDrawEnabled={false}
        listening={false}
      />
    ));

    return [...verticalLines, ...horizontalLines];
  }, []);

  return (
    <div className="canvas-container" ref={containerRef}>
      <Toolbar />
      
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
        draggable={false}
        listening={true}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#f8f9fa"
            stroke="#e9ecef"
            strokeWidth={2}
            perfectDrawEnabled={false}
            listening={false}
          />
          
          {/* Grid pattern */}
          {gridLines}
        </Layer>
        
        <Layer>
          {/* Connection lines */}
          {connectionPaths.map((connection) => {
            return connection.points.length > 0 ? (
              <Line
                key={connection.id}
                points={connection.points}
                stroke="#007bff"
                strokeWidth={2}
                opacity={0.7}
                perfectDrawEnabled={false}
                listening={false}
              />
            ) : null;
          })}
        </Layer>
        
        <Layer>
          {/* Nodes */}
          {nodes.map((node: CanvasNodeType) => (
            <CanvasNode
              key={node.id}
              node={node}
              onNodeClick={handleNodeClick}
              isConnecting={mode === 'connect' && connectingFrom.current === node.id}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;