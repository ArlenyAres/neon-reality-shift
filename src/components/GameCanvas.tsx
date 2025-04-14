
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameState = {
  health: number;
  energy: number;
  reality: 'physical' | 'digital';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isJumping: boolean;
  platforms: Platform[];
  interactables: Interactable[];
};

type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'physical' | 'digital' | 'both';
};

type Interactable = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'terminal' | 'door' | 'item';
  state: 'locked' | 'unlocked';
  reality: 'physical' | 'digital' | 'both';
};

type GameCanvasProps = {
  onObjectSolved?: () => void;
  level?: number;
};

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;

const GameCanvas: React.FC<GameCanvasProps> = ({ onObjectSolved, level = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => generateLevelState(level));
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate level state based on current level
  function generateLevelState(level: number): GameState {
    // Base platforms that are always present
    const basePlatforms: Platform[] = [
      // Base platform - always visible
      { x: 0, y: 500, width: 800, height: 20, type: 'both' },
    ];
    
    // Base interactables
    const baseInteractables: Interactable[] = [];
    
    // Add level-specific platforms and interactables
    if (level === 1) {
      // Level 1 platforms
      basePlatforms.push(
        { x: 200, y: 400, width: 150, height: 20, type: 'physical' },
        { x: 500, y: 350, width: 150, height: 20, type: 'physical' },
        { x: 350, y: 320, width: 150, height: 20, type: 'digital' },
        { x: 650, y: 250, width: 150, height: 20, type: 'digital' }
      );
      
      // Level 1 interactables - we'll add 10 interactable objects for level completion
      baseInteractables.push(
        // Terminals - 4 terminals
        { x: 400, y: 470, width: 30, height: 30, type: 'terminal', state: 'locked', reality: 'digital' },
        { x: 550, y: 330, width: 30, height: 30, type: 'terminal', state: 'locked', reality: 'digital' },
        { x: 250, y: 380, width: 30, height: 30, type: 'terminal', state: 'locked', reality: 'digital' },
        { x: 680, y: 230, width: 30, height: 30, type: 'terminal', state: 'locked', reality: 'digital' },
        
        // Energy items - 3 items
        { x: 300, y: 370, width: 20, height: 20, type: 'item', state: 'unlocked', reality: 'physical' },
        { x: 470, y: 320, width: 20, height: 20, type: 'item', state: 'unlocked', reality: 'physical' },
        { x: 630, y: 220, width: 20, height: 20, type: 'item', state: 'unlocked', reality: 'digital' },
        
        // Door - exit point (counts as 3 objects when unlocked)
        { x: 750, y: 430, width: 40, height: 70, type: 'door', state: 'locked', reality: 'physical' }
      );
    } else {
      // Higher levels - more complex configurations
      // Generate more platforms with increasing difficulty
      for (let i = 0; i < level + 3; i++) {
        const x = Math.random() * 700;
        const y = 150 + Math.random() * 300;
        const width = 80 + Math.random() * 100;
        const reality = Math.random() > 0.5 ? 'physical' : 'digital';
        
        basePlatforms.push({ x, y, width, height: 20, type: reality });
      }
      
      // Generate more interactables with increasing complexity
      for (let i = 0; i < 4; i++) {
        // Terminals
        const termX = 100 + Math.random() * 600;
        const termY = 100 + Math.random() * 350;
        baseInteractables.push({
          x: termX, y: termY, width: 30, height: 30,
          type: 'terminal', state: 'locked', reality: 'digital'
        });
        
        // Items
        const itemX = 100 + Math.random() * 600;
        const itemY = 100 + Math.random() * 350;
        const itemReality = Math.random() > 0.5 ? 'physical' : 'digital';
        baseInteractables.push({
          x: itemX, y: itemY, width: 20, height: 20,
          type: 'item', state: 'unlocked', reality: itemReality
        });
      }
      
      // Always add one door
      baseInteractables.push({
        x: 750, y: 430, width: 40, height: 70,
        type: 'door', state: 'locked', reality: 'physical'
      });
    }
    
    return {
      health: 100,
      energy: 100,
      reality: 'physical',
      position: { x: 100, y: 300 },
      velocity: { x: 0, y: 0 },
      isJumping: false,
      platforms: basePlatforms,
      interactables: baseInteractables
    };
  }
  
  // Reset game state when level changes
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
      
      // Interact with E
      if (e.code === 'KeyE') {
        handleInteraction();
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
  }, [gameState.reality, gameState.energy, isTransitioning]);
  
  // Handle player interaction with objects
  const handleInteraction = () => {
    const player = {
      x: gameState.position.x,
      y: gameState.position.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT
    };
    
    for (const interactable of gameState.interactables) {
      // Check if player is close to interactable and it's in the current reality
      if (
        Math.abs(player.x - interactable.x) < 50 &&
        Math.abs(player.y - interactable.y) < 50 &&
        (interactable.reality === gameState.reality || interactable.reality === 'both')
      ) {
        handleInteractableAction(interactable);
        break;
      }
    }
  };
  
  const handleInteractableAction = (interactable: Interactable) => {
    // Handle terminal interaction
    if (interactable.type === 'terminal' && gameState.reality === 'digital') {
      if (interactable.state === 'locked') {
        // Unlock the terminal and the door
        setGameState(prev => {
          const updatedInteractables = prev.interactables.map(item => {
            if (item.type === 'terminal' && item.x === interactable.x && item.y === interactable.y) {
              return { ...item, state: 'unlocked' as const };
            }
            if (item.type === 'door' && prev.interactables.filter(i => 
              i.type === 'terminal' && i.state === 'unlocked'
            ).length >= 3) {
              return { ...item, state: 'unlocked' as const };
            }
            return item;
          });
          
          return {
            ...prev,
            interactables: updatedInteractables
          };
        });
        
        showMessage("Terminal hackeado! Terminal desbloqueado.");
        toast({
          title: "Terminal Hackeado",
          description: "Has desbloqueado un terminal. Hackea más para desbloquear la puerta.",
        });
        
        // Notify parent that object was solved
        if (onObjectSolved) onObjectSolved();
      } else {
        showMessage("Terminal ya hackeado");
      }
    }
    
    // Handle door interaction
    else if (interactable.type === 'door') {
      if (interactable.state === 'unlocked' && gameState.reality === 'physical') {
        showMessage("Puerta desbloqueada! Avanzando al siguiente desafío...");
        toast({
          title: "Puerta Desbloqueada",
          description: "Acceso concedido. Este objeto cuenta como 3 objetivos resueltos.",
        });
        
        // Door counts as 3 objects when solved
        if (onObjectSolved) {
          onObjectSolved();
          onObjectSolved();
          onObjectSolved();
        }
      } else if (interactable.state === 'locked') {
        showMessage("Puerta bloqueada. Hackea terminales en la realidad digital.");
      }
    }
    
    // Handle item pickup
    else if (interactable.type === 'item') {
      // Remove the item from the game and add energy
      setGameState(prev => {
        const updatedInteractables = prev.interactables.filter(item => 
          !(item.type === 'item' && item.x === interactable.x && item.y === interactable.y)
        );
        
        return {
          ...prev,
          energy: Math.min(100, prev.energy + 30),
          interactables: updatedInteractables
        };
      });
      
      showMessage("Fragmento de energía recogido (+30 energía)");
      
      // Notify parent that object was solved
      if (onObjectSolved) onObjectSolved();
    }
  };
  
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
        const newState = { ...prev };
        
        // Apply movement based on keys pressed
        if (keysPressed.has('ArrowLeft') || keysPressed.has('KeyA')) {
          newState.velocity.x = -MOVE_SPEED;
        } else if (keysPressed.has('ArrowRight') || keysPressed.has('KeyD')) {
          newState.velocity.x = MOVE_SPEED;
        } else {
          // Decelerate when no keys are pressed
          newState.velocity.x = 0;
        }
        
        // Handle jumping
        if ((keysPressed.has('ArrowUp') || keysPressed.has('KeyW') || keysPressed.has('Space')) && !newState.isJumping) {
          newState.velocity.y = JUMP_FORCE;
          newState.isJumping = true;
        }
        
        // Apply gravity
        newState.velocity.y += GRAVITY;
        
        // Update position
        newState.position.x += newState.velocity.x;
        newState.position.y += newState.velocity.y;
        
        // Boundary constraints
        if (newState.position.x < 0) newState.position.x = 0;
        if (newState.position.x > canvas.width - PLAYER_WIDTH) {
          newState.position.x = canvas.width - PLAYER_WIDTH;
        }
        
        // Reset jumping state if on a platform
        let onPlatform = false;
        
        // Collision detection with platforms
        for (const platform of newState.platforms) {
          // Skip platforms that aren't in the current reality
          if (platform.type !== 'both' && platform.type !== newState.reality) continue;
          
          const playerBottom = newState.position.y + PLAYER_HEIGHT;
          const platformTop = platform.y;
          
          // Check if player is directly above the platform and falling
          if (
            newState.velocity.y >= 0 &&
            playerBottom >= platformTop && 
            playerBottom - newState.velocity.y <= platformTop &&
            newState.position.x + PLAYER_WIDTH > platform.x && 
            newState.position.x < platform.x + platform.width
          ) {
            // Land on platform
            newState.position.y = platform.y - PLAYER_HEIGHT;
            newState.velocity.y = 0;
            newState.isJumping = false;
            onPlatform = true;
          }
        }
        
        // If not on any platform and going down, still jumping
        if (!onPlatform && newState.velocity.y >= 0) {
          newState.isJumping = true;
        }
        
        // If fell off the bottom, reset
        if (newState.position.y > canvas.height) {
          newState.position = { x: 100, y: 300 };
          newState.velocity = { x: 0, y: 0 };
          newState.health = Math.max(0, newState.health - 20);
          
          showMessage("Caída al vacío! Salud -20");
          
          if (newState.health <= 0) {
            showMessage("Game Over - Reiniciando");
            setTimeout(() => {
              setGameState(generateLevelState(1));
            }, 2000);
          }
        }
        
        // Regenerate energy slowly when in physical reality
        if (newState.reality === 'physical' && !isTransitioning) {
          newState.energy = Math.min(100, newState.energy + 0.1);
        }
        
        return newState;
      });
      
      // Render game
      renderGame(context);
      
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
  }, [keysPressed, isTransitioning, level, onObjectSolved]);
  
  // Render game
  const renderGame = (context: CanvasRenderingContext2D) => {
    const canvas = context.canvas;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background based on reality
    if (gameState.reality === 'physical') {
      context.fillStyle = '#1f1f3a';
    } else {
      context.fillStyle = '#1a3a2a';
    }
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines for digital reality
    if (gameState.reality === 'digital') {
      context.strokeStyle = 'rgba(30, 174, 219, 0.2)';
      context.lineWidth = 1;
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 20) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += 20) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
    }
    
    // Draw platforms
    gameState.platforms.forEach(platform => {
      if (platform.type === 'both' || platform.type === gameState.reality) {
        if (gameState.reality === 'physical') {
          context.fillStyle = '#7E69AB';
        } else {
          context.fillStyle = '#1EAEDB';
        }
        context.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    });
    
    // Draw interactable objects
    gameState.interactables.forEach(interactable => {
      if (interactable.reality === 'both' || interactable.reality === gameState.reality) {
        if (interactable.type === 'terminal') {
          // Draw terminal
          context.fillStyle = interactable.state === 'locked' ? '#F97316' : '#33C3F0';
          context.fillRect(interactable.x, interactable.y, interactable.width, interactable.height);
        } else if (interactable.type === 'door') {
          // Draw door
          context.fillStyle = interactable.state === 'locked' ? '#D946EF' : '#33C3F0';
          context.fillRect(interactable.x, interactable.y, interactable.width, interactable.height);
        } else if (interactable.type === 'item') {
          // Draw energy item
          context.fillStyle = '#F97316';
          context.beginPath();
          context.arc(
            interactable.x + interactable.width / 2,
            interactable.y + interactable.height / 2, 
            interactable.width / 2, 
            0, 
            Math.PI * 2
          );
          context.fill();
        }
      }
    });
    
    // Draw player
    if (gameState.reality === 'physical') {
      context.fillStyle = '#9b87f5';
    } else {
      context.fillStyle = '#33C3F0';
    }
    context.fillRect(
      gameState.position.x, 
      gameState.position.y, 
      PLAYER_WIDTH, 
      PLAYER_HEIGHT
    );
    
    // Draw reality transition effect
    if (isTransitioning) {
      context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some glitch effect lines
      for (let i = 0; i < 10; i++) {
        const y = Math.random() * canvas.height;
        const width = Math.random() * 100 + 50;
        context.fillStyle = 'rgba(0, 255, 255, 0.3)';
        context.fillRect(0, y, width, 2);
        
        const y2 = Math.random() * canvas.height;
        const width2 = Math.random() * 100 + 50;
        context.fillStyle = 'rgba(255, 0, 255, 0.3)';
        context.fillRect(canvas.width - width2, y2, width2, 2);
      }
    }
    
    // Draw level instructions
    context.fillStyle = 'rgba(155, 135, 245, 0.7)';
    context.font = '14px "Share Tech Mono", monospace';
    context.fillText(`Nivel ${level}: Resuelve 10 objetos para avanzar`, 10, 20);
  };
  
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
        <p>WASD/Arrows to move, Space to jump, Tab to shift reality, E to interact</p>
      </div>
    </div>
  );
};

export default GameCanvas;
