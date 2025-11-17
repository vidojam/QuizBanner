import { useEffect, useState } from "react";

interface AnimatedBanner {
  id: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  color: string;
  duration: number;
  delay: number;
  size: number;
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal  
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Lavender
  '#85C1E9', // Sky Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getRandomDuration() {
  return Math.random() * 3 + 2; // 2-5 seconds
}

function getRandomDelay() {
  return Math.random() * 2; // 0-2 seconds
}

function getFixedSize() {
  return 60; // Fixed 60px thickness for all banners
}

export function AnimatedBanners() {
  const [banners, setBanners] = useState<AnimatedBanner[]>([]);
  
  console.log('AnimatedBanners render - banners count:', banners.length);

  useEffect(() => {
    console.log('AnimatedBanners component mounted');
    
    // Create initial banners
    const initialBanners: AnimatedBanner[] = [];
    
    // Add banners for each side
    const sides: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
    
    sides.forEach((side, sideIndex) => {
      // Add 2-4 banners per side
      const bannersPerSide = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < bannersPerSide; i++) {
        initialBanners.push({
          id: `${side}-${i}-${Date.now()}`,
          side,
          color: getRandomColor(),
          duration: getRandomDuration(),
          delay: getRandomDelay() + (i * 0.5),
          size: getFixedSize(),
        });
      }
    });

    console.log('Initial banners created:', initialBanners.length);
    setBanners(initialBanners);

    // Continuously add new banners
    const interval = setInterval(() => {
      setBanners(prev => {
        // Remove banners older than 10 seconds to prevent memory leak
        const now = Date.now();
        const filtered = prev.filter(banner => {
          const age = (now - parseInt(banner.id.split('-')[2])) / 1000;
          return age < 10;
        });

        // Add new random banner
        const randomSide = sides[Math.floor(Math.random() * sides.length)];
        const newBanner: AnimatedBanner = {
          id: `${randomSide}-${Math.random()}-${now}`,
          side: randomSide,
          color: getRandomColor(),
          duration: getRandomDuration(),
          delay: 0,
          size: getFixedSize(),
        };

        console.log('Adding new banner:', newBanner.side, newBanner.color);
        return [...filtered, newBanner];
      });
    }, 1000); // Add new banner every 1 second (faster for testing)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {banners.map((banner) => {
        const isHorizontal = banner.side === 'top' || banner.side === 'bottom';
        
        const baseStyles = {
          position: 'absolute' as const,
          backgroundColor: banner.color,
          opacity: 0.9,
          borderRadius: '8px',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        };

        const animationStyles = {
          animationDuration: `${banner.duration}s`,
          animationDelay: `${banner.delay}s`,
          animationIterationCount: 'infinite' as const,
          animationTimingFunction: 'linear' as const,
        };

        if (isHorizontal) {
          // Horizontal banners (top/bottom)
          const horizontalStyles = {
            ...baseStyles,
            ...animationStyles,
            height: `${banner.size}px`,
            width: '100vw',
            left: '0px',
            [banner.side]: '0px',
          };

          return (
            <div
              key={banner.id}
              className={`animated-banner ${banner.side === 'top' ? 'slide-right-to-left' : 'slide-left-to-right'}`}
              style={horizontalStyles}
            />
          );
        } else {
          // Vertical banners (left/right)
          const verticalStyles = {
            ...baseStyles,
            ...animationStyles,
            width: `${banner.size}px`,
            height: '100vh',
            top: '0px',
            [banner.side]: '0px',
          };

          return (
            <div
              key={banner.id}
              className={`animated-banner ${banner.side === 'left' ? 'slide-bottom-to-top' : 'slide-top-to-bottom'}`}
              style={verticalStyles}
            />
          );
        }
      })}
    </div>
  );
}