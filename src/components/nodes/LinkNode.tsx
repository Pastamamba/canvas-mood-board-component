import React, { useEffect, useState, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { LinkNodeData } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { fetchOpenGraphData, isValidUrl } from '../../utils';

const LinkNode: React.FC<NodeProps> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const typedData = data as LinkNodeData;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-fetch OpenGraph data if URL is provided but no title/description
    if (typedData.url && isValidUrl(typedData.url) && !typedData.title && !isLoading) {
      setIsLoading(true);
      fetchOpenGraphData(typedData.url)
        .then((ogData) => {
          updateNode(id, {
            data: {
              ...typedData,
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
  }, [typedData.url, typedData.title, id, updateNode, isLoading, data]);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      data: {
        ...typedData,
        url: event.target.value,
        // Reset other fields when URL changes
        title: undefined,
        description: undefined,
        image: undefined,
        siteName: undefined,
      },
    });
  };

  const handleOpenLink = () => {
    if (typedData.url && isValidUrl(typedData.url)) {
      window.open(typedData.url, '_blank');
    }
  };

  return (
    <div className={`link-node ${selected ? 'selected' : ''}`}>
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
      <div className="node-header link-header">
        <span className="node-type">LINK</span>
        {typedData.url && isValidUrl(typedData.url) && (
          <button onClick={handleOpenLink} className="open-link-button" title="Open link">
            ↗
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="node-content">
        <input
          type="url"
          value={typedData.url}
          onChange={handleUrlChange}
          className="link-url-input"
          placeholder="Enter URL..."
        />
        
        {isLoading && (
          <div className="loading-indicator">Loading...</div>
        )}
        
        {typedData.image && (
          <div className="link-image">
            <img src={typedData.image} alt={typedData.title || 'Link preview'} />
          </div>
        )}
        
        {typedData.title && (
          <h3 className="link-title">{typedData.title}</h3>
        )}
        
        {typedData.description && (
          <p className="link-description">{typedData.description}</p>
        )}
        
        {typedData.siteName && (
          <span className="link-site-name">{typedData.siteName}</span>
        )}
      </div>
    </div>
  );
};

export default memo(LinkNode);
