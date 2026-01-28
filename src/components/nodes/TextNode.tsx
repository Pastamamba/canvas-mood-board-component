import React, { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import type { TextNode as TextNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { useDebounce } from '../../hooks/usePerformance';

const TextNode: React.FC<NodeProps<TextNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(data.content);

  // Debounced update to improve performance during typing
  const debouncedUpdate = useDebounce((content: string) => {
    updateNode(id, {
      data: {
        ...data,
        content,
      },
    });
  }, 300);

  const handleToggleMarkdown = useCallback(() => {
    updateNode(id, {
      data: {
        ...data,
        isMarkdown: !data.isMarkdown,
      },
    });
  }, [id, data, updateNode]);

  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setLocalContent(newContent);
    debouncedUpdate(newContent);
  }, [debouncedUpdate]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Final update on blur to ensure consistency
    updateNode(id, {
      data: {
        ...data,
        content: localContent,
      },
    });
  }, [id, data, localContent, updateNode]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
      setLocalContent(data.content); // Reset to original content
    }
    // Prevent event bubbling to avoid canvas shortcuts
    event.stopPropagation();
  }, [data.content]);

  return (
    <div className={`text-node ${selected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#6b7280' }}
        isConnectable={!isEditing}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#6b7280' }}
        isConnectable={!isEditing}
      />
      
      {/* Header */}
      <div className="node-header text-header">
        <span className="node-type">TEXT</span>
        <div className="node-controls">
          <button
            onClick={handleToggleMarkdown}
            className={`markdown-toggle ${data.isMarkdown ? 'active' : ''}`}
            title={data.isMarkdown ? 'Disable Markdown' : 'Enable Markdown'}
          >
            {data.isMarkdown ? '📝' : 'MD'}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="node-content" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <textarea
            value={localContent}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-editor"
            autoFocus
            rows={6}
            placeholder="Enter your text here..."
          />
        ) : (
          <div className="text-display">
            {data.isMarkdown ? (
              <div className="markdown-content">
                <ReactMarkdown>{data.content || 'Double-click to edit...'}</ReactMarkdown>
              </div>
            ) : (
              <pre className="text-content">{data.content || 'Double-click to edit...'}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TextNode);