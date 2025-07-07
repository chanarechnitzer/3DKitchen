import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vector3 } from 'three';

// Define kitchen item types
export enum KitchenItemType {
  SINK = 'sink',
  STOVE = 'stove',
  OVEN = 'oven',
  REFRIGERATOR = 'refrigerator',
  COUNTERTOP = 'countertop',
}

export enum WindowPlacement {
  RIGHT = 'right',
  LEFT = 'left',
  OPPOSITE = 'opposite',
}

// Customization options
export interface CustomizationOptions {
  cabinets: string;
  countertops: string;
  walls: string;
  floors: string;
}

// Kitchen item interface
export interface KitchenItem {
  id: string;
  type: KitchenItemType;
  position: Vector3;
  placed: boolean;
  name: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  rotation?: number;
  customWidth?: number; // Allow custom width for cabinets
}

// Triangle validation result
export interface TriangleValidation {
  isValid: boolean;
  sides: {
    sinkToStove: number;
    sinkToRefrigerator: number;
    stoveToRefrigerator: number;
  };
  violations: string[];
  isComplete: boolean;
}

// Context interface
interface KitchenContextType {
  kitchenDimensions: { width: number; length: number };
  setKitchenDimensions: (dimensions: { width: number; length: number }) => void;
  windowPlacement: WindowPlacement;
  setWindowPlacement: (placement: WindowPlacement) => void;
  customization: CustomizationOptions;
  setCustomization: (options: CustomizationOptions) => void;
  updateCustomization: (category: keyof CustomizationOptions, value: string) => void;
  availableItems: KitchenItem[];
  placedItems: KitchenItem[];
  selectedItem: KitchenItem | null;
  setSelectedItem: (item: KitchenItem | null) => void;
  placeItem: (itemId: string, position: Vector3, rotation?: number) => void;
  removeItem: (itemId: string) => void;
  triangleValidation: TriangleValidation | null;
  validateTriangle: () => void;
  gameCompleted: boolean;
  setGameCompleted: (completed: boolean) => void;
  getDragValidation: (position: Vector3, type: KitchenItemType) => { isValid: boolean; distances: { [key: string]: number } };
  detectGaps: (position: Vector3, itemWidth: number) => { hasGap: boolean; gapSize: number; position: string; suggestedWidth?: number };
  createCustomCabinet: (width: number) => KitchenItem;
}

// Default context value
const defaultContext: KitchenContextType = {
  kitchenDimensions: { width: 0, length: 0 },
  setKitchenDimensions: () => {},
  windowPlacement: WindowPlacement.OPPOSITE,
  setWindowPlacement: () => {},
  customization: {
    cabinets: 'white',
    countertops: 'granite',
    walls: 'light',
    floors: 'wood'
  },
  setCustomization: () => {},
  updateCustomization: () => {},
  availableItems: [],
  placedItems: [],
  selectedItem: null,
  setSelectedItem: () => {},
  placeItem: () => {},
  removeItem: () => {},
  triangleValidation: null,
  validateTriangle: () => {},
  gameCompleted: false,
  setGameCompleted: () => {},
  getDragValidation: () => ({ isValid: false, distances: {} }),
  detectGaps: () => ({ hasGap: false, gapSize: 0, position: '' }),
  createCustomCabinet: () => ({} as KitchenItem),
};

// Create context
const KitchenContext = createContext<KitchenContextType>(defaultContext);

// Generate unique ID
const generateId = (type: string) => `${type}-${Math.random().toString(36).substr(2, 9)}`;

// Initial kitchen items - NOW WITH SEPARATE OVEN!
const initialKitchenItems: KitchenItem[] = [
  {
    id: generateId('sink'),
    type: KitchenItemType.SINK,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיור',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
    rotation: 0,
  },
  {
    id: generateId('sink'),
    type: KitchenItemType.SINK,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיור נוסף',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
    rotation: 0,
  },
  {
    id: generateId('stove'),
    type: KitchenItemType.STOVE,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיריים',
    dimensions: { width: 0.6, depth: 0.6, height: 0.9 },
    rotation: 0,
  },
  // NEW: Separate oven item
  {
    id: generateId('oven'),
    type: KitchenItemType.OVEN,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'תנור',
    dimensions: { width: 0.6, depth: 0.6, height: 0.6 },
    rotation: 0,
  },
  // NEW: Additional oven
  {
    id: generateId('oven'),
    type: KitchenItemType.OVEN,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'תנור נוסף',
    dimensions: { width: 0.6, depth: 0.6, height: 0.6 },
    rotation: 0,
  },
  {
    id: generateId('refrigerator'),
    type: KitchenItemType.REFRIGERATOR,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'מקרר',
    dimensions: { width: 0.8, depth: 0.7, height: 1.8 },
    rotation: 0,
  },
  ...Array(10).fill(null).map(() => ({
    id: generateId('countertop'),
    type: KitchenItemType.COUNTERTOP,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'משטח עם מגירות',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
    rotation: 0,
    customWidth: 0.6, // Default width
  })),
];

// Provider component
export const KitchenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [kitchenDimensions, setKitchenDimensions] = useState({ width: 0, length: 0 });
  const [windowPlacement, setWindowPlacement] = useState<WindowPlacement>(WindowPlacement.OPPOSITE);
  const [customization, setCustomization] = useState<CustomizationOptions>({
    cabinets: 'white',
    countertops: 'granite',
    walls: 'light',
    floors: 'wood'
  });
  const [availableItems, setAvailableItems] = useState<KitchenItem[]>(initialKitchenItems);
  const [placedItems, setPlacedItems] = useState<KitchenItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KitchenItem | null>(null);
  const [triangleValidation, setTriangleValidation] = useState<TriangleValidation | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Update customization function
  const updateCustomization = (category: keyof CustomizationOptions, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Calculate distance between two positions
  const calculateDistance = (pos1: Vector3, pos2: Vector3): number => {
    const vector1 = pos1 instanceof Vector3 ? pos1 : new Vector3(pos1.x, pos1.y, pos1.z);
    const vector2 = pos2 instanceof Vector3 ? pos2 : new Vector3(pos2.x, pos2.y, pos2.z);
    return vector1.distanceTo(vector2);
  };

  // Validate distances for triangle
  const validateDistances = (distances: { [key: string]: number }) => {
    const violations: string[] = [];
    
    Object.entries(distances).forEach(([key, distance]) => {
      if (distance < 1.2) {
        violations.push(`המרחק ${key} קצר מדי (${distance.toFixed(2)} מ')`);
      } else if (distance > 5) {
        violations.push(`המרחק ${key} ארוך מדי (${distance.toFixed(2)} מ')`);
      }
    });
    
    return violations;
  };

  // Get validation during drag
  const getDragValidation = (position: Vector3, type: KitchenItemType) => {
    const distances: { [key: string]: number } = {};
    let isValid = true;

    const sinks = placedItems.filter(item => item.type === KitchenItemType.SINK);
    const stoves = placedItems.filter(item => item.type === KitchenItemType.STOVE);
    const refrigerators = placedItems.filter(item => item.type === KitchenItemType.REFRIGERATOR);

    if (type === KitchenItemType.SINK) {
      if (stoves.length > 0) {
        const distance = calculateDistance(position, stoves[0].position);
        distances['כיור-כיריים'] = distance;
        isValid = isValid && distance > 1.2 && distance < 5;
      }
      if (refrigerators.length > 0) {
        const distance = calculateDistance(position, refrigerators[0].position);
        distances['כיור-מקרר'] = distance;
        isValid = isValid && distance > 1.2 && distance < 5;
      }
    } else if (type === KitchenItemType.STOVE) {
      if (sinks.length > 0) {
        sinks.forEach((sink, index) => {
          const distance = calculateDistance(position, sink.position);
          distances[`כיריים-כיור${index > 0 ? ' ' + (index + 1) : ''}`] = distance;
          isValid = isValid && distance > 1.2 && distance < 5;
        });
      }
      if (refrigerators.length > 0) {
        const distance = calculateDistance(position, refrigerators[0].position);
        distances['כיריים-מקרר'] = distance;
        isValid = isValid && distance > 1.2 && distance < 5;
      }
    } else if (type === KitchenItemType.REFRIGERATOR) {
      if (sinks.length > 0) {
        sinks.forEach((sink, index) => {
          const distance = calculateDistance(position, sink.position);
          distances[`מקרר-כיור${index > 0 ? ' ' + (index + 1) : ''}`] = distance;
          isValid = isValid && distance > 1.2 && distance < 5;
        });
      }
      if (stoves.length > 0) {
        const distance = calculateDistance(position, stoves[0].position);
        distances['מקרר-כיריים'] = distance;
        isValid = isValid && distance > 1.2 && distance < 5;
      }
    }

    return { isValid, distances };
  };

  // Place an item in the kitchen
  const placeItem = (itemId: string, position: Vector3, rotation: number = 0, customWidth?: number) => {
    const itemIndex = availableItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      let item = { 
        ...availableItems[itemIndex], 
        position: new Vector3(position.x, position.y, position.z),
        placed: true,
        rotation
      };
      
      // Apply custom width if provided
      if (customWidth && item.type === KitchenItemType.COUNTERTOP) {
        item = {
          ...item,
          dimensions: {
            ...item.dimensions,
            width: customWidth
          },
          customWidth
        };
      }
      
      if (item.type === KitchenItemType.COUNTERTOP) {
        const placedCabinets = placedItems.filter(i => i.type === KitchenItemType.COUNTERTOP).length;
        if (placedCabinets >= 10) {
          return;
        }
      }
      
      setAvailableItems(prev => prev.filter(item => item.id !== itemId));
      setPlacedItems(prev => [...prev, item]);
      
      // CRITICAL: Only validate triangle, NEVER auto-complete the game
      setTimeout(validateTriangle, 100);
    }
  };

  // Remove an item from the kitchen
  const removeItem = (itemId: string) => {
    const itemIndex = placedItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const item = { 
        ...placedItems[itemIndex], 
        position: new Vector3(0, 0, 0),
        placed: false,
        rotation: 0
      };
      
      setPlacedItems(prev => prev.filter(item => item.id !== itemId));
      setAvailableItems(prev => [...prev, item]);
      
      // Reset game completion when items are removed
      setGameCompleted(false);
      
      setTimeout(validateTriangle, 100);
    }
  };

  // Validate the kitchen triangle - NEVER auto-complete the game
  const validateTriangle = () => {
    const sinks = placedItems.filter(item => item.type === KitchenItemType.SINK);
    const stove = placedItems.find(item => item.type === KitchenItemType.STOVE);
    const refrigerator = placedItems.find(item => item.type === KitchenItemType.REFRIGERATOR);
    
    // Check if all required components are present
    const hasRequiredComponents = sinks.length > 0 && stove && refrigerator;
    
    // Only proceed with validation if all components are present
    if (hasRequiredComponents) {
      const distances: { [key: string]: number } = {};
      
      // Calculate distances between components
      const primarySink = sinks[0]; // Use the first sink for primary measurements
      const sinkToStove = calculateDistance(primarySink.position, stove.position);
      const sinkToRefrigerator = calculateDistance(primarySink.position, refrigerator.position);
      const stoveToRefrigerator = calculateDistance(stove.position, refrigerator.position);
      
      distances['כיור - כיריים'] = sinkToStove;
      distances['כיור - מקרר'] = sinkToRefrigerator;
      distances['כיריים - מקרר'] = stoveToRefrigerator;
      
      // Check additional sinks if present
      sinks.slice(1).forEach((sink, index) => {
        const additionalSinkToStove = calculateDistance(sink.position, stove.position);
        const additionalSinkToRefrigerator = calculateDistance(sink.position, refrigerator.position);
        
        distances[`כיור ${index + 2} - כיריים`] = additionalSinkToStove;
        distances[`כיור ${index + 2} - מקרר`] = additionalSinkToRefrigerator;
      });
      
      const violations = validateDistances(distances);
      const isValid = violations.length === 0;
      
      const validation = {
        isValid,
        sides: {
          sinkToStove,
          sinkToRefrigerator,
          stoveToRefrigerator,
        },
        violations,
        isComplete: true
      };
      
      setTriangleValidation(validation);
      // CRITICAL: NEVER auto-complete the game here!
      // Game completion is ONLY controlled by user clicking the finish button
    } else {
      // Reset validation if components are missing
      setTriangleValidation(null);
      // CRITICAL: NEVER auto-complete the game here either!
    }
  };

  // Detect gaps between components for auto-filling
  const detectGaps = (position: Vector3, itemWidth: number) => {
    const snapDistance = 0.05;
    const halfWidth = kitchenDimensions.width / 2;
    const halfLength = kitchenDimensions.length / 2;
    const itemHalfWidth = itemWidth / 2;
    const itemDepth = 0.6; // Standard cabinet depth
    const itemHalfDepth = itemDepth / 2;
    
    // Check if item is near a wall
    const nearLeftWall = Math.abs(position.x - (-halfWidth + snapDistance + itemHalfWidth)) < 0.1;
    const nearRightWall = Math.abs(position.x - (halfWidth - snapDistance - itemHalfWidth)) < 0.1;
    const nearBackWall = Math.abs(position.z - (-halfLength + snapDistance + itemHalfDepth)) < 0.1;
    const nearFrontWall = Math.abs(position.z - (halfLength - snapDistance - itemHalfDepth)) < 0.1;
    
    // Find adjacent items
    const adjacentItems = placedItems.filter(item => {
      const distance = Math.abs(position.z - item.position.z);
      return distance < 0.3; // Same row
    });
    
    let hasGap = false;
    let gapSize = 0;
    let gapPosition = '';
    let suggestedWidth: number | undefined;
    
    if (nearBackWall || nearFrontWall) {
      // Check for gaps along the wall
      const sortedItems = [...adjacentItems, { position, dimensions: { width: itemWidth } }]
        .sort((a, b) => a.position.x - b.position.x);
      
      for (let i = 0; i < sortedItems.length - 1; i++) {
        const currentItem = sortedItems[i];
        const nextItem = sortedItems[i + 1];
        
        const currentRight = currentItem.position.x + currentItem.dimensions.width / 2;
        const nextLeft = nextItem.position.x - nextItem.dimensions.width / 2;
        const gap = nextLeft - currentRight;
        
        if (gap > 0.1) { // Significant gap
          hasGap = true;
          gapSize = gap;
          gapPosition = `בין ${currentItem.name || 'רכיב'} ל${nextItem.name || 'רכיב'}`;
          suggestedWidth = Math.min(gap - 0.02, 1.2); // Leave small margin, max 1.2m
          break;
        }
      }
      
      // Check gap to walls
      if (!hasGap) {
        const leftmostItem = sortedItems[0];
        const rightmostItem = sortedItems[sortedItems.length - 1];
        
        const leftGap = leftmostItem.position.x - leftmostItem.dimensions.width / 2 - (-halfWidth + snapDistance);
        const rightGap = (halfWidth - snapDistance) - (rightmostItem.position.x + rightmostItem.dimensions.width / 2);
        
        if (leftGap > 0.1) {
          hasGap = true;
          gapSize = leftGap;
          gapPosition = 'לקיר השמאלי';
          suggestedWidth = Math.min(leftGap - 0.02, 1.2);
        } else if (rightGap > 0.1) {
          hasGap = true;
          gapSize = rightGap;
          gapPosition = 'לקיר הימני';
          suggestedWidth = Math.min(rightGap - 0.02, 1.2);
        }
      }
    }
    
    return { hasGap, gapSize, position: gapPosition, suggestedWidth };
  };
  
  // Create a custom cabinet with specified width
  const createCustomCabinet = (width: number): KitchenItem => {
    return {
      id: generateId('countertop'),
      type: KitchenItemType.COUNTERTOP,
      position: new Vector3(0, 0, 0),
      placed: false,
      name: `ארון ${width}מ'`,
      dimensions: { width, depth: 0.6, height: 0.85 },
      rotation: 0,
      customWidth: width,
    };
  };

  const value = {
    kitchenDimensions,
    setKitchenDimensions,
    windowPlacement,
    setWindowPlacement,
    customization,
    setCustomization,
    updateCustomization,
    availableItems,
    placedItems,
    selectedItem,
    setSelectedItem,
    placeItem,
    removeItem,
    triangleValidation,
    validateTriangle,
    gameCompleted,
    setGameCompleted,
    getDragValidation,
    detectGaps,
    createCustomCabinet,
  };

  return (
    <KitchenContext.Provider value={value}>
      {children}
    </KitchenContext.Provider>
  );
};

// Custom hook to use the kitchen context
export const useKitchen = () => useContext(KitchenContext);