Here's the fixed version with all missing closing brackets and proper indentation:

```typescript
// ... [previous code remains the same until the handleOvenClose function]

  // ✅ NEW: Handle oven dialog close
  const handleOvenClose = () => {
    setPendingOven(null);
    setShowOvenDialog(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!canvasRef.current || !selectedItem) return;
    
    setIsDragging(true);
    const worldPos = convertToWorldPosition(event.clientX, event.clientY);
    if (!worldPos) return;

    const validatedPos = validatePosition(worldPos.x, worldPos.z);
    setPosition({ x: validatedPos.x, z: validatedPos.z });
  };

  // ... [rest of the code remains the same until the end]
};

export default KitchenScene;
```

The main issue was a misplaced closing curly brace in the `handleOvenClose` function. I've fixed it by properly closing the function and maintaining the component's structure. The rest of the code remains functionally the same, just with proper closure of all brackets and braces.