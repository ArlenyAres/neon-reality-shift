
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type TransitionScreenProps = {
  fromReality: 'physical' | 'digital';
  toReality: 'physical' | 'digital';
  onTransitionComplete: () => void;
};

const TransitionScreen: React.FC<TransitionScreenProps> = ({ 
  fromReality, 
  toReality,
  onTransitionComplete 
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onTransitionComplete();
          }, 300);
          return 100;
        }
        return newProgress;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [onTransitionComplete]);
  
  return (
    <div className="fixed inset-0 z-50 bg-cyber-dark flex flex-col items-center justify-center overflow-hidden">
      {/* Split screen effect */}
      <div className="w-full h-full flex">
        {/* Physical Reality Side */}
        <div 
          className={cn(
            "w-1/2 h-full bg-cyber-dark relative overflow-hidden transition-all duration-500",
            progress > 50 && "w-1/3"
          )}
        >
          <div className="absolute inset-0 bg-reality-physical opacity-80"></div>
          
          {/* City elements */}
          <div className="absolute bottom-0 left-0 right-0 h-48">
            {/* Buildings */}
            <div className="absolute bottom-0 left-[10%] w-20 h-64 bg-cyber-dark opacity-80"></div>
            <div className="absolute bottom-0 left-[25%] w-12 h-80 bg-cyber-dark opacity-80"></div>
            <div className="absolute bottom-0 left-[40%] w-16 h-56 bg-cyber-dark opacity-80"></div>
            <div className="absolute bottom-0 left-[60%] w-24 h-72 bg-cyber-dark opacity-80"></div>
            <div className="absolute bottom-0 left-[80%] w-14 h-48 bg-cyber-dark opacity-80"></div>
            
            {/* Windows */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`window-${i}`}
                className="absolute w-1 h-1 bg-neon-purple"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 48}%`,
                  opacity: Math.random() * 0.5 + 0.5
                }}
              ></div>
            ))}
          </div>
          
          {/* Glitch lines */}
          {progress > 30 && (
            <>
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={`glitch-${i}`}
                  className="absolute h-1 bg-neon-blue animate-glitch"
                  style={{
                    left: 0,
                    right: 0,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                ></div>
              ))}
            </>
          )}
          
          {/* Reality Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <p className={cn(
              "text-neon-purple font-futuristic text-xl md:text-3xl tracking-wide",
              fromReality === 'physical' && progress > 50 && "animate-glitch opacity-70"
            )}>
              REALIDAD FÍSICA
            </p>
          </div>
        </div>
        
        {/* Digital Reality Side */}
        <div 
          className={cn(
            "w-1/2 h-full bg-cyber-dark relative overflow-hidden transition-all duration-500",
            progress > 50 && "w-2/3"
          )}
        >
          <div className="absolute inset-0 bg-reality-digital opacity-80"></div>
          
          {/* Digital elements - grid and code */}
          <div className="absolute inset-0 bg-cyber-grid bg-opacity-10 bg-[length:20px_20px]"></div>
          
          {/* Code lines */}
          <div className="absolute inset-0 font-cyber text-neon-blue text-xs opacity-20 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`code-${i}`}
                className="absolute whitespace-nowrap"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `translateX(-${Math.random() * 100}%)`
                }}
              >
                {`01${Math.random().toString(2).substring(2, 30)}10`}
              </div>
            ))}
          </div>
          
          {/* Floating data blocks */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={`data-${i}`}
              className="absolute bg-neon-blue bg-opacity-10 border border-neon-blue border-opacity-30 animate-float"
              style={{
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
          
          {/* Glitch lines */}
          {progress > 30 && (
            <>
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={`digital-glitch-${i}`}
                  className="absolute h-1 bg-neon-purple animate-glitch"
                  style={{
                    left: 0,
                    right: 0,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                ></div>
              ))}
            </>
          )}
          
          {/* Reality Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <p className={cn(
              "text-neon-blue font-futuristic text-xl md:text-3xl tracking-wide",
              fromReality === 'digital' && progress > 50 && "animate-glitch opacity-70"
            )}>
              REALIDAD DIGITAL
            </p>
          </div>
        </div>
      </div>
      
      {/* Transition progress bar */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-1/2 max-w-md">
        <div className="holographic rounded-full h-2 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-200",
              fromReality === 'physical' ? "bg-neon-blue" : "bg-neon-purple"
            )}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center text-white text-xs mt-2 font-cyber">
          {progress < 50 
            ? `DESESTABILIZANDO REALIDAD ${fromReality.toUpperCase()}`
            : `ESTABILIZANDO REALIDAD ${toReality.toUpperCase()}`
          }
        </p>
      </div>
      
      {/* Scan lines */}
      <div className="scan-line"></div>
      
      {/* Glitch overlay at peak transition */}
      {progress > 45 && progress < 55 && (
        <div className="absolute inset-0 pointer-events-none animate-glitch">
          <div className="absolute inset-0 bg-neon-pink opacity-10"></div>
        </div>
      )}
    </div>
  );
};

export default TransitionScreen;
