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
  availableItems: KitchenItem[];
  placedItems: KitchenItem[];
  selectedItem: KitchenItem | null;
  setSelectedItem: (item: KitchenItem | null) => void;
  placeItem: (itemId: string, position: Vector3) => void;
  removeItem: (itemId: string) => void;
  triangleValidation: TriangleValidation | null;
  validateTriangle: () => void;
  gameCompleted: boolean;
  getDragValidation: (position: Vector3, type: KitchenItemType) => { isValid: boolean; distances: { [key: string]: number } };
}

// Default context value
const defaultContext: KitchenContextType = {
  kitchenDimensions: { width: 0, length: 0 },
  setKitchenDimensions: () => {},
  availableItems: [],
  placedItems: [],
  selectedItem: null,
  setSelectedItem: () => {},
  placeItem: () => {},
  removeItem: () => {},
  triangleValidation: null,
  validateTriangle: () => {},
  gameCompleted: false,
  getDragValidation: () => ({ isValid: false, distances: {} }),
};

// Create context
const KitchenContext = createContext<KitchenContextType>(defaultContext);

// Generate unique ID
const generateId = (type: string) => `${type}-${Math.random().toString(36).substr(2, 9)}`;

// Initial kitchen items
const initialKitchenItems: KitchenItem[] = [
  {
    id: generateId('sink'),
    type: KitchenItemType.SINK,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיור',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
  },
  {
    id: generateId('sink'),
    type: KitchenItemType.SINK,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיור נוסף',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
  },
  {
    id: generateId('stove'),
    type: KitchenItemType.STOVE,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיריים',
    dimensions: { width: 0.6, depth: 0.6, height: 0.9 },
  },
  {
    id: generateId('oven'),
    type: KitchenItemType.OVEN,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'תנור',
    dimensions: { width: 0.6, depth: 0.6, height: 0.6 },
  },
  {
    id: generateId('refrigerator'),
    type: KitchenItemType.REFRIGERATOR,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'מקרר',
    dimensions: { width: 0.8, depth: 0.7, height: 1.8 },
  },
  ...Array(10).fill(null).map(() => ({
    id: generateId('countertop'),
    type: KitchenItemType.COUNTERTOP,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'משטח עם מגירות',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
  })),
];

// Provider component
export const KitchenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [kitchenDimensions, setKitchenDimensions] = useState({ width: 0, length: 0 });
  const [availableItems, setAvailableItems] = useState<KitchenItem[]>(initialKitchenItems);
  const [placedItems, setPlacedItems] = useState<KitchenItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KitchenItem | null>(null);
  const [triangleValidation, setTriangleValidation] = useState<TriangleValidation | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Calculate distance between two positions
  const calculateDistance = (pos1: Vector3, pos2: Vector3): number => {
    return pos1.distanceTo(pos2);
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
  const placeItem = (itemId: string, position: Vector3) => {
    const itemIndex = availableItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const item = { ...availableItems[itemIndex], position, placed: true };
      
      // Check if trying to place more than 10 cabinets
      if (item.type === KitchenItemType.COUNTERTOP) {
        const placedCabinets = placedItems.filter(i => i.type === KitchenItemType.COUNTERTOP).length;
        if (placedCabinets >= 10) {
          return; // Don't place if limit reached
        }
      }
      
      setAvailableItems(prev => prev.filter(item => item.id !== itemId));
      setPlacedItems(prev => [...prev, item]);
      
      // Validate triangle after placing an item
      setTimeout(validateTriangle, 100);
    }
  };

  // Remove an item from the kitchen
  const removeItem = (itemId: string) => {
    const itemIndex = placedItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const item = { ...placedItems[itemIndex], placed: false };
      
      setPlacedItems(prev => prev.filter(item => item.id !== itemId));
      setAvailableItems(prev => [...prev, item]);
      setGameCompleted(false);
      
      // Validate triangle after removing an item
      setTimeout(validateTriangle, 100);
    }
  };

  // Validate the kitchen triangle
  const validateTriangle = () => {
    const sinks = placedItems.filter(item => item.type === KitchenItemType.SINK);
    const stove = placedItems.find(item => item.type === KitchenItemType.STOVE);
    const refrigerator = placedItems.find(item => item.type === KitchenItemType.REFRIGERATOR);
    
    const isComplete = sinks.length > 0 && stove !== undefined && refrigerator !== undefined;
    
    if (isComplete) {
      const distances: { [key: string]: number } = {};
      
      sinks.forEach((sink, index) => {
        const sinkToStove = calculateDistance(sink.position, stove.position);
        const sinkToRefrigerator = calculateDistance(sink.position, refrigerator.position);
        
        distances[`כיור${index > 0 ? ' ' + (index + 1) : ''} - כיריים`] = sinkToStove;
        distances[`כיור${index > 0 ? ' ' + (index + 1) : ''} - מקרר`] = sinkToRefrigerator;
      });
      
      const stoveToRefrigerator = calculateDistance(stove.position, refrigerator.position);
      distances['כיריים - מקרר'] = stoveToRefrigerator;
      
      const violations = validateDistances(distances);
      const isValid = violations.length === 0;
      
      const validation = {
        isValid,
        sides: {
          sinkToStove: distances['כיור - כיריים'],
          sinkToRefrigerator: distances['כיור - מקרר'],
          stoveToRefrigerator,
        },
        violations,
        isComplete
      };
      
      setTriangleValidation(validation);
      setGameCompleted(isValid);
    } else {
      setTriangleValidation(null);
      setGameCompleted(false);
    }
  };

  const value = {
    kitchenDimensions,
    setKitchenDimensions,
    availableItems,
    placedItems,
    selectedItem,
    setSelectedItem,
    placeItem,
    removeItem,
    triangleValidation,
    validateTriangle,
    gameCompleted,
    getDragValidation,
  };

  return (
    <KitchenContext.Provider value={value}>
      {children}
    </KitchenContext.Provider>
  );
};

// Custom hook to use the kitchen context
export const useKitchen = () => useContext(KitchenContext);