import React from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

interface SnapGuidesProps {
  position: Vector3;
  kitchenDimensions: { width: number; length: number };
  isSnapped: boolean;
}

const SnapGuides: React.FC<SnapGuidesProps> = ({ position, kitchenDimensions, isSnapped }) => {
  const halfWidth = kitchenDimensions.width / 2;
  const halfLength = kitchenDimensions.length / 2;
  const snapDistance = 0.3;

  if (!isSnapped) return null;

  const guides: JSX.Element[] = [];

  // Vertical guide lines (for wall snapping)
  if (Math.abs(position.x - (-halfWidth + snapDistance)) < 0.1) {
    guides.push(
      <Line
        key="left-wall-guide"
        points={[
          [-halfWidth + snapDistance, 0.01, -halfLength],
          [-halfWidth + snapDistance, 0.01, halfLength]
        ]}
        color="#22c55e"
        lineWidth={3}
        dashed={true}
      />
    );
  }

  if (Math.abs(position.x - (halfWidth - snapDistance)) < 0.1) {
    guides.push(
      <Line
        key="right-wall-guide"
        points={[
          [halfWidth - snapDistance, 0.01, -halfLength],
          [halfWidth - snapDistance, 0.01, halfLength]
        ]}
        color="#22c55e"
        lineWidth={3}
        dashed={true}
      />
    );
  }

  // Horizontal guide lines
  if (Math.abs(position.z - (-halfLength + snapDistance)) < 0.1) {
    guides.push(
      <Line
        key="back-wall-guide"
        points={[
          [-halfWidth, 0.01, -halfLength + snapDistance],
          [halfWidth, 0.01, -halfLength + snapDistance]
        ]}
        color="#22c55e"
        lineWidth={3}
        dashed={true}
      />
    );
  }

  if (Math.abs(position.z - (halfLength - snapDistance)) < 0.1) {
    guides.push(
      <Line
        key="front-wall-guide"
        points={[
          [-halfWidth, 0.01, halfLength - snapDistance],
          [halfWidth, 0.01, halfLength - snapDistance]
        ]}
        color="#22c55e"
        lineWidth={3}
        dashed={true}
      />
    );
  }

  return <>{guides}</>;
};

export default SnapGuides;