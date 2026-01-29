import React, { useState, useCallback, memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { DocumentNodeData } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { useDebounce } from '../../hooks/usePerformance';

const DocumentNode: React.FC<NodeProps> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const typedData = data as DocumentNodeData;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [localTitle, setLocalTitle] = useState(typedData.title);
  const [localContent, setLocalContent] = useState(typedData.content);

  // Debounced updates for performance
  const debouncedTitleUpdate = useDebounce((title: string) => {
    updateNode(id, {
      data: {
        ...typedData,
        title,
      },
    });
  }, 300);

  const debouncedContentUpdate = useDebounce((content: string) => {
    updateNode(id, {
      data: {
        ...typedData,
        content,
      },
    });
  }, 300);

  // Memoized icon based on document type
  const documentIcon = useMemo(() => {
    const fileExtension = typedData.title?.split('.').pop()?.toLowerCase();
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
  }, [typedData.title]);

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
        ...typedData,
        title: localTitle,
      },
    });
  }, [id, data, localTitle, updateNode]);

  const handleContentBlur = useCallback(() => {
    setIsEditingContent(false);
    updateNode(id, {
      data: {
        ...typedData,
        content: localContent,
      },
    });
  }, [id, data, localContent, updateNode]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, field: 'title' | 'content') => {
    if (event.key === 'Escape') {
      if (field === 'title') {
        setIsEditingTitle(false);
        setLocalTitle(typedData.title);
      } else {
        setIsEditingContent(false);
        setLocalContent(typedData.content);
      }
    }
    if (event.key === 'Enter' && field === 'title') {
      setIsEditingTitle(false);
    }
    event.stopPropagation();
  }, [typedData.title, typedData.content]);

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
              {typedData.title || 'Untitled Document'}
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
              {typedData.content || 'Double-click to edit...'}
            </div>
          )}
        </div>
        
        {/* Categories */}
        {typedData.categories && typedData.categories.length > 0 && (
          <div className="document-categories">
            {typedData.categories.map((category: string, index: number) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        )}
        
        {/* Actors */}
        {typedData.actors && typedData.actors.length > 0 && (
          <div className="document-actors">
            <div className="actors-header">Actors:</div>
            {typedData.actors.map((actor: { id: string; name: string; avatar?: string }) => (
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
        {typedData.attachments && typedData.attachments.length > 0 && (
          <div className="document-attachments">
            {typedData.attachments.map((attachment: { id: string; type: 'image' | 'file'; url: string; thumbnail?: string; name: string }) => (
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
