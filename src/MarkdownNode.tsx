import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface MarkdownNodeProps {
  data: {
    content?: string;
    title?: string;
  };
}

function MarkdownNode({ data }: MarkdownNodeProps) {
  const [content, setContent] = useState(data.content || '# New Note\n\nClick to edit...');
  const [title, setTitle] = useState(data.title || 'Markdown Note');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Simple markdown to HTML converter (basic)
  const markdownToHtml = (md: string) => {
    return md
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="markdown-node-container">
      <NodeResizer minWidth={300} minHeight={200} />
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <div className="markdown-header">
        {isEditingTitle ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            className="markdown-title-input"
            autoFocus
          />
        ) : (
          <h4 
            onClick={() => setIsEditingTitle(true)}
            className="markdown-title"
          >
            {title}
          </h4>
        )}
        
        <div className="markdown-controls">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className={`mode-btn ${previewMode ? 'active' : ''}`}
          >
            {previewMode ? '📝 Edit' : '👁️ Preview'}
          </button>
        </div>
      </div>
      
      <div className="markdown-content">
        {isEditing || !previewMode ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="markdown-textarea"
            placeholder="Enter markdown content...\n\n# Heading\n**bold** *italic*\n- List item\n`code`"
            autoFocus={isEditing}
          />
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
          />
        )}
      </div>
      
      <div className="markdown-toolbar">
        <button onClick={() => setContent(content + '\n**Bold Text**')} className="format-btn">B</button>
        <button onClick={() => setContent(content + '\n*Italic Text*')} className="format-btn">I</button>
        <button onClick={() => setContent(content + '\n# Heading')} className="format-btn">H</button>
        <button onClick={() => setContent(content + '\n- List item')} className="format-btn">•</button>
        <button onClick={() => setContent(content + '\n`code`')} className="format-btn">{`<>`}</button>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(MarkdownNode);