import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface DocumentNodeProps {
  data: {
    title?: string;
    categories?: string[];
    actors?: string[];
    attachments?: { name: string; type: string; thumbnail?: string }[];
    documentId?: string;
    content?: string;
  };
}

function DocumentNode({ data }: DocumentNodeProps) {
  const [title, setTitle] = useState(data.title || 'New Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [categories] = useState(data.categories || []);
  const [actors] = useState(data.actors || []);
  const [attachments] = useState(data.attachments || []);

  const getActorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActorDisplay = (actor: any) => {
    if (typeof actor === 'string') {
      return { name: actor, initials: getActorInitials(actor) };
    } else if (actor && typeof actor === 'object' && actor.name) {
      return { 
        name: actor.name, 
        initials: actor.avatar || getActorInitials(actor.name) 
      };
    }
    return { name: 'Unknown', initials: 'U' };
  };

  return (
    <div className="document-node-container">
      <NodeResizer minWidth={250} minHeight={150} />
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <div className="document-header">
        {isEditingTitle ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            className="document-title-input"
            autoFocus
          />
        ) : (
          <h3 
            onClick={() => setIsEditingTitle(true)}
            className="document-title"
          >
            {title}
          </h3>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="document-categories">
          {categories.map((category, index) => (
            <span key={index} className="category-pill">
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Actors */}
      {actors.length > 0 && (
        <div className="document-actors">
          <div className="section-label">People:</div>
          <div className="actors-list">
            {actors.map((actor, index) => {
              const actorDisplay = getActorDisplay(actor);
              return (
                <div key={index} className="actor-avatar" title={actorDisplay.name}>
                  {actorDisplay.initials}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="document-attachments">
          <div className="section-label">Attachments:</div>
          <div className="attachments-grid">
            {attachments.map((attachment, index) => (
              <div key={index} className="attachment-item">
                {attachment.thumbnail ? (
                  <img src={attachment.thumbnail} alt={attachment.name} className="attachment-thumbnail" />
                ) : (
                  <div className="attachment-placeholder">
                    {attachment.type === 'image' ? '🖼️' : attachment.type === 'video' ? '🎬' : '📄'}
                  </div>
                )}
                <span className="attachment-name">{attachment.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(DocumentNode);