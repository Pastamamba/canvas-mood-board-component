import React, { useState } from 'react';
import type { DrawingTool, DrawingState } from './DrawingUtils';

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

  // const brushSizes = [1, 2, 4, 6, 8, 12, 16, 20, 24, 32]; // TODO: Use for size options

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