import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';

interface ImageNodeProps {
  id: string;
  data: {
    imageUrl?: string;
    caption?: string;
  };
  selected?: boolean;
}

function ImageNode({ id, data, selected }: ImageNodeProps) {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [caption, setCaption] = useState(data.caption || 'Add caption...');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { setNodes } = useReactFlow();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(false);
    const img = e.target as HTMLImageElement;
    
    // Announce successful image load to screen readers
    const announcement = `Image loaded successfully: ${caption || 'Image'} with dimensions ${img.naturalWidth} by ${img.naturalHeight}`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-10000px';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
    
    // Calculate appropriate node size based on image dimensions
    const maxWidth = 400;
    const maxHeight = 300;
    const minWidth = 200;
    const minHeight = 150;
    
    let nodeWidth = Math.min(Math.max(img.naturalWidth, minWidth), maxWidth);
    let nodeHeight = Math.min(Math.max(img.naturalHeight + 80, minHeight), maxHeight + 80); // +80 for UI elements
    
    // Maintain aspect ratio if needed
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    if (nodeWidth / (nodeHeight - 80) !== aspectRatio) {
      if (img.naturalWidth > img.naturalHeight) {
        nodeHeight = (nodeWidth / aspectRatio) + 80;
      } else {
        nodeWidth = (nodeHeight - 80) * aspectRatio;
      }
    }
    
    // Update node size
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              style: {
                ...node.style,
                width: nodeWidth,
                height: nodeHeight,
              },
            }
          : node
      )
    );
  }, [id, setNodes]);

  return (
    <div 
      className={`image-node-container node-container ${imageError ? 'error' : ''}`} 
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Image node: ${caption || 'No caption'}`}
    >
      {selected && <NodeResizer minWidth={200} minHeight={150} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <div className="image-node-content">
        {/* Image URL input - only show for regular URLs, not data URLs */}
        {!imageUrl.startsWith('data:image/') && (
          <>
            {isEditingUrl ? (
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onBlur={() => setIsEditingUrl(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditingUrl(false)}
                className="image-url-input"
                placeholder="Enter image URL..."
                autoFocus
              />
            ) : (
              <div 
                onClick={() => setIsEditingUrl(true)}
                className="image-url-placeholder"
              >
                {imageUrl || 'Click to add image URL'}
              </div>
            )}
          </>
        )}
        
        {/* Image display */}
        <div className="image-display">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={caption}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className="image-preview"
            />
          ) : (
            <div className="image-placeholder">
              <div className="image-placeholder-icon">📷</div>
              <div className="image-placeholder-text">
                {imageError ? 'Failed to load image' : 'No image'}
              </div>
            </div>
          )}
        </div>
        
        {/* Caption */}
        {isEditingCaption ? (
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => setIsEditingCaption(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditingCaption(false)}
            className="image-caption-input"
            autoFocus
          />
        ) : (
          <div 
            onClick={() => setIsEditingCaption(true)}
            className="image-caption"
          >
            {caption}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(ImageNode);