import React, { useState, useCallback } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  count?: number;
  priority?: 'high' | 'medium' | 'low';
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultExpanded = false,
  children,
  headerActions,
  count,
  priority = 'medium'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const priorityColors = {
    high: 'var(--color-danger)',
    medium: 'var(--color-warning)',
    low: 'var(--color-success)'
  };

  return (
    <div className={`collapsible-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div 
        className="section-header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="header-left">
          <span className="expand-icon">
            {isExpanded ? '🔽' : '▶️'}
          </span>
          {icon && <span className="section-icon">{icon}</span>}
          <span className="section-title">{title}</span>
          {count !== undefined && (
            <span className="item-count" style={{ color: priorityColors[priority] }}>
              ({count})
            </span>
          )}
        </div>
        <div className="header-right">
          {headerActions}
        </div>
      </div>
      
      <div 
        className="section-content"
        id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        aria-hidden={!isExpanded}
      >
        {children}
      </div>
    </div>
  );
};

interface SmartTruncateProps {
  text: string;
  maxLength?: number;
  expandInline?: boolean;
  previewLines?: number;
  className?: string;
}

export const SmartTruncate: React.FC<SmartTruncateProps> = ({
  text,
  maxLength = 100,
  expandInline = false,
  previewLines = 2,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  const lines = text.split('\n');
  const shouldTruncateLines = lines.length > previewLines;
  const previewText = shouldTruncateLines ? 
    lines.slice(0, previewLines).join('\n') : 
    text.substring(0, maxLength);

  const truncatedText = previewText.length > maxLength ? 
    previewText.substring(0, maxLength) + '...' : 
    previewText + (shouldTruncateLines ? '\n...' : '...');

  if (expandInline) {
    return (
      <span className={`smart-truncate ${className}`}>
        {isExpanded ? text : truncatedText}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="expand-toggle-inline"
          aria-label={isExpanded ? 'Show less' : 'Show more'}
        >
          {isExpanded ? ' Show less' : ' Show more'}
        </button>
      </span>
    );
  }

  return (
    <div className={`smart-truncate ${className}`}>
      <pre className="truncate-content">
        {isExpanded ? text : truncatedText}
      </pre>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="expand-toggle"
        aria-label={isExpanded ? 'Collapse text' : 'Expand text'}
      >
        {isExpanded ? '▲ Show less' : '▼ Show more'}
      </button>
    </div>
  );
};

interface DataHierarchyProps {
  data: Record<string, unknown>;
  level?: number;
  maxDepth?: number;
  collapseLongArrays?: number;
}

export const DataHierarchy: React.FC<DataHierarchyProps> = ({
  data,
  level = 0,
  maxDepth = 3,
  collapseLongArrays = 5
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleKey = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const renderValue = (key: string, value: unknown): React.ReactNode => {
    const keyId = `${level}-${key}`;
    
    if (value === null || value === undefined) {
      return <span className="data-null">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="data-boolean">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="data-number">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return (
        <SmartTruncate 
          text={value} 
          maxLength={50} 
          expandInline={true}
          className="data-string"
        />
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="data-array">[]</span>;
      }
      
      const isExpanded = expandedKeys.has(keyId);
      const shouldCollapse = value.length > collapseLongArrays;
      
      if (shouldCollapse && !isExpanded) {
        return (
          <span className="data-array-collapsed">
            Array({value.length}){' '}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleKey(keyId); }}
              className="expand-array-btn"
            >
              Show items
            </button>
          </span>
        );
      }
      
      return (
        <div className="data-array">
          {shouldCollapse && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleKey(keyId); }}
              className="collapse-array-btn"
            >
              Hide items ({value.length})
            </button>
          )}
          <div className="array-items">
            {value.map((item, index) => (
              <div key={index} className="array-item">
                <span className="array-index">[{index}]</span>
                {typeof item === 'object' && item !== null ? (
                  level < maxDepth ? (
                    <DataHierarchy
                      data={item}
                      level={level + 1}
                      maxDepth={maxDepth}
                      collapseLongArrays={collapseLongArrays}
                    />
                  ) : (
                    <span className="data-object-collapsed">
                      {Array.isArray(item) ? `Array(${item.length})` : 'Object'}
                    </span>
                  )
                ) : (
                  renderValue(`${keyId}-${index}`, item)
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="data-object">{'{}'}</span>;
      }
      
      if (level >= maxDepth) {
        return <span className="data-object-collapsed">Object({keys.length} keys)</span>;
      }
      
      return (
        <DataHierarchy
          data={value as Record<string, unknown>}
          level={level + 1}
          maxDepth={maxDepth}
          collapseLongArrays={collapseLongArrays}
        />
      );
    }
    
    return <span className="data-unknown">{String(value)}</span>;
  };

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return <div className="data-hierarchy-root">{renderValue('root', data)}</div>;
  }

  const entries = Object.entries(data);
  const sortedEntries = entries.sort(([a], [b]) => {
    // Priority order: strings, numbers, booleans, arrays, objects
    const typeOrder = { string: 1, number: 2, boolean: 3, object: 4 };
    const aType = Array.isArray(data[a]) ? 'array' : typeof data[a];
    const bType = Array.isArray(data[b]) ? 'array' : typeof data[b];
    const aPriority = typeOrder[aType as keyof typeof typeOrder] || 5;
    const bPriority = typeOrder[bType as keyof typeof typeOrder] || 5;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.localeCompare(b);
  });

  return (
    <div className={`data-hierarchy level-${level}`}>
      {sortedEntries.map(([key, value]) => (
        <div key={key} className="data-item">
          <span className="data-key">{key}:</span>
          <div className="data-value">
            {renderValue(key, value)}
          </div>
        </div>
      ))}
    </div>
  );
};

interface InfoPanelProps {
  title: string;
  subtitle?: string;
  metadata?: Record<string, unknown>;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'compact' | 'detailed';
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  title,
  subtitle,
  metadata,
  children,
  actions,
  variant = 'default'
}) => {
  return (
    <div className={`info-panel variant-${variant}`}>
      <div className="panel-header">
        <div className="header-content">
          <h3 className="panel-title">{title}</h3>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
      
      {metadata && Object.keys(metadata).length > 0 && (
        <CollapsibleSection
          title="Metadata"
          icon="ℹ️"
          defaultExpanded={variant === 'detailed'}
          count={Object.keys(metadata).length}
        >
          <DataHierarchy data={metadata} maxDepth={2} />
        </CollapsibleSection>
      )}
      
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
};