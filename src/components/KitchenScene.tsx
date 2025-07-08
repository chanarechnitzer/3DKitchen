import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import KitchenRoom from './three/KitchenRoom';
import DraggableObject from './three/DraggableObject';
import TriangleLines from './three/TriangleLines';
import DistanceLines from './three/DistanceLines';
import SnapGuides from './three/SnapGuides';
import { useKitchen, WindowPlacement, KitchenItemType } from '../store/KitchenContext';
import OvenStackDialog from './OvenStackDialog';
import CabinetOptionsDialog from './CabinetOptionsDialog';

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
    removeItem,
    triangleValidation,
    getDragValidation,
    updateOvenStack,
    setAvailableItems,
  } = useKitchen();
  
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [dragValidation, setDragValidation] = useState<{ isValid: boolean; distances: { [key: string]: number } }>({ isValid: true, distances: {} });
  const [isDragging, setIsDragging] = useState(false);
  const [snapPosition, setSnapPosition] = useState<{ x: number, z: number, rotation?: number, snapType?: string } | null>(null);
  const [itemRotation, setItemRotation] = useState(0);
  const [showRotationHint, setShowRotationHint] = useState(false);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [showOvenStackDialog, setShowOvenStackDialog] = useState(false);
  const [conflictingOven, setConflictingOven] = useState<string | null>(null);
  const [showCabinetOptionsDialog, setShowCabinetOptionsDialog] = useState(false);
  const [pendingCabinetPlacement, setPendingCabinetPlacement] = useState<{
    position: { x: number; z: number };
    rotation: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<any>(null);
  const worldPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // ✅ FIXED: Check if position is near a wall
  const isNearWall = (x: number, z: number) => {
    if (!selectedItem) return false;
    
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem.dimensions.width / 2;
    const itemHalfDepth = selectedItem.dimensions.depth / 2;
    const snapDistance = 0.05;
    const wallThreshold = 0.1; // Distance to consider "near wall"
    
    // Check if item is positioned near any wall
    const nearLeftWall = Math.abs(x - (-halfWidth + snapDistance + itemHalfWidth)) < wallThreshold;
    const nearRightWall = Math.abs(x - (halfWidth - snapDistance - itemHalfWidth)) < wallThreshold;
    const nearBackWall = Math.abs(z - (-halfLength + snapDistance + itemHalfDepth)) < wallThreshold;
    const nearFrontWall = Math.abs(z - (halfLength - snapDistance - itemHalfDepth)) < wallThreshold;
    
    return nearLeftWall || nearRightWall || nearBackWall || nearFrontWall;
  };

  // ✅ FIXED: Improved collision detection - NO collision warning when snapped to walls
  const checkCollisions = (x: number, z: number, itemWidth: number, itemDepth: number, rotation: number = 0) => {
    if (!selectedItem) return null;
    
    // ✅ CRITICAL: If item is near a wall, don't check for collisions
    // Items against walls should never show collision warnings
    if (isNearWall(x, z)) {
      return null;
    }
    
    // Calculate rotated dimensions
    const rotatedWidth = Math.abs(Math.cos(rotation)) * itemWidth + Math.abs(Math.sin(rotation)) * itemDepth;
    const rotatedDepth = Math.abs(Math.sin(rotation)) * itemWidth + Math.abs(Math.cos(rotation)) * itemDepth;
    
    const itemHalfWidth = rotatedWidth / 2;
    const itemHalfDepth = rotatedDepth / 2;
    
    for (const placedItem of placedItems) {
      // Skip self if editing existing item
      if (placedItem.id === selectedItem.id) continue;
      
      const placedRotation = placedItem.rotation || 0;
      const placedRotatedWidth = Math.abs(Math.cos(placedRotation)) * placedItem.dimensions.width + 
                                 Math.abs(Math.sin(placedRotation)) * placedItem.dimensions.depth;
      const placedRotatedDepth = Math.abs(Math.sin(placedRotation)) * placedItem.dimensions.width + 
                                 Math.abs(Math.cos(placedRotation)) * placedItem.dimensions.depth;
      
      const placedHalfWidth = placedRotatedWidth / 2;
      const placedHalfDepth = placedRotatedDepth / 2;
      
      // ✅ FIXED: Much smaller buffer - only prevent actual overlap, allow touching
      const buffer = 0.01; // Only 1cm buffer - allows items to be adjacent
      const xOverlap = Math.abs(x - placedItem.position.x) < (itemHalfWidth + placedHalfWidth + buffer);
      const zOverlap = Math.abs(z - placedItem.position.z) < (itemHalfDepth + placedHalfDepth + buffer);
      
      if (xOverlap && zOverlap) {
        return placedItem.name; // Return the name of the colliding item
      }
    }
    return null;
  };

  // ✅ FIXED: Enhanced snapping - prioritize walls for countertops, allow both item and wall snapping
  const getSnapPosition = (x: number, z: number) => {
    if (!selectedItem) return null;
    
    const snapDistance = 0.05; // Distance from walls
    const itemSnapDistance = 0.01; // Distance for item snapping
    const snapThreshold = 0.5; // Threshold for easier snapping
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

    // ✅ NEW: Check wall proximity first for countertops
    const isNearLeftWall = Math.abs(x - (-halfWidth + snapDistance + itemHalfWidth)) < cornerThreshold;
    const isNearRightWall = Math.abs(x - (halfWidth - snapDistance - itemHalfWidth)) < cornerThreshold;
    const isNearBackWall = Math.abs(z - (-halfLength + snapDistance + itemHalfDepth)) < cornerThreshold;
    const isNearFrontWall = Math.abs(z - (halfLength - snapDistance - itemHalfDepth)) < cornerThreshold;

    // ✅ PRIORITY 1: For countertops, prioritize wall snapping even when near other items
    if (selectedItem.type === 'countertop') {
      // Corner snapping with rotation options
      if (isNearLeftWall && isNearBackWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה שמאל-אחור';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearBackWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה ימין-אחור';
        setShowRotationHint(true);
      } else if (isNearLeftWall && isNearFrontWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה שמאל-קדמי';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearFrontWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה ימין-קדמי';
        setShowRotationHint(true);
      }
      // Wall snapping (not corners) - automatic rotation to face away from wall
      else if (isNearLeftWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;
        rotation = Math.PI / 2; // Face right (away from left wall)
        snapped = true;
        snapType = '🧲 קיר שמאל';
        setShowRotationHint(false);
      } else if (isNearRightWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;
        rotation = -Math.PI / 2; // Face left (away from right wall)
        snapped = true;
        snapType = '🧲 קיר ימין';
        setShowRotationHint(false);
      } else if (isNearBackWall) {
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = 0; // Face forward (away from back wall)
        snapped = true;
        snapType = '🧲 קיר אחורי';
        setShowRotationHint(false);
      } else if (isNearFrontWall) {
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = Math.PI; // Face backward (away from front wall)
        snapped = true;
        snapType = '🧲 קיר קדמי';
        setShowRotationHint(false);
      }
    }

    // ✅ PRIORITY 2: If not snapped to walls (or not a countertop), check item snapping
    if (!snapped) {
      for (const placedItem of placedItems) {
        // Skip self if editing existing item
        if (placedItem.id === selectedItem.id) continue;
        
        const placedHalfWidth = placedItem.dimensions.width / 2;
        const placedHalfDepth = placedItem.dimensions.depth / 2;
        
        // ✅ FIXED: When snapping to items, face AWAY from walls, not the item
        // Snap to right side of placed item
        const rightSnapX = placedItem.position.x + placedHalfWidth + itemHalfWidth + itemSnapDistance;
        if (Math.abs(x - rightSnapX) < snapThreshold && Math.abs(z - placedItem.position.z) < snapThreshold) {
          snapX = rightSnapX;
          snapZ = placedItem.position.z;
          
          // ✅ FIXED: Face away from nearest wall, not the item
          const distanceToRightWall = halfWidth - snapX;
          const distanceToLeftWall = snapX + halfWidth;
          const distanceToBackWall = halfLength + snapZ;
          const distanceToFrontWall = halfLength - snapZ;
          
          const minDistance = Math.min(distanceToRightWall, distanceToLeftWall, distanceToBackWall, distanceToFrontWall);
          
          if (minDistance === distanceToRightWall) rotation = -Math.PI / 2; // Face left (away from right wall)
          else if (minDistance === distanceToLeftWall) rotation = Math.PI / 2; // Face right (away from left wall)
          else if (minDistance === distanceToBackWall) rotation = 0; // Face forward (away from back wall)
          else rotation = Math.PI; // Face backward (away from front wall)
          
          snapped = true;
          snapType = `נצמד ימינה ל${placedItem.name}`;
          setShowRotationHint(false);
          break;
        }
        
        // Snap to left side of placed item
        const leftSnapX = placedItem.position.x - placedHalfWidth - itemHalfWidth - itemSnapDistance;
        if (Math.abs(x - leftSnapX) < snapThreshold && Math.abs(z - placedItem.position.z) < snapThreshold) {
          snapX = leftSnapX;
          snapZ = placedItem.position.z;
          
          // ✅ FIXED: Face away from nearest wall
          const distanceToRightWall = halfWidth - snapX;
          const distanceToLeftWall = snapX + halfWidth;
          const distanceToBackWall = halfLength + snapZ;
          const distanceToFrontWall = halfLength - snapZ;
          
          const minDistance = Math.min(distanceToRightWall, distanceToLeftWall, distanceToBackWall, distanceToFrontWall);
          
          if (minDistance === distanceToRightWall) rotation = -Math.PI / 2; // Face left
          else if (minDistance === distanceToLeftWall) rotation = Math.PI / 2; // Face right
          else if (minDistance === distanceToBackWall) rotation = 0; // Face forward
          else rotation = Math.PI; // Face backward
          
          snapped = true;
          snapType = `נצמד שמאלה ל${placedItem.name}`;
          setShowRotationHint(false);
          break;
        }
        
        // Snap to front of placed item
        const frontSnapZ = placedItem.position.z + placedHalfDepth + itemHalfDepth + itemSnapDistance;
        if (Math.abs(z - frontSnapZ) < snapThreshold && Math.abs(x - placedItem.position.x) < snapThreshold) {
          snapX = placedItem.position.x;
          snapZ = frontSnapZ;
          
          // ✅ FIXED: Face away from nearest wall
          const distanceToRightWall = halfWidth - snapX;
          const distanceToLeftWall = snapX + halfWidth;
          const distanceToBackWall = halfLength + snapZ;
          const distanceToFrontWall = halfLength - snapZ;
          
          const minDistance = Math.min(distanceToRightWall, distanceToLeftWall, distanceToBackWall, distanceToFrontWall);
          
          if (minDistance === distanceToRightWall) rotation = -Math.PI / 2; // Face left
          else if (minDistance === distanceToLeftWall) rotation = Math.PI / 2; // Face right
          else if (minDistance === distanceToBackWall) rotation = 0; // Face forward
          else rotation = Math.PI; // Face backward
          
          snapped = true;
          snapType = `נצמד קדימה ל${placedItem.name}`;
          setShowRotationHint(false);
          break;
        }
        
        // Snap to back of placed item
        const backSnapZ = placedItem.position.z - placedHalfDepth - itemHalfDepth - itemSnapDistance;
        if (Math.abs(z - backSnapZ) < snapThreshold && Math.abs(x - placedItem.position.x) < snapThreshold) {
          snapX = placedItem.position.x;
          snapZ = backSnapZ;
          
          // ✅ FIXED: Face away from nearest wall
          const distanceToRightWall = halfWidth - snapX;
          const distanceToLeftWall = snapX + halfWidth;
          const distanceToBackWall = halfLength + snapZ;
          const distanceToFrontWall = halfLength - snapZ;
          
          const minDistance = Math.min(distanceToRightWall, distanceToLeftWall, distanceToBackWall, distanceToFrontWall);
          
          if (minDistance === distanceToRightWall) rotation = -Math.PI / 2; // Face left
          else if (minDistance === distanceToLeftWall) rotation = Math.PI / 2; // Face right
          else if (minDistance === distanceToBackWall) rotation = 0; // Face forward
          else rotation = Math.PI; // Face backward
          
          snapped = true;
          snapType = `נצמד אחורה ל${placedItem.name}`;
          setShowRotationHint(false);
          break;
        }
      }
    }

    // ✅ PRIORITY 3: If still not snapped and not a countertop, check wall snapping for other items
    if (!snapped && selectedItem.type !== 'countertop') {
      // Corner snapping with rotation options
      if (isNearLeftWall && isNearBackWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה שמאל-אחור';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearBackWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה ימין-אחור';
        setShowRotationHint(true);
      } else if (isNearLeftWall && isNearFrontWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה שמאל-קדמי';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearFrontWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה ימין-קדמי';
        setShowRotationHint(true);
      }
      // Wall snapping (not corners) - automatic rotation to face away from wall
      else if (isNearLeftWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;
        rotation = Math.PI / 2; // Face right (away from left wall)
        snapped = true;
        snapType = '🧲 קיר שמאל';
        setShowRotationHint(false);
      } else if (isNearRightWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;
        rotation = -Math.PI / 2; // Face left (away from right wall)
        snapped = true;
        snapType = '🧲 קיר ימין';
        setShowRotationHint(false);
      } else if (isNearBackWall) {
        snapZ = -halfLength + snapDistance + itemHalfDepth;
        rotation = 0; // Face forward (away from back wall)
        snapped = true;
        snapType = '🧲 קיר אחורי';
        setShowRotationHint(false);
      } else if (isNearFrontWall) {
        snapZ = halfLength - snapDistance - itemHalfDepth;
        rotation = Math.PI; // Face backward (away from front wall)
        snapped = true;
        snapType = '🧲 קיר קדמי';
        setShowRotationHint(false);
      } else {
        setShowRotationHint(false);
      }
    }

    // ✅ If no snapping occurred, reset rotation hint
    if (!snapped) {
      setShowRotationHint(false);
    }

    return snapped ? { x: snapX, z: snapZ, rotation, snapType } : null;
  };

  // ✅ Handle rotation toggle for corner positions
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

  // ✅ Validate position to prevent going into walls
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
      
      // ✅ Only update rotation if not in corner (let user control corner rotation)
      if (snap && !showRotationHint && snap.rotation !== undefined) {
        setItemRotation(snap.rotation);
      }
      
      const finalPos = snap || validatedPos;
      const finalRotation = snap?.rotation !== undefined ? snap.rotation : itemRotation;
      
      // ✅ FIXED: Check for collisions - but exclude wall-snapped items
      const collision = checkCollisions(
        finalPos.x, 
        finalPos.z, 
        selectedItem.dimensions.width, 
        selectedItem.dimensions.depth,
        finalRotation
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

  // ✅ Add keyboard listener for rotation
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

  // ✅ Handle placing item - only if no collision
  const handlePlaceItem = () => {
    if (selectedItem) {
      const finalPos = snapPosition || validatePosition(position.x, position.z);
      const finalRotation = snapPosition?.rotation !== undefined ? snapPosition.rotation : itemRotation;
      
      // ✅ NEW: Check if this is a countertop - show options dialog first
      if (selectedItem.type === KitchenItemType.COUNTERTOP) {
        setPendingCabinetPlacement({
          position: { x: finalPos.x, z: finalPos.z },
          rotation: finalRotation
        });
        setShowCabinetOptionsDialog(true);
        return; // Don't place yet, wait for user choice
      }
      
      // ✅ NEW: Check for oven stacking opportunity
      if (selectedItem.type === KitchenItemType.OVEN) {
        const existingOven = placedItems.find(item => 
          item.type === KitchenItemType.OVEN && 
          Math.abs(item.position.x - finalPos.x) < 0.1 && 
          Math.abs(item.position.z - finalPos.z) < 0.1
        );
        
        if (existingOven) {
          setConflictingOven(existingOven.id);
          setShowOvenStackDialog(true);
          return; // Don't place yet, wait for user decision
        }
      }
      
      // ✅ FIXED: Only place if no collision warning
      if (!collisionWarning) {
        placeItem(
          selectedItem.id, 
          new THREE.Vector3(finalPos.x, 0, finalPos.z),
          finalRotation
        );
        setSelectedItem(null);
        setIsDragging(false);
        setSnapPosition(null);
        setItemRotation(0);
        setShowRotationHint(false);
        setCollisionWarning(null);
        
        // ✅ Haptic feedback for mobile
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
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
  const finalRotation = snapPosition?.rotation !== undefined ? snapPosition.rotation : itemRotation;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'sink': return '💧';
      case 'stove': return '🔥';
      case 'oven': return '♨️';
      case 'refrigerator': return '❄️';
      case 'countertop': return '📦';
      default: return '📄';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'sink': return 'from-blue-400 to-blue-600';
      case 'stove': return 'from-red-400 to-red-600';
      case 'oven': return 'from-orange-400 to-orange-600';
      case 'refrigerator': return 'from-cyan-400 to-cyan-600';
      case 'countertop': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

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
            key={`placed-${item.id}-${item.dimensions.width}-${item.dimensions.depth}-${item.dimensions.height}`}
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
              key={`selected-${selectedItem.id}-${selectedItem.dimensions.width}-${selectedItem.dimensions.depth}-${selectedItem.dimensions.height}`}
              position={[finalPosition.x, 0, finalPosition.z]}
              type={selectedItem.type}
              isPlaced={false}
              dimensions={selectedItem.dimensions}
              rotation={finalRotation}
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
      
      {/* ✅ FIXED: Elevated window position - starts above kitchen units */}
      {selectedItem && (
        <div className="fixed top-20 right-4 bg-white/98 backdrop-blur-sm rounded-2xl shadow-2xl p-5 w-80 border-2 border-primary/20 z-40">
          <div className="space-y-4">
            {/* Item Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl ${
                collisionWarning 
                  ? 'bg-gradient-to-br from-red-400 to-red-600' 
                  : dragValidation.isValid 
                    ? 'bg-gradient-to-br from-green-400 to-green-600' 
                    : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
              }`}>
                {getItemIcon(selectedItem.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedItem.dimensions.width} × {selectedItem.dimensions.depth} × {selectedItem.dimensions.height}מ'
                </p>
              </div>
            </div>

            {/* Live Status Indicator */}
            <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className={`w-3 h-3 rounded-full animate-pulse ${collisionWarning ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {collisionWarning ? 'מיקום לא זמין' : 'מיקום זמין'}
              </span>
            </div>

            {/* Status */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {collisionWarning 
                  ? `⚠️ חוסם את ${collisionWarning}` 
                  : snapPosition 
                    ? `${snapPosition.snapType || '🧲 נצמד'}` 
                    : 'גרור למיקום הרצוי'
                }
              </p>
            </div>
            
            {/* ✅ FIXED: Collision Warning - only shows for actual overlaps, NOT for wall-adjacent items */}
            {collisionWarning && !isNearWall(finalPosition.x, finalPosition.z) && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">
                  🚫 לא ניתן למקם כאן
                </p>
                <p className="text-xs text-red-600">
                  הרכיב חוסם את {collisionWarning}. בחר מיקום אחר.
                </p>
              </div>
            )}
            
            {/* ✅ FIXED: Always show rotation controls when in corner */}
            {showRotationHint && !collisionWarning && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  🔄 פינה זוהתה! ניתן לסובב
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  לחץ R או לחץ כאן כדי לסובב את החזית
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRotationToggle();
                  }}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  🔄 סובב חזית ({Math.round(itemRotation * 180 / Math.PI)}°)
                </button>
              </div>
            )}
            
            {/* Distance Measurements */}
            {Object.keys(dragValidation.distances).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">מרחקי משולש הזהב</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(dragValidation.distances).map(([key, distance]) => (
                    <div 
                      key={key}
                      className={`p-2 rounded-lg border-2 ${
                        distance > 1.2 && distance < 5 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">{key}</p>
                        <p className="text-sm font-bold">{distance.toFixed(2)}מ'</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="bg-gradient-to-r from-primary/5 to-yellow-500/5 rounded-xl p-3 border border-primary/20">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  collisionWarning ? 'bg-red-500' : 'bg-primary'
                }`}></div>
                <span>{collisionWarning ? 'בחר מיקום אחר' : 'לחץ כדי למקם'}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                💡 <strong>רוצה לשנות מיקום?</strong> לחץ "הסר" ברשימת הרכיבים ולאחר מכן גרור שוב
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ NEW: Oven Stack Dialog */}
      {showOvenStackDialog && conflictingOven && selectedItem && (
        <OvenStackDialog
          onClose={() => {
            setShowOvenStackDialog(false);
            setConflictingOven(null);
          }}
          onConfirm={(shouldStack) => {
            const finalPos = snapPosition || validatePosition(position.x, position.z);
            const finalRotation = snapPosition?.rotation !== undefined ? snapPosition.rotation : itemRotation;
            
            if (shouldStack && conflictingOven && selectedItem) {
              // Place the new oven and create stack
              placeItem(
                selectedItem.id, 
                new THREE.Vector3(finalPos.x, 0, finalPos.z),
                finalRotation
              );
              // Create the stack relationship
              setTimeout(() => {
                updateOvenStack(conflictingOven, selectedItem.id);
              }, 100);
            } else if (conflictingOven && selectedItem) {
              // Replace existing oven
              removeItem(conflictingOven);
              placeItem(
                selectedItem.id, 
                new THREE.Vector3(finalPos.x, 0, finalPos.z),
                finalRotation
              );
            }
            
            setSelectedItem(null);
            setIsDragging(false);
            setSnapPosition(null);
            setItemRotation(0);
            setShowRotationHint(false);
            setCollisionWarning(null);
            setShowOvenStackDialog(false);
            setConflictingOven(null);
          }}
          baseOvenName={placedItems.find(item => item.id === conflictingOven)?.name || 'תנור'}
        />
      )}
      
      {/* ✅ NEW: Cabinet Options Dialog - Auto-opens when placing countertop */}
      {showCabinetOptionsDialog && selectedItem && pendingCabinetPlacement && (
        <CabinetOptionsDialog
          onClose={() => {
            setShowCabinetOptionsDialog(false);
            setPendingCabinetPlacement(null);
            // Don't place the item if user cancels
          }}
          onConfirm={(option, customWidth, fillPosition) => {
            if (!selectedItem || !pendingCabinetPlacement) return;
            
            console.log('🎯 Cabinet placement confirmed with option:', option);
            console.log('📍 Placement position:', pendingCabinetPlacement.position);
            console.log('📏 Custom width:', customWidth);
            console.log('📍 Fill position:', fillPosition);
            
            let finalWidth = selectedItem.dimensions.width;
            let finalPosition = fillPosition || pendingCabinetPlacement.position;
            
            if (option === 'custom' && customWidth) {
              finalWidth = customWidth;
              console.log('🔧 Using custom width:', finalWidth);
            } else if (option === 'fill' && customWidth) {
              finalWidth = customWidth;
              console.log('📐 Using fill width:', finalWidth);
              console.log('📍 Using calculated fill position:', finalPosition);
            }
            
            console.log('✅ Final cabinet width:', finalWidth);
            console.log('📍 Final cabinet position:', finalPosition);
            
            // Update item dimensions in available items before placement
            setAvailableItems(prev => prev.map(item => 
              item.id === selectedItem.id 
                ? { ...item, dimensions: { ...item.dimensions, width: finalWidth } }
                : item
            ));
            
            console.log('🔄 Updated available items with new width');
            
            // Place the item with updated dimensions and position
            placeItem(
              selectedItem.id,
              new THREE.Vector3(finalPosition.x, 0, finalPosition.z),
              pendingCabinetPlacement.rotation
            );
            
            console.log('✅ Item placed successfully');
            
            setSelectedItem(null);
            setIsDragging(false);
            setSnapPosition(null);
            setItemRotation(0);
            setShowRotationHint(false);
            setCollisionWarning(null);
            setShowCabinetOptionsDialog(false);
            setPendingCabinetPlacement(null);
            
            // Haptic feedback for mobile
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }}
          defaultWidth={selectedItem.dimensions.width}
          placedItems={placedItems}
          position={pendingCabinetPlacement ? pendingCabinetPlacement.position : { x: 0, z: 0 }}
          kitchenDimensions={kitchenDimensions}
        />
      )}
      
    </div>
  );
};

export default KitchenScene;