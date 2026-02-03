import { memo } from 'react';

interface AnnotationNodeData {
  level?: number;
  label?: string;
  arrowStyle?: string;
}

function AnnotationNode({ data }: { data: AnnotationNodeData }) {
  return (
    <>
      <div className='annotation-content'>
        <div className='annotation-level'>{data.level}.</div>
        <div>{data.label}</div>
      </div>
      {data.arrowStyle && (
        <div 
          className="annotation-arrow" 
          style={typeof data.arrowStyle === 'string' ? {} : data.arrowStyle}
        >
          ⤹
        </div>
      )}
    </>
  );
}

export default memo(AnnotationNode);
