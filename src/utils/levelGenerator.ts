
import { GameState, Platform, Interactable } from '@/types/game.types';

export function generateLevelState(level: number): GameState {
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

export function getLevelColors(level: number) {
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
}
