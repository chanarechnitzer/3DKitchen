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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);
  const worldPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // FIXED: Enhanced snap to wall logic with proper corner detection
  const getSnapPosition = (x: number, z: number) => {
    const snapDistance = 0.05;
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfDepth = selectedItem ? selectedItem.dimensions.depth / 2 : 0.3;
    const cornerThreshold = 0.8; // Increased threshold for better corner detection
    
    let snapX = x;
    let snapZ = z;
    let snapped = false;
    let rotation = 0;

    // FIXED: Better corner detection logic
    const isNearLeftWall = Math.abs(x - (-halfWidth + snapDistance + itemHalfDepth)) < cornerThreshold;
    const isNearRightWall = Math.abs(x - (halfWidth - snapDistance - itemHalfDepth)) < cornerThreshold;
    const isNearBackWall = Math.abs(z - (-halfLength + snapDistance + itemHalfDepth)) < cornerThreshold;
    const isNearFrontWall = Math.abs(z - (halfLength - snapDistance - itemHalfDepth)) < cornerThreshold;

    // FIXED: Corner snapping with rotation options - better logic
    if (isNearLeftWall && isNearBackWall) {
      // Left-back corner
      snapX = -halfWidth + snapDistance + itemHalfDepth;
      snapZ = -halfLength + snapDistance + itemHalfDepth;
      rotation = itemRotation; // Keep current rotation, allow user to change
      snapped = true;
      setShowRotationHint(true);
    } else if (isNearRightWall && isNearBackWall) {
      // Right-back corner
      snapX = halfWidth - snapDistance - itemHalfDepth;
      snapZ = -halfLength + snapDistance + itemHalfDepth;
      rotation = itemRotation; // Keep current rotation, allow user to change
      snapped = true;
      setShowRotationHint(true);
    } else if (isNearLeftWall && isNearFrontWall) {
      // Left-front corner
      snapX = -halfWidth + snapDistance + itemHalfDepth;
      snapZ = halfLength - snapDistance - itemHalfDepth;
      rotation = itemRotation; // Keep current rotation, allow user to change
      snapped = true;
      setShowRotationHint(true);
    } else if (isNearRightWall && isNearFrontWall) {
      // Right-front corner
      snapX = halfWidth - snapDistance - itemHalfDepth;
      snapZ = halfLength - snapDistance - itemHalfDepth;
      rotation = itemRotation; // Keep current rotation, allow user to change
      snapped = true;
      setShowRotationHint(true);
    }
    // Wall snapping (not corners)
    else if (isNearLeftWall) {
      snapX = -halfWidth + snapDistance + itemHalfDepth;
      rotation = Math.PI / 2; // Face right
      snapped = true;
      setShowRotationHint(false);
    } else if (isNearRightWall) {
      snapX = halfWidth - snapDistance - itemHalfDepth;
      rotation = -Math.PI / 2; // Face left
      snapped = true;
      setShowRotationHint(false);
    } else if (isNearBackWall) {
      snapZ = -halfLength + snapDistance + itemHalfDepth;
      rotation = 0; // Face forward
      snapped = true;
      setShowRotationHint(false);
    } else if (isNearFrontWall) {
      snapZ = halfLength - snapDistance - itemHalfDepth;
      rotation = Math.PI; // Face back
      snapped = true;
      setShowRotationHint(false);
    } else {
      setShowRotationHint(false);
    }

    return snapped ? { x: snapX, z: snapZ, rotation } : null;
  };

  // FIXED: Handle rotation toggle for corner positions
  const handleRotationToggle = () => {
    if (showRotationHint) {
      const currentRotation = itemRotation;
      let newRotation = currentRotation + Math.PI / 2;
      
      // Normalize rotation to 0-2π range
      if (newRotation >= Math.PI * 2) {
        newRotation = 0;
      }
      
      setItemRotation(newRotation);
      console.log('Rotation changed to:', newRotation * 180 / Math.PI, 'degrees');
    }
  };

  // Validate position to prevent going into walls
  const validatePosition = (x: number, z: number) => {
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem ? selectedItem.dimensions.width / 2 : 0.3;
    const itemHalfDepth = selectedItem ? selectedItem.dimensions.depth / 2 : 0.3;
    
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
      
      // FIXED: Only update rotation if not in corner (let user control corner rotation)
      if (snap && !showRotationHint) {
        setItemRotation(snap.rotation);
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
      setShowRotationHint(false);
    }
  }, [position, selectedItem, getDragValidation, itemRotation]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  // FIXED: Add keyboard listener for rotation
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
      setShowRotationHint(false);
      
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
      
      {/* FIXED: Placement Instructions with working rotation */}
      {selectedItem && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md mx-4 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                dragValidation.isValid ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}>
                {selectedItem.type === 'sink' ? '💧' : selectedItem.type === 'stove' ? '🔥' : selectedItem.type === 'oven' ? '♨️' : selectedItem.type === 'refrigerator' ? '❄️' : '📦'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">
                  {snapPosition ? '🧲 נצמד לקיר' : 'גרור למיקום הרצוי'}
                </p>
              </div>
            </div>
            
            {/* FIXED: Rotation hint for corners - now working! */}
            {showRotationHint && (
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