import React, { useEffect, useState, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { LinkNode as LinkNodeType } from '../../types';
import useCanvasStore from '../../store/canvasStore';
import { fetchOpenGraphData, isValidUrl } from '../../utils';

const LinkNode: React.FC<NodeProps<LinkNodeType['data']>> = ({ 
  data, 
  selected,
  id
}) => {
  const { updateNode } = useCanvasStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-fetch OpenGraph data if URL is provided but no title/description
    if (data.url && isValidUrl(data.url) && !data.title && !isLoading) {
      setIsLoading(true);
      fetchOpenGraphData(data.url)
        .then((ogData) => {
          updateNode(id, {
            data: {
              ...data,
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
  }, [data.url, data.title, id, updateNode, isLoading, data]);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, {
      data: {
        ...data,
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
    if (data.url && isValidUrl(data.url)) {
      window.open(data.url, '_blank');
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
        {data.url && isValidUrl(data.url) && (
          <button onClick={handleOpenLink} className="open-link-button" title="Open link">
            ↗
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="node-content">
        <input
          type="url"
          value={data.url}
          onChange={handleUrlChange}
          className="link-url-input"
          placeholder="Enter URL..."
        />
        
        {isLoading && (
          <div className="loading-indicator">Loading...</div>
        )}
        
        {data.image && (
          <div className="link-image">
            <img src={data.image} alt={data.title || 'Link preview'} />
          </div>
        )}
        
        {data.title && (
          <h3 className="link-title">{data.title}</h3>
        )}
        
        {data.description && (
          <p className="link-description">{data.description}</p>
        )}
        
        {data.siteName && (
          <span className="link-site-name">{data.siteName}</span>
        )}
      </div>
    </div>
  );
};

export default memo(LinkNode);