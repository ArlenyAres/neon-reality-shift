
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameState, GameCanvasProps } from '@/types/game.types';
import { MOVE_SPEED, PLAYER_HEIGHT, PLAYER_WIDTH, STAIR_DURATION, INITIAL_LIVES } from '@/constants/game.constants';
import { generateLevelState, getLevelColors } from '@/utils/levelGenerator';
import { checkCollisions, updateInteractables, cleanupStairs } from '@/utils/gamePhysics';
import { findInteractableAtPosition, handleInteractableAction, useInventoryItem } from '@/utils/interactionHandler';
import { renderGame } from '@/utils/gameRenderer';
import { createTempStair, updatePlayerPosition, handlePlayerFall, isNearLadder, checkHazardCollisions, spawnRandomItems } from '@/utils/playerActions';

const GameCanvas: React.FC<GameCanvasProps> = ({ onObjectSolved, level = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => generateLevelState(level));
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClimbing, setIsClimbing] = useState(false);
  const { toast } = useToast();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStairRef = useRef<number>(0);
  const lastHazardHitRef = useRef<number>(0);
  const hazardCooldownMs = 1000; // 1 second cooldown between hazard hits

  // Generate level state based on current level
  useEffect(() => {
    setGameState(generateLevelState(level));
    showMessage(`Nivel ${level} iniciado - Resuelve 10 objetos para avanzar`);
  }, [level]);

  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newKeys = new Set(prev);
        newKeys.add(e.code);
        return newKeys;
      });
      
      // Reality shift with Tab
      if (e.code === 'Tab') {
        e.preventDefault(); // Prevent default tab behavior
        
        if (!isTransitioning && gameState.energy >= 20) {
          setIsTransitioning(true);
          
          // Decrease energy when shifting reality
          setGameState(prev => ({
            ...prev,
            energy: Math.max(0, prev.energy - 20)
          }));
          
          // Show message about reality shift
          showMessage(`Shifting to ${gameState.reality === 'physical' ? 'digital' : 'physical'} reality`);
          
          // Apply reality shift after transition animation
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              reality: prev.reality === 'physical' ? 'digital' : 'physical'
            }));
            setIsTransitioning(false);
          }, 1000);
        } else if (gameState.energy < 20) {
          showMessage("Not enough energy to shift reality");
        }
      }
      
      // Create temporary stairs with C
      if (e.code === 'KeyC') {
        if (gameState.energy >= 10) {
          // Check if enough time has passed since last stair creation (1 second cooldown)
          const now = Date.now();
          if (now - lastStairRef.current > 1000) {
            lastStairRef.current = now;
            setGameState(prev => createTempStair(prev, showMessage));
            showMessage("Escalera temporal creada! Durará 6 segundos");
          } else {
            showMessage("Espera un momento para crear otra escalera");
          }
        } else {
          showMessage("No tienes suficiente energía para crear una escalera");
        }
      }
      
      // Interact with E
      if (e.code === 'KeyE') {
        handleInteraction();
      }
      
      // Use items from inventory with 1 for battery and 2 for heart
      if (e.code === 'Digit1') {
        setGameState(prev => useInventoryItem(prev, 'battery', showMessage, showToastMessage));
      }
      
      if (e.code === 'Digit2') {
        setGameState(prev => useInventoryItem(prev, 'heart', showMessage, showToastMessage));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.code);
        return newKeys;
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.reality, gameState.energy, gameState.position, isTransitioning]);
  
  // Handle temporary stairs expiration
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setGameState(prev => cleanupStairs(prev));
    }, 1000); // Check every second
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // Utility function to show messages
  const showMessage = (message: string) => {
    setDisplayMessage(message);
    
    // Clear any existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    // Set new timeout to clear message
    messageTimeoutRef.current = setTimeout(() => {
      setDisplayMessage(null);
    }, 3000);
  };
  
  // Show toast wrapper
  const showToastMessage = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };
  
  // Handle player interaction with objects
  const handleInteraction = () => {
    const interactable = findInteractableAtPosition(gameState);
    if (interactable) {
      setGameState(prev => 
        handleInteractableAction(
          interactable, 
          prev, 
          onObjectSolved, 
          showMessage, 
          showToastMessage
        )
      );
    }
  };
  
  // Check if player is on a ladder
  useEffect(() => {
    setIsClimbing(isNearLadder(gameState));
  }, [gameState.position, gameState.reality, gameState.tempStairs]);
  
  // Game loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const gameLoop = () => {
      // Update game state
      setGameState(prev => {
        // Create a copy of the previous state
        let newState = { ...prev };
        
        // Apply movement based on keys pressed
        newState = updatePlayerPosition(newState, keysPressed, MOVE_SPEED, isClimbing);
        
        // Check collisions
        newState = checkCollisions(newState, canvas);
        
        // Update interactables
        newState = updateInteractables(newState);
        
        // Check for hazard collisions (with cooldown)
        const now = Date.now();
        if (newState.level >= 3 && now - lastHazardHitRef.current > hazardCooldownMs) {
          const stateAfterHazardCheck = checkHazardCollisions(newState, showMessage);
          if (stateAfterHazardCheck.hazardHits !== newState.hazardHits) {
            // If hazard hits changed, we hit a hazard, so update the timestamp
            lastHazardHitRef.current = now;
            newState = stateAfterHazardCheck;
          }
        }
        
        // Spawn random batteries and hearts in level 3+
        newState = spawnRandomItems(newState, canvas);
        
        // Handle falling
        newState = handlePlayerFall(newState, canvas.height, showMessage);
        
        // Game over check
        if (newState.health <= 0 || newState.lives <= 0) {
          setTimeout(() => {
            setGameState(generateLevelState(1));
          }, 2000);
        }
        
        // Regenerate energy slowly when in physical reality
        if (newState.reality === 'physical' && !isTransitioning) {
          newState.energy = Math.min(100, newState.energy + 0.1);
        }
        
        return newState;
      });
      
      // Render game
      const levelColors = getLevelColors(gameState.level);
      renderGame(context, gameState, levelColors, isTransitioning);
      
      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [keysPressed, isTransitioning, level, onObjectSolved, isClimbing]);
  
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center">
      {/* Game canvas */}
      <div className={cn(
        "relative overflow-hidden border-2 border-neon-purple rounded-md",
        isTransitioning && "animate-reality-shift"
      )}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600}
          className="bg-cyber-dark"
        />
        <div className="scan-line" />
      </div>
      
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full px-4 pt-2 flex justify-between">
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <Heart className="h-5 w-5 text-neon-pink" />
          <div className="w-32 h-3 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-pink" 
              style={{ width: `${gameState.health}%` }}
            />
          </div>
        </div>
        
        <div className="holographic rounded-md p-2 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-neon-orange" />
          <div className="w-32 h-3 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-orange" 
              style={{ width: `${gameState.energy}%` }}
            />
          </div>
        </div>
        
        <div className={cn(
          "holographic rounded-md p-2 flex items-center space-x-2",
          gameState.reality === 'physical' ? "text-neon-purple" : "text-neon-blue"
        )}>
          <Shield className="h-5 w-5" />
          <span className="text-xs font-mono">
            {gameState.reality.toUpperCase()} REALITY
          </span>
        </div>
      </div>
      
      {/* Game messages */}
      {displayMessage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 holographic px-4 py-2 rounded-md text-white animate-fade-in">
          {displayMessage}
        </div>
      )}
      
      {/* Controls Info */}
      <div className="absolute bottom-0 left-0 text-xs text-muted-foreground p-2">
        <p>WASD/Arrows: mover, Space: saltar, Tab: cambiar realidad, E: interactuar, C: crear escaleras, 1/2: usar objetos del inventario</p>
      </div>
      
      {/* Lives and inventory display */}
      <div className="absolute top-16 left-0 text-xs text-white p-2 holographic rounded-md m-2">
        <p>Vidas: {gameState.lives} | Nivel: {gameState.level}</p>
        {gameState.inventory.length > 0 && (
          <div className="mt-1">
            <p>Inventario:</p>
            <ul>
              {gameState.inventory.map((item, index) => (
                <li key={index}>
                  {item.type === 'battery' ? 'Baterías' : 'Corazones'}: {item.quantity} 
                  {item.type === 'battery' ? ' (1)' : ' (2)'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
