import React, { useRef, useCallback } from 'react';
import { Group, Rect } from 'react-konva';
import useCanvasStore from '../store/canvasStore';
import DocumentNodeContent from './nodes/DocumentNode';
import LinkNodeContent from './nodes/LinkNode';
import VideoNodeContent from './nodes/VideoNode';
import SketchNodeContent from './nodes/SketchNode';
import TextNodeContent from './nodes/TextNode';
import type { CanvasNode as CanvasNodeType } from '../types';

interface CanvasNodeProps {
  node: CanvasNodeType;
  onNodeClick: (nodeId: string, event: any) => void;
  isConnecting: boolean;
}

const CanvasNode: React.FC<CanvasNodeProps> = ({ node, onNodeClick, isConnecting }) => {
  const { updateNode, selectNode } = useCanvasStore();
  const groupRef = useRef<any>(null);
  const isDragging = useRef(false);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
    // Disable stage dragging when dragging a node
    const stage = groupRef.current?.getStage();
    if (stage) {
      stage.draggable(false);
    }
  }, []);

  const handleDragEnd = useCallback((e: any) => {
    isDragging.current = false;
    
    // Re-enable stage dragging
    const stage = e.target.getStage();
    if (stage) {
      setTimeout(() => {
        stage.draggable(true);
      }, 50);
    }
    
    updateNode(node.id, {
      position: {
        x: e.target.x(),
        y: e.target.y(),
      },
    });
  }, [node.id, updateNode]);

  const handleClick = useCallback((e: any) => {
    if (!isDragging.current) {
      selectNode(node.id, e.evt.shiftKey);
      onNodeClick(node.id, e);
    }
  }, [node.id, selectNode, onNodeClick]);

  const renderNodeContent = () => {
    switch (node.type) {
      case 'document':
        return <DocumentNodeContent node={node} />;
      case 'link':
        return <LinkNodeContent node={node} />;
      case 'video':
        return <VideoNodeContent node={node} />;
      case 'sketch':
        return <SketchNodeContent node={node} />;
      case 'text':
        return <TextNodeContent node={node} />;
      default:
        return null;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={node.position.x}
      y={node.position.y}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection highlight */}
      {(node.selected || isConnecting) && (
        <Rect
          x={-4}
          y={-4}
          width={node.size.width + 8}
          height={node.size.height + 8}
          stroke={isConnecting ? '#28a745' : '#007bff'}
          strokeWidth={2}
          fill="transparent"
          cornerRadius={10}
          dash={isConnecting ? [5, 5] : undefined}
        />
      )}

      {/* Node background */}
      <Rect
        x={0}
        y={0}
        width={node.size.width}
        height={node.size.height}
        fill="white"
        stroke="#e1e5e9"
        strokeWidth={1}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={4}
        shadowOpacity={0.1}
        shadowOffsetX={0}
        shadowOffsetY={2}
      />

      {/* Node content */}
      {renderNodeContent()}
    </Group>
  );
};

export default CanvasNode;