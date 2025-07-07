import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
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

  // Memoize the component based on type
  const component = useMemo(() => {
    const [x, y, z] = position;
    const { width, depth, height } = dimensions;

    switch (type) {
      case KitchenItemType.SINK:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Base cabinet */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Countertop */}
            <mesh position={[0, height + 0.025, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color={getCountertopColor()} />
            </mesh>
            {/* Sink basin */}
            <mesh position={[0, height + 0.05, 0]} castShadow>
              <boxGeometry args={[width * 0.7, 0.15, depth * 0.7]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
            {/* Faucet */}
            <mesh position={[0, height + 0.2, -depth * 0.3]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
            {/* Faucet head */}
            <mesh position={[0, height + 0.35, -depth * 0.3]} castShadow>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
          </group>
        );

      case KitchenItemType.STOVE:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Base cabinet */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Countertop */}
            <mesh position={[0, height + 0.025, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Burners */}
            {[-0.15, 0.15].map((xOffset, i) =>
              [-0.15, 0.15].map((zOffset, j) => (
                <mesh
                  key={`burner-${i}-${j}`}
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
                key={`knob-${i}`}
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
            {/* Oven body */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#2D3748" />
            </mesh>
            {/* Oven door */}
            <mesh position={[0, height * 0.6, depth * 0.48]} castShadow>
              <boxGeometry args={[width * 0.9, height * 0.7, 0.05]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Oven window */}
            <mesh position={[0, height * 0.6, depth * 0.51]} castShadow>
              <boxGeometry args={[width * 0.6, height * 0.4, 0.02]} />
              <meshStandardMaterial color="#333333" transparent opacity={0.8} />
            </mesh>
            {/* Door handle */}
            <mesh position={[width * 0.3, height * 0.6, depth * 0.52]} castShadow>
              <boxGeometry args={[0.15, 0.02, 0.02]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
          </group>
        );

      case KitchenItemType.REFRIGERATOR:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Main body */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color="#F8F9FA" />
            </mesh>
            {/* Upper door */}
            <mesh position={[width * 0.48, height * 0.75, 0]} castShadow>
              <boxGeometry args={[0.05, height * 0.45, depth * 0.95]} />
              <meshStandardMaterial color="#E9ECEF" />
            </mesh>
            {/* Lower door */}
            <mesh position={[width * 0.48, height * 0.25, 0]} castShadow>
              <boxGeometry args={[0.05, height * 0.45, depth * 0.95]} />
              <meshStandardMaterial color="#E9ECEF" />
            </mesh>
            {/* Upper handle */}
            <mesh position={[width * 0.52, height * 0.85, 0]} castShadow>
              <boxGeometry args={[0.02, 0.15, 0.02]} />
              <meshStandardMaterial color="#6C757D" />
            </mesh>
            {/* Lower handle */}
            <mesh position={[width * 0.52, height * 0.35, 0]} castShadow>
              <boxGeometry args={[0.02, 0.15, 0.02]} />
              <meshStandardMaterial color="#6C757D" />
            </mesh>
            {/* Freezer compartment line */}
            <mesh position={[0, height * 0.5, depth * 0.48]} castShadow>
              <boxGeometry args={[width * 0.9, 0.01, 0.01]} />
              <meshStandardMaterial color="#DEE2E6" />
            </mesh>
          </group>
        );

      case KitchenItemType.COUNTERTOP:
        return (
          <group position={[x, y, z]} rotation={[0, rotation, 0]}>
            {/* Base cabinet */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Countertop */}
            <mesh position={[0, height + 0.025, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, 0.05, depth]} />
              <meshStandardMaterial color={getCountertopColor()} />
            </mesh>
            {/* Cabinet doors */}
            <mesh position={[0, height * 0.6, depth * 0.48]} castShadow>
              <boxGeometry args={[width * 0.9, height * 0.7, 0.05]} />
              <meshStandardMaterial color={getCabinetColor()} />
            </mesh>
            {/* Door handles */}
            {width > 0.8 ? (
              // Two handles for wide cabinets
              <>
                <mesh position={[-width * 0.2, height * 0.6, depth * 0.52]} castShadow>
                  <boxGeometry args={[0.08, 0.02, 0.02]} />
                  <meshStandardMaterial color="#6C757D" />
                </mesh>
                <mesh position={[width * 0.2, height * 0.6, depth * 0.52]} castShadow>
                  <boxGeometry args={[0.08, 0.02, 0.02]} />
                  <meshStandardMaterial color="#6C757D" />
                </mesh>
              </>
            ) : (
              // Single handle for narrow cabinets
              <mesh position={[width * 0.3, height * 0.6, depth * 0.52]} castShadow>
                <boxGeometry args={[0.08, 0.02, 0.02]} />
                <meshStandardMaterial color="#6C757D" />
              </mesh>
            )}
            {/* Drawer handles */}
            <mesh position={[width * 0.3, height * 0.15, depth * 0.52]} castShadow>
              <boxGeometry args={[0.08, 0.02, 0.02]} />
              <meshStandardMaterial color="#6C757D" />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh ref={meshRef} position={[x, y, z]} rotation={[0, rotation, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
        );
    }
  }, [position, type, dimensions, rotation, customization, getCabinetColor, getCountertopColor]);

  return (
    <group ref={meshRef}>
      {component}
      {/* Highlight effect for unplaced items */}
      {!isPlaced && (
        <mesh position={position} rotation={[0, rotation, 0]}>
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