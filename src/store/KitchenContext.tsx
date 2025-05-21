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
};

// Create context
const KitchenContext = createContext<KitchenContextType>(defaultContext);

// Initial kitchen items
const initialKitchenItems: KitchenItem[] = [
  {
    id: 'sink',
    type: KitchenItemType.SINK,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיור',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
  },
  {
    id: 'stove',
    type: KitchenItemType.STOVE,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'כיריים',
    dimensions: { width: 0.6, depth: 0.6, height: 0.9 },
  },
  {
    id: 'oven',
    type: KitchenItemType.OVEN,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'תנור',
    dimensions: { width: 0.6, depth: 0.6, height: 0.6 },
  },
  {
    id: 'refrigerator',
    type: KitchenItemType.REFRIGERATOR,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'מקרר',
    dimensions: { width: 0.8, depth: 0.7, height: 1.8 },
  },
  {
    id: 'countertop',
    type: KitchenItemType.COUNTERTOP,
    position: new Vector3(0, 0, 0),
    placed: false,
    name: 'משטח עם מגירות',
    dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
  },
];

// Provider component
export const KitchenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [kitchenDimensions, setKitchenDimensions] = useState({ width: 0, length: 0 });
  const [availableItems, setAvailableItems] = useState<KitchenItem[]>(initialKitchenItems);
  const [placedItems, setPlacedItems] = useState<KitchenItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KitchenItem | null>(null);
  const [triangleValidation, setTriangleValidation] = useState<TriangleValidation | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Place an item in the kitchen
  const placeItem = (itemId: string, position: Vector3) => {
    const itemIndex = availableItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const item = { ...availableItems[itemIndex], position, placed: true };
      
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

  // Calculate distance between two positions
  const calculateDistance = (pos1: Vector3, pos2: Vector3): number => {
    return pos1.distanceTo(pos2);
  };

  // Validate the kitchen triangle
  const validateTriangle = () => {
    const sink = placedItems.find(item => item.type === KitchenItemType.SINK);
    const stove = placedItems.find(item => item.type === KitchenItemType.STOVE);
    const refrigerator = placedItems.find(item => item.type === KitchenItemType.REFRIGERATOR);
    
    if (sink && stove && refrigerator) {
      const sinkToStove = calculateDistance(sink.position, stove.position);
      const sinkToRefrigerator = calculateDistance(sink.position, refrigerator.position);
      const stoveToRefrigerator = calculateDistance(stove.position, refrigerator.position);
      
      const isValid = 
        sinkToStove > 1.2 && sinkToStove < 5 &&
        sinkToRefrigerator > 1.2 && sinkToRefrigerator < 5 &&
        stoveToRefrigerator > 1.2 && stoveToRefrigerator < 5;
      
      const validation = {
        isValid,
        sides: {
          sinkToStove,
          sinkToRefrigerator,
          stoveToRefrigerator,
        },
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
  };

  return (
    <KitchenContext.Provider value={value}>
      {children}
    </KitchenContext.Provider>
  );
};

// Custom hook to use the kitchen context
export const useKitchen = () => useContext(KitchenContext);