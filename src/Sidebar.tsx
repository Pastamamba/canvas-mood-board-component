import React from 'react';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">Drag & Drop Nodes</h3>
        <div className="node-list">
          
          {/* Document Node */}
          <div
            className="node-item document-node-item"
            onDragStart={(event) => onDragStart(event, 'documentNode')}
            draggable
          >
            <div className="node-icon document-icon">📄</div>
            <div className="node-info">
              <div className="node-name">Document</div>
              <div className="node-description">Link to existing document</div>
            </div>
          </div>

          {/* Markdown Node */}
          <div
            className="node-item markdown-node-item"
            onDragStart={(event) => onDragStart(event, 'markdownNode')}
            draggable
          >
            <div className="node-icon markdown-icon">📝</div>
            <div className="node-info">
              <div className="node-name">Markdown</div>
              <div className="node-description">Rich text with markdown</div>
            </div>
          </div>

          {/* Text Node */}
          <div
            className="node-item text-node-item"
            onDragStart={(event) => onDragStart(event, 'textNode')}
            draggable
          >
            <div className="node-icon text-icon">T</div>
            <div className="node-info">
              <div className="node-name">Text</div>
              <div className="node-description">Simple text content</div>
            </div>
          </div>

          {/* Link Node */}
          <div
            className="node-item link-node-item"
            onDragStart={(event) => onDragStart(event, 'linkNode')}
            draggable
          >
            <div className="node-icon link-icon">🔗</div>
            <div className="node-info">
              <div className="node-name">Link</div>
              <div className="node-description">Web link with preview</div>
            </div>
          </div>

          {/* Video Node */}
          <div
            className="node-item video-node-item"
            onDragStart={(event) => onDragStart(event, 'videoNode')}
            draggable
          >
            <div className="node-icon video-icon">🎬</div>
            <div className="node-info">
              <div className="node-name">Video</div>
              <div className="node-description">YouTube, Vimeo, MP4</div>
            </div>
          </div>

          {/* Iframe Node */}
          <div
            className="node-item iframe-node-item"
            onDragStart={(event) => onDragStart(event, 'iframeNode')}
            draggable
          >
            <div className="node-icon iframe-icon">🌐</div>
            <div className="node-info">
              <div className="node-name">Web View</div>
              <div className="node-description">Embed any website</div>
            </div>
          </div>

          {/* Image Node */}
          <div
            className="node-item image-node-item"
            onDragStart={(event) => onDragStart(event, 'imageNode')}
            draggable
          >
            <div className="node-icon image-icon">📷</div>
            <div className="node-info">
              <div className="node-name">Image</div>
              <div className="node-description">Image with caption</div>
            </div>
          </div>

          {/* Sketch Node */}
          <div
            className="node-item sketch-node-item"
            onDragStart={(event) => onDragStart(event, 'sketchNode')}
            draggable
          >
            <div className="node-icon sketch-icon">🎨</div>
            <div className="node-info">
              <div className="node-name">Sketch</div>
              <div className="node-description">Freehand drawing tool</div>
            </div>
          </div>

          {/* Note Node */}
          <div
            className="node-item note-node-item"
            onDragStart={(event) => onDragStart(event, 'noteNode')}
            draggable
          >
            <div className="node-icon note-icon">📝</div>
            <div className="node-info">
              <div className="node-name">Sticky Note</div>
              <div className="node-description">Colorful sticky note</div>
            </div>
          </div>

        </div>
      </div>
      
      <div className="sidebar-instructions">
        <h4 className="instructions-title">Quick Paste</h4>
        <p className="instructions-text">
          Press <strong>Ctrl+V</strong> to automatically create nodes from clipboard:
        </p>
        <ul className="paste-help">
          <li>📺 Video URLs → Video Node</li>
          <li>🔗 Web URLs → Link Node</li>
          <li>🖼️ Image URLs → Image Node</li>
          <li>📝 Text/Markdown → Text/Markdown Node</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;