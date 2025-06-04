import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import KitchenRoom from './three/KitchenRoom';
import DraggableObject from './three/DraggableObject';
import TriangleLines from './three/TriangleLines';
import DistanceLines from './three/DistanceLines';
import { useKitchen } from '../store/KitchenContext';

const KitchenScene: React.FC = () => {
  const { 
    kitchenDimensions, 
    windowPlacement,
    placedItems, 
    selectedItem,
    setSelectedItem,
    placeItem,
    triangleValidation,
    getDragValidation
  } = useKitchen();
  
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [dragValidation, setDragValidation] = useState<{ isValid: boolean; distances: { [key: string]: number } }>({ isValid: true, distances: {} });
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (selectedItem) {
      const validation = getDragValidation(
        new THREE.Vector3(position.x, 0, position.z),
        selectedItem.type
      );
      setDragValidation(validation);
    } else {
      setDragValidation({ isValid: true, distances: {} });
    }
  }, [position, selectedItem, getDragValidation]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  const handlePlaceItem = () => {
    if (selectedItem) {
      placeItem(
        selectedItem.id, 
        new THREE.Vector3(position.x, 0, position.z)
      );
      setSelectedItem(null);
      setIsDragging(false);
      document.body.style.cursor = 'auto';
    }
  };

  const getScreenPosition = (worldX: number, worldZ: number) => {
    if (!canvasRef.current) return null;

    const camera = controlsRef.current?.object;
    if (!camera) return null;

    const vector = new THREE.Vector3(worldX, 0, worldZ);
    vector.project(camera);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (vector.x + 1) * rect.width / 2 + rect.left,
      y: (-vector.y + 1) * rect.height / 2 + rect.top
    };
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!canvasRef.current || !selectedItem) return;
    
    setIsDragging(true);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const mouseZ = ((event.clientY - canvasRect.top) / canvasRect.height) * 2 - 1;
    
    const maxX = kitchenDimensions.width / 2;
    const maxZ = kitchenDimensions.length / 2;
    
    const newX = Math.min(Math.max(-maxX, mouseX * maxX), maxX);
    const newZ = Math.min(Math.max(-maxZ, mouseZ * maxZ), maxZ);
    
    setPosition({ x: newX, z: newZ });

    const screenPos = getScreenPosition(newX, newZ);
    if (screenPos) {
      setCursorPosition(screenPos);
    }
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
    const touchZ = ((touch.clientY - canvasRect.top) / canvasRect.height) * 2 - 1;
    
    const maxX = kitchenDimensions.width / 2;
    const maxZ = kitchenDimensions.length / 2;
    
    const newX = Math.min(Math.max(-maxX, touchX * maxX), maxX);
    const newZ = Math.min(Math.max(-maxZ, touchZ * maxZ), maxZ);
    
    setPosition({ x: newX, z: newZ });

    const screenPos = getScreenPosition(newX, newZ);
    if (screenPos) {
      setCursorPosition(screenPos);
    }
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
          windowPlacement={windowPlacement}
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
          <>
            <DraggableObject
              position={[position.x, 0, position.z]}
              type={selectedItem.type}
              isPlaced={false}
              dimensions={selectedItem.dimensions}
            />
            <DistanceLines
              position={new THREE.Vector3(position.x, 0, position.z)}
              placedItems={placedItems}
              type={selectedItem.type}
            />
          </>
        )}
        
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
              border: `2px solid ${dragValidation.isValid ? '#22c55e' : '#ef4444'}`,
              borderRadius: '50%',
              backgroundColor: dragValidation.isValid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            }}
          />
          <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-md p-4 text-center space-y-2">
            <p className="font-medium">
              לחץ במקום המבוקש כדי למקם את {selectedItem.name}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(dragValidation.distances).map(([key, distance]) => (
                <div 
                  key={key}
                  className={`p-2 rounded ${
                    distance > 1.2 && distance < 5 
                      ? 'bg-success/10 text-success' 
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  <p className="text-sm">{key}</p>
                  <p className="font-bold">{distance.toFixed(2)} מ'</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KitchenScene;