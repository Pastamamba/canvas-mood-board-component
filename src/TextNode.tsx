import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { SmartTextArea } from './AdvancedUIComponents';

interface TextNodeProps {
  data: {
    text?: string;
    richText?: boolean;
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
  };
  selected?: boolean;
}

function TextNode({ data, selected }: TextNodeProps) {
  const [text, setText] = useState(data.text || 'Click to edit text...');
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState(data.fontSize || 14);
  const [textAlign, setTextAlign] = useState(data.textAlign || 'left');
  const [showToolbar, setShowToolbar] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    setIsEditing(true);
    setShowToolbar(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setShowToolbar(false);
  }, []);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    // Update node data if needed
  }, []);

  const handleFontSizeChange = useCallback((delta: number) => {
    setFontSize(prev => Math.max(8, Math.min(72, prev + delta)));
  }, []);

  const handleTextAlignChange = useCallback((align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      // Here you could save to localStorage or backend
      console.log('Auto-saving text:', text);
    }, 2000);
    
    return () => clearTimeout(saveTimeout);
  }, [text]);

  const nodeStyle = {
    fontSize: `${fontSize}px`,
    textAlign,
    backgroundColor: data.backgroundColor || 'var(--color-surface)',
    color: data.textColor || 'var(--color-text)',
    minHeight: '80px',
    width: '100%',
    height: '100%'
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div 
      ref={nodeRef}
      className={`text-node-container node-container ${isEditing ? 'editing' : ''}`} 
      style={nodeStyle}
    >
      {selected && <NodeResizer minWidth={150} minHeight={80} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Toolbar for formatting when editing */}
      {showToolbar && isEditing && (
        <div className="text-node-toolbar">
          <div className="toolbar-group">
            <button 
              onClick={() => handleFontSizeChange(-2)}
              className="toolbar-btn"
              title="Decrease font size"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <span className="font-size-display">{fontSize}px</span>
            <button 
              onClick={() => handleFontSizeChange(2)}
              className="toolbar-btn"
              title="Increase font size"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>
          
          <div className="toolbar-group">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                onClick={() => handleTextAlignChange(align)}
                className={`toolbar-btn ${textAlign === align ? 'active' : ''}`}
                title={`Align ${align}`}
                aria-label={`Align ${align}`}
              >
                {align === 'left' ? '⫷' : align === 'center' ? '▣' : '⫸'}
              </button>
            ))}
          </div>
          
          <div className="toolbar-stats">
            {wordCount}w • {charCount}c
          </div>
        </div>
      )}
      
      {isEditing ? (
        <SmartTextArea
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder="Enter your text... (Ctrl+Enter to save)"
          className="text-node-textarea"
          showToolbar={data.richText}
          autoResize={true}
        />
      ) : (
        <div 
          onClick={handleClick}
          className="text-node-content node-body"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
          aria-label="Click to edit text"
          style={{ textAlign, fontSize }}
        >
          {text === 'Click to edit text...' ? (
            <span className="placeholder-text">{text}</span>
          ) : (
            <pre className="text-content">{text}</pre>
          )}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(TextNode);