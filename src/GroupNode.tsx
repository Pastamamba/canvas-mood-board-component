import { memo, useState } from 'react';
import { NodeResizer, Handle, Position } from '@xyflow/react';

interface GroupNodeProps {
  id: string;
  data: {
    label?: string;
    backgroundColor?: string;
  };
  selected?: boolean;
}

function GroupNode({ data, selected }: GroupNodeProps) {
  const [label, setLabel] = useState(data.label || 'Group');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div 
      className="group-node-container" 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: data.backgroundColor || 'rgba(99, 102, 241, 0.1)',
      }}
    >
      {selected && (
        <NodeResizer 
          minWidth={200} 
          minHeight={150}
          keepAspectRatio={false}
        />
      )}
      
      {/* Group label */}
      <div className="group-node-header">
        {isEditing ? (
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="group-label-input"
            autoFocus
          />
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="group-label"
          >
            {label}
          </div>
        )}
      </div>

      {/* Content area for child nodes */}
      <div className="group-content-area">
        <div className="group-drop-hint">
          Drop nodes here to group them
        </div>
      </div>

      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="group-handle" />
      <Handle type="source" position={Position.Bottom} className="group-handle" />
    </div>
  );
}

export default memo(GroupNode);