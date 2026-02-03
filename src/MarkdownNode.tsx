import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface MarkdownNodeProps {
  data: {
    content?: string;
    title?: string;
  };
  selected?: boolean;
}

function MarkdownNode({ data, selected }: MarkdownNodeProps) {
  const [content, setContent] = useState(data.content || '# New Note\n\nClick to edit...');
  const [title, setTitle] = useState(data.title || 'Markdown Note');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Safe markdown to React elements converter
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    
    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`}>
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };
    
    lines.forEach((line, idx) => {
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={`h1-${idx}`}>{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={`h2-${idx}`}>{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={`h3-${idx}`}>{line.substring(4)}</h3>);
      } else if (line.startsWith('- ')) {
        const content = line.substring(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        currentList.push(content);
      } else if (line.trim() === '') {
        flushList();
        if (elements.length > 0) elements.push(<br key={`br-${idx}`} />);
      } else {
        flushList();
        const content = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        elements.push(<p key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: content }} />);
      }
    });
    
    flushList();
    return elements;
  };

  return (
    <div className="markdown-node-container" style={{ width: '100%', height: '100%' }}>
      {selected && <NodeResizer minWidth={300} minHeight={200} />}
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
          >
            {renderMarkdown(content)}
          </div>
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