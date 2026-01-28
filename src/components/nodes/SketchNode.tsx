import React, { useRef, useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { SketchNode as SketchNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';

const SketchNode: React.FC<NodeProps<SketchNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentStroke([x, y]);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke(prev => [...prev, x, y]);

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentStroke.length < 4) return;

    const newStroke = {
      points: currentStroke,
      color: '#333',
      width: 2,
    };

    updateNode(id, {
      data: {
        ...data,
        strokes: [...data.strokes, newStroke],
      },
    });

    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, id, data, updateNode]);

  const clearSketch = useCallback(() => {
    updateNode(id, {
      data: {
        ...data,
        strokes: [],
      },
    });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [id, data, updateNode]);

  // Redraw strokes when component mounts or strokes change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background color if specified
    if (data.backgroundColor) {
      ctx.fillStyle = data.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw all strokes
    data.strokes.forEach(stroke => {
      if (stroke.points.length < 4) return;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0], stroke.points[1]);
      
      for (let i = 2; i < stroke.points.length; i += 2) {
        ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
      }
      
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, [data.strokes, data.backgroundColor]);

  return (
    <div className={`sketch-node ${selected ? 'selected' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
      
      {/* Header */}
      <div className="node-header sketch-header">
        <span className="node-type">SKETCH</span>
        <button onClick={clearSketch} className="clear-button" title="Clear sketch">
          🗑
        </button>
      </div>
      
      {/* Content */}
      <div className="node-content">
        <canvas
          ref={canvasRef}
          width={280}
          height={200}
          className="sketch-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default memo(SketchNode);