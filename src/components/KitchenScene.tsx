import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import KitchenRoom from './three/KitchenRoom';
import DraggableObject from './three/DraggableObject';
import TriangleLines from './three/TriangleLines';
import { useKitchen } from '../store/KitchenContext';

const KitchenScene: React.FC = () => {
  const { 
    kitchenDimensions, 
    placedItems, 
    selectedItem,
    setSelectedItem,
    placeItem,
    triangleValidation
  } = useKitchen();
  
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [distances, setDistances] = useState<{ [key: string]: number }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (selectedItem && placedItems.length > 0) {
      const newDistances: { [key: string]: number } = {};
      
      placedItems.forEach(item => {
        const dx = position.x - item.position.x;
        const dz = position.z - item.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        newDistances[item.id] = distance;
      });
      
      setDistances(newDistances);
    } else {
      setDistances({});
    }
  }, [position, selectedItem, placedItems]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  const handlePlaceItem = () => {
    if (selectedItem) {
      placeItem(
        selectedItem.id, 
        { x: position.x, y: 0, z: position.z }
      );
      setSelectedItem(null);
      setIsDragging(false);
      document.body.style.cursor = 'auto';
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!canvasRef.current || !selectedItem) return;
    
    setIsDragging(true);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const mouseZ = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    
    const maxX = kitchenDimensions.width / 2;
    const maxZ = kitchenDimensions.length / 2;
    
    const newX = Math.min(Math.max(-maxX, mouseX * maxX), maxX);
    const newZ = Math.min(Math.max(-maxZ, mouseZ * maxZ), maxZ);
    
    setPosition({ x: newX, z: newZ });
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      document.body.style.cursor = 'auto';
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!canvasRef.current || !selectedItem) return;
    
    event.preventDefault();
    setIsDragging(true);
    
    const touch = event.touches[0];
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const touchX = ((touch.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const touchZ = -((touch.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    
    const maxX = kitchenDimensions.width / 2;
    const maxZ = kitchenDimensions.length / 2;
    
    const newX = Math.min(Math.max(-maxX, touchX * maxX), maxX);
    const newZ = Math.min(Math.max(-maxZ, touchZ * maxZ), maxZ);
    
    setPosition({ x: newX, z: newZ });
    setCursorPosition({ x: touch.clientX, y: touch.clientY });
  };

  return (
    <div 
      className="w-full h-full relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePlaceItem}
      onClick={selectedItem ? handlePlaceItem : undefined}
    >
      <Canvas 
        ref={canvasRef}
        camera={{ position: [0, 5, 5], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        <KitchenRoom 
          width={kitchenDimensions.width} 
          length={kitchenDimensions.length} 
        />
        
        {placedItems.map(item => (
          <DraggableObject
            key={item.id}
            position={[item.position.x, 0, item.position.z]}
            type={item.type}
            isPlaced={true}
            dimensions={item.dimensions}
          />
        ))}
        
        {selectedItem && (
          <DraggableObject
            position={[position.x, 0, position.z]}
            type={selectedItem.type}
            isPlaced={false}
            dimensions={selectedItem.dimensions}
          />
        )}
        
        {selectedItem && Object.entries(distances).map(([itemId, distance]) => {
          const item = placedItems.find(i => i.id === itemId);
          if (!item) return null;
          
          const midX = (position.x + item.position.x) / 2;
          const midZ = (position.z + item.position.z) / 2;
          
          return (
            <Text
              key={`distance-${itemId}`}
              position={[midX, 0.5, midZ]}
              color="black"
              fontSize={0.15}
              anchorX="center"
              anchorY="middle"
              rotation={[Math.PI / -2, 0, 0]}
            >
              {`${distance.toFixed(2)} מ'`}
            </Text>
          );
        })}
        
        {triangleValidation && (
          <TriangleLines 
            placedItems={placedItems} 
            isValid={triangleValidation.isValid} 
          />
        )}
        
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {selectedItem && (
        <>
          <div 
            className="absolute pointer-events-none"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              border: '2px solid #e3a92b',
              borderRadius: '50%',
              backgroundColor: 'rgba(227, 169, 43, 0.2)',
            }}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-80 p-2 rounded text-center">
            לחץ במקום המבוקש כדי למקם את {selectedItem.name}
          </div>
        </>
      )}
    </div>
  );
};

export default KitchenScene;