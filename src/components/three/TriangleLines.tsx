import React from 'react';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';
import { KitchenItem, KitchenItemType } from '../../store/KitchenContext';

interface TriangleLinesProps {
  placedItems: KitchenItem[];
  isValid: boolean;
}

const TriangleLines: React.FC<TriangleLinesProps> = ({ placedItems, isValid }) => {
  // Find sink, stove, and refrigerator
  const sink = placedItems.find(item => item.type === KitchenItemType.SINK);
  const stove = placedItems.find(item => item.type === KitchenItemType.STOVE);
  const refrigerator = placedItems.find(item => item.type === KitchenItemType.REFRIGERATOR);
  
  if (!sink || !stove || !refrigerator) return null;
  
  // Create points for the triangle
  const points = [
    new Vector3(sink.position.x, 0.1, sink.position.z),
    new Vector3(stove.position.x, 0.1, stove.position.z),
    new Vector3(refrigerator.position.x, 0.1, refrigerator.position.z),
    new Vector3(sink.position.x, 0.1, sink.position.z),
  ];
  
  // Line color based on validity
  const color = isValid ? '#e3a92b' : '#ef4444';
  const lineWidth = isValid ? 5 : 2;
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      dashed={!isValid}
    />
  );
};

export default TriangleLines;