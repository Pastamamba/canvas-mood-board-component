import React, { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import type { TextNode as TextNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';

const TextNode: React.FC<NodeProps<TextNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleMarkdown = useCallback(() => {
    updateNode(id, {
      data: {
        ...data,
        isMarkdown: !data.isMarkdown,
      },
    });
  }, [id, data, updateNode]);

  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(id, {
      data: {
        ...data,
        content: event.target.value,
      },
    });
  }, [id, data, updateNode]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <div className={`text-node ${selected ? 'selected' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
      
      {/* Header */}
      <div className="node-header text-header">
        <span className="node-type">TEXT</span>
        <button
          onClick={handleToggleMarkdown}
          className={`markdown-toggle ${data.isMarkdown ? 'active' : ''}`}
          title={data.isMarkdown ? 'Disable Markdown' : 'Enable Markdown'}
        >
          MD
        </button>
      </div>
      
      {/* Content */}
      <div className="node-content" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <textarea
            value={data.content}
            onChange={handleContentChange}
            onBlur={handleBlur}
            className="text-editor"
            autoFocus
            rows={6}
          />
        ) : (
          <div className="text-display">
            {data.isMarkdown ? (
              <ReactMarkdown>{data.content}</ReactMarkdown>
            ) : (
              <pre className="text-content">{data.content}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TextNode);