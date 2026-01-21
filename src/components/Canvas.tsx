import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import useCanvasStore from '../store/canvasStore';
import { useClipboard, useKeyboardShortcuts } from '../hooks/useCanvasInteraction';
import CanvasNode from './CanvasNode';
import Toolbar from './Toolbar';
import type { CanvasNode as CanvasNodeType } from '../types';

const Canvas: React.FC = () => {
  const {
    nodes,
    connections,
    zoom,
    panOffset,
    mode,
    clearSelection,
    addConnection,
    setZoom,
    setPanOffset,
  } = useCanvasStore();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const connectingFrom = useRef<string | null>(null);
  const [isStageBeingDragged, setIsStageBeingDragged] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Canvas boundaries - finite canvas size
  const CANVAS_WIDTH = 3000;
  const CANVAS_HEIGHT = 2000;

  // Custom hooks
  useClipboard();
  useKeyboardShortcuts();

  // Handle wheel zoom with throttling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Throttle zoom updates for better performance
      if (zoomTimeoutRef.current) return;
      
      zoomTimeoutRef.current = setTimeout(() => {
        zoomTimeoutRef.current = null;
      }, 16); // ~60fps
      
      const scaleBy = 1.08;
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.2, Math.min(2, newScale));

      setZoom(clampedScale);

      // Keep the zoom centered on mouse position
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };
      
      // Apply canvas boundaries
      const boundedPos = {
        x: Math.min(0, Math.max(window.innerWidth - CANVAS_WIDTH * clampedScale, newPos.x)),
        y: Math.min(0, Math.max(window.innerHeight - CANVAS_HEIGHT * clampedScale, newPos.y)),
      };
      
      setPanOffset(boundedPos);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [setZoom, setPanOffset, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const handleStageClick = useCallback((e: any) => {
    // Only clear selection if we didn't drag the stage
    if (e.target === e.target.getStage() && !isStageBeingDragged) {
      clearSelection();
      connectingFrom.current = null;
    }
  }, [clearSelection, isStageBeingDragged]);

  const handleStageDragStart = useCallback(() => {
    setIsStageBeingDragged(true);
  }, []);

  const handleStageDragEnd = useCallback((e: any) => {
    // Apply boundaries when dragging ends
    const newX = Math.min(0, Math.max(window.innerWidth - CANVAS_WIDTH * zoom, e.target.x()));
    const newY = Math.min(0, Math.max(window.innerHeight - CANVAS_HEIGHT * zoom, e.target.y()));
    
    setPanOffset({ x: newX, y: newY });
    
    // Reset drag state after a small delay to prevent immediate clicks
    setTimeout(() => {
      setIsStageBeingDragged(false);
    }, 100);
  }, [setPanOffset, zoom, CANVAS_WIDTH, CANVAS_HEIGHT]);

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

  const connectionPaths = useMemo(() => {
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
  }, [nodes, connections]);

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  return (
    <div className="canvas-container" ref={containerRef}>
      <Toolbar />
      
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onDragStart={handleStageDragStart}
        onDragEnd={handleStageDragEnd}
        draggable={true}
      >
        <Layer>
          {/* Canvas background with visible boundaries */}
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#f8f9fa"
            stroke="#dee2e6"
            strokeWidth={2}
          />
          
          {/* Grid pattern */}
          {Array.from({ length: Math.ceil(CANVAS_WIDTH / 50) }, (_, i) => (
            <Line
              key={`vertical-${i}`}
              points={[i * 50, 0, i * 50, CANVAS_HEIGHT]}
              stroke="rgba(0,0,0,0.05)"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_HEIGHT / 50) }, (_, i) => (
            <Line
              key={`horizontal-${i}`}
              points={[0, i * 50, CANVAS_WIDTH, i * 50]}
              stroke="rgba(0,0,0,0.05)"
              strokeWidth={1}
            />
          ))}
        </Layer>
        
        <Layer>
          {/* Render connections */}
          {connectionPaths.map((connection) => {
            return connection.points.length > 0 ? (
              <Line
                key={connection.id}
                points={connection.points}
                stroke="#6c757d"
                strokeWidth={2}
                opacity={0.7}
              />
            ) : null;
          })}
        </Layer>
        
        <Layer>
          {/* Render nodes */}
          {nodes
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((node: CanvasNodeType) => (
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