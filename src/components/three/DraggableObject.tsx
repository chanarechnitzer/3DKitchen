import React from 'react';
import { KitchenItemType } from '../../store/KitchenContext';

interface DraggableObjectProps {
  position: [number, number, number];
  type: KitchenItemType;
  isPlaced: boolean;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ 
  position, 
  type, 
  isPlaced, 
  dimensions 
}) => {
  // Function to get color based on type
  const getColor = () => {
    switch (type) {
      case KitchenItemType.SINK:
        return '#60a5fa'; // Blue for sink
      case KitchenItemType.STOVE:
        return '#f87171'; // Red for stove
      case KitchenItemType.OVEN:
        return '#fb923c'; // Orange for oven
      case KitchenItemType.REFRIGERATOR:
        return '#93c5fd'; // Light blue for refrigerator
      case KitchenItemType.COUNTERTOP:
        return '#a3a3a3'; // Gray for countertop
      default:
        return '#d4d4d4';
    }
  };

  // Function to render the specific object based on type
  const renderObject = () => {
    const baseHeight = dimensions.height;
    const opacity = isPlaced ? 1 : 0.7;
    
    switch (type) {
      case KitchenItemType.SINK:
        return (
          <group>
            {/* Sink base */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color="#a3a3a3" transparent opacity={opacity} />
            </mesh>
            
            {/* Sink */}
            <mesh 
              position={[0, baseHeight - 0.05, 0]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.1, 0.1, dimensions.depth - 0.1]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
          </group>
        );
        
      case KitchenItemType.STOVE:
        return (
          <group>
            {/* Stove base */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color="#1f2937" transparent opacity={opacity} />
            </mesh>
            
            {/* Stove top */}
            <mesh 
              position={[0, baseHeight, 0]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width, 0.05, dimensions.depth]} />
              <meshStandardMaterial color="#111827" transparent opacity={opacity} />
            </mesh>
            
            {/* Burners */}
            <mesh 
              position={[-dimensions.width / 4, baseHeight + 0.03, -dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[dimensions.width / 4, baseHeight + 0.03, -dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[-dimensions.width / 4, baseHeight + 0.03, dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[dimensions.width / 4, baseHeight + 0.03, dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
          </group>
        );
        
      case KitchenItemType.OVEN:
        return (
          <group>
            {/* Oven body */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color="#1f2937" transparent opacity={opacity} />
            </mesh>
            
            {/* Oven door */}
            <mesh 
              position={[0, baseHeight / 2, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.1, baseHeight - 0.1, 0.02]} />
              <meshStandardMaterial color="#111827" transparent opacity={opacity} />
            </mesh>
            
            {/* Oven handle */}
            <mesh 
              position={[0, baseHeight / 2, dimensions.depth / 2 + 0.03]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.3, 0.05, 0.02]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
          </group>
        );
        
      case KitchenItemType.REFRIGERATOR:
        return (
          <group>
            {/* Refrigerator body */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color="#d1d5db" transparent opacity={opacity} />
            </mesh>
            
            {/* Refrigerator door line */}
            <mesh 
              position={[0, baseHeight * 0.6, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width, 0.01, 0.01]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={opacity} />
            </mesh>
            
            {/* Refrigerator handles */}
            <mesh 
              position={[dimensions.width / 4, baseHeight * 0.3, dimensions.depth / 2 + 0.03]} 
              castShadow
            >
              <boxGeometry args={[0.05, baseHeight * 0.4, 0.03]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[dimensions.width / 4, baseHeight * 0.8, dimensions.depth / 2 + 0.03]} 
              castShadow
            >
              <boxGeometry args={[0.05, baseHeight * 0.3, 0.03]} />
              <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
            </mesh>
          </group>
        );
        
      case KitchenItemType.COUNTERTOP:
        return (
          <group>
            {/* Countertop base */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color="#a3a3a3" transparent opacity={opacity} />
            </mesh>
            
            {/* Countertop surface */}
            <mesh 
              position={[0, baseHeight, 0]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width, 0.05, dimensions.depth]} />
              <meshStandardMaterial color="#f3f4f6" transparent opacity={opacity} />
            </mesh>
            
            {/* Drawer handles */}
            <mesh 
              position={[0, baseHeight * 0.3, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width * 0.5, 0.03, 0.02]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[0, baseHeight * 0.6, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width * 0.5, 0.03, 0.02]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={opacity} />
            </mesh>
          </group>
        );
        
      default:
        return (
          <mesh 
            position={[0, baseHeight / 2, 0]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
            <meshStandardMaterial color={getColor()} transparent opacity={opacity} />
          </mesh>
        );
    }
  };
  
  return (
    <group position={position}>
      {renderObject()}
    </group>
  );
};

export default DraggableObject;