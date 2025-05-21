import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speed: number;
}

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    const colors = ['#e3a92b', '#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6'];
    const newPieces: ConfettiPiece[] = [];
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 40,
        size: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speed: 1 + Math.random() * 3,
      });
    }
    
    setPieces(newPieces);
    
    // Clean up after animation
    const timeout = setTimeout(() => {
      setPieces([]);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="confetti">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 1.5}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `fall ${6 / piece.speed}s linear forwards`,
          }}
        />
      ))}
      <style jsx="true">{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;