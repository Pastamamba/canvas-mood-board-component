import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface NoteNodeProps {
  data: {
    note?: string;
    color?: string;
  };
}

function NoteNode({ data }: NoteNodeProps) {
  const [note, setNote] = useState(data.note || 'Write your note here...');
  const [color, setColor] = useState(data.color || 'yellow');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`note-node-container note-${color}`}>
      <NodeResizer minWidth={150} minHeight={100} />
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Color picker */}
      <div className="note-color-picker">
        {['yellow', 'blue', 'green', 'pink', 'purple'].map((colorName) => (
          <button
            key={colorName}
            onClick={() => setColor(colorName)}
            className={`color-button color-${colorName} ${color === colorName ? 'selected' : ''}`}
            title={colorName}
          />
        ))}
      </div>
      
      {/* Note content */}
      {isEditing ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              setIsEditing(false);
            }
          }}
          className="note-textarea"
          autoFocus
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="note-content"
        >
          {note}
        </div>
      )}
      
      <div className="note-icon">📝</div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(NoteNode);