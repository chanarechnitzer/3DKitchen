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
  showTriangle?: boolean;
}

const KitchenScene: React.FC<KitchenSceneProps> = ({ 
  windowPlacement, 
  showTriangle = false
}) => {
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
  const [showRotationHint, setShowRotationHint] = useState(false);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);
  const worldPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // NEW: Check for collisions with other items
  const checkCollisions = (x: number, z: number, itemWidth: number, itemDepth: number) => {
    const itemHalfWidth = itemWidth / 2;
    const itemHalfDepth = itemDepth / 2;
    
    for (const placedItem of placedItems) {
      const placedHalfWidth = placedItem.dimensions.width / 2;
      const placedHalfDepth = placedItem.dimensions.depth / 2;
      
      // Check if bounding boxes overlap
      const xOverlap = Math.abs(x - placedItem.position.x) < (itemHalfWidth + placedHalfWidth);
      const zOverlap = Math.abs(z - placedItem.position.z) < (itemHalfDepth + placedHalfDepth);
      
      if (xOverlap && zOverlap) {
        return placedItem.name; // Return the name of the colliding item
      }
    }
    return null;
  };

  // NEW: Smart snapping to walls AND other items
  const getSnapPosition = (x: number, z: number) => {
    if (!selectedItem) return null;
    
    const snapDistance = 0.05;
    const itemSnapDistance = 0.02; // Distance for snapping to other items
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem.dimensions.width / 2;
    const itemHalfDepth = selectedItem.dimensions.depth / 2;
    const cornerThreshold = 0.8;
    
    let snapX = x;
    let snapZ = z;
    let snapped = false;
    let rotation = 0;
    let snapType = '';

    // First, check for snapping to other items
    for (const placedItem of placedItems) {
      const placedHalfWidth = placedItem.dimensions.width / 2;
      const placedHalfDepth = placedItem.dimensions.depth / 2;
      
      // Snap to right side of placed item
      const rightSnapX = placedItem.position.x + placedHalfWidth + itemHalfWidth + itemSnapDistance;
      if (Math.abs(x - rightSnapX) < 0.3 && Math.abs(z - placedItem.position.z) < 0.5) {
        snapX = rightSnapX;
        snapZ = placedItem.position.z;
        snapped = true;
        snapType = `נצמד ל${placedItem.name}`;
        setShowRotationHint(false);
        break;
      }
      
      // Snap to left side of placed item
      const leftSnapX = placedItem.position.x - placedHalfWidth - itemHalfWidth - itemSnapDistance;
      if (Math.abs(x - leftSnapX) < 0.3 && Math.abs(z - placedItem.position.z) < 0.5) {
        snapX = leftSnapX;
        snapZ = placedItem.position.z;
        snapped = true;
        snapType = `נצמד ל${placedItem.name}`;
        setShowRotationHint(false);
        break;
      }
      
      // Snap to front of placed item
      const frontSnapZ = placedItem.position.z + placedHalfDepth + itemHalfDepth + itemSnapDistance;
      if (Math.abs(z - frontSnapZ) < 0.3 && Math.abs(x - placedItem.position.x) < 0.5) {
        snapX = placedItem.position.x;
        snapZ = frontSnapZ;
        snapped = true;
        snapType = `נצמד ל${placedItem.name}`;
        setShowRotationHint(false);
        break;
      }
      
      // Snap to back of placed item
      const backSnapZ = placedItem.position.z - placedHalfDepth - itemHalfDepth - itemSnapDistance;
      if (Math.abs(z - backSnapZ) < 0.3 && Math.abs(x - placedItem.position.x) < 0.5) {
        snapX = placedItem.position.x;
        snapZ = backSnapZ;
        snapped = true;
        snapType = `נצמד ל${placedItem.name}`;
        setShowRotationHint(false);
        break;
      }
    }

    // If not snapped to items, check wall snapping
    if (!snapped) {
      const isNearLeftWall = Math.abs(x - (-halfWidth + snapDistance + itemHalfDepth)) < cornerThreshold;
      const isNearRightWall = Math.abs(x - (halfWidth - snapDistance - itemHalfDepth)) < cornerThreshold;
      const isNearBackWall = Math.abs(z - (-halfLength + snapDistance + itemHalfDepth)) < cornerThreshold;
      const isNearFrontWall = Math.abs(z - (halfLength - snapDistance - itemHalfDepth)) < cornerThreshold;

      // Corner snapping with rotation options
      if (isNearLeftWall && isNearBackWall) {
        snapX = -halfWidth + snapDistance + itemHalfDepth;
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = itemRotation;
        snapped = true;
        snapType = 'פינה שמאל-אחור';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearBackWall) {
        snapX = halfWidth - snapDistance - itemHalfDepth;
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = itemRotation;
        snapped = true;
        snapType = 'פינה ימין-אחור';
        setShowRotationHint(true);
      } else if (isNearLeftWall && isNearFrontWall) {
        snapX = -halfWidth + snapDistance + itemHalfDepth;
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = itemRotation;
        snapped = true;
        snapType = 'פינה שמאל-קדמי';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearFrontWall) {
        snapX = halfWidth - snapDistance - itemHalfDepth;
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = itemRotation;
        snapped = true;
        snapType = 'פינה ימין-קדמי';
        setShowRotationHint(true);
      }
      // Wall snapping (not corners)
      else if (isNearLeftWall) {
        snapX = -halfWidth + snapDistance + itemHalfDepth;
        rotation = Math.PI / 2;
        snapped = true;
        snapType = 'קיר שמאל';
        setShowRotationHint(false);
      } else if (isNearRightWall) {
        snapX = halfWidth - snapDistance - itemHalfDepth;
        rotation = -Math.PI / 2;
        snapped = true;
        snapType = 'קיר ימין';
        setShowRotationHint(false);
      } else if (isNearBackWall) {
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = 0;
        snapped = true;
        snapType = 'קיר אחורי';
        setShowRotationHint(false);
      } else if (isNearFrontWall) {
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = Math.PI;
        snapped = true;
        snapType = 'קיר קדמי';
        setShowRotationHint(false);
      } else {
        setShowRotationHint(false);
      }
    }

    return snapped ? { x: snapX, z: snapZ, rotation, snapType } : null;
  };

  // Handle rotation toggle for corner positions
  const handleRotationToggle = () => {
    if (showRotationHint) {
      const currentRotation = itemRotation;
      let newRotation = currentRotation + Math.PI / 2;
      
      if (newRotation >= Math.PI * 2) {
        newRotation = 0;
      }
      
      setItemRotation(newRotation);
    }
  };

  // Validate position to prevent going into walls
  const validatePosition = (x: number, z: number) => {
    if (!selectedItem) return { x, z };
    
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem.dimensions.width / 2;
    const itemHalfDepth = selectedItem.dimensions.depth / 2;
    
    const margin = 0.05;
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
      
      // Only update rotation if not in corner (let user control corner rotation)
      if (snap && !showRotationHint) {
        setItemRotation(snap.rotation);
      }
      
      const finalPos = snap || validatedPos;
      
      // Check for collisions
      const collision = checkCollisions(
        finalPos.x, 
        finalPos.z, 
        selectedItem.dimensions.width, 
        selectedItem.dimensions.depth
      );
      setCollisionWarning(collision);
      
      const validation = getDragValidation(
        new THREE.Vector3(finalPos.x, 0, finalPos.z),
        selectedItem.type
      );
      setDragValidation(validation);
    } else {
      setDragValidation({ isValid: true, distances: {} });
      setSnapPosition(null);
      setItemRotation(0);
      setShowRotationHint(false);
      setCollisionWarning(null);
    }
  }, [position, selectedItem, getDragValidation, itemRotation, placedItems]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  // Add keyboard listener for rotation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === 'r' || event.key === 'R' || event.key === 'ר') && showRotationHint) {
        event.preventDefault();
        handleRotationToggle();
      }
    };

    if (selectedItem && showRotationHint) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedItem, showRotationHint, itemRotation]);

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
    if (selectedItem && !collisionWarning) {
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
      setShowRotationHint(false);
      setCollisionWarning(null);
      
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
        
        {triangleValidation && showTriangle && (
          <TriangleLines 
            placedItems={placedItems} 
            isValid={triangleValidation.isValid}
            showTriangle={showTriangle}
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
      
      {/* Placement Instructions with collision detection */}
      {selectedItem && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md mx-4 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                collisionWarning 
                  ? 'bg-gradient-to-br from-red-400 to-red-600' 
                  : dragValidation.isValid 
                    ? 'bg-gradient-to-br from-green-400 to-green-600' 
                    : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
              }`}>
                {selectedItem.type === 'sink' ? '💧' : selectedItem.type === 'stove' ? '🔥' : selectedItem.type === 'oven' ? '♨️' : selectedItem.type === 'refrigerator' ? '❄️' : '📦'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">
                  {collisionWarning 
                    ? `⚠️ חוסם את ${collisionWarning}` 
                    : snapPosition 
                      ? `🧲 ${snapPosition.snapType || 'נצמד'}` 
                      : 'גרור למיקום הרצוי'
                  }
                </p>
              </div>
            </div>
            
            {/* Collision Warning */}
            {collisionWarning && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">
                  🚫 לא ניתן למקם כאן
                </p>
                <p className="text-xs text-red-600">
                  הרכיב חוסם את {collisionWarning}. בחר מיקום אחר.
                </p>
              </div>
            )}
            
            {/* Rotation hint for corners */}
            {showRotationHint && !collisionWarning && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  🔄 פינה זוהתה!
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  לחץ R או לחץ כאן כדי לסובב את החזית
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRotationToggle();
                  }}
                  className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  🔄 סובב חזית ({Math.round(itemRotation * 180 / Math.PI)}°)
                </button>
              </div>
            )}
            
            {Object.keys(dragValidation.distances).length > 0 && !collisionWarning && (
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
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                collisionWarning ? 'bg-red-500' : 'bg-primary'
              }`}></div>
              <span>{collisionWarning ? 'בחר מיקום אחר' : 'לחץ כדי למקם'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenScene;