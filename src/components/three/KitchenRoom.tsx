import React, { useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import { TextureLoader } from 'three';
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

  useEffect(() => {
    const textureLoader = new TextureLoader();
    textureLoader.load(
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
      (texture) => {
        texture.encoding = 3001; // sRGBEncoding
        texture.flipY = false;
        setWindowTexture(texture);
      }
    );
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

  const renderPlant = (position: [number, number, number], scale: number = 1) => (
    <group position={position}>
      {/* Plant pot */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1 * scale, 0.08 * scale, 0.15 * scale, 16]} />
        <meshStandardMaterial color="#964B00" />
      </mesh>
      
      {/* Plant base */}
      <mesh position={[0, 0.1 * scale, 0]} castShadow>
        <sphereGeometry args={[0.15 * scale, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2F4538" />
      </mesh>
      
      {/* Plant leaves */}
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI * 0.4) * 0.1 * scale,
            0.15 * scale + Math.random() * 0.1 * scale,
            Math.cos(i * Math.PI * 0.4) * 0.1 * scale
          ]}
          rotation={[
            Math.random() * 0.5,
            i * Math.PI * 0.4,
            Math.PI * 0.25 + Math.random() * 0.2
          ]}
          castShadow
        >
          <sphereGeometry args={[0.1 * scale, 8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
  );

  const renderShelf = (position: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) => (
    <group position={position} rotation={rotation}>
      {/* Shelf board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 0.05, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Shelf brackets */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, -0.05, 0]} castShadow>
          <boxGeometry args={[0.05, 0.15, 0.3]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
      ))}
      
      {/* Plants on shelf */}
      {renderPlant([-0.3, 0.025, 0], 0.8)}
      {renderPlant([0.3, 0.025, 0], 0.9)}
    </group>
  );

  const renderWindow = () => {
    if (!windowTexture) return null;

    const windowWidth = width / 3;
    const windowHeight = 1.5;
    const windowY = 1.5;
    const wallOffset = 0.1;
    const windowDepth = 0.2;

    let windowPosition: [number, number, number];
    let windowRotation: [number, number, number] = [0, 0, 0];
    let backgroundPosition: [number, number, number];
    let backgroundRotation: [number, number, number] = [0, 0, 0];

    switch (windowPlacement) {
      case WindowPlacement.RIGHT:
        windowPosition = [halfWidth - wallOffset, windowY, 0];
        windowRotation = [0, -Math.PI / 2, 0];
        backgroundPosition = [halfWidth + windowDepth, windowY, 0];
        backgroundRotation = [0, -Math.PI / 2, 0];
        break;
      case WindowPlacement.LEFT:
        windowPosition = [-halfWidth + wallOffset, windowY, 0];
        windowRotation = [0, Math.PI / 2, 0];
        backgroundPosition = [-halfWidth - windowDepth, windowY, 0];
        backgroundRotation = [0, Math.PI / 2, 0];
        break;
      default: // OPPOSITE
        windowPosition = [0, windowY, -halfLength + wallOffset];
        backgroundPosition = [0, windowY, -halfLength - windowDepth];
        break;
    }

    return (
      <>
        {/* Window background (mountain view) */}
        <mesh position={backgroundPosition} rotation={backgroundRotation}>
          <planeGeometry args={[windowWidth * 1.5, windowHeight * 1.5]} />
          <meshBasicMaterial 
            map={windowTexture} 
            toneMapped={false}
          />
        </mesh>

        {/* Window frame */}
        <group position={windowPosition} rotation={windowRotation}>
          <mesh>
            <boxGeometry args={[windowWidth + 0.1, windowHeight + 0.1, 0.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          
          {/* Window glass */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[windowWidth - 0.1, windowHeight - 0.1]} />
            <meshStandardMaterial 
              transparent 
              opacity={0.1}
              color="#ffffff"
            />
          </mesh>
        </group>
      </>
    );
  };

  return (
    <group className="room-fly-in">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      <gridHelper
        args={[width, Math.ceil(width) * 2, '#d1d5db', '#d1d5db']}
        position={[0, 0.001, 0]}
      />
      <gridHelper
        args={[length, Math.ceil(length) * 2, '#d1d5db', '#d1d5db']}
        position={[0, 0.001, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <mesh position={[0, 1.5, -halfLength]} receiveShadow>
        <boxGeometry args={[width, 3, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <mesh
        position={[-halfWidth, 1.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 3, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <mesh
        position={[halfWidth, 1.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[length, 3, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <group position={[0, 1.5, halfLength]}>
        <mesh position={[-width / 3, 0, 0]} receiveShadow>
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[width / 3, 0, 0]} receiveShadow>
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.9, 2.5, 0.05]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
      </group>

      {renderWindow()}

      {/* Decorative shelves with plants */}
      {renderShelf([-halfWidth + 0.2, 2.2, -halfLength + 0.2], [0, Math.PI / 4, 0])}
      {renderShelf([halfWidth - 0.2, 2.2, -halfLength + 0.2], [0, -Math.PI / 4, 0])}

      {generateMarkers(width, true)}
      {generateMarkers(length, false)}

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