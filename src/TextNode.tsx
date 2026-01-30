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
    <div className="text-node-container">
      {selected && <NodeResizer minWidth={100} minHeight={60} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          className="text-node-textarea"
          autoFocus
        />
      ) : (
        <div 
          onClick={handleClick}
          className="text-node-content"
        >
          {text}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(TextNode);