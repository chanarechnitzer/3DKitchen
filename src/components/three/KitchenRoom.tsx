import React, { useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WindowPlacement, useKitchen } from '../../store/KitchenContext';

interface KitchenRoomProps {
  width: number;
  length: number;
  windowPlacement: WindowPlacement;
}

const KitchenRoom: React.FC<KitchenRoomProps> = ({ width, length, windowPlacement }) => {
  const { customization } = useKitchen();
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const [windowTexture, setWindowTexture] = useState<THREE.Texture | null>(null);
  const [textureError, setTextureError] = useState(false);

  // Get colors based on customization
  const getWallColor = () => {
    switch (customization.walls) {
      case 'light':
        return '#F8FAFC';
      case 'warm':
        return '#FEF3E2';
      case 'cool':
        return '#EFF6FF';
      case 'bold':
        return '#1E293B';
      default:
        return '#F8FAFC';
    }
  };

  const getFloorColor = () => {
    switch (customization.floors) {
      case 'wood':
        return '#8B4513';
      case 'tile':
        return '#E2E8F0';
      case 'stone':
        return '#64748B';
      case 'concrete':
        return '#374151';
      default:
        return '#8B4513';
    }
  };

  // Create a canvas with the mountain view
  const createMountainViewCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
    skyGradient.addColorStop(0, '#4A90E2');
    skyGradient.addColorStop(0.5, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 8; i++) {
      const x = canvas.width * Math.random();
      const y = canvas.height * 0.2 * Math.random();
      const size = 30 + Math.random() * 20;
      
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(x + j * 15, y + Math.sin(j) * 5, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Background mountains
    ctx.fillStyle = '#8BA9A5';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.7);
    ctx.lineTo(canvas.width * 0.2, canvas.height * 0.5);
    ctx.lineTo(canvas.width * 0.5, canvas.height * 0.6);
    ctx.lineTo(canvas.width * 0.8, canvas.height * 0.45);
    ctx.lineTo(canvas.width, canvas.height * 0.55);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Foreground mountains
    ctx.fillStyle = '#4B6455';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height * 0.6);
    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.4);
    ctx.lineTo(canvas.width * 0.7, canvas.height * 0.65);
    ctx.lineTo(canvas.width, canvas.height * 0.5);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.25, canvas.height * 0.45);
    ctx.lineTo(canvas.width * 0.35, canvas.height * 0.4);
    ctx.lineTo(canvas.width * 0.45, canvas.height * 0.43);
    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.48);
    ctx.fill();

    return canvas;
  };

  useEffect(() => {
    try {
      const canvas = createMountainViewCanvas();
      if (canvas) {
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        setWindowTexture(texture);
      }
    } catch (error) {
      console.error('Error creating window view:', error);
      setTextureError(true);
    }
  }, []);

  const generateMarkers = (size: number, isWidth: boolean) => {
    const markers = [];
    for (let i = 0; i <= size; i++) {
      const position = (i - size / 2);

      markers.push(
        <Text
          key={`marker-${i}`}
          position={
            isWidth
              ? [position, 0.01, -halfLength + 0.2]
              : [-halfWidth + 0.2, 0.01, position]
          }
          rotation={[-Math.PI / 2, 0, isWidth ? 0 : Math.PI / 2]}
          color="black"
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
        >
          {i}
        </Text>
      );

      if (i < size) {
        for (let j = 1; j < 10; j++) {
          const subPosition = position + j / 10;
          const lineHeight = j === 5 ? 0.15 : 0.1;

          markers.push(
            <mesh
              key={`tick-${i}-${j}`}
              position={
                isWidth
                  ? [subPosition, 0.01, -halfLength + 0.2]
                  : [-halfWidth + 0.2, 0.01, subPosition]
              }
              rotation={[-Math.PI / 2, 0, isWidth ? 0 : Math.PI / 2]}
            >
              <planeGeometry args={[0.01, lineHeight]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
          );
        }
      }
    }
    return markers;
  };

  const renderPlants = () => {
    const plants = [];
    const shelfHeight = 2.2;
    const shelfDepth = 0.3;

    const cornerPositions = [
      [-halfWidth + 0.4, shelfHeight, -halfLength + shelfDepth],
      [halfWidth - 0.4, shelfHeight, -halfLength + shelfDepth],
    ];

    cornerPositions.forEach((position, index) => {
      if (windowPlacement === WindowPlacement.OPPOSITE && 
          position[0] > -width/6 && position[0] < width/6) {
        return;
      }
      if (windowPlacement === WindowPlacement.LEFT && 
          position[0] < 0) {
        return;
      }
      if (windowPlacement === WindowPlacement.RIGHT && 
          position[0] > 0) {
        return;
      }

      plants.push(
        <group key={`plant-${index}`} position={position}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
          <group position={[0, 0.15, 0]}>
            {[0, 1, 2].map((layer) => (
              <mesh 
                key={`leaves-${layer}`} 
                position={[0, layer * 0.08, 0]} 
                rotation={[layer * 0.2, layer * Math.PI / 4, 0]}
                castShadow
              >
                <sphereGeometry args={[0.15 - layer * 0.03, 8, 8]} />
                <meshStandardMaterial 
                  color={layer === 0 ? "#2D5A27" : "#3A7A34"} 
                  roughness={0.8}
                />
              </mesh>
            ))}
          </group>
        </group>
      );

      plants.push(
        <mesh 
          key={`shelf-${index}`} 
          position={[position[0], shelfHeight - 0.12, position[2]]}
        >
          <boxGeometry args={[0.6, 0.03, 0.3]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      );
    });

    return plants;
  };

  const renderWindow = () => {
    const windowWidth = 1.2;
    const windowHeight = 1.2;
    const windowY = 1.4;
    const wallOffset = 0.05;

    let windowPosition: [number, number, number];
    let windowRotation: [number, number, number] = [0, 0, 0];

    switch (windowPlacement) {
      case WindowPlacement.RIGHT:
        windowPosition = [halfWidth - wallOffset, windowY, 0];
        windowRotation = [0, -Math.PI / 2, 0];
        break;
      case WindowPlacement.LEFT:
        windowPosition = [-halfWidth + wallOffset, windowY, 0];
        windowRotation = [0, Math.PI / 2, 0];
        break;
      default:
        windowPosition = [0, windowY, -halfLength + wallOffset];
        break;
    }

    return (
      <group position={windowPosition} rotation={windowRotation}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[windowWidth - 0.1, windowHeight - 0.1]} />
          <meshBasicMaterial 
            map={windowTexture}
            side={THREE.DoubleSide}
            toneMapped={false}
            color={textureError ? "#87CEEB" : "white"}
          />
        </mesh>

        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[windowWidth - 0.1, windowHeight - 0.1]} />
          <meshPhysicalMaterial 
            transparent
            opacity={0.2}
            roughness={0}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh>
          <boxGeometry args={[windowWidth, windowHeight, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.05, windowHeight - 0.1, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[windowWidth - 0.1, 0.05, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  };
  
  const wallColor = getWallColor();
  const floorColor = getFloorColor();
  
  return (
    <group className="room-fly-in">
      {/* Floor - uses floor customization */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Grid */}
      <gridHelper
        args={[width, Math.ceil(width) * 2, '#d1d5db', '#d1d5db']}
        position={[0, 0.001, 0]}
      />
      <gridHelper
        args={[length, Math.ceil(length) * 2, '#d1d5db', '#d1d5db']}
        position={[0, 0.001, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Walls - use wall customization */}
      <mesh position={[0, 1.5, -halfLength]} receiveShadow>
        <boxGeometry args={[width, 3, 0.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh
        position={[-halfWidth, 1.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 3, 0.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh
        position={[halfWidth, 1.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 3, 0.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* Front wall with door opening */}
      <group position={[0, 1.5, halfLength]}>
        <mesh position={[-width / 3, 0, 0]} receiveShadow>
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
        <mesh position={[width / 3, 0, 0]} receiveShadow>
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </group>

      {/* Plants and shelves */}
      {renderPlants()}

      {/* Window with view */}
      {renderWindow()}

      {/* Measurement markers */}
      {generateMarkers(width, true)}
      {generateMarkers(length, false)}

      {/* Dimension labels */}
      <Text
        position={[0, 0.01, -halfLength + 0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="black"
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
      >
        {`${width} מ'`}
      </Text>

      <Text
        position={[-halfWidth + 0.4, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        color="black"
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
      >
        {`${length} מ'`}
      </Text>
    </group>
  );
};

export default KitchenRoom;