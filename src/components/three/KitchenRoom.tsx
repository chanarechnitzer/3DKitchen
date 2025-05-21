import React from 'react';
import { Text } from '@react-three/drei';

interface KitchenRoomProps {
  width: number;
  length: number;
}

const KitchenRoom: React.FC<KitchenRoomProps> = ({ width, length }) => {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  
  // Generate meter markers
  const generateMarkers = (size: number, isWidth: boolean) => {
    const markers = [];
    for (let i = 0; i <= size; i++) {
      const position = (i - size / 2);
      markers.push(
        <Text
          key={`marker-${i}`}
          position={isWidth ? [position, 0.05, -halfLength + 0.1] : [-halfWidth + 0.1, 0.05, position]}
          rotation={[-Math.PI / 2, 0, isWidth ? 0 : Math.PI / 2]}
          color="black"
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
        >
          {i}
        </Text>
      );

      // Add marker lines
      if (i < size) {
        markers.push(
          <mesh
            key={`line-${i}`}
            position={isWidth ? [position + 0.5, 0.01, -halfLength + 0.1] : [-halfWidth + 0.1, 0.01, position + 0.5]}
            rotation={[-Math.PI / 2, 0, isWidth ? 0 : Math.PI / 2]}
          >
            <planeGeometry args={[0.05, 0.2]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
        );
      }
    }
    return markers;
  };
  
  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#e5e7eb" />
        
        {/* Grid lines */}
        <gridHelper args={[width, Math.ceil(width), '#9ca3af', '#9ca3af']} />
        <gridHelper args={[length, Math.ceil(length), '#9ca3af', '#9ca3af']} rotation={[0, Math.PI / 2, 0]} />
      </mesh>
      
      {/* Walls */}
      {/* Back wall */}
      <mesh 
        position={[0, 1.5, -halfLength]} 
        receiveShadow
      >
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
      
      {/* Right wall with window */}
      <group position={[halfWidth, 1.5, 0]}>
        {/* Upper wall section */}
        <mesh 
          position={[0, 0.75, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[length, 1.5, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        
        {/* Lower wall section */}
        <mesh 
          position={[0, -0.75, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[length, 1.5, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        
        {/* Window */}
        <mesh
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[length / 3, 1.5]} />
          <meshStandardMaterial 
            color="#93c5fd" 
            transparent 
            opacity={0.7} 
          />
        </mesh>
        
        {/* Window frame */}
        <mesh
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[length / 3 + 0.1, 1.5 + 0.1, 0.05]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      
      {/* Front wall with door */}
      <group position={[0, 1.5, halfLength]}>
        {/* Left section */}
        <mesh 
          position={[-width / 3, 0, 0]}
          receiveShadow
        >
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        
        {/* Right section */}
        <mesh 
          position={[width / 3, 0, 0]}
          receiveShadow
        >
          <boxGeometry args={[width / 3, 3, 0.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        
        {/* Door */}
        <mesh
          position={[0, -0.25, 0]}
        >
          <boxGeometry args={[0.9, 2.5, 0.05]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
        
        {/* Door frame */}
        <mesh
          position={[0, -0.25, 0]}
        >
          <boxGeometry args={[1, 2.6, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      
      {/* Measurement markers */}
      {generateMarkers(width, true)}
      {generateMarkers(length, false)}
      
      {/* Main dimension labels */}
      <Text
        position={[0, 0.05, -halfLength + 0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="black"
        fontSize={0.25}
        anchorX="center"
        anchorY="middle"
      >
        {`${width} מ'`}
      </Text>
      
      <Text
        position={[-halfWidth + 0.3, 0.05, 0]}
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