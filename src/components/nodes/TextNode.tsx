import React, { useState, useCallback, memo } from 'react';
import { Text, Group, Rect } from 'react-konva';
import type { TextNode } from '../../types';
import useCanvasStore from '../../store/canvasStore';

interface TextNodeProps {
  node: TextNode;
}

const TextNodeContent: React.FC<TextNodeProps> = ({ node }) => {
  const { updateNode } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleMarkdown = useCallback(() => {
    updateNode(node.id, {
      data: {
        ...node.data,
        isMarkdown: !node.data.isMarkdown,
      },
    });
  }, [node.id, node.data, updateNode]);

  const handleContentChange = useCallback((newContent: string) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        content: newContent,
      },
    });
  }, [node.id, node.data, updateNode]);

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for Konva Text
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let yOffset = 0;

    lines.forEach((line, index) => {
      let fontSize = 12;
      let fontStyle = 'normal';
      let text = line;

      // Basic markdown parsing
      if (line.startsWith('# ')) {
        fontSize = 16;
        fontStyle = 'bold';
        text = line.substring(2);
      } else if (line.startsWith('## ')) {
        fontSize = 14;
        fontStyle = 'bold';
        text = line.substring(3);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        fontStyle = 'bold';
        text = line.slice(2, -2);
      } else if (line.startsWith('*') && line.endsWith('*')) {
        fontStyle = 'italic';
        text = line.slice(1, -1);
      }

      elements.push(
        <Text
          key={index}
          x={12}
          y={40 + yOffset}
          text={text}
          fontSize={fontSize}
          fontStyle={fontStyle}
          fill="#333"
          width={node.size.width - 24}
          wrap="word"
        />
      );

      yOffset += fontSize + 4;
    });

    return elements;
  };

  const displayContent = node.data.content || 'Click to edit text...';
  const maxLength = Math.floor((node.size.width - 24) * (node.size.height - 60) / 180); // Rough calculation
  const truncatedContent = displayContent.length > maxLength ? 
    displayContent.substring(0, maxLength) + '...' : 
    displayContent;

  return (
    <Group>
      {/* Header */}
      <Rect
        x={8}
        y={8}
        width={node.size.width - 16}
        height={24}
        fill="#6f42c1"
        cornerRadius={4}
      />
      
      <Text
        x={12}
        y={14}
        text="TEXT"
        fontSize={10}
        fontStyle="bold"
        fill="white"
      />

      {/* Markdown toggle */}
      <Group 
        x={node.size.width - 45} 
        y={8}
        onClick={handleToggleMarkdown}
        onTap={handleToggleMarkdown}
      >
        <Rect
          x={0}
          y={0}
          width={30}
          height={24}
          fill={node.data.isMarkdown ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"}
          cornerRadius={4}
        />
        <Text
          x={6}
          y={7}
          text="MD"
          fontSize={8}
          fill="white"
          fontStyle={node.data.isMarkdown ? 'bold' : 'normal'}
        />
      </Group>

      {/* Content */}
      {node.data.isMarkdown ? (
        <Group>
          {renderMarkdown(truncatedContent)}
        </Group>
      ) : (
        <Text
          x={12}
          y={40}
          text={truncatedContent}
          fontSize={12}
          fill="#333"
          width={node.size.width - 24}
          height={node.size.height - 52}
          wrap="word"
          verticalAlign="top"
        />
      )}

      {/* Character count indicator */}
      <Text
        x={12}
        y={node.size.height - 16}
        text={`${node.data.content.length} chars`}
        fontSize={8}
        fill="#6c757d"
      />

      {/* Markdown indicator */}
      {node.data.isMarkdown && (
        <Group x={node.size.width - 20} y={node.size.height - 20}>
          <Rect
            x={0}
            y={0}
            width={12}
            height={12}
            fill="#6f42c1"
            cornerRadius={2}
          />
          <Text
            x={2}
            y={2}
            text="M"
            fontSize={8}
            fill="white"
            fontStyle="bold"
          />
        </Group>
      )}

      {/* Edit overlay (invisible but handles clicks) */}
      <Rect
        x={12}
        y={40}
        width={node.size.width - 24}
        height={node.size.height - 60}
        fill="transparent"
        onDblClick={() => {
          // In a real implementation, you might open a text editor modal
          const newContent = prompt('Edit text:', node.data.content);
          if (newContent !== null) {
            handleContentChange(newContent);
          }
        }}
      />
    </Group>
  );
};

export default memo(TextNodeContent);