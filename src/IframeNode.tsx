import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface IframeNodeProps {
  data: {
    url?: string;
    title?: string;
  };
}

function IframeNode({ data }: IframeNodeProps) {
  const [url, setUrl] = useState(data.url || '');
  const [title, setTitle] = useState(data.title || 'Web View');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [error, setError] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="iframe-node-container">
      <NodeResizer minWidth={400} minHeight={300} />
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Title */}
      {isEditingTitle ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsEditingTitle(false)}
          onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
          className="iframe-title-input"
          autoFocus
        />
      ) : (
        <h4 
          onClick={() => setIsEditingTitle(true)}
          className="iframe-title"
        >
          {title}
        </h4>
      )}
      
      {/* URL Input */}
      {isEditingUrl ? (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => setIsEditingUrl(false)}
          onKeyPress={(e) => e.key === 'Enter' && setIsEditingUrl(false)}
          className="iframe-url-input"
          placeholder="Enter website URL..."
          autoFocus
        />
      ) : (
        <div 
          onClick={() => setIsEditingUrl(true)}
          className="iframe-url-display"
        >
          {url ? getDomain(url) : 'Click to add URL'}
        </div>
      )}
      
      <div className="iframe-controls">
        <button 
          onClick={() => setShowIframe(!showIframe)}
          className="iframe-toggle-btn"
        >
          {showIframe ? '📋 Preview' : '🌐 Load'}
        </button>
        {url && (
          <button 
            onClick={() => window.open(url, '_blank')}
            className="iframe-open-btn"
          >
            ↗️ Open
          </button>
        )}
      </div>
      
      {/* Iframe Display */}
      <div className="iframe-display">
        {url && isValidUrl(url) && showIframe && !error ? (
          <iframe
            src={url}
            className="iframe-content"
            title={title}
            onError={() => setError(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="iframe-placeholder">
            <div className="iframe-placeholder-icon">🌐</div>
            <div className="iframe-placeholder-text">
              {error ? 'Failed to load page' : showIframe ? 'Loading...' : 'Click Load to view'}
            </div>
            {url && !showIframe && (
              <div className="iframe-preview-info">
                <strong>URL:</strong> {getDomain(url)}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(IframeNode);