import React, { useState, useCallback, memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { DocumentNode as DocumentNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { useDebounce } from '../../hooks/usePerformance';

const DocumentNode: React.FC<NodeProps<DocumentNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title);
  const [localContent, setLocalContent] = useState(data.content);

  // Debounced updates for performance
  const debouncedTitleUpdate = useDebounce((title: string) => {
    updateNode(id, {
      data: {
        ...data,
        title,
      },
    });
  }, 300);

  const debouncedContentUpdate = useDebounce((content: string) => {
    updateNode(id, {
      data: {
        ...data,
        content,
      },
    });
  }, 300);

  // Memoized icon based on document type
  const documentIcon = useMemo(() => {
    const fileExtension = data.title?.split('.').pop()?.toLowerCase();
    switch (fileExtension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'txt':
        return '📃';
      case 'md':
        return '📋';
      default:
        return '📄';
    }
  }, [data.title]);

  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setLocalTitle(newTitle);
    debouncedTitleUpdate(newTitle);
  }, [debouncedTitleUpdate]);

  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setLocalContent(newContent);
    debouncedContentUpdate(newContent);
  }, [debouncedContentUpdate]);

  const handleTitleDoubleClick = useCallback(() => {
    setIsEditingTitle(true);
  }, []);

  const handleContentDoubleClick = useCallback(() => {
    setIsEditingContent(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    updateNode(id, {
      data: {
        ...data,
        title: localTitle,
      },
    });
  }, [id, data, localTitle, updateNode]);

  const handleContentBlur = useCallback(() => {
    setIsEditingContent(false);
    updateNode(id, {
      data: {
        ...data,
        content: localContent,
      },
    });
  }, [id, data, localContent, updateNode]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, field: 'title' | 'content') => {
    if (event.key === 'Escape') {
      if (field === 'title') {
        setIsEditingTitle(false);
        setLocalTitle(data.title);
      } else {
        setIsEditingContent(false);
        setLocalContent(data.content);
      }
    }
    if (event.key === 'Enter' && field === 'title') {
      setIsEditingTitle(false);
    }
    event.stopPropagation();
  }, [data.title, data.content]);

  return (
    <div className={`document-node ${selected ? 'selected' : ''} ${(isEditingTitle || isEditingContent) ? 'editing' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#3b82f6' }}
        isConnectable={!isEditingTitle && !isEditingContent}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#3b82f6' }}
        isConnectable={!isEditingTitle && !isEditingContent}
      />
      
      {/* Header */}
      <div className="node-header document-header">
        <span className="node-type">DOCUMENT</span>
        <div className="document-icon">{documentIcon}</div>
      </div>
      
      {/* Content */}
      <div className="node-content">
        {/* Title */}
        <div className="document-title-section" onDoubleClick={handleTitleDoubleClick}>
          {isEditingTitle ? (
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => handleKeyDown(e, 'title')}
              className="document-title-input"
              placeholder="Document title..."
              autoFocus
            />
          ) : (
            <div className="document-title-display">
              {data.title || 'Untitled Document'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="document-content-section" onDoubleClick={handleContentDoubleClick}>
          {isEditingContent ? (
            <textarea
              value={localContent}
              onChange={handleContentChange}
              onBlur={handleContentBlur}
              onKeyDown={(e) => handleKeyDown(e, 'content')}
              className="document-content-textarea"
              placeholder="Document content..."
              rows={4}
              autoFocus
            />
          ) : (
            <div className="document-content-display">
              {data.content || 'Double-click to edit...'}
            </div>
          )}
        </div>
        
        {/* Categories */}
        {data.categories && data.categories.length > 0 && (
          <div className="document-categories">
            {data.categories.map((category, index) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        )}
        
        {/* Actors */}
        {data.actors && data.actors.length > 0 && (
          <div className="document-actors">
            <div className="actors-header">Actors:</div>
            {data.actors.map((actor) => (
              <div key={actor.id} className="actor-item">
                {actor.avatar && (
                  <img 
                    src={actor.avatar} 
                    alt={actor.name}
                    className="actor-avatar"
                  />
                )}
                <span className="actor-name">{actor.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Attachments */}
        {data.attachments && data.attachments.length > 0 && (
          <div className="document-attachments">
            {data.attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-item">
                {attachment.thumbnail && (
                  <img 
                    src={attachment.thumbnail} 
                    alt={attachment.name}
                    className="attachment-thumbnail"
                  />
                )}
                <span className="attachment-name">{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DocumentNode);