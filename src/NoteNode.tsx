import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { SmartTruncate } from './InformationComponents';

interface NoteNodeProps {
  data: {
    note?: string;
    color?: string;
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    timestamp?: string;
  };
  selected?: boolean;
}

function NoteNode({ data, selected }: NoteNodeProps) {
  const [note, setNote] = useState(data.note || 'Write your note here...');
  const [color, setColor] = useState(data.color || 'yellow');
  const [isEditing, setIsEditing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tags] = useState(data.tags || []);
  const [priority] = useState(data.priority || 'medium');

  const wordCount = note.split(/\s+/).filter(Boolean).length;
  const charCount = note.length;

  const priorityIcons = {
    high: '🔴',
    medium: '🟡', 
    low: '🟢'
  };

  const handleToggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <div 
      className={`note-node-container note-${color} node-container ${isEditing ? 'editing' : ''} ${isMinimized ? 'minimized' : ''}`} 
      style={{ width: '100%', height: '100%' }}
      role="note"
      aria-label={`${color} sticky note${priority !== 'medium' ? `, ${priority} priority` : ''}`}
    >
      {selected && <NodeResizer minWidth={isMinimized ? 100 : 150} minHeight={isMinimized ? 60 : 100} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Note header with controls */}
      <div className="note-header">
        <div className="note-indicators">
          {priority !== 'medium' && (
            <span className="priority-indicator" title={`Priority: ${priority}`}>
              {priorityIcons[priority]}
            </span>
          )}
          {tags.length > 0 && (
            <span className="tags-count" title={`${tags.length} tags`}>
              🏷️{tags.length}
            </span>
          )}
        </div>
        
        <div className="note-controls">
          <button
            onClick={handleToggleMinimize}
            className="control-btn minimize-btn"
            title={isMinimized ? "Expand note" : "Minimize note"}
            aria-label={isMinimized ? "Expand note" : "Minimize note"}
          >
            {isMinimized ? '⬜' : '➖'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Color picker */}
          <div className="note-color-picker" role="radiogroup" aria-label="Choose note color">
            {['yellow', 'blue', 'green', 'pink', 'purple', 'orange', 'gray'].map((colorName) => (
              <button
                key={colorName}
                onClick={() => setColor(colorName)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const colors = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange', 'gray'];
                    const currentIndex = colors.indexOf(colorName);
                    const nextIndex = e.key === 'ArrowRight' 
                      ? (currentIndex + 1) % colors.length
                      : (currentIndex - 1 + colors.length) % colors.length;
                    setColor(colors[nextIndex]);
                  }
                }}
                className={`color-button color-${colorName} ${color === colorName ? 'selected' : ''}`}
                aria-label={`${colorName} color`}
                aria-pressed={color === colorName}
                role="radio"
                tabIndex={color === colorName ? 0 : -1}
              />
            ))}
          </div>

          {/* Note content */}
          <div className="note-content">
            {isEditing ? (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                  }
                  // Allow Ctrl+Enter to exit editing
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    setIsEditing(false);
                  }
                }}
                className="note-textarea"
                autoFocus
                placeholder="Write your note here..."
                aria-label="Note content"
              />
            ) : (
              <div 
                onClick={() => setIsEditing(true)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
                className="note-display"
                role="button"
                tabIndex={0}
                aria-label="Click to edit note"
              >
                {note === 'Write your note here...' ? (
                  <span className="note-placeholder">{note}</span>
                ) : (
                  <SmartTruncate
                    text={note}
                    maxLength={isMinimized ? 50 : 200}
                    previewLines={isMinimized ? 1 : 4}
                    className="note-text"
                  />
                )}
              </div>
            )}
          </div>

          {/* Tags display */}
          {tags.length > 0 && (
            <div className="note-tags">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="note-tag">
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="note-tag more-tags">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Note footer with stats */}
          <div className="note-footer">
            <div className="note-stats">
              {wordCount > 0 && (
                <span className="word-count" title={`${wordCount} words, ${charCount} characters`}>
                  {wordCount}w
                </span>
              )}
            </div>
            {data.timestamp && (
              <div className="note-timestamp" title="Last modified">
                {formatTimestamp(data.timestamp)}
              </div>
            )}
          </div>
        </>
      )}

      {/* Minimized view */}
      {isMinimized && (
        <div className="note-minimized-content">
          <SmartTruncate
            text={note}
            maxLength={30}
            previewLines={1}
            expandInline={false}
            className="note-text-mini"
          />
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(NoteNode);
      </div>
      
      {/* Note content */}
      {isEditing ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              setIsEditing(false);
            }
            if (e.key === 'Escape') {
              setIsEditing(false);
            }
          }}
          className="note-textarea"
          autoFocus
          placeholder="Write your note... (Ctrl+Enter to save)"
          aria-label="Note content"
          aria-describedby="note-help"
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsEditing(true);
            }
          }}
          className="note-content node-body"
          role="button"
          tabIndex={0}
          aria-label="Click to edit note"
        >
          {note}
        </div>
      )}
      
      <div id="note-help" className="sr-only">
        Press Ctrl+Enter to save, Escape to cancel
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(NoteNode);