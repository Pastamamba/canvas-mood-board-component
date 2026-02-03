import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { CollapsibleSection, SmartTruncate, InfoPanel, DataHierarchy } from './InformationComponents';

interface DocumentNodeProps {
  data: {
    title?: string;
    categories?: string[];
    actors?: string[];
    attachments?: { name: string; type: string; thumbnail?: string; size?: number }[];
    documentId?: string;
    content?: string;
    description?: string;
    metadata?: Record<string, any>;
    lastModified?: string;
    author?: string;
    tags?: string[];
    priority?: 'high' | 'medium' | 'low';
  };
  selected?: boolean;
}

function DocumentNode({ data, selected }: DocumentNodeProps) {
  const [title, setTitle] = useState(data.title || 'New Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [description, setDescription] = useState(data.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  const categories = data.categories || [];
  const actors = data.actors || [];
  const attachments = data.attachments || [];
  const tags = data.tags || [];

  const getActorInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  const getActorDisplay = useCallback((actor: string | { name: string; role?: string }) => {
    if (typeof actor === 'string') {
      return { name: actor, initials: getActorInitials(actor) };
    } else if (actor && typeof actor === 'object' && actor.name) {
      return { 
        name: actor.name, 
        initials: actor.avatar || getActorInitials(actor.name),
        role: actor.role
      };
    }
    return { name: 'Unknown', initials: 'U' };
  }, [getActorInitials]);

  const formatFileSize = useCallback((bytes?: number) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b', 
    low: '#10b981'
  };

  const documentMetadata = {
    id: data.documentId,
    author: data.author,
    lastModified: data.lastModified,
    priority: data.priority,
    ...(data.metadata || {})
  };

  return (
    <div className="document-node-container" style={{ width: '100%', height: '100%' }}>
      {selected && <NodeResizer minWidth={300} minHeight={200} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <InfoPanel 
        title={title}
        subtitle={data.author ? `by ${data.author}` : undefined}
        metadata={documentMetadata}
        variant={compactMode ? 'compact' : 'default'}
        actions={
          <div className="document-actions">
            <button 
              onClick={(e) => { e.stopPropagation(); setCompactMode(!compactMode); }}
              className="toggle-btn"
              title={compactMode ? "Expand view" : "Compact view"}
              aria-label={compactMode ? "Expand view" : "Compact view"}
            >
              {compactMode ? '🔍' : '📄'}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
              className="edit-btn"
              title="Edit title"
              aria-label="Edit title"
            >
              ✏️
            </button>
          </div>
        }
      >
        {/* Title editing */}
        {isEditingTitle && (
          <div className="title-editor">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="title-input"
              autoFocus
              placeholder="Document title..."
            />
          </div>
        )}

        {/* Description */}
        {(description || isEditingDescription) && (
          <CollapsibleSection
            title="Description"
            icon="📝"
            defaultExpanded={!compactMode}
            headerActions={
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditingDescription(!isEditingDescription); }}
                className="edit-section-btn"
              >
                {isEditingDescription ? '💾' : '✏️'}
              </button>
            }
          >
            {isEditingDescription ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setIsEditingDescription(false)}
                className="description-textarea"
                placeholder="Add a description..."
                rows={3}
              />
            ) : (
              <SmartTruncate 
                text={description} 
                maxLength={150} 
                previewLines={3}
                className="document-description"
              />
            )}
          </CollapsibleSection>
        )}

        {/* Categories & Tags */}
        {(categories.length > 0 || tags.length > 0) && (
          <CollapsibleSection
            title="Categories & Tags"
            icon="🏷️"
            defaultExpanded={!compactMode}
            count={categories.length + tags.length}
          >
            <div className="tags-container">
              {categories.map((category, index) => (
                <span key={`cat-${index}`} className="category-pill">
                  📂 {category}
                </span>
              ))}
              {tags.map((tag, index) => (
                <span key={`tag-${index}`} className="tag-pill">
                  # {tag}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Actors/People */}
        {actors.length > 0 && (
          <CollapsibleSection
            title="People"
            icon="👥"
            defaultExpanded={!compactMode}
            count={actors.length}
          >
            <div className="actors-grid">
              {actors.map((actor, index) => {
                const actorDisplay = getActorDisplay(actor);
                return (
                  <div key={index} className="actor-card">
                    <div className="actor-avatar" title={actorDisplay.name}>
                      {actorDisplay.initials}
                    </div>
                    <div className="actor-info">
                      <div className="actor-name">{actorDisplay.name}</div>
                      {actorDisplay.role && (
                        <div className="actor-role">{actorDisplay.role}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <CollapsibleSection
            title="Attachments"
            icon="📎"
            defaultExpanded={!compactMode}
            count={attachments.length}
            priority={attachments.length > 10 ? 'high' : attachments.length > 5 ? 'medium' : 'low'}
          >
            <div className="attachments-grid">
              {attachments.map((attachment, index) => (
                <div key={index} className="attachment-card">
                  <div className="attachment-preview">
                    {attachment.thumbnail ? (
                      <img 
                        src={attachment.thumbnail} 
                        alt={attachment.name} 
                        className="attachment-thumbnail" 
                      />
                    ) : (
                      <div className="attachment-placeholder">
                        {attachment.type === 'image' ? '🖼️' : 
                         attachment.type === 'video' ? '🎬' : 
                         attachment.type === 'audio' ? '🎵' : 
                         attachment.type === 'pdf' ? '📄' : '📄'}
                      </div>
                    )}
                  </div>
                  <div className="attachment-info">
                    <SmartTruncate 
                      text={attachment.name}
                      maxLength={25}
                      expandInline={true}
                      className="attachment-name"
                    />
                    {attachment.size && (
                      <div className="attachment-size">
                        {formatFileSize(attachment.size)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Content Preview */}
        {data.content && (
          <CollapsibleSection
            title="Content Preview"
            icon="📖"
            defaultExpanded={false}
          >
            <SmartTruncate 
              text={data.content}
              maxLength={200}
              previewLines={5}
              className="content-preview"
            />
          </CollapsibleSection>
        )}
      </InfoPanel>
      
      {/* Priority indicator */}
      {data.priority && (
        <div 
          className="priority-indicator"
          style={{ 
            backgroundColor: priorityColors[data.priority],
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%'
          }}
          title={`Priority: ${data.priority}`}
        />
      )}
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(DocumentNode);