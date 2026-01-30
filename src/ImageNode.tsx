import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface ImageNodeProps {
  data: {
    imageUrl?: string;
    caption?: string;
  };
  selected?: boolean;
}

function ImageNode({ data, selected }: ImageNodeProps) {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [caption, setCaption] = useState(data.caption || 'Add caption...');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <div className="image-node-container" style={{ width: '100%', height: '100%' }}>
      {selected && <NodeResizer minWidth={200} minHeight={150} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <div className="image-node-content">
        {/* Image URL input */}
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