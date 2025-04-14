
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Zap, Shield, Stairs } from 'lucide-react';
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
  tempStairs: TempStair[];
  level: number;
};

type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'physical' | 'digital' | 'both';
};

type Interactable = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'terminal' | 'door' | 'item';
  state: 'locked' | 'unlocked';
  reality: 'physical' | 'digital' | 'both';
  isMoving?: boolean;
  moveSpeed?: number;
  moveDirection?: 'horizontal' | 'vertical';
  moveRange?: number;
  originalPosition?: { x: number; y: number };
};

type TempStair = {
  x: number;
  y: number;
  width: number;
  height: number;
  reality: 'physical' | 'digital' | 'both';
  createdAt: number;
  duration: number;
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
const STAIR_DURATION = 6000; // 6 seconds in milliseconds

const GameCanvas: React.FC<GameCanvasProps> = ({ onObjectSolved, level = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => generateLevelState(level));
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStairRef = useRef<number>(0);

  // Generate level state based on current level
  function generateLevelState(level: number): GameState {
    // Base platforms that are always present
    const basePlatforms: Platform[] = [
      // Base platform - always visible
      { x: 0, y: 500, width: 800, height: 20, type: 'both' },
    ];
    
    // Base interactables
    const baseInteractables: Interactable[] = [];
    
    // Level colors vary with level
    const levelColors = {
      physical: {
        background: level % 3 === 0 ? '#1f2a3a' : level % 2 === 0 ? '#2a1f3a' : '#1f1f3a',
        platform: level % 3 === 0 ? '#8E77CE' : level % 2 === 0 ? '#7E89AB' : '#7E69AB',
        player: level % 3 === 0 ? '#a797f5' : level % 2 === 0 ? '#8b97f5' : '#9b87f5',
      },
      digital: {
        background: level % 3 === 0 ? '#1a3a20' : level % 2 === 0 ? '#1a203a' : '#1a3a2a',
        platform: level % 3 === 0 ? '#33e3f0' : level % 2 === 0 ? '#33f0ae' : '#1EAEDB',
        player: level % 3 === 0 ? '#33f0f0' : level % 2 === 0 ? '#33f0dd' : '#33C3F0',
      }
    };
    
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
        { 
          id: 1,
          x: 400, y: 470, width: 30, height: 30, 
          type: 'terminal', state: 'locked', reality: 'digital' 
        },
        { 
          id: 2,
          x: 550, y: 330, width: 30, height: 30, 
          type: 'terminal', state: 'locked', reality: 'digital' 
        },
        { 
          id: 3,
          x: 250, y: 380, width: 30, height: 30, 
          type: 'terminal', state: 'locked', reality: 'digital',
          isMoving: true, moveSpeed: 1, moveDirection: 'horizontal', moveRange: 100,
          originalPosition: { x: 250, y: 380 }
        },
        { 
          id: 4,
          x: 680, y: 230, width: 30, height: 30, 
          type: 'terminal', state: 'locked', reality: 'digital' 
        },
        
        // Energy items - 3 items with different behavior in each reality
        { 
          id: 5,
          x: 300, y: 370, width: 20, height: 20, 
          type: 'item', state: 'unlocked', reality: 'physical',
          isMoving: true, moveSpeed: 1.5, moveDirection: 'vertical', moveRange: 50,
          originalPosition: { x: 300, y: 370 }
        },
        { 
          id: 6,
          x: 470, y: 320, width: 20, height: 20, 
          type: 'item', state: 'unlocked', reality: 'physical' 
        },
        { 
          id: 7,
          x: 630, y: 220, width: 20, height: 20, 
          type: 'item', state: 'unlocked', reality: 'digital' 
        },
        
        // Door - exit point (counts as 3 objects when unlocked)
        { 
          id: 8,
          x: 750, y: 430, width: 40, height: 70, 
          type: 'door', state: 'locked', reality: 'physical' 
        }
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
        const isMoving = Math.random() > 0.5;
        const moveDirection = Math.random() > 0.5 ? 'horizontal' as const : 'vertical' as const;
        
        baseInteractables.push({
          id: i + 1,
          x: termX, y: termY, width: 30, height: 30,
          type: 'terminal', state: 'locked', reality: 'digital',
          isMoving: isMoving, 
          moveSpeed: 1 + Math.random(), 
          moveDirection: moveDirection, 
          moveRange: 50 + Math.random() * 50,
          originalPosition: { x: termX, y: termY }
        });
        
        // Items - create separate items for physical and digital reality
        const itemX1 = 100 + Math.random() * 600;
        const itemY1 = 100 + Math.random() * 350;
        const isMovingItem1 = Math.random() > 0.3;
        
        baseInteractables.push({
          id: i + 5,
          x: itemX1, y: itemY1, width: 20, height: 20,
          type: 'item', state: 'unlocked', reality: 'physical',
          isMoving: isMovingItem1, 
          moveSpeed: 1 + Math.random(), 
          moveDirection: Math.random() > 0.5 ? 'horizontal' as const : 'vertical' as const, 
          moveRange: 30 + Math.random() * 70,
          originalPosition: { x: itemX1, y: itemY1 }
        });
        
        // Create counterpart in digital realm but at different location
        const itemX2 = 100 + Math.random() * 600;
        const itemY2 = 100 + Math.random() * 350;
        const isMovingItem2 = Math.random() > 0.3;
        
        baseInteractables.push({
          id: i + 9,
          x: itemX2, y: itemY2, width: 20, height: 20,
          type: 'item', state: 'unlocked', reality: 'digital',
          isMoving: isMovingItem2, 
          moveSpeed: 1 + Math.random(), 
          moveDirection: Math.random() > 0.5 ? 'horizontal' as const : 'vertical' as const, 
          moveRange: 30 + Math.random() * 70,
          originalPosition: { x: itemX2, y: itemY2 }
        });
      }
      
      // Always add one door
      baseInteractables.push({
        id: 20,
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
      interactables: baseInteractables,
      tempStairs: [],
      level: level
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
      
      // Create temporary stairs with C
      if (e.code === 'KeyC') {
        if (gameState.energy >= 10) {
          // Check if enough time has passed since last stair creation (1 second cooldown)
          const now = Date.now();
          if (now - lastStairRef.current > 1000) {
            lastStairRef.current = now;
            
            // Create stair in front of the player
            const stairX = gameState.position.x + (gameState.velocity.x >= 0 ? PLAYER_WIDTH : -40);
            const stairY = gameState.position.y + PLAYER_HEIGHT;
            
            // Add the temporary stair
            setGameState(prev => ({
              ...prev,
              energy: Math.max(0, prev.energy - 10),
              tempStairs: [...prev.tempStairs, {
                x: stairX,
                y: stairY,
                width: 40,
                height: 100,
                reality: prev.reality,
                createdAt: now,
                duration: STAIR_DURATION
              }]
            }));
            
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
      const now = Date.now();
      
      setGameState(prev => {
        // Filter out expired stairs
        const updatedStairs = prev.tempStairs.filter(stair => 
          now - stair.createdAt < stair.duration
        );
        
        // Only update if there's been a change
        if (updatedStairs.length !== prev.tempStairs.length) {
          return {
            ...prev,
            tempStairs: updatedStairs
          };
        }
        
        return prev;
      });
    }, 1000); // Check every second
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
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
            if (item.id === interactable.id) {
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
          !(item.id === interactable.id)
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
        
        // Update moving objects
        const updatedInteractables = newState.interactables.map(obj => {
          if (obj.isMoving && obj.moveSpeed && obj.moveDirection && obj.moveRange && obj.originalPosition) {
            const originalX = obj.originalPosition.x;
            const originalY = obj.originalPosition.y;
            
            if (obj.moveDirection === 'horizontal') {
              // Calculate new position based on sine wave
              const time = Date.now() / 1000; // time in seconds
              const newX = originalX + Math.sin(time * obj.moveSpeed) * obj.moveRange;
              return { ...obj, x: newX };
            } else {
              // Vertical movement
              const time = Date.now() / 1000; // time in seconds
              const newY = originalY + Math.sin(time * obj.moveSpeed) * obj.moveRange;
              return { ...obj, y: newY };
            }
          }
          return obj;
        });
        
        newState.interactables = updatedInteractables;
        
        // Reset jumping state if on a platform
        let onPlatform = false;
        
        // Check platforms first
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
        
        // Then check temporary stairs
        if (!onPlatform) {
          for (const stair of newState.tempStairs) {
            // Skip stairs that aren't in the current reality
            if (stair.reality !== 'both' && stair.reality !== newState.reality) continue;
            
            const playerBottom = newState.position.y + PLAYER_HEIGHT;
            const stairTop = stair.y;
            
            // Check if player is directly above the stair and falling
            if (
              newState.velocity.y >= 0 &&
              playerBottom >= stairTop && 
              playerBottom - newState.velocity.y <= stairTop &&
              newState.position.x + PLAYER_WIDTH > stair.x && 
              newState.position.x < stair.x + stair.width
            ) {
              // Land on stair
              newState.position.y = stair.y - PLAYER_HEIGHT;
              newState.velocity.y = 0;
              newState.isJumping = false;
              onPlatform = true;
            }
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
    
    // Level-specific colors
    const levelColors = getLevelColors(gameState.level);
    
    // Draw background based on reality
    if (gameState.reality === 'physical') {
      context.fillStyle = levelColors.physical.background;
    } else {
      context.fillStyle = levelColors.digital.background;
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
          context.fillStyle = levelColors.physical.platform;
        } else {
          context.fillStyle = levelColors.digital.platform;
        }
        context.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    });
    
    // Draw temporary stairs
    gameState.tempStairs.forEach(stair => {
      if (stair.reality === 'both' || stair.reality === gameState.reality) {
        // Calculate remaining time
        const remainingTime = stair.duration - (Date.now() - stair.createdAt);
        const fadeOutFactor = Math.min(1, remainingTime / 1000); // Start fading in the last second
        
        if (gameState.reality === 'physical') {
          context.fillStyle = `rgba(215, 150, 255, ${fadeOutFactor})`;
        } else {
          context.fillStyle = `rgba(51, 195, 240, ${fadeOutFactor})`;
        }
        
        // Draw stair steps
        const stepHeight = stair.height / 5;
        const stepWidth = stair.width;
        
        for (let i = 0; i < 5; i++) {
          const stepX = stair.x;
          const stepY = stair.y - i * stepHeight;
          const currentStepWidth = stepWidth * (1 - i * 0.15); // Steps get smaller as they go up
          
          context.fillRect(stepX, stepY, currentStepWidth, stepHeight - 2);
        }
        
        // Draw stair icon
        context.fillStyle = 'white';
        context.font = '12px "Share Tech Mono", monospace';
        context.fillText('⟰', stair.x + stair.width / 2 - 6, stair.y - stair.height / 2);
      }
    });
    
    // Draw interactable objects
    gameState.interactables.forEach(interactable => {
      if (interactable.reality === 'both' || interactable.reality === gameState.reality) {
        if (interactable.type === 'terminal') {
          // Draw terminal
          context.fillStyle = interactable.state === 'locked' ? '#F97316' : '#33C3F0';
          context.fillRect(interactable.x, interactable.y, interactable.width, interactable.height);
          
          // Draw terminal screen
          context.fillStyle = interactable.state === 'locked' ? '#FFD700' : '#33FFAA';
          context.fillRect(interactable.x + 5, interactable.y + 5, interactable.width - 10, interactable.height - 15);
          
          // Draw terminal base
          context.fillStyle = '#333333';
          context.fillRect(interactable.x + 5, interactable.y + interactable.height - 10, interactable.width - 10, 5);
        } else if (interactable.type === 'door') {
          // Draw door
          context.fillStyle = interactable.state === 'locked' ? '#D946EF' : '#33C3F0';
          context.fillRect(interactable.x, interactable.y, interactable.width, interactable.height);
          
          // Draw door handle
          context.fillStyle = '#FFFFFF';
          context.beginPath();
          context.arc(
            interactable.x + interactable.width - 10,
            interactable.y + interactable.height / 2,
            5,
            0,
            Math.PI * 2
          );
          context.fill();
          
          // Draw lock if locked
          if (interactable.state === 'locked') {
            context.fillStyle = '#FFFF00';
            context.fillRect(interactable.x + interactable.width / 2 - 5, interactable.y + interactable.height / 2 - 10, 10, 15);
            context.fillRect(interactable.x + interactable.width / 2 - 7, interactable.y + interactable.height / 2 - 10, 14, 5);
          }
        } else if (interactable.type === 'item') {
          // Draw energy item with glowing effect
          // Inner bright core
          context.fillStyle = gameState.reality === 'physical' ? '#FFAA33' : '#33FFAA';
          context.beginPath();
          context.arc(
            interactable.x + interactable.width / 2,
            interactable.y + interactable.height / 2, 
            interactable.width / 2 - 2, 
            0, 
            Math.PI * 2
          );
          context.fill();
          
          // Outer glow
          context.strokeStyle = gameState.reality === 'physical' ? '#F97316' : '#33C3F0';
          context.lineWidth = 2;
          context.beginPath();
          context.arc(
            interactable.x + interactable.width / 2,
            interactable.y + interactable.height / 2, 
            interactable.width / 2, 
            0, 
            Math.PI * 2
          );
          context.stroke();
          
          // Pulsating effect based on time
          const pulseSize = Math.sin(Date.now() / 200) * 3 + 2;
          context.strokeStyle = gameState.reality === 'physical' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(51, 195, 240, 0.5)';
          context.beginPath();
          context.arc(
            interactable.x + interactable.width / 2,
            interactable.y + interactable.height / 2, 
            interactable.width / 2 + pulseSize, 
            0, 
            Math.PI * 2
          );
          context.stroke();
        }
      }
    });
    
    // Draw player
    if (gameState.reality === 'physical') {
      context.fillStyle = levelColors.physical.player;
    } else {
      context.fillStyle = levelColors.digital.player;
    }
    context.fillRect(
      gameState.position.x, 
      gameState.position.y, 
      PLAYER_WIDTH, 
      PLAYER_HEIGHT
    );
    
    // Draw player eyes
    context.fillStyle = 'white';
    context.fillRect(gameState.position.x + 8, gameState.position.y + 10, 5, 5);
    context.fillRect(gameState.position.x + 18, gameState.position.y + 10, 5, 5);
    
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
    context.fillText(`Nivel ${gameState.level}: Resuelve 10 objetos para avanzar`, 10, 20);
  };
  
  // Get color scheme based on level
  const getLevelColors = (level: number) => {
    return {
      physical: {
        background: level % 3 === 0 ? '#1f2a3a' : level % 2 === 0 ? '#2a1f3a' : '#1f1f3a',
        platform: level % 3 === 0 ? '#8E77CE' : level % 2 === 0 ? '#7E89AB' : '#7E69AB',
        player: level % 3 === 0 ? '#a797f5' : level % 2 === 0 ? '#8b97f5' : '#9b87f5',
      },
      digital: {
        background: level % 3 === 0 ? '#1a3a20' : level % 2 === 0 ? '#1a203a' : '#1a3a2a',
        platform: level % 3 === 0 ? '#33e3f0' : level % 2 === 0 ? '#33f0ae' : '#1EAEDB',
        player: level % 3 === 0 ? '#33f0f0' : level % 2 === 0 ? '#33f0dd' : '#33C3F0',
      }
    };
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
        <p>WASD/Arrows to move, Space to jump, Tab to shift reality, E to interact, C to create stairs</p>
      </div>
    </div>
  );
};

export default GameCanvas;
