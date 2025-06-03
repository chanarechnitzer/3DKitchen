import React from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { KitchenItem, KitchenItemType } from '../../store/KitchenContext';

interface DistanceLinesProps {
  position: Vector3;
  placedItems: KitchenItem[];
  type: KitchenItemType;
}

const DistanceLines: React.FC<DistanceLinesProps> = ({ position, placedItems, type }) => {
  const getRelevantItems = () => {
    switch (type) {
      case KitchenItemType.SINK:
        return {
          stoves: placedItems.filter(item => item.type === KitchenItemType.STOVE),
          refrigerators: placedItems.filter(item => item.type === KitchenItemType.REFRIGERATOR)
        };
      case KitchenItemType.STOVE:
        return {
          sinks: placedItems.filter(item => item.type === KitchenItemType.SINK),
          refrigerators: placedItems.filter(item => item.type === KitchenItemType.REFRIGERATOR)
        };
      case KitchenItemType.REFRIGERATOR:
        return {
          sinks: placedItems.filter(item => item.type === KitchenItemType.SINK),
          stoves: placedItems.filter(item => item.type === KitchenItemType.STOVE)
        };
      default:
        return {};
    }
  };

  const items = getRelevantItems();
  const lines: JSX.Element[] = [];

  Object.entries(items).forEach(([key, itemList]) => {
    itemList.forEach((item, index) => {
      const distance = position.distanceTo(item.position);
      const isValid = distance > 1.2 && distance < 5;
      
      lines.push(
        <group key={`${key}-${index}`}>
          <Line
            points={[
              [position.x, 0.05, position.z],
              [item.position.x, 0.05, item.position.z]
            ]}
            color={isValid ? '#22c55e' : '#ef4444'}
            lineWidth={1}
            dashed={!isValid}
          />
        </group>
      );
    });
  });

  return <>{lines}</>;
};

export default DistanceLines;