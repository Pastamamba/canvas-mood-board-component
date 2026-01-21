import React from 'react';
import { Text, Group, Rect, Circle, Image as KonvaImage } from 'react-konva';
import type { DocumentNode } from '../../types';
import useCanvasStore from '../../store/canvasStore';

interface DocumentNodeProps {
  node: DocumentNode;
}

const DocumentNodeContent: React.FC<DocumentNodeProps> = ({ node }) => {
  const { updateNode } = useCanvasStore();
  
  const handleTextEdit = (newContent: string) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        content: newContent,
      },
    });
  };

  const handleTitleEdit = (newTitle: string) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        title: newTitle,
      },
    });
  };

  return (
    <Group>
      {/* Header */}
      <Rect
        x={8}
        y={8}
        width={node.size.width - 16}
        height={24}
        fill="#28a745"
        cornerRadius={4}
      />
      
      <Text
        x={12}
        y={14}
        text="DOCUMENT"
        fontSize={10}
        fontStyle="bold"
        fill="white"
      />

      {/* Title */}
      <Text
        x={12}
        y={40}
        text={node.data.title || 'Untitled Document'}
        fontSize={14}
        fontStyle="bold"
        fill="#333"
        width={node.size.width - 24}
        wrap="word"
      />

      {/* Content preview */}
      <Text
        x={12}
        y={60}
        text={node.data.content ? 
          node.data.content.substring(0, 100) + (node.data.content.length > 100 ? '...' : '') :
          'No content'
        }
        fontSize={12}
        fill="#666"
        width={node.size.width - 24}
        height={80}
        wrap="word"
      />

      {/* Categories */}
      {node.data.categories.length > 0 && (
        <Group y={node.size.height - 40}>
          {node.data.categories.slice(0, 3).map((category, index) => (
            <Group key={category} x={12 + index * 60}>
              <Rect
                x={0}
                y={0}
                width={55}
                height={16}
                fill="#e9ecef"
                cornerRadius={8}
              />
              <Text
                x={4}
                y={3}
                text={category.length > 8 ? category.substring(0, 8) + '...' : category}
                fontSize={9}
                fill="#495057"
              />
            </Group>
          ))}
          {node.data.categories.length > 3 && (
            <Text
              x={12 + 3 * 60}
              y={3}
              text={`+${node.data.categories.length - 3} more`}
              fontSize={9}
              fill="#6c757d"
            />
          )}
        </Group>
      )}

      {/* Actors */}
      {node.data.actors.length > 0 && (
        <Group y={node.size.height - 60}>
          {node.data.actors.slice(0, 4).map((actor, index) => (
            <Group key={actor.id} x={12 + index * 25}>
              <Circle
                x={10}
                y={10}
                radius={8}
                fill="#6c757d"
                stroke="white"
                strokeWidth={2}
              />
              <Text
                x={6}
                y={6}
                text={actor.name.charAt(0).toUpperCase()}
                fontSize={10}
                fill="white"
                fontStyle="bold"
              />
            </Group>
          ))}
          {node.data.actors.length > 4 && (
            <Text
              x={12 + 4 * 25}
              y={6}
              text={`+${node.data.actors.length - 4}`}
              fontSize={9}
              fill="#6c757d"
            />
          )}
        </Group>
      )}

      {/* Attachments indicator */}
      {node.data.attachments.length > 0 && (
        <Group x={node.size.width - 30} y={node.size.height - 25}>
          <Circle
            x={0}
            y={0}
            radius={8}
            fill="#007bff"
          />
          <Text
            x={-3}
            y={-4}
            text={node.data.attachments.length.toString()}
            fontSize={9}
            fill="white"
            fontStyle="bold"
          />
        </Group>
      )}
    </Group>
  );
};

export default DocumentNodeContent;