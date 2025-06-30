import React from 'react';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';
import { KitchenItem, KitchenItemType } from '../../store/KitchenContext';

interface TriangleLinesProps {
  placedItems: KitchenItem[];
  isValid: boolean;
  showTriangle?: boolean; // Add prop to control when to show triangle
}

const TriangleLines: React.FC<TriangleLinesProps> = ({ 
  placedItems, 
  isValid, 
  showTriangle = false // Default to false - only show when explicitly requested
}) => {
  // CRITICAL: Only show triangle lines when explicitly requested (after user clicks finish)
  if (!showTriangle) {
    return null;
  }

  // Find all sinks, stoves, and refrigerators
  const sinks = placedItems.filter(item => item.type === KitchenItemType.SINK);
  const stoves = placedItems.filter(item => item.type === KitchenItemType.STOVE);
  const refrigerators = placedItems.filter(item => item.type === KitchenItemType.REFRIGERATOR);
  
  // ✅ NEW: Support multiple triangles when there are multiple sinks
  if (sinks.length === 0 || stoves.length === 0 || refrigerators.length === 0) return null;
  
  const triangles: JSX.Element[] = [];
  
  // ✅ Create a triangle for each sink with the first stove and first refrigerator
  sinks.forEach((sink, sinkIndex) => {
    const stove = stoves[0]; // Use first stove
    const refrigerator = refrigerators[0]; // Use first refrigerator
    
    // Create points for this triangle
    const points = [
      new Vector3(sink.position.x, 0.1, sink.position.z),
      new Vector3(stove.position.x, 0.1, stove.position.z),
      new Vector3(refrigerator.position.x, 0.1, refrigerator.position.z),
      new Vector3(sink.position.x, 0.1, sink.position.z), // Close the triangle
    ];
    
    // ✅ Different colors for multiple triangles
    const colors = ['#e3a92b', '#3b82f6', '#22c55e', '#f97316']; // Gold, Blue, Green, Orange
    const color = isValid ? colors[sinkIndex % colors.length] : '#ef4444';
    const lineWidth = isValid ? 5 : 2;
    
    triangles.push(
      <Line
        key={`triangle-${sinkIndex}`}
        points={points}
        color={color}
        lineWidth={lineWidth}
        dashed={!isValid}
      />
    );
  });
  
  return <>{triangles}</>;
};

export default TriangleLines;