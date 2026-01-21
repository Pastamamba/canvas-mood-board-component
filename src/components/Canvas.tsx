import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import useCanvasStore from '../store/canvasStore';
import { useClipboard, useKeyboardShortcuts, useCanvasInteraction } from '../hooks/useCanvasInteraction';
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
  } = useCanvasStore();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const connectingFrom = useRef<string | null>(null);

  // Custom hooks
  useClipboard();
  useKeyboardShortcuts();
  const canvasInteraction = useCanvasInteraction();

  // Handle stage events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', canvasInteraction.handleWheel);
    container.addEventListener('mousedown', canvasInteraction.handleMouseDown);
    container.addEventListener('mousemove', canvasInteraction.handleMouseMove);
    container.addEventListener('mouseup', canvasInteraction.handleMouseUp);

    return () => {
      container.removeEventListener('wheel', canvasInteraction.handleWheel);
      container.removeEventListener('mousedown', canvasInteraction.handleMouseDown);
      container.removeEventListener('mousemove', canvasInteraction.handleMouseMove);
      container.removeEventListener('mouseup', canvasInteraction.handleMouseUp);
    };
  }, [canvasInteraction]);

  const handleStageClick = useCallback((e: any) => {
    // Check if we clicked on empty space
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

  const getConnectionPath = useCallback((fromNodeId: string, toNodeId: string) => {
    const fromNode = nodes.find(n => n.id === fromNodeId);
    const toNode = nodes.find(n => n.id === toNodeId);
    
    if (!fromNode || !toNode) return [];

    const fromCenter = {
      x: fromNode.position.x + fromNode.size.width / 2,
      y: fromNode.position.y + fromNode.size.height / 2,
    };
    
    const toCenter = {
      x: toNode.position.x + toNode.size.width / 2,
      y: toNode.position.y + toNode.size.height / 2,
    };

    // Simple straight line connection
    return [fromCenter.x, fromCenter.y, toCenter.x, toCenter.y];
  }, [nodes]);

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
        draggable={false}
      >
        <Layer>
          {/* Render connections */}
          {connections.map((connection) => {
            const points = getConnectionPath(connection.fromNodeId, connection.toNodeId);
            return points.length > 0 ? (
              <Line
                key={connection.id}
                points={points}
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