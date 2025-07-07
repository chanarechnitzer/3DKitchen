import React from 'react';
import { KitchenItemType } from '../../store/KitchenContext';
import { useKitchen } from '../../store/KitchenContext';

interface DraggableObjectProps {
  position: [number, number, number];
  type: KitchenItemType;
  isPlaced: boolean;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  rotation?: number;
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ 
  position, 
  type, 
  isPlaced, 
  dimensions,
  rotation = 0
}) => {
  const { customization } = useKitchen();

  // Get cabinet color based on customization
  const getCabinetColor = () => {
    switch (customization.cabinets) {
      case 'white':
        return '#ffffff';
      case 'wood':
        return '#8B4513';
      case 'gray':
        return '#6B7280';
      case 'navy':
        return '#1E3A8A';
      default:
        return '#ffffff';
    }
  };

  // Get countertop color based on customization
  const getCountertopColor = () => {
    switch (customization.countertops) {
      case 'granite':
        return '#2D3748';
      case 'marble':
        return '#F7FAFC';
      case 'quartz':
        return '#4A5568';
      case 'wood':
        return '#8B4513';
      default:
        return '#2D3748';
    }
  };

  // Function to render the specific object based on type
  const renderObject = () => {
    const baseHeight = dimensions.height;
    const opacity = isPlaced ? 1 : 0.7;
    const cabinetColor = getCabinetColor();
    const countertopColor = getCountertopColor();
    
    switch (type) {
      case KitchenItemType.SINK:
        return (
          <group>
            {/* Sink base - uses cabinet customization */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color={cabinetColor} transparent opacity={opacity} />
            </mesh>
            
            {/* Countertop surface */}
            <mesh 
              position={[0, baseHeight + 0.025, 0]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width, 0.05, dimensions.depth]} />
              <meshStandardMaterial color={countertopColor} transparent opacity={opacity} />
            </mesh>
            
            {/* IMPROVED: Realistic sink bowl with proper stainless steel finish */}
            <mesh 
              position={[0, baseHeight - 0.08, 0]} 
              castShadow
            >
              <cylinderGeometry args={[dimensions.width * 0.35, dimensions.width * 0.3, 0.12, 20]} />
              <meshStandardMaterial 
                color="#c0c0c0" 
                metalness={0.9} 
                roughness={0.15} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* IMPROVED: Sink interior - darker stainless steel with better depth */}
            <mesh 
              position={[0, baseHeight - 0.02, 0]} 
              castShadow
            >
              <cylinderGeometry args={[dimensions.width * 0.32, dimensions.width * 0.27, 0.08, 20]} />
              <meshStandardMaterial 
                color="#a8a8a8" 
                metalness={0.95} 
                roughness={0.1} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* NEW: Sink drain - realistic detail */}
            <mesh 
              position={[0, baseHeight - 0.05, 0]} 
              castShadow
            >
              <cylinderGeometry args={[0.03, 0.025, 0.02, 12]} />
              <meshStandardMaterial 
                color="#808080" 
                metalness={0.9} 
                roughness={0.2} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* IMPROVED: Faucet base - more realistic chrome finish */}
            <mesh 
              position={[0, baseHeight + 0.08, -dimensions.depth * 0.3]} 
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.05, 0.12, 12]} />
              <meshStandardMaterial 
                color="#f0f0f0" 
                metalness={0.95} 
                roughness={0.05} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* IMPROVED: Faucet spout - curved and realistic */}
            <mesh 
              position={[0, baseHeight + 0.18, -dimensions.depth * 0.15]} 
              castShadow
              rotation={[Math.PI / 6, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.025, 0.25, 12]} />
              <meshStandardMaterial 
                color="#f0f0f0" 
                metalness={0.95} 
                roughness={0.05} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* NEW: Faucet handle - realistic detail */}
            <mesh 
              position={[0.08, baseHeight + 0.15, -dimensions.depth * 0.3]} 
              castShadow
            >
              <cylinderGeometry args={[0.015, 0.02, 0.06, 8]} />
              <meshStandardMaterial 
                color="#e0e0e0" 
                metalness={0.8} 
                roughness={0.1} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* Cabinet handles */}
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
              <meshStandardMaterial color="#f87171" transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[dimensions.width / 4, baseHeight + 0.03, -dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#f87171" transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[-dimensions.width / 4, baseHeight + 0.03, dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#f87171" transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[dimensions.width / 4, baseHeight + 0.03, dimensions.depth / 4]} 
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color="#f87171" transparent opacity={opacity} />
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
            
            {/* Oven window */}
            <mesh 
              position={[0, baseHeight * 0.6, dimensions.depth / 2 + 0.02]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.2, baseHeight * 0.4, 0.01]} />
              <meshStandardMaterial 
                color="#333333" 
                transparent 
                opacity={opacity * 0.8} 
              />
            </mesh>
            
            {/* Oven handle */}
            <mesh 
              position={[0, baseHeight * 0.3, dimensions.depth / 2 + 0.03]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.3, 0.05, 0.02]} />
              <meshStandardMaterial color="#fb923c" transparent opacity={opacity} />
            </mesh>
            
            {/* Control panel */}
            <mesh 
              position={[0, baseHeight - 0.05, dimensions.depth / 2 + 0.02]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.1, 0.08, 0.01]} />
              <meshStandardMaterial color="#374151" transparent opacity={opacity} />
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
              <meshStandardMaterial color="#93c5fd" transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[dimensions.width / 4, baseHeight * 0.8, dimensions.depth / 2 + 0.03]} 
              castShadow
            >
              <boxGeometry args={[0.05, baseHeight * 0.3, 0.03]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={opacity} />
            </mesh>
          </group>
        );
        
      case KitchenItemType.COUNTERTOP:
        return (
          <group>
            {/* Countertop base - uses cabinet customization */}
            <mesh 
              position={[0, baseHeight / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight, dimensions.depth]} />
              <meshStandardMaterial color={cabinetColor} transparent opacity={opacity} />
            </mesh>
            
            {/* Countertop surface - uses countertop customization */}
            <mesh 
              position={[0, baseHeight, 0]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width, 0.05, dimensions.depth]} />
              <meshStandardMaterial color={countertopColor} transparent opacity={opacity} />
            </mesh>
            
            {/* Drawer handles - scale with width */}
            {dimensions.width > 0.4 && (
            <mesh 
              position={[0, baseHeight * 0.3, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[Math.min(dimensions.width * 0.6, 0.4), 0.03, 0.02]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={opacity} />
            </mesh>
            )}
            
            {dimensions.width > 0.4 && (
            <mesh 
              position={[0, baseHeight * 0.6, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[Math.min(dimensions.width * 0.6, 0.4), 0.03, 0.02]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={opacity} />
            </mesh>
            )}
            
            {/* Add dividers for wide cabinets */}
            {dimensions.width > 1.0 && (
              <>
                <mesh 
                  position={[-dimensions.width * 0.25, baseHeight / 2, 0]} 
                  castShadow
                >
                  <boxGeometry args={[0.02, baseHeight, dimensions.depth]} />
                  <meshStandardMaterial color={cabinetColor} transparent opacity={opacity * 0.8} />
                </mesh>
                <mesh 
                  position={[dimensions.width * 0.25, baseHeight / 2, 0]} 
                  castShadow
                >
                  <boxGeometry args={[0.02, baseHeight, dimensions.depth]} />
                  <meshStandardMaterial color={cabinetColor} transparent opacity={opacity * 0.8} />
                </mesh>
              </>
            )}
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
            <meshStandardMaterial color="#d4d4d4" transparent opacity={opacity} />
          </mesh>
        );
    }
  };
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {renderObject()}
    </group>
  );
};

export default DraggableObject;