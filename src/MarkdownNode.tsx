import { memo, useState, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
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

  // Render table of contents tree - moved before usage
  const renderTOCTree = useCallback((headings: HeadingNode[], depth = 0): JSX.Element[] => {
    const renderTreeNode = (heading: HeadingNode, currentDepth: number): JSX.Element => (
      <div key={heading.id} className={`toc-item level-${heading.level}`} style={{ marginLeft: `${currentDepth * 12}px` }}>
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
        {heading.children.length > 0 && heading.children.map(child => renderTreeNode(child, currentDepth + 1))}
      </div>
    );

    return headings.map((heading) => renderTreeNode(heading, depth));
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
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        currentList.push(content);
      } else if (line.trim() === '') {
        flushList();
        if (elements.length > 0 && elements[elements.length - 1].type !== 'br') {
          elements.push(<br key={`br-${idx}`} />);
        }
      } else {
        flushList();
        const content = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>');
        elements.push(<p key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: content }} />);
      }
    });
    
    flushList();
    return elements;
  }, []);

  return (
    <div className="markdown-node-container node-container">
      {selected && <NodeResizer minWidth={300} minHeight={200} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Header with controls */}
      <div className="markdown-header">
        {isEditingTitle ? (
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
          />
        ) : (
          <h3 onClick={() => setIsEditingTitle(true)} className="markdown-title">
            {title}
          </h3>
        )}
        
        <div className="markdown-controls">
          <button
            onClick={(e) => { e.stopPropagation(); setShowStats(!showStats); }}
            className={`control-btn ${showStats ? 'active' : ''}`}
            title="Document statistics"
            aria-label="Show document statistics"
          >
            📊
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowOutline(!showOutline); }}
            className={`control-btn ${showOutline ? 'active' : ''}`}
            title="Document outline"
            aria-label="Toggle document outline"
          >
            🗂️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewMode(!previewMode); }}
            className={`control-btn ${previewMode ? 'active' : ''}`}
            title={previewMode ? "Edit mode" : "Preview mode"}
            aria-label={previewMode ? "Switch to edit mode" : "Switch to preview mode"}
          >
            {previewMode ? '✏️' : '👁️'}
          </button>
        </div>
      </div>

      {/* Document outline */}
      {showOutline && headingsStructure.length > 0 && (
        <CollapsibleSection
          title="Document Outline"
          icon="📑"
          defaultExpanded={true}
          count={headingsStructure.length}
        >
          <div className="document-toc">
            {renderTOCTree(headingsStructure)}
          </div>
        </CollapsibleSection>
      )}

      {/* Document statistics */}
      {showStats && (
        <CollapsibleSection
          title="Document Statistics"
          icon="📈"
          defaultExpanded={false}
        >
          <div className="document-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{documentStats.words}</span>
                <span className="stat-label">Words</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{documentStats.characters}</span>
                <span className="stat-label">Characters</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{documentStats.paragraphs}</span>
                <span className="stat-label">Paragraphs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{documentStats.headings}</span>
                <span className="stat-label">Headings</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{readingTime}</span>
                <span className="stat-label">Min read</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{documentStats.links}</span>
                <span className="stat-label">Links</span>
              </div>
            </div>
            {(documentStats.codeBlocks > 0 || documentStats.inlineCode > 0) && (
              <div className="code-stats">
                <span>Code: {documentStats.codeBlocks} blocks, {documentStats.inlineCode} inline</span>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Main content */}
      <div className="markdown-content">
        {isEditing ? (
          <div className="markdown-editor">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                }
                // Tab handling for indentation
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newContent = content.substring(0, start) + '  ' + content.substring(end);
                  setContent(newContent);
                  setTimeout(() => {
                    e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                  }, 0);
                }
              }}
              className="markdown-textarea"
              autoFocus
              placeholder="# Enter your markdown here..."
              spellCheck={true}
            />
            <div className="editor-footer">
              <span className="editor-stats">
                {documentStats.words}w • {documentStats.lines}l • {documentStats.characters}c
              </span>
              <span className="editor-hint">
                ESC to preview • Tab for indent
              </span>
            </div>
          </div>
        ) : previewMode ? (
          <div 
            className="markdown-preview"
            onClick={() => setIsEditing(true)}
          >
            <div className="rendered-markdown">
              {renderMarkdown(content)}
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="markdown-display"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
            aria-label="Click to edit markdown"
          >
            <SmartTruncate
              text={content}
              maxLength={300}
              previewLines={6}
              className="markdown-text"
            />
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(MarkdownNode);