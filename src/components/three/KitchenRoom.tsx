import React from 'react';
import { Text } from '@react-three/drei';

interface KitchenRoomProps {
  width: number;
  length: number;
}

const KitchenRoom: React.FC<KitchenRoomProps> = ({ width, length }) => {
  const halfWidth = width / 2;
  const halfLength = length / 2;

  // Generate meter markers - positioned inside the room
  const generateMarkers = (size: number, isWidth: boolean) => {
    const markers = [];
    for (let i = 0; i <= size; i++) {
      const position = (i - size / 2);

      // Number markers inside the room
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

      // Tick marks between numbers
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

  return (
    <group className="room-fly-in">
      {/* Floor with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {/* Grid lines */}
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

      {/* Back wall with window */}
      <group position={[0, 1.5, -halfLength]}>
        <mesh position={[0, 0.75, 0]} receiveShadow>
          <boxGeometry args={[width, 1.5, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.75, 0]} receiveShadow>
          <boxGeometry args={[width, 1.5, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[width / 3, 1.5]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width / 3 + 0.1, 1.6, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

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

      {/* Front wall with door */}
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
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[1, 2.6, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Measurement markers */}
      {generateMarkers(width, true)}
      {generateMarkers(length, false)}

      {/* Main dimension labels */}
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
