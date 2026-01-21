import React, { useRef, useState, useCallback, memo } from 'react';
import { Text, Group, Rect, Line } from 'react-konva';
import type { SketchNode } from '../../types';
import useCanvasStore from '../../store/canvasStore';

interface SketchNodeProps {
  node: SketchNode;
}

const SketchNodeContent: React.FC<SketchNodeProps> = ({ node }) => {
  const { updateNode } = useCanvasStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<number[]>([]);
  const stageRef = useRef<any>(null);

  const handleMouseDown = useCallback((e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    const localPos = {
      x: pos.x - node.position.x - 12, // Account for padding
      y: pos.y - node.position.y - 40, // Account for header
    };
    
    if (localPos.x >= 0 && localPos.x <= node.size.width - 24 && 
        localPos.y >= 0 && localPos.y <= node.size.height - 52) {
      setIsDrawing(true);
      setCurrentStroke([localPos.x, localPos.y]);
    }
  }, [node.position, node.size]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing) return;

    const pos = e.target.getStage().getPointerPosition();
    const localPos = {
      x: pos.x - node.position.x - 12,
      y: pos.y - node.position.y - 40,
    };

    setCurrentStroke(prev => [...prev, localPos.x, localPos.y]);
  }, [isDrawing, node.position]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentStroke.length < 4) return;

    const newStroke = {
      points: currentStroke,
      color: '#333',
      width: 2,
    };

    updateNode(node.id, {
      data: {
        ...node.data,
        strokes: [...node.data.strokes, newStroke],
      },
    });

    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, node.id, node.data.strokes, updateNode]);

  const clearSketch = useCallback(() => {
    updateNode(node.id, {
      data: {
        ...node.data,
        strokes: [],
      },
    });
  }, [node.id, node.data, updateNode]);

  return (
    <Group>
      {/* Header */}
      <Rect
        x={8}
        y={8}
        width={node.size.width - 16}
        height={24}
        fill="#fd7e14"
        cornerRadius={4}
      />
      
      <Text
        x={12}
        y={14}
        text="SKETCH"
        fontSize={10}
        fontStyle="bold"
        fill="white"
      />

      {/* Clear button */}
      <Group 
        x={node.size.width - 50} 
        y={8}
        onClick={clearSketch}
        onTap={clearSketch}
      >
        <Rect
          x={0}
          y={0}
          width={35}
          height={24}
          fill="rgba(255, 255, 255, 0.2)"
          cornerRadius={4}
        />
        <Text
          x={4}
          y={7}
          text="Clear"
          fontSize={8}
          fill="white"
        />
      </Group>

      {/* Drawing area */}
      <Group y={40}>
        {/* Background */}
        <Rect
          x={12}
          y={0}
          width={node.size.width - 24}
          height={node.size.height - 52}
          fill={node.data.backgroundColor || '#fafafa'}
          stroke="#ddd"
          strokeWidth={1}
          cornerRadius={4}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        {/* Existing strokes */}
        {node.data.strokes.map((stroke, index) => (
          <Line
            key={index}
            points={stroke.points}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            x={12}
            y={0}
          />
        ))}

        {/* Current stroke being drawn */}
        {isDrawing && currentStroke.length > 2 && (
          <Line
            points={currentStroke}
            stroke="#333"
            strokeWidth={2}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            x={12}
            y={0}
          />
        )}
      </Group>

      {/* Instructions */}
      {node.data.strokes.length === 0 && !isDrawing && (
        <Text
          x={12 + (node.size.width - 24) / 2 - 40}
          y={40 + (node.size.height - 52) / 2 - 6}
          text="Click and drag to draw"
          fontSize={11}
          fill="#999"
          align="center"
        />
      )}

      {/* Stroke count indicator */}
      {node.data.strokes.length > 0 && (
        <Group x={node.size.width - 25} y={node.size.height - 20}>
          <Rect
            x={0}
            y={0}
            width={15}
            height={15}
            fill="#fd7e14"
            cornerRadius={7}
          />
          <Text
            x={3}
            y={3}
            text={node.data.strokes.length.toString()}
            fontSize={8}
            fill="white"
            fontStyle="bold"
          />
        </Group>
      )}
    </Group>
  );
};

export default memo(SketchNodeContent);