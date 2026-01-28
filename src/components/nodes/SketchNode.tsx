import React, { useRef, useState, useCallback, memo, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { SketchNode as SketchNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { useDebounce } from '../../hooks/usePerformance';

const SketchNode: React.FC<NodeProps<SketchNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Debounced title update
  const debouncedTitleUpdate = useDebounce((title: string) => {
    updateNode(id, {
      data: {
        ...data,
        title,
      },
    });
  }, 300);

  // Initialize canvas from saved sketch data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw saved paths
    if (data.paths && data.paths.length > 0) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      data.paths.forEach(path => {
        if (path.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        
        ctx.stroke();
      });
    }
  }, [data.paths]);

  const getMousePos = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getMousePos(e);
    setIsDrawing(true);
    setCurrentPath([pos]);
  }, [getMousePos]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pos = getMousePos(e);
    const newPath = [...currentPath, pos];
    setCurrentPath(newPath);

    // Draw the line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, [isDrawing, currentPath, getMousePos]);
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentPath.length === 0) return;

    setIsDrawing(false);
    
    // Save the completed path
    const newPaths = [...(data.paths || []), currentPath];
    setCurrentPath([]);

    updateNode(id, {
      data: {
        ...data,
        paths: newPaths,
      },
    });
  }, [isDrawing, currentPath, data, id, updateNode]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateNode(id, {
      data: {
        ...data,
        paths: [],
      },
    });
  }, [data, id, updateNode]);

  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setLocalTitle(newTitle);
    debouncedTitleUpdate(newTitle);
  }, [debouncedTitleUpdate]);

  const handleTitleDoubleClick = useCallback(() => {
    setIsEditingTitle(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    updateNode(id, {
      data: {
        ...data,
        title: localTitle,
      },
    });
  }, [id, data, localTitle, updateNode]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      setIsEditingTitle(false);
      if (event.key === 'Escape') {
        setLocalTitle(data.title);
      }
    }
    event.stopPropagation();
  }, [data.title]);

  return (
    <div className={`sketch-node ${selected ? 'selected' : ''} ${isEditingTitle ? 'editing' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#f59e0b' }}
        isConnectable={!isEditingTitle}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#f59e0b' }}
        isConnectable={!isEditingTitle}
      />
      
      {/* Header */}
      <div className="node-header sketch-header">
        <span className="node-type">SKETCH</span>
        <div className="node-controls">
          <button
            onClick={clearCanvas}
            className="clear-btn"
            title="Clear canvas"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="node-content">
        {/* Title */}
        <div className="sketch-title-section" onDoubleClick={handleTitleDoubleClick}>
          {isEditingTitle ? (
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className="sketch-title-input"
              placeholder="Sketch title..."
              autoFocus
            />
          ) : (
            <div className="sketch-title-display">
              {data.title || 'Untitled Sketch'}
            </div>
          )}
        </div>

        {/* Canvas */}
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

        {/* Instructions */}
        <div className="sketch-instructions">
          {isDrawing ? 'Drawing...' : 'Click and drag to draw'}
        </div>
      </div>
    </div>
  );
};

export default memo(SketchNode);