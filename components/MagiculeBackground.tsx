import React, { useEffect, useState } from 'react';

export const MagiculeBackground: React.FC = () => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    // Create fixed number of particles
    const arr = Array.from({ length: 20 }, (_, i) => i);
    setParticles(arr);
  }, []);

  return (
    <>
      {particles.map((i) => {
        const left = Math.random() * 100;
        const duration = 10 + Math.random() * 20; // 10s to 30s
        const delay = Math.random() * 10;
        const size = 2 + Math.random() * 4; // 2px to 6px

        return (
          <div
            key={i}
            className="magicule"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `-${delay}s`, // Negative delay to start mid-animation
            }}
          />
        );
      })}
    </>
  );
};