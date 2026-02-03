import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';
import { FileDropZone } from './AdvancedUIComponents';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { setNodes } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image must be less than 10MB');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setCaption(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
      setIsLoading(false);
      setUploadProgress(0);
    };
    
    reader.onerror = () => {
      alert('Failed to read file');
      setIsLoading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  }, []);

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
  }, [id, setNodes, caption]);

  return (
    <div 
      className={`image-node-container node-container ${imageError ? 'error' : ''}`} 
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Image node: ${caption || 'No caption'}`}
    >
      {selected && <NodeResizer minWidth={200} minHeight={150} />}
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <FileDropZone onFileDrop={handleFileDrop} accept="image/*">
        <div className="image-node-content">
          {/* Upload progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              />
              <span className="progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="image-loading-state">
              <div className="loading-spinner"></div>
              <p>Processing image...</p>
            </div>
          )}

          {/* Image URL input - only show for regular URLs, not data URLs */}
          {!imageUrl.startsWith('data:image/') && !isLoading && (
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
                  {imageUrl || 'Click to add image URL or drop file'}
                </div>
              )}
            </>
          )}
          
          {/* Image display */}
          <div className="image-display">
            {imageUrl && !imageError && !isLoading ? (
              <div className="image-container">
                <div className="image-controls">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="control-btn"
                    title="Replace image"
                    aria-label="Replace image"
                  >
                    📁
                  </button>
                  <button 
                    onClick={() => {
                      setImageUrl('');
                      setCaption('Add caption...');
                    }}
                    className="control-btn remove-btn"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    🗑️
                  </button>
                </div>
                <img
                  src={imageUrl}
                  alt={caption}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  className="image-preview"
                />
              </div>
            ) : !isLoading ? (
              <div className="image-placeholder">
                <div className="image-placeholder-icon">📷</div>
                <div className="image-placeholder-text">
                  {imageError ? 'Failed to load image' : 'Drop image here or click to browse'}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary btn-sm"
                >
                  Browse Files
                </button>
              </div>
            ) : null}
          </div>
          
          {/* Caption */}
          {(imageUrl && !isLoading) && (
            <>
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
            </>
          )}
        </div>
      </FileDropZone>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = e.target.files;
          if (files) handleFileDrop(files);
        }}
      />
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(ImageNode);