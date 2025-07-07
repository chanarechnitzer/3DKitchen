  interface KitchenContextType {
  getDragValidation: (position: Vector3, type: KitchenItemType) => { isValid: boolean; distances: { [key: string]: number } };
  updateCabinetSize: (itemId: string, newWidth: number) => void;
  updateOvenStack: (baseOvenId: string, newOvenId: string) => void;
}

const defaultContext: KitchenContextType = {
  setGameCompleted: () => {},
  getDragValidation: () => ({ isValid: false, distances: {} }),
  updateCabinetSize: () => {},
  updateOvenStack: () => {},
};

const getDragValidation = (position: Vector3, type: KitchenItemType) => {
    return { isValid, distances };
  };

  // Update cabinet size
  const updateCabinetSize = (itemId: string, newWidth: number) => {
    setPlacedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, dimensions: { ...item.dimensions, width: newWidth } }
        : item
    ));
  };

  // Update oven stack
  const updateOvenStack = (baseOvenId: string, newOvenId: string) => {
    setPlacedItems(prev => prev.map(item => {
      if (item.id === baseOvenId) {
        return { ...item, name: item.name + ' (כפול)', dimensions: { ...item.dimensions, height: 1.2 } };
      }
      if (item.id === newOvenId) {
        return { ...item, name: item.name + ' (עליון)', position: new Vector3(item.position.x, 0.6, item.position.z) };
      }
      return item;
    }));
  };

  return {
    getDragValidation,
    updateCabinetSize,
    updateOvenStack,
  };

export const useKitchen = () => useContext(KitchenContext);