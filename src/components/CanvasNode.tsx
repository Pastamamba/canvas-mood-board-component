import React, { useRef, useCallback, memo } from 'react';
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
  const updateNode = useCanvasStore((state) => state.updateNode);
  const selectNode = useCanvasStore((state) => state.selectNode);
  const groupRef = useRef<any>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((e: any) => {
    isDragging.current = true;
    dragStartPos.current = { x: e.target.x(), y: e.target.y() };
  }, []);

  const handleDragEnd = useCallback((e: any) => {
    isDragging.current = false;
    const newPos = { x: e.target.x(), y: e.target.y() };
    
    // Only update if position changed significantly (reduces unnecessary updates)
    if (Math.abs(newPos.x - dragStartPos.current.x) > 1 || 
        Math.abs(newPos.y - dragStartPos.current.y) > 1) {
      updateNode(node.id, { position: newPos });
    }
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
      perfectDrawEnabled={false}
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
          perfectDrawEnabled={false}
          listening={false}
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
        shadowBlur={2}
        shadowOpacity={0.08}
        shadowOffsetX={0}
        shadowOffsetY={1}
        perfectDrawEnabled={false}
      />

      {/* Node content */}
      {renderNodeContent()}
    </Group>
  );
};

export default memo(CanvasNode);