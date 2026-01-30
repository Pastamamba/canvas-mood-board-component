import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface SketchNodeData {
  title: string;
  drawing?: string;
}

interface SketchNodeProps {
  data: SketchNodeData;
}

const SketchNode: React.FC<SketchNodeProps> = ({ data }) => {
  const [title, setTitle] = useState(data.title);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctxRef.current = ctx;
        
        // Clear canvas with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert canvas to base64 image data
    const imageData = canvas.toDataURL('image/png');
    
    // Create attachment object
    const attachment = {
      id: `sketch-${Date.now()}`,
      name: `${title || 'Sketch'}.png`,
      type: 'image/png',
      data: imageData,
      thumbnail: imageData,
      createdAt: new Date().toISOString(),
    };
    
    // Trigger custom event for parent component to handle
    const event = new CustomEvent('sketchSaved', {
      detail: { 
        nodeId: `sketch-${Date.now()}`,
        title,
        attachment 
      }
    });
    window.dispatchEvent(event);
    
    // Also store in node data for serialization
    if (typeof window !== 'undefined') {
      console.log('Sketch saved as attachment:', attachment);
    }
  };

  const downloadSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${title || 'sketch'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="sketch-node">
      <NodeResizer minWidth={300} minHeight={250} />
      <Handle type="target" position={Position.Top} />
      
      <div className="sketch-header">
        <input
          className="sketch-title node-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sketch title"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="sketch-tools">
          <button 
            className={`sketch-tool ${currentTool === 'pen' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentTool('pen');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            ✏️
          </button>
          <button 
            className={`sketch-tool ${currentTool === 'eraser' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentTool('eraser');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            🧽
          </button>
          <button 
            className="sketch-tool"
            onClick={(e) => {
              e.stopPropagation();
              clearCanvas();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Clear canvas"
          >
            🗑️
          </button>
          <button 
            className="sketch-tool"
            onClick={(e) => {
              e.stopPropagation();
              saveSketch();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Save as attachment"
          >
            💾
          </button>
          <button 
            className="sketch-tool"
            onClick={(e) => {
              e.stopPropagation();
              downloadSketch();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Download sketch"
          >
            ⬇️
          </button>
        </div>
      </div>
      
      <canvas 
        ref={canvasRef}
        className="sketch-canvas"
        width={280}
        height={200}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      />
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default SketchNode;