import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { 
  AdvancedDrawingToolbar, 
  DrawingState, 
  DrawingHistoryManager,
  createHistoryManager,
  saveDrawingState,
  undoDrawing,
  redoDrawing,
  drawShape,
  type DrawingTool
} from './AdvancedDrawingTools';

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShapeMode, setIsShapeMode] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [tempCanvas, setTempCanvas] = useState<HTMLCanvasElement | null>(null);
  
  const [drawingState, setDrawingState] = useState<DrawingState>({
    tool: 'pen',
    color: '#000000',
    size: 2,
    opacity: 1,
    fill: false,
    fontSize: 16
  });

  const [history, setHistory] = useState<DrawingHistoryManager>(() => 
    createHistoryManager(50)
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const node = nodeRef.current;
    if (canvas && node) {
      const nodeRect = node.getBoundingClientRect();
      const canvasWidth = Math.max(400, nodeRect.width - 24);
      const canvasHeight = Math.max(300, nodeRect.height - 120); // More space for toolbar
      
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctxRef.current = ctx;
        
        // Save initial state to history
        setHistory(prev => saveDrawingState(canvas, prev));
      }

      // Create temporary canvas for shape preview
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      setTempCanvas(temp);
    }
  }, []);

  const handleDrawingStateChange = useCallback((newState: Partial<DrawingState>) => {
    setDrawingState(prev => ({ ...prev, ...newState }));
    setIsShapeMode(['line', 'rectangle', 'circle', 'text'].includes(newState.tool as string));
  }, []);

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => undoDrawing(canvas, prev));
    }
  }, []);

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => redoDrawing(canvas, prev));
    }
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory(prev => saveDrawingState(canvas, prev));
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    const attachment = {
      id: `sketch-${Date.now()}`,
      name: `${title || 'Sketch'}.png`,
      type: 'image/png',
      data: imageData,
      thumbnail: imageData,
      createdAt: new Date().toISOString(),
    };
    
    const event = new CustomEvent('sketchSaved', {
      detail: { nodeId: `sketch-${Date.now()}`, title, attachment }
    });
    window.dispatchEvent(event);
  }, [title]);

  const handleExport = useCallback((format: 'png' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    if (format === 'png') {
      link.download = `${title || 'sketch'}.png`;
      link.href = canvas.toDataURL('image/png');
    } else {
      // Simple SVG export (would need more complex implementation for full SVG support)
      link.download = `${title || 'sketch'}.png`;
      link.href = canvas.toDataURL('image/png');
    }
    link.click();
  }, [title]);

  useEffect(() => {
    // Initialize canvas after component mounts with a longer delay for proper sizing
    const timer = setTimeout(initializeCanvas, 200);
    let resizeTimeout: number;
    
    // Add resize observer to handle node resizing
    const node = nodeRef.current;
    if (node && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        // Improved debouncing - clear previous timeout and set new one
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Only reinitialize if size actually changed significantly
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = node.getBoundingClientRect();
            const newWidth = Math.floor(rect.width - 32); // Account for padding
            const newHeight = Math.floor(rect.height - 80); // Account for header
            
            if (Math.abs(canvas.width - newWidth) > 5 || Math.abs(canvas.height - newHeight) > 5) {
              initializeCanvas();
            }
          }
        }, 150); // Increased debounce time
      });
      resizeObserver.observe(node);
      
      return () => {
        resizeObserver.disconnect();
        clearTimeout(timer);
        clearTimeout(resizeTimeout);
      };
    }
    
    return () => clearTimeout(timer);
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
    
    setStartPoint({ x, y });
    setIsDrawing(true);
    
    // Configure drawing context
    ctx.globalAlpha = drawingState.opacity;
    ctx.strokeStyle = drawingState.color;
    ctx.fillStyle = drawingState.color;
    ctx.lineWidth = drawingState.size;
    
    if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = drawingState.size * 2; // Eraser is bigger
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    if (drawingState.tool === 'pen' || drawingState.tool === 'brush') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [drawingState]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
    
    if (drawingState.tool === 'pen' || drawingState.tool === 'brush' || drawingState.tool === 'eraser') {
      // Free drawing
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (isShapeMode && tempCanvas) {
      // Shape preview - draw on temporary canvas
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        // Clear temp canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Copy main canvas to temp
        tempCtx.drawImage(canvas, 0, 0);
        
        // Draw shape preview
        drawShape(tempCtx, drawingState.tool, startPoint.x, startPoint.y, x, y, drawingState);
        
        // Clear main canvas and draw temp canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  }, [isDrawing, drawingState, isShapeMode, startPoint, tempCanvas]);

  const stopDrawing = useCallback((e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const canvas = canvasRef.current;
    if (canvas && (drawingState.tool === 'pen' || drawingState.tool === 'brush' || drawingState.tool === 'eraser' || isShapeMode)) {
      // Save state to history
      setHistory(prev => saveDrawingState(canvas, prev));
    }
    
    setIsDrawing(false);
  }, [isDrawing, drawingState.tool, isShapeMode]);

  return (
    <div ref={nodeRef} className="sketch-node" style={{ width: '100%', height: '100%' }}>
      {selected && <NodeResizer minWidth={500} minHeight={450} />}
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
      </div>

      <AdvancedDrawingToolbar
        drawingState={drawingState}
        onChange={handleDrawingStateChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
        onExport={handleExport}
        canUndo={history.currentIndex > 0}
        canRedo={history.currentIndex < history.states.length - 1}
      />
      
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