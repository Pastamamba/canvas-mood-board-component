import { memo, useState, useCallback, useMemo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { CollapsibleSection, SmartTruncate } from './InformationComponents';

interface MarkdownNodeProps {
  data: {
    content?: string;
    title?: string;
    toc?: boolean; // Table of contents
    outline?: boolean; // Document outline
  };
  selected?: boolean;
}

interface HeadingNode {
  level: number;
  title: string;
  id: string;
  children: HeadingNode[];
  line: number;
}

function MarkdownNode({ data, selected }: MarkdownNodeProps) {
  const [content, setContent] = useState(data.content || '# New Note\n\nClick to edit...');
  const [title, setTitle] = useState(data.title || 'Markdown Note');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showOutline, setShowOutline] = useState(data.outline || false);
  const [showStats, setShowStats] = useState(false);

  // Parse headings from markdown for table of contents
  const headingsStructure = useMemo((): HeadingNode[] => {
    const lines = content.split('\n');
    const headings: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2];
        const id = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
        
        const node: HeadingNode = {
          level,
          title,
          id,
          children: [],
          line: index
        };

        // Find the correct parent
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          headings.push(node);
        } else {
          stack[stack.length - 1].children.push(node);
        }

        stack.push(node);
      }
    });

    return headings;
  }, [content]);

  // Document statistics
  const documentStats = useMemo(() => {
    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(Boolean);
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean).length;
    const headings = headingsStructure.length;
    
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    const inlineCode = (content.match(/`[^`]+`/g) || []).length;
    const links = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    const images = (content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;

    return {
      lines: lines.length,
      words: words.length,
      characters,
      charactersNoSpaces,
      paragraphs,
      headings,
      codeBlocks,
      inlineCode,
      links,
      images
    };
  }, [content, headingsStructure.length]);

  const readingTime = Math.ceil(documentStats.words / 200); // ~200 words per minute

  // Render table of contents tree
  const renderTOCTree = useCallback((headings: HeadingNode[], depth = 0): JSX.Element[] => {
    return headings.map((heading) => (
      <div key={heading.id} className={`toc-item level-${heading.level}`} style={{ marginLeft: `${depth * 12}px` }}>
        <button
          className="toc-link"
          onClick={(e) => {
            e.stopPropagation();
            // Would scroll to heading in a real implementation
            console.log(`Navigate to: ${heading.title}`);
          }}
          title={`Go to: ${heading.title}`}
        >
          {'#'.repeat(heading.level)} {heading.title}
        </button>
        {heading.children.length > 0 && renderTOCTree(heading.children, depth + 1)}
      </div>
    ));
  }, []);

  // Safe markdown to React elements converter
  const renderMarkdown = useCallback((md: string) => {
    const lines = md.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    
    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`}>
            {currentList.map((item, idx) => (
              <li key={idx}>
                {item.replace(/^\*\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };
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