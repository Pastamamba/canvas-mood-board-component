import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { MetadataService, type OpenGraphData } from './MetadataService';
import { LoadingSpinner, Input } from './UIComponents';

interface LinkNodeProps {
  data: {
    url?: string;
    title?: string;
  };
  selected?: boolean;
}

function LinkNode({ data, selected }: LinkNodeProps) {
  const [url, setUrl] = useState(data.url || 'https://example.com');
  const [title, setTitle] = useState(data.title || 'Click to edit title');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [metadata, setMetadata] = useState<OpenGraphData | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch metadata when URL changes with debouncing
  useEffect(() => {
    if (url && url.startsWith('http') && !isEditingUrl) {
      // Debounce metadata fetching to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        setIsLoadingMetadata(true);
        MetadataService.fetchMetadata(url)
          .then(meta => {
            if (meta) {
              setMetadata(meta);
              // Update title if it hasn't been manually set
              if (title === 'Click to edit title' || title === data.title) {
                setTitle(meta.title || title);
              }
            }
          })
          .finally(() => setIsLoadingMetadata(false));
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [url, isEditingUrl, title, data.title]);

  const handleLinkClick = () => {
    if (url && !isEditingTitle && !isEditingUrl) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`link-node-container node-container ${isLoadingMetadata ? 'loading' : ''}`} style={{ width: '100%', height: '100%' }}>
      {selected && <NodeResizer minWidth={200} minHeight={80} />}
      <Handle type="target" position={Position.Left} className="custom-handle" />
      
      <div className="link-node-content">
        {/* Title */}
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={setTitle}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            placeholder="Enter link title"
            autoFocus
            aria-label="Link title"
          />
        ) : (
          <div 
            onClick={() => setIsEditingTitle(true)}
            className="link-title node-title-medium"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(true)}
          >
            {title}
          </div>
        )}
        
        {/* URL */}
        {isEditingUrl ? (
          <Input
            value={url}
            onChange={setUrl}
            onBlur={() => setIsEditingUrl(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingUrl(false)}
            placeholder="Enter URL"
            autoFocus
            aria-label="Link URL"
          />
        ) : (
          <div 
            onClick={() => setIsEditingUrl(true)}
            className="link-url node-caption"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingUrl(true)}
          >
            {url}
          </div>
        )}
        
        {/* Link button with metadata preview */}
        {isLoadingMetadata ? (
          <div className="link-loading">
            <LoadingSpinner size="sm" message="Loading preview..." />
          </div>
        ) : metadata && metadata.image ? (
          <div className="link-preview-container" onClick={handleLinkClick}>
            <img 
              src={metadata.image} 
              alt="Link preview" 
              className="link-thumbnail"
              onError={(e) => (e.target as HTMLElement).style.display = 'none'}
            />
            <div className="link-preview-info">
              <div className="link-meta-description">{metadata.description}</div>
              {metadata.siteName && <div className="link-site-name">{metadata.siteName}</div>}
            </div>
          </div>
        ) : null}
        
        <button
          onClick={handleLinkClick}
          className="link-button"
        >
          🔗 Open Link
        </button>
      </div>
      
      <Handle type="source" position={Position.Right} className="custom-handle" />
    </div>
  );
}

export default memo(LinkNode);