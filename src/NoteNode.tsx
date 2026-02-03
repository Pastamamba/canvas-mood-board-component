import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface NoteNodeProps {
  data: {
    note?: string;
    color?: string;
  };
  selected?: boolean;
}

function NoteNode({ data, selected }: NoteNodeProps) {
  const [note, setNote] = useState(data.note || 'Write your note here...');
  const [color, setColor] = useState(data.color || 'yellow');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div 
      className={`note-node-container note-${color} node-container ${isEditing ? 'editing' : ''}`} 
      style={{ width: '100%', height: '100%' }}
      role="note"
      aria-label={`${color} sticky note`}
    >
      {selected && <NodeResizer minWidth={150} minHeight={100} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Color picker */}
      <div className="note-color-picker" role="radiogroup" aria-label="Choose note color">
        {['yellow', 'blue', 'green', 'pink', 'purple'].map((colorName) => (
          <button
            key={colorName}
            onClick={() => setColor(colorName)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const colors = ['yellow', 'blue', 'green', 'pink', 'purple'];
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