import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import KitchenRoom from './three/KitchenRoom';
import DraggableObject from './three/DraggableObject';
import TriangleLines from './three/TriangleLines';
import DistanceLines from './three/DistanceLines';
import SnapGuides from './three/SnapGuides';
import { useKitchen, WindowPlacement } from '../store/KitchenContext';

interface KitchenSceneProps {
  windowPlacement: WindowPlacement;
}

const KitchenScene: React.FC<KitchenSceneProps> = ({ windowPlacement }) => {
  const { 
    kitchenDimensions, 
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
  const [snapPosition, setSnapPosition] = useState<{ x: number, z: number } | null>(null);
  const [itemRotation, setItemRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);
  const worldPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Enhanced snap to wall logic with rotation - allowing items to be flush against walls
  const getSnapPosition = (x: number, z: number) => {
    const snapDistance = 0.05; // Very close to wall - almost touching
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfDepth = selectedItem ? selectedItem.dimensions.depth / 2 : 0.3;
    
    let snapX = x;
    let snapZ = z;
    let snapped = false;
    let rotation = 0;

    // Snap to left wall (facing right) - item flush against wall
    if (Math.abs(x - (-halfWidth + snapDistance + itemHalfDepth)) < 0.5) {
      snapX = -halfWidth + snapDistance + itemHalfDepth;
      rotation = Math.PI / 2; // Face right
      snapped = true;
    } 
    // Snap to right wall (facing left) - item flush against wall
    else if (Math.abs(x - (halfWidth - snapDistance - itemHalfDepth)) < 0.5) {
      snapX = halfWidth - snapDistance - itemHalfDepth;
      rotation = -Math.PI / 2; // Face left
      snapped = true;
    }

    // Snap to back wall (facing forward) - item flush against wall
    if (Math.abs(z - (-halfLength + snapDistance + itemHalfDepth)) < 0.5) {
      snapZ = -halfLength + snapDistance + itemHalfDepth;
      rotation = 0; // Face forward
      snapped = true;
    } 
    // Snap to front wall (facing back) - item flush against wall
    else if (Math.abs(z - (halfLength - snapDistance - itemHalfDepth)) < 0.5) {
      snapZ = halfLength - snapDistance - itemHalfDepth;
      rotation = Math.PI; // Face back
      snapped = true;
    }

    return snapped ? { x: snapX, z: snapZ, rotation } : null;
  };

  // Validate position to prevent going into walls - strict boundaries
  const validatePosition = (x: number, z: number) => {
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem ? selectedItem.dimensions.width / 2 : 0.3;
    const itemHalfDepth = selectedItem ? selectedItem.dimensions.depth / 2 : 0.3;
    
    // Prevent going into walls by keeping item boundaries inside room with small margin
    const margin = 0.05; // Small margin to prevent clipping
    const minX = -halfWidth + itemHalfWidth + margin;
    const maxX = halfWidth - itemHalfWidth - margin;
    const minZ = -halfLength + itemHalfDepth + margin;
    const maxZ = halfLength - itemHalfDepth - margin;
    
    return {
      x: Math.min(Math.max(minX, x), maxX),
      z: Math.min(Math.max(minZ, z), maxZ)
    };
  };

  useEffect(() => {
    if (selectedItem) {
      const validatedPos = validatePosition(position.x, position.z);
      const snap = getSnapPosition(validatedPos.x, validatedPos.z);
      setSnapPosition(snap);
      
      if (snap) {
        setItemRotation(snap.rotation);
      } else {
        setItemRotation(0);
      }
      
      const finalPos = snap || validatedPos;
      const validation = getDragValidation(
        new THREE.Vector3(finalPos.x, 0, finalPos.z),
        selectedItem.type
      );
      setDragValidation(validation);
    } else {
      setDragValidation({ isValid: true, distances: {} });
      setSnapPosition(null);
      setItemRotation(0);
    }
  }, [position, selectedItem, getDragValidation]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  const convertToWorldPosition = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const camera = controlsRef.current?.object;
    if (!camera) return null;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    raycaster.ray.intersectPlane(plane, worldPosRef.current);

    return worldPosRef.current.clone();
  };

  const handlePlaceItem = () => {
    if (selectedItem) {
      const finalPos = snapPosition || validatePosition(position.x, position.z);
      placeItem(
        selectedItem.id, 
        new THREE.Vector3(finalPos.x, 0, finalPos.z),
        itemRotation
      );
      setSelectedItem(null);
      setIsDragging(false);
      setSnapPosition(null);
      setItemRotation(0);
      
      // Haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!canvasRef.current || !selectedItem) return;
    
    setIsDragging(true);
    const worldPos = convertToWorldPosition(event.clientX, event.clientY);
    if (!worldPos) return;

    const validatedPos = validatePosition(worldPos.x, worldPos.z);
    setPosition({ x: validatedPos.x, z: validatedPos.z });
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!canvasRef.current || !selectedItem) return;
    
    event.preventDefault();
    setIsDragging(true);
    
    const touch = event.touches[0];
    const worldPos = convertToWorldPosition(touch.clientX, touch.clientY);
    if (!worldPos) return;

    const validatedPos = validatePosition(worldPos.x, worldPos.z);
    setPosition({ x: validatedPos.x, z: validatedPos.z });
  };

  const finalPosition = snapPosition || validatePosition(position.x, position.z);

  return (
    <div 
      className="w-full h-full relative"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePlaceItem}
      onClick={selectedItem ? handlePlaceItem : undefined}
    >
      <Canvas 
        ref={canvasRef}
        camera={{ position: [0, 8, 8], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
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
            rotation={item.rotation || 0}
          />
        ))}
        
        {selectedItem && (
          <>
            <DraggableObject
              position={[finalPosition.x, 0, finalPosition.z]}
              type={selectedItem.type}
              isPlaced={false}
              dimensions={selectedItem.dimensions}
              rotation={itemRotation}
            />
            <SnapGuides
              position={new THREE.Vector3(finalPosition.x, 0, finalPosition.z)}
              kitchenDimensions={kitchenDimensions}
              isSnapped={!!snapPosition}
            />
            <DistanceLines
              position={new THREE.Vector3(finalPosition.x, 0, finalPosition.z)}
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
          maxPolarAngle={Math.PI / 2.2}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
      
      {/* Placement Instructions */}
      {selectedItem && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md mx-4 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                dragValidation.isValid ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}>
                {selectedItem.type === 'sink' ? '💧' : selectedItem.type === 'stove' ? '🔥' : selectedItem.type === 'refrigerator' ? '❄️' : '📦'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">
                  {snapPosition ? '🧲 נצמד לקיר' : 'גרור למיקום הרצוי'}
                </p>
              </div>
            </div>
            
            {Object.keys(dragValidation.distances).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(dragValidation.distances).map(([key, distance]) => (
                  <div 
                    key={key}
                    className={`p-3 rounded-xl border-2 ${
                      distance > 1.2 && distance < 5 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <p className="text-xs font-medium">{key}</p>
                    <p className="text-lg font-bold">{distance.toFixed(2)}מ'</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>לחץ כדי למקם</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenScene;