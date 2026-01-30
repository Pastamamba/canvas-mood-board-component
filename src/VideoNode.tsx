import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';

interface VideoNodeProps {
  data: {
    url?: string;
    title?: string;
    thumbnail?: string;
  };
}

function VideoNode({ data }: VideoNodeProps) {
  const [url, setUrl] = useState(data.url || '');
  const [title, setTitle] = useState(data.title || 'Video');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [error, setError] = useState(false);

  const getEmbedUrl = (url: string) => {
    const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId[1]}`;
    }
    
    const vimeoId = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId[1]}`;
    }
    
    return url;
  };

  const isValidVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('.mp4');
  };

  return (
    <div className="video-node-container">
      <NodeResizer minWidth={300} minHeight={200} />
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      {/* Title */}
      {isEditingTitle ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsEditingTitle(false)}
          onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
          className="video-title-input"
          autoFocus
        />
      ) : (
        <h4 
          onClick={() => setIsEditingTitle(true)}
          className="video-title"
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
          className="video-url-input"
          placeholder="Paste video URL (YouTube, Vimeo, MP4)..."
          autoFocus
        />
      ) : (
        <div 
          onClick={() => setIsEditingUrl(true)}
          className="video-url-placeholder"
        >
          {url || 'Click to add video URL'}
        </div>
      )}
      
      {/* Video Player/Thumbnail */}
      <div className="video-display">
        {url && isValidVideoUrl(url) && !error ? (
          <div className="video-wrapper">
            <iframe
              src={getEmbedUrl(url)}
              className="video-iframe"
              allowFullScreen
              title={title}
              width="100%"
              height="200"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onError={() => setError(true)}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="video-placeholder">
            <div className="video-placeholder-icon">🎬</div>
            <div className="video-placeholder-text">
              {error ? 'Failed to load video' : 'No video'}
            </div>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
}

export default memo(VideoNode);