import React, { useState, useRef } from 'react';

interface RichTextToolbarProps {
  onInsert: (text: string) => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ onInsert }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleLinkInsert = () => {
    if (linkUrl) {
      onInsert(`[Link text](${linkUrl})`);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const formatButtons = [
    { icon: '𝐁', command: 'bold', tooltip: 'Bold (Ctrl+B)', text: '**bold**' },
    { icon: '𝐼', command: 'italic', tooltip: 'Italic (Ctrl+I)', text: '*italic*' },
    { icon: 'S̶', command: 'strikethrough', tooltip: 'Strikethrough', text: '~~strikethrough~~' },
    { icon: 'H₁', command: 'heading1', tooltip: 'Heading 1', text: '# ' },
    { icon: 'H₂', command: 'heading2', tooltip: 'Heading 2', text: '## ' },
    { icon: '•', command: 'list', tooltip: 'Bullet List', text: '- ' },
    { icon: '1.', command: 'numberedList', tooltip: 'Numbered List', text: '1. ' },
    { icon: '❝', command: 'quote', tooltip: 'Quote', text: '> ' },
    { icon: '⌨', command: 'code', tooltip: 'Inline Code', text: '`code`' },
    { icon: '▤', command: 'codeblock', tooltip: 'Code Block', text: '```\ncode block\n```' }
  ];

  return (
    <div className="rich-text-toolbar">
      {formatButtons.map((btn) => (
        <button
          key={btn.command}
          onClick={() => onInsert(btn.text)}
          className="toolbar-btn"
          title={btn.tooltip}
          aria-label={btn.tooltip}
        >
          {btn.icon}
        </button>
      ))}
      
      <button
        onClick={() => setShowLinkDialog(true)}
        className="toolbar-btn"
        title="Insert Link"
        aria-label="Insert Link"
      >
        🔗
      </button>
      
      {showLinkDialog && (
        <div className="link-dialog">
          <input
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLinkInsert();
              if (e.key === 'Escape') setShowLinkDialog(false);
            }}
            autoFocus
          />
          <div className="link-dialog-actions">
            <button onClick={handleLinkInsert} className="btn btn-primary btn-sm">
              Insert
            </button>
            <button onClick={() => setShowLinkDialog(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface FileDropZoneProps {
  onFileDrop: (files: FileList) => void;
  children: React.ReactNode;
  accept?: string;
  className?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFileDrop, 
  children, 
  className = '' 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileDrop(files);
    }
  };

  return (
    <div
      className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-message">
            📎 Drop files here
          </div>
        </div>
      )}
    </div>
  );
};

interface SmartTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  autoResize?: boolean;
}

export const SmartTextArea: React.FC<SmartTextAreaProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className = '',
  showToolbar = false,
  autoResize = true
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInsert = (text: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + text.length, start + text.length);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleInsert('**bold**');
          break;
        case 'i':
          e.preventDefault();
          handleInsert('*italic*');
          break;
        case 'Enter':
          e.preventDefault();
          onBlur?.();
          break;
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      handleInsert('  '); // Insert 2 spaces for indentation
    }
  };

  const adjustHeight = React.useCallback(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [autoResize]);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <div className="smart-textarea-container">
      {showToolbar && (
        <RichTextToolbar 
          onInsert={handleInsert}
        />
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`smart-textarea ${className}`}
        rows={autoResize ? 1 : 4}
      />
      <div className="textarea-stats">
        {value.length} chars • {value.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
};