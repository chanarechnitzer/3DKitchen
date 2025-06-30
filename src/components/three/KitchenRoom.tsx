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
  const [curtainTexture, setCurtainTexture] = useState<THREE.Texture | null>(null);
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

  // Get text color based on floor darkness
  const getTextColor = () => {
    const floorColor = getFloorColor();
    const isDarkFloor = ['#64748B', '#374151', '#8B4513'].includes(floorColor);
    return isDarkFloor ? '#ffffff' : '#000000';
  };

  // Create a beautiful mountain landscape view
  const createMountainViewCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Sky gradient - beautiful blue sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.3, '#98D8E8');
    skyGradient.addColorStop(0.7, '#B8E6F0');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    const sunGradient = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.2, 0,
      canvas.width * 0.8, canvas.height * 0.2, 80
    );
    sunGradient.addColorStop(0, '#FFE55C');
    sunGradient.addColorStop(0.5, '#FFD700');
    sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = sunGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const clouds = [
      { x: 0.15, y: 0.15, size: 60 },
      { x: 0.4, y: 0.1, size: 45 },
      { x: 0.65, y: 0.25, size: 50 },
      { x: 0.85, y: 0.05, size: 35 },
    ];
    
    clouds.forEach(cloud => {
      const x = canvas.width * cloud.x;
      const y = canvas.height * cloud.y;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
          x + (i - 2) * cloud.size * 0.4, 
          y + Math.sin(i) * cloud.size * 0.2, 
          cloud.size * (0.8 + Math.random() * 0.4), 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // Distant mountains (background layer)
    ctx.fillStyle = '#B8C6DB';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.7);
    ctx.lineTo(canvas.width * 0.2, canvas.height * 0.5);
    ctx.lineTo(canvas.width * 0.4, canvas.height * 0.55);
    ctx.lineTo(canvas.width * 0.6, canvas.height * 0.45);
    ctx.lineTo(canvas.width * 0.8, canvas.height * 0.52);
    ctx.lineTo(canvas.width, canvas.height * 0.48);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Middle mountains
    ctx.fillStyle = '#8FA2B7';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.8);
    ctx.lineTo(canvas.width * 0.25, canvas.height * 0.6);
    ctx.lineTo(canvas.width * 0.5, canvas.height * 0.65);
    ctx.lineTo(canvas.width * 0.75, canvas.height * 0.55);
    ctx.lineTo(canvas.width, canvas.height * 0.62);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    // Foreground mountains
    ctx.fillStyle = '#4A6741';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height * 0.75);
    ctx.lineTo(canvas.width * 0.3, canvas.height * 0.6);
    ctx.lineTo(canvas.width * 0.7, canvas.height * 0.7);
    ctx.lineTo(canvas.width, canvas.height * 0.65);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Snow caps on peaks
    ctx.fillStyle = '#FFFFFF';
    const peaks = [
      { x: 0.3, y: 0.6, width: 0.08 },
      { x: 0.6, y: 0.45, width: 0.06 },
    ];
    
    peaks.forEach(peak => {
      ctx.beginPath();
      ctx.moveTo(canvas.width * (peak.x - peak.width), canvas.height * (peak.y + 0.05));
      ctx.lineTo(canvas.width * peak.x, canvas.height * peak.y);
      ctx.lineTo(canvas.width * (peak.x + peak.width), canvas.height * (peak.y + 0.05));
      ctx.lineTo(canvas.width * peak.x, canvas.height * (peak.y + 0.02));
      ctx.fill();
    });

    // Trees in foreground
    ctx.fillStyle = '#2D5A27';
    const trees = [
      { x: 0.1, y: 0.75, height: 0.15 },
      { x: 0.15, y: 0.78, height: 0.12 },
      { x: 0.85, y: 0.7, height: 0.18 },
      { x: 0.9, y: 0.72, height: 0.14 },
    ];
    
    trees.forEach(tree => {
      const x = canvas.width * tree.x;
      const y = canvas.height * tree.y;
      const height = canvas.height * tree.height;
      
      // Tree trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 5, y, 10, height * 0.3);
      
      // Tree foliage
      ctx.fillStyle = '#2D5A27';
      ctx.beginPath();
      ctx.arc(x, y - height * 0.2, height * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    return canvas;
  };

  // Create curtain texture
  const createCurtainCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Curtain gradient - elegant cream color
    const curtainGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    curtainGradient.addColorStop(0, '#F5F5DC');
    curtainGradient.addColorStop(0.1, '#FFFACD');
    curtainGradient.addColorStop(0.2, '#F5F5DC');
    curtainGradient.addColorStop(0.3, '#FFFACD');
    curtainGradient.addColorStop(0.4, '#F5F5DC');
    curtainGradient.addColorStop(0.5, '#FFFACD');
    curtainGradient.addColorStop(0.6, '#F5F5DC');
    curtainGradient.addColorStop(0.7, '#FFFACD');
    curtainGradient.addColorStop(0.8, '#F5F5DC');
    curtainGradient.addColorStop(0.9, '#FFFACD');
    curtainGradient.addColorStop(1, '#F5F5DC');
    
    ctx.fillStyle = curtainGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add curtain folds/pleats
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Add subtle pattern
    ctx.fillStyle = 'rgba(139, 69, 19, 0.1)';
    for (let y = 20; y < canvas.height; y += 40) {
      for (let x = 20; x < canvas.width; x += 80) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas;
  };

  useEffect(() => {
    try {
      // Create mountain view texture
      const viewCanvas = createMountainViewCanvas();
      if (viewCanvas) {
        const texture = new THREE.CanvasTexture(viewCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        setWindowTexture(texture);
      }

      // Create curtain texture
      const curtainCanvas = createCurtainCanvas();
      if (curtainCanvas) {
        const texture = new THREE.CanvasTexture(curtainCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        setCurtainTexture(texture);
      }
    } catch (error) {
      console.error('Error creating window textures:', error);
      setTextureError(true);
    }
  }, []);

  const generateMarkers = (size: number, isWidth: boolean) => {
    const markers = [];
    const textColor = getTextColor();
    
    for (let i = 0; i <= size; i++) {
      const position = (i - size / 2);

      markers.push(
        <Text
          key={`marker-${i}`}
          position={
            isWidth
              ? [position, 0.02, -halfLength + 0.2]
              : [-halfWidth + 0.2, 0.02, position]
          }
          rotation={[-Math.PI / 2, 0, isWidth ? 0 : Math.PI / 2]}
          color={textColor}
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
                  ? [subPosition, 0.02, -halfLength + 0.2]
                  : [-halfWidth + 0.2, 0.02, subPosition]
              }
              rotation={[-Math.PI / 2, 0, isWidth ? 0 : Math.PI / 2]}
            >
              <planeGeometry args={[0.01, lineHeight]} />
              <meshStandardMaterial color={textColor} />
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
    const windowWidth = 1.4;
    const windowHeight = 1.4;
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
        {/* Window frame - clean and simple */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[windowWidth, windowHeight, 0.08]} />
          <meshStandardMaterial color="#2D1B14" />
        </mesh>

        {/* Beautiful mountain view - CONTAINED within frame */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[windowWidth - 0.15, windowHeight - 0.15]} />
          <meshBasicMaterial 
            map={windowTexture}
            side={THREE.DoubleSide}
            toneMapped={false}
            color={textureError ? "#87CEEB" : "white"}
          />
        </mesh>

        {/* Glass effect - CONTAINED within frame */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[windowWidth - 0.15, windowHeight - 0.15]} />
          <meshPhysicalMaterial 
            transparent
            opacity={0.15}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Curtains - elegant and flowing - CONTAINED within window area */}
        <group position={[0, 0, 0.05]}>
          {/* Left curtain - ONLY covers part of window */}
          <mesh position={[-windowWidth * 0.35, 0, 0]}>
            <planeGeometry args={[windowWidth * 0.25, windowHeight - 0.2]} />
            <meshStandardMaterial 
              map={curtainTexture}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Right curtain - ONLY covers part of window */}
          <mesh position={[windowWidth * 0.35, 0, 0]}>
            <planeGeometry args={[windowWidth * 0.25, windowHeight - 0.2]} />
            <meshStandardMaterial 
              map={curtainTexture}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Curtain rod - CONTAINED within window frame - SMALLER and INSIDE */}
          <mesh position={[0, windowHeight * 0.35, 0.02]}>
            <cylinderGeometry args={[0.012, 0.012, windowWidth * 0.7, 16]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>

          {/* Curtain rod ends - CONTAINED within window frame - SMALLER */}
          <mesh position={[-windowWidth * 0.35, windowHeight * 0.35, 0.02]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[windowWidth * 0.35, windowHeight * 0.35, 0.02]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>

        {/* Window sill - CONTAINED within window area */}
        <mesh position={[0, -windowHeight * 0.5 - 0.05, 0.04]}>
          <boxGeometry args={[windowWidth + 0.1, 0.1, 0.15]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
      </group>
    );
  };
  
  const wallColor = getWallColor();
  const floorColor = getFloorColor();
  const textColor = getTextColor();
  
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

      {/* Beautiful window - NO cross frame! Clean and simple */}
      {renderWindow()}

      {/* Measurement markers with adaptive color */}
      {generateMarkers(width, true)}
      {generateMarkers(length, false)}

      {/* Dimension labels with adaptive color */}
      <Text
        position={[0, 0.02, -halfLength + 0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        color={textColor}
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
      >
        {`${width} מ'`}
      </Text>

      <Text
        position={[-halfWidth + 0.4, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        color={textColor}
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