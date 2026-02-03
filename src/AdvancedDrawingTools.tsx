import React, { useState, useCallback } from 'react';

export type DrawingTool = 'pen' | 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text';

export interface DrawingState {
  tool: DrawingTool;
  color: string;
  size: number;
  opacity: number;
  fill: boolean;
  fontSize: number;
}

export interface DrawingToolbarProps {
  drawingState: DrawingState;
  onChange: (state: Partial<DrawingState>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport: (format: 'png' | 'svg') => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const AdvancedDrawingToolbar: React.FC<DrawingToolbarProps> = ({
  drawingState,
  onChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  canUndo,
  canRedo
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const tools = [
    { id: 'pen' as DrawingTool, icon: '✏️', name: 'Pen', shortcut: 'P' },
    { id: 'brush' as DrawingTool, icon: '🖌️', name: 'Brush', shortcut: 'B' },
    { id: 'eraser' as DrawingTool, icon: '🧽', name: 'Eraser', shortcut: 'E' },
    { id: 'line' as DrawingTool, icon: '📏', name: 'Line', shortcut: 'L' },
    { id: 'rectangle' as DrawingTool, icon: '⬜', name: 'Rectangle', shortcut: 'R' },
    { id: 'circle' as DrawingTool, icon: '⭕', name: 'Circle', shortcut: 'C' },
    { id: 'text' as DrawingTool, icon: 'T', name: 'Text', shortcut: 'T' }
  ];

  const predefinedColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
    '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080'
  ];

  const brushSizes = [1, 2, 4, 6, 8, 12, 16, 20, 24, 32];

  return (
    <div className="advanced-drawing-toolbar">
      {/* Main Tools */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onChange({ tool: tool.id })}
              className={`toolbar-btn ${drawingState.tool === tool.id ? 'active' : ''}`}
              title={`${tool.name} (${tool.shortcut})`}
              aria-label={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="toolbar-section">
        <div className="color-selector">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="color-preview"
            style={{ backgroundColor: drawingState.color }}
            title="Select color"
            aria-label="Select color"
          />
          {showColorPicker && (
            <div className="color-picker-dropdown">
              <div className="predefined-colors">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange({ color });
                      setShowColorPicker(false);
                    }}
                    className="color-option"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={drawingState.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="custom-color-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* Brush Settings */}
      <div className="toolbar-section">
        <div className="brush-settings">
          <label className="setting-label">
            Size: {drawingState.size}px
            <input
              type="range"
              min="1"
              max="50"
              value={drawingState.size}
              onChange={(e) => onChange({ size: parseInt(e.target.value) })}
              className="size-slider"
            />
          </label>
          
          <label className="setting-label">
            Opacity: {Math.round(drawingState.opacity * 100)}%
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={drawingState.opacity}
              onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
              className="opacity-slider"
            />
          </label>
        </div>
      </div>

      {/* Shape Options */}
      {(drawingState.tool === 'rectangle' || drawingState.tool === 'circle') && (
        <div className="toolbar-section">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={drawingState.fill}
              onChange={(e) => onChange({ fill: e.target.checked })}
            />
            Fill shape
          </label>
        </div>
      )}

      {/* Text Options */}
      {drawingState.tool === 'text' && (
        <div className="toolbar-section">
          <label className="setting-label">
            Font size: {drawingState.fontSize}px
            <input
              type="range"
              min="8"
              max="72"
              value={drawingState.fontSize}
              onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
              className="font-size-slider"
            />
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="toolbar-btn"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="toolbar-btn"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            ↷
          </button>
          <button
            onClick={onClear}
            className="toolbar-btn"
            title="Clear canvas"
            aria-label="Clear canvas"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="toolbar-section">
        <div className="export-menu">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="toolbar-btn"
            title="Export options"
            aria-label="Export options"
          >
            ⬇️
          </button>
          {showExportMenu && (
            <div className="export-dropdown">
              <button onClick={() => { onExport('png'); setShowExportMenu(false); }}>
                Export as PNG
              </button>
              <button onClick={() => { onExport('svg'); setShowExportMenu(false); }}>
                Export as SVG
              </button>
              <button onClick={() => { onSave(); setShowExportMenu(false); }}>
                Save to Node
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface DrawingHistoryManager {
  states: ImageData[];
  currentIndex: number;
  maxStates: number;
}

export const createHistoryManager = (maxStates: number = 50): DrawingHistoryManager => ({
  states: [],
  currentIndex: -1,
  maxStates
});

export const saveDrawingState = (
  canvas: HTMLCanvasElement,
  history: DrawingHistoryManager
): DrawingHistoryManager => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return history;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const newStates = history.states.slice(0, history.currentIndex + 1);
  newStates.push(imageData);

  // Limit history size
  if (newStates.length > history.maxStates) {
    newStates.shift();
  }

  return {
    ...history,
    states: newStates,
    currentIndex: newStates.length - 1
  };
};

export const undoDrawing = (
  canvas: HTMLCanvasElement,
  history: DrawingHistoryManager
): DrawingHistoryManager => {
  if (history.currentIndex > 0) {
    const newIndex = history.currentIndex - 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(history.states[newIndex], 0, 0);
    }
    return {
      ...history,
      currentIndex: newIndex
    };
  }
  return history;
};

export const redoDrawing = (
  canvas: HTMLCanvasElement,
  history: DrawingHistoryManager
): DrawingHistoryManager => {
  if (history.currentIndex < history.states.length - 1) {
    const newIndex = history.currentIndex + 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(history.states[newIndex], 0, 0);
    }
    return {
      ...history,
      currentIndex: newIndex
    };
  }
  return history;
};

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  tool: DrawingTool,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  state: DrawingState
) => {
  ctx.globalAlpha = state.opacity;
  ctx.strokeStyle = state.color;
  ctx.fillStyle = state.color;
  ctx.lineWidth = state.size;

  switch (tool) {
    case 'line':
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      break;

    case 'rectangle':
      const width = endX - startX;
      const height = endY - startY;
      if (state.fill) {
        ctx.fillRect(startX, startY, width, height);
      } else {
        ctx.strokeRect(startX, startY, width, height);
      }
      break;

    case 'circle':
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      if (state.fill) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
      break;

    case 'text':
      ctx.font = `${state.fontSize}px Arial`;
      ctx.fillText('Click to edit text', startX, startY);
      break;
  }

  ctx.globalAlpha = 1; // Reset opacity
};