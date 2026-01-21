import React, { useMemo } from 'react';
import { Text, Group, Rect, Image as KonvaImage } from 'react-konva';
import type { VideoNode } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { 
  getYouTubeVideoId, 
  getVimeoVideoId, 
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl 
} from '../../utils';
import useImage from 'use-image';

interface VideoNodeProps {
  node: VideoNode;
}

const VideoNodeContent: React.FC<VideoNodeProps> = ({ node }) => {
  const { updateNode } = useCanvasStore();

  const videoData = useMemo(() => {
    if (!node.data.url) return null;

    const youtubeId = getYouTubeVideoId(node.data.url);
    if (youtubeId) {
      return {
        id: youtubeId,
        type: 'youtube' as const,
        thumbnail: getYouTubeThumbnail(youtubeId),
        embedUrl: getYouTubeEmbedUrl(youtubeId),
      };
    }

    const vimeoId = getVimeoVideoId(node.data.url);
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
      embedUrl: node.data.url,
    };
  }, [node.data.url]);

  const [thumbnailImage] = useImage(
    videoData?.thumbnail || node.data.thumbnail || '', 
    'anonymous'
  );

  const handleUrlChange = (newUrl: string) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        url: newUrl,
        title: undefined, // Reset title when URL changes
      },
    });
  };

  const displayTitle = node.data.title || 
    (videoData?.id ? `${videoData.type.toUpperCase()} Video` : 'Video Content');

  return (
    <Group>
      {/* Header */}
      <Rect
        x={8}
        y={8}
        width={node.size.width - 16}
        height={24}
        fill="#dc3545"
        cornerRadius={4}
      />
      
      <Text
        x={12}
        y={14}
        text="VIDEO"
        fontSize={10}
        fontStyle="bold"
        fill="white"
      />

      {/* Video platform indicator */}
      {videoData?.type && videoData.type !== 'iframe' && (
        <Text
          x={node.size.width - 60}
          y={14}
          text={videoData.type.toUpperCase()}
          fontSize={8}
          fill="white"
          fontStyle="bold"
        />
      )}

      {/* Thumbnail/Preview area */}
      <Group y={40}>
        {thumbnailImage ? (
          <KonvaImage
            x={12}
            y={0}
            width={node.size.width - 24}
            height={(node.size.width - 24) * 9 / 16} // 16:9 aspect ratio
            image={thumbnailImage}
            cornerRadius={4}
          />
        ) : (
          <Group>
            <Rect
              x={12}
              y={0}
              width={node.size.width - 24}
              height={(node.size.width - 24) * 9 / 16}
              fill="#f8f9fa"
              stroke="#dee2e6"
              strokeWidth={1}
              cornerRadius={4}
            />
            
            {/* Play button placeholder */}
            <Group 
              x={12 + (node.size.width - 24) / 2} 
              y={(node.size.width - 24) * 9 / 32}
            >
              <Circle
                x={0}
                y={0}
                radius={20}
                fill="rgba(0, 0, 0, 0.7)"
              />
              
              {/* Play triangle */}
              <Text
                x={-6}
                y={-8}
                text="▶"
                fontSize={16}
                fill="white"
              />
            </Group>
          </Group>
        )}

        {/* Play button overlay */}
        {thumbnailImage && (
          <Group 
            x={12 + (node.size.width - 24) / 2} 
            y={(node.size.width - 24) * 9 / 32}
          >
            <Circle
              x={0}
              y={0}
              radius={16}
              fill="rgba(0, 0, 0, 0.8)"
            />
            
            <Text
              x={-5}
              y={-6}
              text="▶"
              fontSize={12}
              fill="white"
            />
          </Group>
        )}
      </Group>

      {/* Content info */}
      <Group y={40 + (node.size.width - 24) * 9 / 16 + 8}>
        {/* Title */}
        <Text
          x={12}
          y={0}
          text={displayTitle}
          fontSize={13}
          fontStyle="bold"
          fill="#333"
          width={node.size.width - 24}
          wrap="word"
        />

        {/* URL */}
        <Text
          x={12}
          y={18}
          text={node.data.url ? 
            (node.data.url.length > 40 ? 
              node.data.url.substring(0, 40) + '...' : 
              node.data.url
            ) : 
            'Enter video URL...'
          }
          fontSize={10}
          fill="#007bff"
          width={node.size.width - 24}
        />

        {/* Video ID for YouTube/Vimeo */}
        {videoData?.id && (
          <Text
            x={12}
            y={32}
            text={`ID: ${videoData.id}`}
            fontSize={9}
            fill="#6c757d"
            width={node.size.width - 24}
          />
        )}
      </Group>

      {/* Embed indicator */}
      <Group x={node.size.width - 20} y={node.size.height - 20}>
        <Rect
          x={0}
          y={0}
          width={12}
          height={12}
          fill="#dc3545"
          cornerRadius={2}
        />
        <Text
          x={2}
          y={2}
          text="▶"
          fontSize={8}
          fill="white"
        />
      </Group>
    </Group>
  );
};

// Simple Circle component
const Circle: React.FC<{
  x: number;
  y: number;
  radius: number;
  fill: string;
}> = ({ x, y, radius, fill }) => (
  <Rect
    x={x - radius}
    y={y - radius}
    width={radius * 2}
    height={radius * 2}
    fill={fill}
    cornerRadius={radius}
  />
);

export default VideoNodeContent;