import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useKitchen, KitchenItemType } from '../../store/KitchenContext';

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
  rotation = 0,
}) => {
  const meshRef = useRef<Mesh>(null);
  const { customization } = useKitchen();
  
  // ✅ 1. יצירת מפתח דינמי המבוסס על המימדים
  const dimensionsKey = `${dimensions.width}-${dimensions.depth}-${dimensions.height}`;
  
  console.log('🎨 DraggableObject render:', {
    type,
    dimensionsKey,
    position,
    isPlaced
  });

  // Get colors based on customization
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

  // Animate floating effect for unplaced items
  useFrame((state) => {
    if (!isPlaced && meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  // ✅ 3. עדכון useMemo עם תלויות נכונות כולל dimensionsKey
  const component = useMemo(() => {
    const [x, y, z] = position;
    // ✅ 2. יצירת אובייקט dimensions חדש עם spread
    const { width, depth, height } = { ...dimensions };
    
    console.log('🎨 Creating component geometry:', { 
      type, 
      width, 
      height, 
      depth, 
      position,
      dimensionsKey 
    });

    switch (type) {
      case KitchenItemType.SINK:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Base cabinet */}
            {/* ✅ 4. המש מקבל מידות ישירות מ-props */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow key={`sink-base-${dimensionsKey}`}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Countertop */}
            <mesh position={[0, height + 0.025, 0]} castShadow receiveShadow key={`sink-counter-${dimensionsKey}`}>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color={getCountertopColor()} />
            </mesh>
            {/* Sink basin */}
            <mesh position={[0, height + 0.05, 0]} castShadow key={`sink-basin-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.7, 0.15, depth * 0.7]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, height + 0.2, -depth * 0.3]} castShadow key={`sink-faucet-${dimensionsKey}`}>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
            {/* Faucet head */}
            <mesh position={[0, height + 0.35, -depth * 0.3]} castShadow key={`sink-head-${dimensionsKey}`}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
          </group>
        );

      case KitchenItemType.STOVE:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Base cabinet */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow key={`stove-base-${dimensionsKey}`}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Countertop */}
            <mesh position={[0, height + 0.025, 0]} castShadow receiveShadow key={`stove-counter-${dimensionsKey}`}>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Burners */}
            {[-0.15, 0.15].map((xOffset, i) =>
              [-0.15, 0.15].map((zOffset, j) => (
                <mesh
                  key={`burner-${i}-${j}-${dimensionsKey}`}
                  position={[xOffset, height + 0.08, zOffset]}
                  castShadow
                >
                  <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
                  <meshStandardMaterial color="#333333" />
                </mesh>
              ))
            )}
            {/* Control knobs */}
            {[-0.2, -0.067, 0.067, 0.2].map((xOffset, i) => (
              <mesh
                key={`knob-${i}-${dimensionsKey}`}
                position={[xOffset, height + 0.05, depth * 0.4]}
                castShadow
              >
                <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
                <meshStandardMaterial color="#C0C0C0" />
              </mesh>
            ))}
          </group>
        );

      case KitchenItemType.OVEN:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Built-in oven cavity */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow key={`oven-base-${dimensionsKey}`}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Oven insert */}
            <mesh position={[0, height * 0.5, depth * 0.3]} castShadow key={`oven-insert-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.85, height * 0.8, depth * 0.4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Oven door */}
            <mesh position={[0, height * 0.5, depth * 0.48]} castShadow key={`oven-door-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.8, height * 0.7, 0.05]} />
              <meshStandardMaterial color="#2D3748" />
            </mesh>
            {/* Oven window */}
            <mesh position={[0, height * 0.55, depth * 0.51]} castShadow key={`oven-window-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.5, height * 0.4, 0.02]} />
              <meshStandardMaterial color="#333333" transparent opacity={0.8} />
            </mesh>
            {/* Door handle */}
            <mesh position={[width * 0.25, height * 0.5, depth * 0.52]} castShadow key={`oven-handle-${dimensionsKey}`}>
              <boxGeometry args={[0.15, 0.02, 0.02]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
            {/* Control panel */}
            <mesh position={[0, height * 0.15, depth * 0.48]} castShadow key={`oven-panel-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.6, 0.08, 0.02]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        );

      case KitchenItemType.REFRIGERATOR:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Main body - modern stainless steel look */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow key={`fridge-body-${dimensionsKey}`}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial 
                color="#E8E9EA" 
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            {/* Freezer door (top) */}
            <mesh position={[width * 0.47, height * 0.8, 0]} castShadow key={`fridge-freezer-${dimensionsKey}`}>
              <boxGeometry args={[0.06, height * 0.35, depth * 0.95]} />
              <meshStandardMaterial 
                color="#D6D8DB" 
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
            {/* Main fridge door (bottom) */}
            <mesh position={[width * 0.47, height * 0.4, 0]} castShadow key={`fridge-main-${dimensionsKey}`}>
              <boxGeometry args={[0.06, height * 0.6, depth * 0.95]} />
              <meshStandardMaterial 
                color="#D6D8DB" 
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
            {/* Freezer handle */}
            <mesh position={[width * 0.52, height * 0.9, depth * 0.2]} castShadow key={`fridge-handle1-${dimensionsKey}`}>
              <boxGeometry args={[0.02, 0.2, 0.03]} />
              <meshStandardMaterial 
                color="#8E9196" 
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Main door handle */}
            <mesh position={[width * 0.52, height * 0.5, depth * 0.2]} castShadow key={`fridge-handle2-${dimensionsKey}`}>
              <boxGeometry args={[0.02, 0.3, 0.03]} />
              <meshStandardMaterial 
                color="#8E9196" 
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Door seals */}
            <mesh position={[width * 0.45, height * 0.625, 0]} castShadow key={`fridge-seal-${dimensionsKey}`}>
              <boxGeometry args={[0.02, 0.02, depth * 0.9]} />
              <meshStandardMaterial color="#4A4A4A" />
            </mesh>
            {/* Brand logo area */}
            <mesh position={[0, height * 0.85, depth * 0.48]} castShadow key={`fridge-logo-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.3, 0.08, 0.01]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
            {/* Water/ice dispenser */}
            <mesh position={[0, height * 0.7, depth * 0.48]} castShadow key={`fridge-dispenser-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.2, 0.15, 0.02]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        );

      case KitchenItemType.COUNTERTOP:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Base cabinet */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow key={`counter-base-${dimensionsKey}`}>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Countertop */}
            <mesh position={[0, height + 0.025, 0]} castShadow receiveShadow key={`counter-top-${dimensionsKey}`}>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color={getCountertopColor()} />
            </mesh>
            {/* Cabinet doors */}
            <mesh position={[0, height * 0.6, depth * 0.48]} castShadow key={`counter-doors-${dimensionsKey}`}>
              <boxGeometry args={[width * 0.9, height * 0.7, 0.05]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Door handles */}
            {width > 0.8 ? (
              // Two handles for wide cabinets
              <>
                <mesh position={[-width * 0.2, height * 0.6, depth * 0.52]} castShadow key={`counter-handle1-${dimensionsKey}`}>
                  <boxGeometry args={[0.08, 0.02, 0.02]} />
                  <meshStandardMaterial color="#6C757D" />
                </mesh>
                <mesh position={[width * 0.2, height * 0.6, depth * 0.52]} castShadow key={`counter-handle2-${dimensionsKey}`}>
                  <boxGeometry args={[0.08, 0.02, 0.02]} />
                  <meshStandardMaterial color="#6C757D" />
                </mesh>
              </>
            ) : (
              // Single handle for narrow cabinets
              <mesh position={[width * 0.3, height * 0.6, depth * 0.52]} castShadow key={`counter-handle-${dimensionsKey}`}>
                <boxGeometry args={[0.08, 0.02, 0.02]} />
                <meshStandardMaterial color="#6C757D" />
              </mesh>
            )}
            {/* Drawer handles */}
            <mesh position={[width * 0.3, height * 0.15, depth * 0.52]} castShadow key={`counter-drawer-${dimensionsKey}`}>
              <boxGeometry args={[0.08, 0.02, 0.02]} />
              <meshStandardMaterial color="#6C757D" />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh ref={meshRef} position={[x, y, z]} rotation={[0, rotation, 0]} castShadow receiveShadow key={`default-${dimensionsKey}`}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
        );
    }
  }, [
    // ✅ 3. כל התלויות הנדרשות כולל dimensionsKey
    position[0], position[1], position[2], 
    dimensions.width, dimensions.depth, dimensions.height, 
    dimensionsKey,
    rotation, 
    type, 
    getCabinetColor(), 
    getCountertopColor()
  ]);

  return (
    <group ref={meshRef}>
      {component}
      {/* Highlight effect for unplaced items */}
      {!isPlaced && (
        <mesh position={position} rotation={[0, rotation, 0]} key={`highlight-${dimensionsKey}`}>
          <boxGeometry args={[dimensions.width + 0.1, dimensions.height + 0.1, dimensions.depth + 0.1]} />
          <meshStandardMaterial
            color="#e3a92b"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

export default DraggableObject;