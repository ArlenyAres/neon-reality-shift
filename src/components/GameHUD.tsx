
import React from 'react';
import { Heart, Zap, Shield, Database, Cpu, Stairs } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameHUDProps = {
  health: number;
  energy: number;
  reality: 'physical' | 'digital';
  score?: number;
  solvedObjects?: number;
  totalObjectsToSolve?: number;
};

const GameHUD: React.FC<GameHUDProps> = ({ 
  health, 
  energy, 
  reality,
  score = 0,
  solvedObjects = 0,
  totalObjectsToSolve = 10
}) => {
  return (
    <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-10 flex flex-col">
      {/* Top HUD - Health, Energy, Reality Status */}
      <div className="w-full p-4 flex justify-between">
        {/* Health Bar */}
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <Heart className="h-5 w-5 text-neon-pink" />
          <div className="w-24 md:w-32 h-3 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-pink transition-all duration-300" 
              style={{ width: `${health}%` }}
            />
          </div>
          <span className="text-xs font-cyber text-white">{health}%</span>
        </div>
        
        {/* Energy Bar */}
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-neon-orange" />
          <div className="w-24 md:w-32 h-3 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-orange transition-all duration-300" 
              style={{ width: `${energy}%` }}
            />
          </div>
          <span className="text-xs font-cyber text-white">{energy}%</span>
        </div>
        
        {/* Reality Status */}
        <div className={cn(
          "holographic rounded-md p-2 flex items-center space-x-2 transition-all duration-500",
          reality === 'physical' ? "text-neon-purple" : "text-neon-blue"
        )}>
          <Shield className="h-5 w-5" />
          <span className="text-xs font-mono hidden md:inline">
            {reality.toUpperCase()} REALITY
          </span>
          <div 
            className={cn(
              "h-3 w-3 rounded-full",
              reality === 'physical' ? "bg-neon-purple" : "bg-neon-blue",
              reality === 'physical' ? "animate-pulse" : "animate-flicker"
            )}
          />
        </div>
      </div>
      
      {/* Game Instructions - Below Energy Bar */}
      <div className="w-full px-4 flex justify-center">
        <div className="holographic rounded-md p-2 mt-1 text-center">
          <p className="text-xs font-cyber text-white">
            MISIÓN: <span className="text-neon-skyBlue">Resuelve {totalObjectsToSolve} objetos para subir de nivel</span> - 
            Progreso: <span className="text-neon-pink">{solvedObjects}/{totalObjectsToSolve}</span>
          </p>
        </div>
      </div>
      
      {/* Bottom HUD - Score, Objectives */}
      <div className="mt-auto w-full p-4 flex justify-between items-end">
        {/* Score */}
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <Database className="h-5 w-5 text-neon-skyBlue" />
          <span className="text-xs font-cyber text-white">SCORE: {score}</span>
        </div>
        
        {/* Controls Information */}
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Stairs className="h-4 w-4 text-neon-vividPurple" />
            <span className="text-xs font-cyber text-white">C: CREAR ESCALERA (10 ENERGÍA)</span>
          </div>
        </div>
        
        {/* Reality Shift Cost */}
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-neon-vividPurple" />
          <span className="text-xs font-cyber text-white">SHIFT COST: 20 ENERGY</span>
        </div>
      </div>
      
      {/* Scan lines effect */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="scan-line"></div>
      </div>
      
      {/* Reality indicator overlay */}
      <div className={cn(
        "fixed top-0 left-0 w-full h-full pointer-events-none",
        reality === 'physical' 
          ? "bg-neon-purple opacity-5" 
          : "bg-neon-blue opacity-5"
      )}></div>
    </div>
  );
};

export default GameHUD;
