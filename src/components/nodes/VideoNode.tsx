import React, { useMemo, memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { VideoNode as VideoNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';
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

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      data: {
        ...data,
        url: event.target.value,
      },
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      data: {
        ...data,
        title: event.target.value,
      },
    });
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className={`video-node ${selected ? 'selected' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
      
      {/* Header */}
      <div className="node-header video-header">
        <span className="node-type">VIDEO</span>
        <button onClick={togglePreview} className="preview-toggle">
          {showPreview ? '📺' : '👁'}
        </button>
      </div>
      
      {/* Content */}
      <div className="node-content">
        <input
          type="url"
          value={data.url}
          onChange={handleUrlChange}
          className="video-url-input"
          placeholder="Enter video URL..."
        />
        
        <input
          type="text"
          value={data.title || ''}
          onChange={handleTitleChange}
          className="video-title-input"
          placeholder="Video title..."
        />
        
        {videoData?.thumbnail && !showPreview && (
          <div className="video-thumbnail">
            <img 
              src={videoData.thumbnail} 
              alt={data.title || 'Video thumbnail'} 
              onClick={togglePreview}
              style={{ cursor: 'pointer' }}
            />
            <div className="play-overlay" onClick={togglePreview}>
              ▶
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