import React, { useMemo, memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { VideoNode as VideoNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { useDebounce } from '../../hooks/usePerformance';
import { 
  getYouTubeVideoId, 
  getVimeoVideoId, 
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl 
} from '../../utils';

const VideoNode: React.FC<NodeProps<VideoNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [showPreview, setShowPreview] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title);
  const [localUrl, setLocalUrl] = useState(data.url);

  // Debounced updates for performance
  const debouncedTitleUpdate = useDebounce((title: string) => {
    updateNode(id, {
      data: {
        ...data,
        title,
      },
    });
  }, 300);

  const debouncedUrlUpdate = useDebounce((url: string) => {
    updateNode(id, {
      data: {
        ...data,
        url,
      },
    });
  }, 500);

  const videoData = useMemo(() => {
    if (!data.url) return null;

    const youtubeId = getYouTubeVideoId(data.url);
    if (youtubeId) {
      return {
        id: youtubeId,
        type: 'youtube' as const,
        thumbnail: getYouTubeThumbnail(youtubeId),
        embedUrl: getYouTubeEmbedUrl(youtubeId),
      };
    }

    const vimeoId = getVimeoVideoId(data.url);
    if (vimeoId) {
      return {
        id: vimeoId,
        type: 'vimeo' as const,
        thumbnail: `https://vumbnail.com/${vimeoId}.jpg`,
        embedUrl: getVimeoEmbedUrl(vimeoId),
      };
    }

    return {
      id: null,
      type: 'iframe' as const,
      thumbnail: null,
      embedUrl: data.url,
    };
  }, [data.url]);

  const handleUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setLocalUrl(newUrl);
    debouncedUrlUpdate(newUrl);
  }, [debouncedUrlUpdate]);

  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setLocalTitle(newTitle);
    debouncedTitleUpdate(newTitle);
  }, [debouncedTitleUpdate]);

  const handleTitleDoubleClick = useCallback(() => {
    setIsEditingTitle(true);
  }, []);

  const handleUrlDoubleClick = useCallback(() => {
    setIsEditingUrl(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    updateNode(id, {
      data: {
        ...data,
        title: localTitle,
      },
    });
  }, [id, data, localTitle, updateNode]);

  const handleUrlBlur = useCallback(() => {
    setIsEditingUrl(false);
    updateNode(id, {
      data: {
        ...data,
        url: localUrl,
      },
    });
  }, [id, data, localUrl, updateNode]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, field: 'title' | 'url') => {
    if (event.key === 'Escape') {
      if (field === 'title') {
        setIsEditingTitle(false);
        setLocalTitle(data.title);
      } else {
        setIsEditingUrl(false);
        setLocalUrl(data.url);
      }
    }
    if (event.key === 'Enter') {
      if (field === 'title') {
        setIsEditingTitle(false);
      } else {
        setIsEditingUrl(false);
      }
    }
    event.stopPropagation();
  }, [data.title, data.url]);

  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  const handlePlay = useCallback(() => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  }, [data.url]);

  return (
    <div className={`video-node ${selected ? 'selected' : ''} ${(isEditingTitle || isEditingUrl) ? 'editing' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#ef4444' }}
        isConnectable={!isEditingTitle && !isEditingUrl}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#ef4444' }}
        isConnectable={!isEditingTitle && !isEditingUrl}
      />
      
      {/* Header */}
      <div className="node-header video-header">
        <span className="node-type">VIDEO</span>
        <div className="node-controls">
          <span className="platform-indicator">
            {videoData?.type === 'youtube' && '📺'}
            {videoData?.type === 'vimeo' && '🎬'}
            {(!videoData || videoData?.type === 'iframe') && '📹'}
          </span>
          <button onClick={togglePreview} className="preview-toggle" title="Toggle preview">
            {showPreview ? '🔽' : '▶️'}
          </button>
          {data.url && (
            <button
              onClick={handlePlay}
              className="play-btn"
              title="Open in new tab"
            >
              🔗
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="node-content">
        {/* URL */}
        <div className="video-url-section" onDoubleClick={handleUrlDoubleClick}>
          {isEditingUrl ? (
            <input
              type="url"
              value={localUrl}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              onKeyDown={(e) => handleKeyDown(e, 'url')}
              className="video-url-input"
              placeholder="https://youtube.com/watch?v=..."
              autoFocus
            />
          ) : (
            <div className="video-url-display">
              {data.url ? (
                <span className="url-preview" title={data.url}>
                  {new URL(data.url).hostname}
                </span>
              ) : (
                <span className="url-placeholder">Double-click to add URL...</span>
              )}
            </div>
          )}
        </div>
        
        {/* Title */}
        <div className="video-title-section" onDoubleClick={handleTitleDoubleClick}>
          {isEditingTitle ? (
            <input
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => handleKeyDown(e, 'title')}
              className="video-title-input"
              placeholder="Video title..."
              autoFocus
            />
          ) : (
            <div className="video-title-display">
              {data.title || 'Untitled Video'}
            </div>
          )}
        </div>
        
        {/* Thumbnail when not previewing full video */}
        {videoData?.thumbnail && !showPreview && (
          <div className="video-thumbnail" onClick={togglePreview}>
            <img 
              src={videoData.thumbnail} 
              alt={data.title || 'Video thumbnail'} 
            />
            <div className="play-overlay">
              <div className="play-button">▶</div>
            </div>
          </div>
        )}
        
        {showPreview && videoData?.embedUrl && (
          <div className="video-preview">
            <iframe
              src={videoData.embedUrl}
              title={data.title || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(VideoNode);