import React, { useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WindowPlacement } from '../../store/KitchenContext';

interface KitchenRoomProps {
  width: number;
  length: number;
  windowPlacement: WindowPlacement;
}

const KitchenRoom: React.FC<KitchenRoomProps> = ({ width, length, windowPlacement }) => {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const [windowTexture, setWindowTexture] = useState<THREE.Texture | null>(null);
  const [textureError, setTextureError] = useState(false);

  // Create a canvas with the mountain view
  const createMountainViewCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB'); // Light blue at top
    skyGradient.addColorStop(0.5, '#B0E2FF'); // Lighter blue in middle
    skyGradient.addColorStop(1, '#E0F6FF'); // Almost white at horizon
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant mountains (background)
    ctx.fillStyle = '#8BA9A5';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.5);
    ctx.lineTo(canvas.width * 0.2, canvas.height * 0.35);
    ctx.lineTo(canvas.width * 0.4, canvas.height * 0.45);
    ctx.lineTo(canvas.width * 0.6, canvas.height * 0.3);
    ctx.lineTo(canvas.width * 0.8, canvas.height * 0.4);
    ctx.lineTo(canvas.width, canvas.height * 0.35);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Closer mountains (foreground)
    ctx.fillStyle = '#4B6455';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height * 0.45);
    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.25);
    ctx.lineTo(canvas.width * 0.7, canvas.height * 0.55);
    ctx.lineTo(canvas.width, canvas.height * 0.35);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.2, canvas.height * 0.3);
    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.25);
    ctx.lineTo(canvas.width * 0.4, canvas.height * 0.28);
    ctx.lineTo(canvas.width * 0.25, canvas.height * 0.35);
    ctx.fill();

    // Add some clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
      const x = canvas.width * (i * 0.2 + 0.1);
      const y = canvas.height * 0.15;
      const size = 40 + Math.random() * 30;
      
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(x + j * 20, y + Math.sin(j) * 10, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas;
  };

  useEffect(() => {
    try {
      const canvas = createMountainViewCanvas();
      if (canvas) {
        const texture = new THREE.CanvasTexture(canvas);
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

    // Only place two plants in opposite corners
    const cornerPositions = [
      [-halfWidth + 0.4, shelfHeight, -halfLength + shelfDepth], // Left back corner
      [halfWidth - 0.4, shelfHeight, -halfLength + shelfDepth],  // Right back corner
    ];

    cornerPositions.forEach((position, index) => {
      // Skip if this position would interfere with the window
      if (windowPlacement === WindowPlacement.OPPOSITE && 
          position[0] > -width/6 && position[0] < width/6) {
        return;
      }

      // Plant group
      plants.push(
        <group key={`plant-${index}`} position={position}>
          {/* Plant pot */}
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          
          {/* Plant leaves - create more natural-looking foliage */}
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

      // Shelf
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
    if (!windowTexture && !textureError) return null;

    const windowWidth = width / 3;
    const windowHeight = 1.5;
    const windowY = 1.5;
    const wallOffset = 0.01; // Reduced to align perfectly with wall
    const viewDistance = 5;

    let windowPosition: [number, number, number];
    let windowRotation: [number, number, number] = [0, 0, 0];
    let viewPosition: [number, number, number];
    let viewRotation: [number, number, number] = [0, 0, 0];

    switch (windowPlacement) {
      case WindowPlacement.RIGHT:
        windowPosition = [halfWidth - wallOffset, windowY, 0];
        windowRotation = [0, -Math.PI / 2, 0];
        viewPosition = [halfWidth + viewDistance, windowY, 0];
        viewRotation = [0, -Math.PI / 2, 0];
        break;
      case WindowPlacement.LEFT:
        windowPosition = [-halfWidth + wallOffset, windowY, 0];
        windowRotation = [0, Math.PI / 2, 0];
        viewPosition = [-halfWidth - viewDistance, windowY, 0];
        viewRotation = [0, Math.PI / 2, 0];
        break;
      default: // OPPOSITE
        windowPosition = [0, windowY, -halfLength + wallOffset];
        viewPosition = [0, windowY, -halfLength - viewDistance];
        break;
    }

    return (
      <>
        {/* Window view */}
        <mesh position={viewPosition} rotation={viewRotation}>
          <planeGeometry args={[windowWidth * 3, windowHeight * 3]} />
          <meshBasicMaterial 
            map={windowTexture}
            color={textureError ? '#87CEEB' : undefined}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Window frame */}
        <group position={windowPosition} rotation={windowRotation}>
          {/* Window glass */}
          <mesh>
            <planeGeometry args={[windowWidth, windowHeight]} />
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

          {/* Window frame */}
          <mesh>
            <boxGeometry args={[windowWidth + 0.1, windowHeight + 0.1, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Window dividers */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.05, windowHeight, 0.02]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[windowWidth, 0.05, 0.02]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </>
    );
  };

  return (
    <group className="room-fly-in">
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f3f4f6" />
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

      {/* Back wall */}
      <mesh position={[0, 1.5, -halfLength]} receiveShadow>
        <boxGeometry args={[width, 3, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-halfWidth, 1.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 3, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[halfWidth, 1.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 3, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Front wall with door opening */}
      <group position={[0, 1.5, halfLength]}>
        <mesh position={[-width / 3, 0, 0]} receiveShadow>
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[width / 3, 0, 0]} receiveShadow>
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
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