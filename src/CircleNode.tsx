import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CircleNodeProps {
  positionAbsoluteX: number;
  positionAbsoluteY: number;
}

const CircleNode = memo(({ positionAbsoluteX, positionAbsoluteY }: CircleNodeProps) => {
  const label = `Position x:${Math.round(positionAbsoluteX)} y:${Math.round(positionAbsoluteY)}`;

  return (
    <div>
      <div>{label || 'no node connected'}</div>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
    </div>
  );
});

export default CircleNode;
