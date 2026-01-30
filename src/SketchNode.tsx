import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface SketchNodeData {
  title: string;
  drawing?: string;
}

interface SketchNodeProps {
  data: SketchNodeData;
  selected?: boolean;
}

const SketchNode: React.FC<SketchNodeProps> = ({ data, selected }) => {
  const [title, setTitle] = useState(data.title);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const node = nodeRef.current;
    if (canvas && node) {
      // Get node dimensions and calculate canvas size
      const nodeRect = node.getBoundingClientRect();
      const canvasWidth = Math.max(400, nodeRect.width - 24); // Account for padding
      const canvasHeight = Math.max(300, nodeRect.height - 80); // Account for header and padding
      
      // Set canvas size (both display and internal dimensions)
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
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
        
        console.log('Canvas initialized:', { width: canvas.width, height: canvas.height });
      }
    }
  };

  useEffect(() => {
    // Initialize canvas after component mounts with a longer delay for proper sizing
    const timer = setTimeout(initializeCanvas, 200);
    
    // Add resize observer to handle node resizing
    const node = nodeRef.current;
    if (node && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        // Debounce the resize to avoid too many redraws
        setTimeout(initializeCanvas, 100);
      });
      resizeObserver.observe(node);
      
      return () => {
        resizeObserver.disconnect();
        clearTimeout(timer);
      };
    }
    
    return () => clearTimeout(timer);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    // Prevent all event propagation to stop React Flow dragging
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    console.log('Start drawing at:', { x, y, canvasSize: { width: canvas.width, height: canvas.height } });
    
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
    e.nativeEvent.stopImmediatePropagation();
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
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
    <div ref={nodeRef} className="sketch-node">
      {selected && <NodeResizer minWidth={450} minHeight={400} />}
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
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
      />
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default SketchNode;