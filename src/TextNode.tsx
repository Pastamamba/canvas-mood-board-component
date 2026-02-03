import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface TextNodeProps {
  data: {
    text?: string;
  };
  selected?: boolean;
}

function TextNode({ data, selected }: TextNodeProps) {
  const [text, setText] = useState(data.text || 'Click to edit text...');
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setIsEditing(false);
    }
  };

  return (
    <div className={`text-node-container node-container ${isEditing ? 'editing' : ''}`} style={{ width: '100%', height: '100%' }}>
      {selected && <NodeResizer minWidth={100} minHeight={60} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          className="text-node-textarea"
          autoFocus
          placeholder="Enter your text..."
          aria-label="Node text content"
        />
      ) : (
        <div 
          onClick={handleClick}
          className="text-node-content node-body"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
          aria-label="Click to edit text"
        >
          {text}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(TextNode);