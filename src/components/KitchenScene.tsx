import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import KitchenRoom from './three/KitchenRoom';
import DraggableObject from './three/DraggableObject';
import TriangleLines from './three/TriangleLines';
import DistanceLines from './three/DistanceLines';
import SnapGuides from './three/SnapGuides';
import CabinetOptionsDialog from './CabinetOptionsDialog';
import OvenStackDialog from './OvenStackDialog';
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
  const [snapPosition, setSnapPosition] = useState<{ x: number, z: number, rotation?: number, snapType?: string } | null>(null);
  const [itemRotation, setItemRotation] = useState(0);
  const [showRotationHint, setShowRotationHint] = useState(false);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [showCabinetDialog, setShowCabinetDialog] = useState(false);
  const [pendingCabinet, setPendingCabinet] = useState<{id: string, position: Vector3, rotation: number} | null>(null);
  const [showOvenDialog, setShowOvenDialog] = useState(false);
  const [pendingOven, setPendingOven] = useState<{id: string, position: Vector3, rotation: number, baseOven?: any} | null>(null);
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
    
    // ✅ CRITICAL: For countertops, be EXTREMELY permissive - they should fill gaps and be adjacent
    if (selectedItem.type === 'countertop') {
      // ✅ FIXED: ULTRA permissive collision detection for countertops - allow them to be adjacent
      const buffer = -0.25; // HUGE negative buffer allows countertops to be placed right next to anything
      
      for (const placedItem of placedItems) {
        if (placedItem.id === selectedItem.id) continue;
        
        // ✅ CRITICAL: Only prevent MAJOR overlaps (more than 15cm)
        const rotatedWidth = Math.abs(Math.cos(rotation)) * itemWidth + Math.abs(Math.sin(rotation)) * itemDepth;
        const rotatedDepth = Math.abs(Math.sin(rotation)) * itemWidth + Math.abs(Math.cos(rotation)) * itemDepth;
        
        const placedRotation = placedItem.rotation || 0;
        const placedRotatedWidth = Math.abs(Math.cos(placedRotation)) * placedItem.dimensions.width + 
                                   Math.abs(Math.sin(placedRotation)) * placedItem.dimensions.depth;
        const placedRotatedDepth = Math.abs(Math.sin(placedRotation)) * placedItem.dimensions.width + 
                                   Math.abs(Math.cos(placedRotation)) * placedItem.dimensions.depth;
        
        const xOverlap = Math.abs(x - placedItem.position.x) < (rotatedWidth/2 + placedRotatedWidth/2 + buffer);
        const zOverlap = Math.abs(z - placedItem.position.z) < (rotatedDepth/2 + placedRotatedDepth/2 + buffer);
        
        // ✅ FIXED: Only warn if there's MASSIVE overlap (more than 15cm) - allows tight fitting
        if (xOverlap && zOverlap) {
          const xDistance = Math.abs(x - placedItem.position.x) - (rotatedWidth/2 + placedRotatedWidth/2);
          const zDistance = Math.abs(z - placedItem.position.z) - (rotatedDepth/2 + placedRotatedDepth/2);
          
          // ✅ FIXED: Only show warning if overlapping by more than 15cm (MASSIVE overlap)
          if (xDistance < -0.15 && zDistance < -0.15) {
            return placedItem.name;
          }
        }
      }
      return null;
    }
    
    // ✅ NEW: For all other items, also be more permissive near walls and other items
    if (isNearWall(x, z)) {
      return null; // Never show collision warnings for items near walls
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
      
      // ✅ FIXED: Standard collision detection for non-countertop items
      const buffer = -0.05; // ✅ FIXED: Negative buffer allows items to be adjacent
      
      // ✅ FIXED: Don't prevent oven collision here - let the dialog handle it
      if (selectedItem.type === 'oven' && placedItem.type === 'oven') {
        // ✅ FIXED: Check if ovens are in same position (for stacking) vs different positions
        const samePosition = Math.abs(x - placedItem.position.x) < 0.1 && Math.abs(z - placedItem.position.z) < 0.1;
        if (samePosition) {
          // Skip collision check for ovens in same position - the dialog will handle stacking
          continue;
        }
        // For ovens in different positions, continue with normal collision detection
      }
      
      // ✅ FIXED: Special handling for stacked ovens - treat them as single unit
      if ((placedItem as any).stackedWith || (placedItem as any).stackedOn) {
        // For stacked ovens, use the base oven's position and combined height
        continue;
      }
      
      const xOverlap = Math.abs(x - placedItem.position.x) < (itemHalfWidth + placedHalfWidth + buffer);
      const zOverlap = Math.abs(z - placedItem.position.z) < (itemHalfDepth + placedHalfDepth + buffer);
      
      if (xOverlap && zOverlap) {
        return placedItem.name; // Return the name of the colliding item
      }
    }
    return null;
  };

  // ✅ Validate position to prevent going into walls
  const validatePosition = (x: number, z: number) => {
    if (!selectedItem) return { x, z };
    
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem.dimensions.width / 2;
    const itemHalfDepth = selectedItem.dimensions.depth / 2;
    
    const margin = 0.005; // ✅ CRITICAL: ULTRA small margin for corner placement
    const tolerance = 0.1; // ✅ CRITICAL: HUGE tolerance to prevent boundary errors
    
    const minX = -halfWidth + itemHalfWidth + margin;
    const maxX = halfWidth - itemHalfWidth - margin;
    const minZ = -halfLength + itemHalfDepth + margin;
    const maxZ = halfLength - itemHalfDepth - margin;
    
    // ✅ CRITICAL: ULTRA permissive validation - prevents corner placement errors
    return {
      x: Math.min(Math.max(minX - tolerance, x), maxX + tolerance), // ✅ CRITICAL: Huge tolerance
      z: Math.min(Math.max(minZ - tolerance, z), maxZ + tolerance)  // ✅ CRITICAL: Huge tolerance
    };
  };

  // ✅ FIXED: Enhanced snapping - prioritize walls for countertops, allow both item and wall snapping
  const getSnapPosition = (x: number, z: number) => {
    if (!selectedItem) return null;
    
    const snapDistance = 0.01; // ✅ CRITICAL: ULTRA small distance from walls
    const itemSnapDistance = 0.002; // ✅ CRITICAL: ULTRA small distance for tight snapping
    const snapThreshold = 0.5; // Threshold for easier snapping
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = selectedItem.dimensions.width / 2;
    const itemHalfDepth = selectedItem.dimensions.depth / 2;
    const cornerThreshold = 0.8;
    
    // ✅ CRITICAL: ULTRA permissive corner detection for better snapping
    const cornerDetectionThreshold = 1.2; // ✅ CRITICAL: Much larger threshold for corner detection
    
    let snapX = x;
    let snapZ = z;
    let snapped = false;
    let rotation = 0;
    let snapType = '';

    // ✅ NEW: Check wall proximity first for countertops
    const isNearLeftWall = Math.abs(x - (-halfWidth + snapDistance + itemHalfWidth)) < cornerDetectionThreshold;
    const isNearRightWall = Math.abs(x - (halfWidth - snapDistance - itemHalfWidth)) < cornerDetectionThreshold;
    const isNearBackWall = Math.abs(z - (-halfLength + snapDistance + itemHalfDepth)) < cornerDetectionThreshold;
    const isNearFrontWall = Math.abs(z - (halfLength - snapDistance - itemHalfDepth)) < cornerDetectionThreshold;

    // ✅ PRIORITY 1: For countertops, prioritize wall snapping even when near other items
    if (selectedItem.type === 'countertop') {
      // Corner snapping with rotation options
      if (isNearLeftWall && isNearBackWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth; // ✅ CRITICAL: Perfect corner placement
        snapZ = -halfLength + snapDistance + itemHalfDepth; // ✅ CRITICAL: Perfect corner placement
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה שמאל-אחור';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearBackWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;   // ✅ CRITICAL: Perfect corner placement
        snapZ = -halfLength + snapDistance + itemHalfDepth; // ✅ CRITICAL: Perfect corner placement
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה ימין-אחור';
        setShowRotationHint(true);
      } else if (isNearLeftWall && isNearFrontWall) {
        snapX = -halfWidth + snapDistance + itemHalfWidth;  // ✅ CRITICAL: Perfect corner placement
        snapZ = halfLength - snapDistance - itemHalfDepth;  // ✅ CRITICAL: Perfect corner placement
        rotation = itemRotation; // User controls rotation in corners
        snapped = true;
        snapType = '🔄 פינה שמאל-קדמי';
        setShowRotationHint(true);
      } else if (isNearRightWall && isNearFrontWall) {
        snapX = halfWidth - snapDistance - itemHalfWidth;   // ✅ CRITICAL: Perfect corner placement
        snapZ = halfLength - snapDistance - itemHalfDepth;  // ✅ CRITICAL: Perfect corner placement
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
        const rightSnapX = placedItem.position.x + placedHalfWidth + itemHalfWidth + itemSnapDistance; // ✅ FIXED: Snap right next to item
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
        const leftSnapX = placedItem.position.x - placedHalfWidth - itemHalfWidth - itemSnapDistance; // ✅ FIXED: Snap right next to item
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
        const frontSnapZ = placedItem.position.z + placedHalfDepth + itemHalfDepth + itemSnapDistance; // ✅ FIXED: Snap right next to item
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
        const backSnapZ = placedItem.position.z - placedHalfDepth - itemHalfDepth - itemSnapDistance; // ✅ FIXED: Snap right next to item
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
    if (selectedItem && !collisionWarning) {
      const finalPos = snapPosition || validatePosition(position.x, position.z);
      const finalRotation = snapPosition?.rotation !== undefined ? snapPosition.rotation : itemRotation;
      
      // Check if it's a countertop/cabinet  
      if (selectedItem.type === 'countertop') {
        // ✅ FIXED: Store cabinet info and show options dialog
        setPendingCabinet({
          id: selectedItem.id,
          position: new THREE.Vector3(finalPos.x, 0, finalPos.z),
          rotation: finalRotation
        });
        setShowCabinetDialog(true);
        
        // ✅ CRITICAL: Don't clear selected item here - let dialog handle it
        
        // ✅ CRITICAL: Don't clear selected item here - let dialog handle it
        // This prevents the "stuck" state when dialog opens
      } else if (selectedItem.type === 'oven') {
        // ✅ FIXED: Check if placing oven on another oven - more precise detection
        const baseOven = placedItems.find(item => 
          item.type === 'oven' && 
          Math.abs(item.position.x - finalPos.x) < 0.05 && 
          Math.abs(item.position.z - finalPos.z) < 0.05
        );
        
        if (baseOven) {
          // Show stacking dialog
          setPendingOven({
            id: selectedItem.id,
            position: new THREE.Vector3(baseOven.position.x, 0, baseOven.position.z), // Use base oven position
            rotation: baseOven.rotation || 0, // Use base oven rotation
            baseOven
          });
          setShowOvenDialog(true);
        } else {
          // Place oven normally
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
        }
      } else {
        // Place other items normally
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
      }
      
      // ✅ Haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  // Handle cabinet dialog close
  const handleCabinetDialogClose = () => {
    console.log('Cabinet dialog closing - resetting selection state');
    setShowCabinetDialog(false);
    setPendingCabinet(null);
    
    // ✅ CRITICAL: Force reset ALL selection state with delay
    setTimeout(() => {
      setSelectedItem(null);
      setIsDragging(false);
      setSnapPosition(null);
      setItemRotation(0);
      setShowRotationHint(false);
      setCollisionWarning(null);
    }, 100);
  };

  // Handle oven dialog close
  const handleOvenDialogClose = () => {
    console.log('Oven dialog closing - resetting selection state');
    setShowOvenDialog(false);
    setPendingOven(null);
    
    // ✅ CRITICAL: Force reset ALL selection state with delay
    setTimeout(() => {
      setSelectedItem(null);
      setIsDragging(false);
      setSnapPosition(null);
      setItemRotation(0);
      setShowRotationHint(false);
      setCollisionWarning(null);
    }, 100);
  };

  // ✅ CRITICAL: Handle cabinet placement success - called from dialog
  const handleCabinetPlaced = () => {
    console.log('Cabinet placed successfully');
    setShowCabinetDialog(false);
    setPendingCabinet(null);
    
    // ✅ CRITICAL: Force reset ALL selection state with delay
    setTimeout(() => {
      setSelectedItem(null);
      setIsDragging(false);
      setSnapPosition(null);
      setItemRotation(0);
      setShowRotationHint(false);
      setCollisionWarning(null);
    }, 100);
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
            key={item.id}
            position={[item.position.x, 0, item.position.z]}
            type={item.type}
            isPlaced={true}
            dimensions={item.dimensions}
            rotation={item.rotation || 0}
            stackedOn={(item as any).stackedOn}
            stackedWith={(item as any).stackedWith}
          />
        ))}
        
        {selectedItem && (
          <>
            <DraggableObject
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
        <div className="fixed top-20 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 w-80 border border-gray-200 z-40">
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
              <div>
                <h3 className="font-bold text-gray-900">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedItem.dimensions.width} × {selectedItem.dimensions.depth} × {selectedItem.dimensions.height}מ'
                </p>
              </div>
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
            {Object.keys(dragValidation.distances).length > 0 && !collisionWarning && (
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
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  collisionWarning ? 'bg-red-500' : 'bg-primary'
                }`}></div>
                <span>{collisionWarning ? 'בחר מיקום אחר' : 'לחץ כדי למקם'}</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                💡 <strong>לא במקום הנכון?</strong> לחץ "הסר" ברשימת הרכיבים ולאחר מכן גרור שוב
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cabinet Options Dialog */}
      {showCabinetDialog && pendingCabinet && (
        <CabinetOptionsDialog
          isOpen={showCabinetDialog}
          onClose={handleCabinetDialogClose}
          onSuccess={handleCabinetPlaced}
          cabinetId={pendingCabinet.id}
          position={pendingCabinet.position}
          rotation={pendingCabinet.rotation}
        />
      )}
      
      {/* Oven Stack Dialog */}
      {showOvenDialog && pendingOven && (
        <OvenStackDialog
          isOpen={showOvenDialog}
          onClose={handleOvenDialogClose}
          ovenId={pendingOven.id}
          position={pendingOven.position}
          rotation={pendingOven.rotation}
          baseOven={pendingOven.baseOven}
        />
      )}
    </div>
  );
};

export default KitchenScene;