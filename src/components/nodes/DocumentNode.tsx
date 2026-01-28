import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { DocumentNode as DocumentNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';

const DocumentNode: React.FC<NodeProps<DocumentNodeType['data']>> = ({ 
  data, 
  selected 
}) => {
  const { updateNode } = useCanvasStore();

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update store with new title
    // Note: we'll need to pass the node ID somehow or use a different approach
    console.log('Title changed:', event.target.value);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update store with new content
    console.log('Content changed:', event.target.value);
  };

  return (
    <div className={`document-node ${selected ? 'selected' : ''}`}>
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
      <div className="node-header document-header">
        <span className="node-type">DOCUMENT</span>
      </div>
      
      {/* Content */}
      <div className="node-content">
        <input
          type="text"
          value={data.title}
          onChange={handleTitleChange}
          className="document-title"
          placeholder="Document title"
        />
        
        <textarea
          value={data.content}
          onChange={handleContentChange}
          className="document-content"
          placeholder="Document content..."
          rows={4}
        />
        
        {/* Categories */}
        {data.categories.length > 0 && (
          <div className="document-categories">
            {data.categories.map((category, index) => (
              <span key={index} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        )}
        
        {/* Actors */}
        {data.actors.length > 0 && (
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
        {data.attachments.length > 0 && (
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