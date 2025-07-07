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
  stackedOn?: string; // ID of item this is stacked on
  stackedWith?: string; // ID of item stacked on this
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ 
  position, 
  type, 
  isPlaced, 
  dimensions,
  rotation = 0,
  stackedOn,
  stackedWith
}) => {
  const { customization } = useKitchen();
  
  // Define baseHeight at the top level so it can be used in calculations
  const baseHeight = dimensions.height;
  
  // ✅ CRITICAL: Calculate actual position based on stacking
  const actualY = stackedOn ? 0.6 : 0; // If stacked on another oven, place at 0.6m height
  const actualHeight = stackedOn ? baseHeight : baseHeight; // Keep same height regardless
  
  // ✅ CRITICAL: Don't render stacked ovens separately - they should be rendered as one unit
  if (stackedOn && type === KitchenItemType.OVEN) {
    return null; // Don't render the top oven separately
  }

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
    const opacity = isPlaced ? 1 : 0.7;
    const cabinetColor = getCabinetColor();
    const countertopColor = getCountertopColor();
    
    switch (type) {
      case KitchenItemType.SINK:
        return (
          <group>
            {/* Sink base - uses cabinet customization */}
            <mesh 
              position={[0, (baseHeight - 0.05) / 2, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, baseHeight - 0.05, dimensions.depth]} />
              <meshStandardMaterial color={cabinetColor} transparent opacity={opacity} />
            </mesh>
            
            {/* Countertop surface */}
            <mesh 
              position={[0, baseHeight, 0]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width, 0.05, dimensions.depth]} />
              <meshStandardMaterial color={countertopColor} transparent opacity={opacity} />
            </mesh>
            
            {/* IMPROVED: Realistic sink bowl with proper stainless steel finish */}
            <mesh 
              position={[0, baseHeight - 0.03, 0]} 
              castShadow
            >
              <cylinderGeometry args={[dimensions.width * 0.35, dimensions.width * 0.3, 0.12, 20]} />
              <meshStandardMaterial 
                color="#e8e8e8" 
                metalness={0.95} 
                roughness={0.05} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* IMPROVED: Sink interior - darker stainless steel with better depth */}
            <mesh 
              position={[0, baseHeight + 0.03, 0]} 
              castShadow
            >
              <cylinderGeometry args={[dimensions.width * 0.32, dimensions.width * 0.27, 0.08, 20]} />
              <meshStandardMaterial 
                color="#d0d0d0" 
                metalness={0.95} 
                roughness={0.08} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* ✅ NEW: Bright sink rim for better visibility on dark countertops */}
            <mesh 
              position={[0, baseHeight + 0.025, 0]} 
              castShadow
            >
              <cylinderGeometry args={[dimensions.width * 0.37, dimensions.width * 0.36, 0.02, 20]} />
              <meshStandardMaterial 
                color="#f5f5f5" 
                metalness={0.9} 
                roughness={0.1} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* NEW: Sink drain - realistic detail */}
            <mesh 
              position={[0, baseHeight, 0]} 
              castShadow
            >
              <cylinderGeometry args={[0.03, 0.025, 0.02, 12]} />
              <meshStandardMaterial 
                color="#f0f0f0" 
                metalness={0.9} 
                roughness={0.2} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* IMPROVED: Faucet base - more realistic chrome finish */}
            <mesh 
              position={[0, baseHeight + 0.13, -dimensions.depth * 0.3]} 
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.05, 0.12, 12]} />
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.95} 
                roughness={0.02} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* IMPROVED: Faucet spout - curved and realistic */}
            <mesh 
              position={[0, baseHeight + 0.23, -dimensions.depth * 0.15]} 
              castShadow
              rotation={[Math.PI / 6, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.025, 0.25, 12]} />
              <meshStandardMaterial 
                color="#ffffff" 
                metalness={0.95} 
                roughness={0.02} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* NEW: Faucet handle - realistic detail */}
            <mesh 
              position={[0.08, baseHeight + 0.20, -dimensions.depth * 0.3]} 
              castShadow
            >
              <cylinderGeometry args={[0.015, 0.02, 0.06, 8]} />
              <meshStandardMaterial 
                color="#f8f8f8" 
                metalness={0.8} 
                roughness={0.05} 
                transparent 
                opacity={opacity} 
              />
            </mesh>
            
            {/* ✅ NEW: Additional sink highlights for better visibility */}
            {/* ✅ REMOVED: No more arc/ring around sink - clean design */}
            
            {/* Cabinet handles */}
            <mesh 
              position={[0, (baseHeight - 0.05) * 0.3, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width * 0.5, 0.03, 0.02]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={opacity} />
            </mesh>
            
            <mesh 
              position={[0, (baseHeight - 0.05) * 0.6, dimensions.depth / 2 + 0.01]} 
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
            {/* ✅ FIXED: Oven body - properly positioned for stacking */}
            <mesh 
              position={[0, actualY + actualHeight / 2, 0]}
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[dimensions.width, actualHeight, dimensions.depth]} />
              <meshStandardMaterial color="#1f2937" transparent opacity={opacity} />
            </mesh>
            
            {/* ✅ FIXED: Oven door - positioned relative to actual oven position */}
            <mesh 
              position={[0, actualY + actualHeight / 2, dimensions.depth / 2 + 0.01]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.1, actualHeight - 0.1, 0.02]} />
              <meshStandardMaterial color="#111827" transparent opacity={opacity} />
            </mesh>
            
            {/* ✅ FIXED: Oven window - positioned relative to actual oven position */}
            <mesh 
              position={[0, actualY + actualHeight * 0.6, dimensions.depth / 2 + 0.02]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.2, actualHeight * 0.4, 0.01]} />
              <meshStandardMaterial 
                color="#333333" 
                transparent 
                opacity={opacity * 0.8} 
              />
            </mesh>
            
            {/* ✅ FIXED: Oven handle - positioned relative to actual oven position */}
            <mesh 
              position={[0, actualY + actualHeight * 0.3, dimensions.depth / 2 + 0.03]} 
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.3, 0.05, 0.02]} />
              <meshStandardMaterial color="#fb923c" transparent opacity={opacity} />
            </mesh>
            
            {/* ✅ FIXED: Control panel - positioned relative to actual oven position */}
            <mesh 
              position={[0, actualY + actualHeight - 0.05, dimensions.depth / 2 + 0.02]}
              castShadow
            >
              <boxGeometry args={[dimensions.width - 0.1, 0.08, 0.01]} />
              <meshStandardMaterial color="#374151" transparent opacity={opacity} />
            </mesh>
            
            {/* ✅ NEW: If this oven has another oven stacked on it, render the stacked oven */}
            {stackedWith && (
              <group position={[0, 0.6, 0]}>
                {/* Stacked oven body */}
                <mesh 
                  position={[0, actualHeight / 2, 0]}
                  castShadow 
                  receiveShadow
                >
                  <boxGeometry args={[dimensions.width, actualHeight, dimensions.depth]} />
                  <meshStandardMaterial color="#1f2937" transparent opacity={opacity} />
                </mesh>
                
                {/* Stacked oven door */}
                <mesh 
                  position={[0, actualHeight / 2, dimensions.depth / 2 + 0.01]} 
                  castShadow
                >
                  <boxGeometry args={[dimensions.width - 0.1, actualHeight - 0.1, 0.02]} />
                  <meshStandardMaterial color="#111827" transparent opacity={opacity} />
                </mesh>
                
                {/* Stacked oven window */}
                <mesh 
                  position={[0, actualHeight * 0.6, dimensions.depth / 2 + 0.02]} 
                  castShadow
                >
                  <boxGeometry args={[dimensions.width - 0.2, actualHeight * 0.4, 0.01]} />
                  <meshStandardMaterial 
                    color="#333333" 
                    transparent 
                    opacity={opacity * 0.8} 
                  />
                </mesh>
                
                {/* Stacked oven handle */}
                <mesh 
                  position={[0, actualHeight * 0.3, dimensions.depth / 2 + 0.03]} 
                  castShadow
                >
                  <boxGeometry args={[dimensions.width - 0.3, 0.05, 0.02]} />
                  <meshStandardMaterial color="#fb923c" transparent opacity={opacity} />
                </mesh>
                
                {/* Stacked oven control panel */}
                <mesh 
                  position={[0, actualHeight - 0.05, dimensions.depth / 2 + 0.02]}
                  castShadow
                >
                  <boxGeometry args={[dimensions.width - 0.1, 0.08, 0.01]} />
                  <meshStandardMaterial color="#374151" transparent opacity={opacity} />
                </mesh>
              </group>
            )}
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