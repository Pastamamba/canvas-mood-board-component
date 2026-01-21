import React, { useEffect, useState, memo } from 'react';
import { Text, Group, Rect, Image as KonvaImage } from 'react-konva';
import type { LinkNode } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { fetchOpenGraphData, isValidUrl } from '../../utils';
import useImage from 'use-image';

interface LinkNodeProps {
  node: LinkNode;
}

const LinkNodeContent: React.FC<LinkNodeProps> = ({ node }) => {
  const { updateNode } = useCanvasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailImage] = useImage(node.data.image || '', 'anonymous');

  useEffect(() => {
    // Auto-fetch OpenGraph data if URL is provided but no title/description
    if (node.data.url && isValidUrl(node.data.url) && !node.data.title && !isLoading) {
      setIsLoading(true);
      fetchOpenGraphData(node.data.url)
        .then((ogData) => {
          updateNode(node.id, {
            data: {
              ...node.data,
              title: ogData.title,
              description: ogData.description,
              image: ogData.image,
              siteName: ogData.siteName,
            },
          });
        })
        .catch((error) => {
          console.error('Failed to fetch OpenGraph data:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [node.data.url, node.data.title, node.id, updateNode, isLoading]);

  const handleUrlChange = (newUrl: string) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        url: newUrl,
        // Reset other fields when URL changes
        title: undefined,
        description: undefined,
        image: undefined,
        siteName: undefined,
      },
    });
  };

  const displayUrl = node.data.url || 'Enter URL...';
  const displayTitle = node.data.title || (node.data.url ? 'Loading...' : 'No URL provided');
  const displayDescription = node.data.description || '';

  return (
    <Group>
      {/* Header */}
      <Rect
        x={8}
        y={8}
        width={node.size.width - 16}
        height={24}
        fill="#007bff"
        cornerRadius={4}
      />
      
      <Text
        x={12}
        y={14}
        text="LINK"
        fontSize={10}
        fontStyle="bold"
        fill="white"
      />

      {/* Thumbnail */}
      {thumbnailImage && (
        <KonvaImage
          x={12}
          y={40}
          width={node.size.width - 24}
          height={60}
          image={thumbnailImage}
          cornerRadius={4}
        />
      )}

      {/* Content */}
      <Group y={thumbnailImage ? 108 : 40}>
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

        {/* Description */}
        {displayDescription && (
          <Text
            x={12}
            y={18}
            text={displayDescription.length > 80 ? 
              displayDescription.substring(0, 80) + '...' : 
              displayDescription
            }
            fontSize={11}
            fill="#666"
            width={node.size.width - 24}
            wrap="word"
          />
        )}

        {/* URL */}
        <Text
          x={12}
          y={displayDescription ? 40 : 18}
          text={displayUrl.length > 35 ? 
            displayUrl.substring(0, 35) + '...' : 
            displayUrl
          }
          fontSize={10}
          fill="#007bff"
          width={node.size.width - 24}
        />

        {/* Site name */}
        {node.data.siteName && (
          <Text
            x={12}
            y={displayDescription ? 55 : 33}
            text={node.data.siteName}
            fontSize={9}
            fill="#6c757d"
            width={node.size.width - 24}
          />
        )}
      </Group>

      {/* Loading indicator */}
      {isLoading && (
        <Group x={node.size.width - 30} y={12}>
          <Circle
            x={0}
            y={0}
            radius={6}
            fill="#ffc107"
          />
          <Text
            x={-2}
            y={-3}
            text="..."
            fontSize={8}
            fill="white"
          />
        </Group>
      )}

      {/* External link icon */}
      <Group x={node.size.width - 25} y={node.size.height - 20}>
        <Rect
          x={0}
          y={0}
          width={12}
          height={12}
          stroke="#007bff"
          strokeWidth={1}
          cornerRadius={2}
        />
        <Text
          x={2}
          y={2}
          text="↗"
          fontSize={8}
          fill="#007bff"
        />
      </Group>
    </Group>
  );
};

// Simple Circle component since we need it
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

export default memo(LinkNodeContent);