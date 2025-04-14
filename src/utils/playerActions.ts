import { GameState, Interactable } from '@/types/game.types';
import { GRAVITY, PLAYER_HEIGHT, PLAYER_WIDTH, STAIR_DURATION, CLIMB_SPEED, HAZARD_DAMAGE, MAX_HAZARD_HITS, BATTERY_SPAWN_RATE, HEART_SPAWN_RATE } from '@/constants/game.constants';

export function createTempStair(
  gameState: GameState, 
  showMessage: (message: string) => void
): GameState {
  const now = Date.now();
  
  // Create stair in front of the player
  const stairX = gameState.position.x + (gameState.velocity.x >= 0 ? PLAYER_HEIGHT : -40);
  const stairY = gameState.position.y + PLAYER_HEIGHT;
  
  // Add the temporary stair
  return {
    ...gameState,
    energy: Math.max(0, gameState.energy - 10),
    tempStairs: [...gameState.tempStairs, {
      x: stairX,
      y: stairY,
      width: 40,
      height: 100,
      reality: gameState.reality,
      createdAt: now,
      duration: STAIR_DURATION
    }]
  };
}

export function updatePlayerPosition(
  gameState: GameState, 
  keysPressed: Set<string>, 
  moveSpeed: number,
  isClimbing: boolean
): GameState {
  const newState = { ...gameState };
  
  // Apply movement based on keys pressed
  if (keysPressed.has('ArrowLeft') || keysPressed.has('KeyA')) {
    newState.velocity.x = -moveSpeed;
  } else if (keysPressed.has('ArrowRight') || keysPressed.has('KeyD')) {
    newState.velocity.x = moveSpeed;
  } else {
    // Decelerate when no keys are pressed
    newState.velocity.x = 0;
  }
  
  // Handle jumping - only if not climbing
  if (!isClimbing && (keysPressed.has('ArrowUp') || keysPressed.has('KeyW') || keysPressed.has('Space')) && !newState.isJumping) {
    newState.velocity.y = -12; // Jump force
    newState.isJumping = true;
  }
  
  // Handle climbing
  if (isClimbing) {
    if (keysPressed.has('ArrowUp') || keysPressed.has('KeyW')) {
      newState.velocity.y = -CLIMB_SPEED; // Climb up
      newState.isJumping = false;
    } else if (keysPressed.has('ArrowDown') || keysPressed.has('KeyS')) {
      newState.velocity.y = CLIMB_SPEED; // Climb down
    } else {
      newState.velocity.y = 0; // Stay in place when on ladder
    }
  } else {
    // Apply gravity if not climbing
    newState.velocity.y += GRAVITY;
  }
  
  // Update position
  newState.position.x += newState.velocity.x;
  newState.position.y += newState.velocity.y;
  
  return newState;
}

export function handlePlayerFall(
  gameState: GameState, 
  canvasHeight: number, 
  showMessage: (message: string) => void
): GameState {
  // If player fell off the bottom, reset position and deduct health
  if (gameState.position.y > canvasHeight) {
    showMessage("Caída al vacío! Salud -20");
    
    const newHealth = Math.max(0, gameState.health - 20);
    let newLives = gameState.lives;
    
    // If health drops to 0, lose a life
    if (newHealth <= 0 && newLives > 0) {
      newLives--;
      showMessage(`Perdiste una vida! Vidas restantes: ${newLives}`);
      
      // Game over if no lives left
      if (newLives <= 0) {
        showMessage("Game Over - Reiniciando");
      }
    }
    
    const newState = {
      ...gameState,
      position: { x: 100, y: 300 },
      velocity: { x: 0, y: 0 },
      health: newLives > 0 ? 100 : 0,
      lives: newLives
    };
    
    return newState;
  }
  
  return gameState;
}

export function isNearLadder(gameState: GameState): boolean {
  const player = {
    x: gameState.position.x,
    y: gameState.position.y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT
  };
  
  // Check temp stairs first (they act as ladders)
  for (const stair of gameState.tempStairs) {
    if (stair.reality === gameState.reality || stair.reality === 'both') {
      if (
        player.x + player.width > stair.x &&
        player.x < stair.x + stair.width &&
        player.y + player.height > stair.y &&
        player.y < stair.y + stair.height
      ) {
        return true;
      }
    }
  }
  
  // Then check permanent ladders
  for (const interactable of gameState.interactables) {
    if (interactable.type === 'ladder' && 
        (interactable.reality === gameState.reality || interactable.reality === 'both')) {
      if (
        player.x + player.width > interactable.x &&
        player.x < interactable.x + interactable.width &&
        player.y + player.height > interactable.y &&
        player.y < interactable.y + interactable.height
      ) {
        return true;
      }
    }
  }
  
  return false;
}

export function checkHazardCollisions(gameState: GameState, showMessage: (message: string) => void): GameState {
  const player = {
    x: gameState.position.x,
    y: gameState.position.y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT
  };
  
  let newState = { ...gameState };
  let hitHazard = false;
  
  for (const interactable of gameState.interactables) {
    // Skip if not a hazard or not in current reality
    if (interactable.type !== 'hazard' || 
        !(interactable.reality === gameState.reality || interactable.reality === 'both')) {
      continue;
    }
    
    // Check collision
    if (
      player.x + player.width > interactable.x &&
      player.x < interactable.x + interactable.width &&
      player.y + player.height > interactable.y &&
      player.y < interactable.y + interactable.height
    ) {
      // Handle hazard collision
      hitHazard = true;
      
      // Reduce energy
      newState.energy = Math.max(0, newState.energy - HAZARD_DAMAGE);
      
      // Increment hazard hits counter
      newState.hazardHits += 1;
      
      // Show message
      showMessage(`¡Peligro! -${HAZARD_DAMAGE}% energía. Impactos: ${newState.hazardHits}/${MAX_HAZARD_HITS}`);
      
      // Check if player has taken enough hits to lose a life
      if (newState.hazardHits >= MAX_HAZARD_HITS) {
        // Reset hazard hits counter
        newState.hazardHits = 0;
        
        // Lose a life
        newState.lives = Math.max(0, newState.lives - 1);
        showMessage(`¡Perdiste una vida! Vidas restantes: ${newState.lives}`);
        
        // Game over check
        if (newState.lives <= 0) {
          showMessage("Game Over - Reiniciando");
        }
      }
      
      // Only count one hazard hit at a time
      break;
    }
  }
  
  return newState;
}

export function spawnRandomItems(gameState: GameState, canvas: HTMLCanvasElement): GameState {
  // Only spawn random items in level 3 or higher
  if (gameState.level < 3) return gameState;
  
  const now = Date.now();
  const lastBatterySpawn = gameState.lastBatterySpawn || 0;
  const lastHeartSpawn = gameState.lastHeartSpawn || 0;
  
  let newState = { ...gameState };
  let interactablesChanged = false;
  
  // Check if it's time to spawn a battery
  if (now - lastBatterySpawn > BATTERY_SPAWN_RATE) {
    // Find max id to ensure uniqueness
    const maxId = Math.max(...newState.interactables.map(i => i.id), 0);
    
    // Random position within canvas bounds
    const x = Math.random() * (canvas.width - 20);
    const y = Math.random() * (canvas.height - 20);
    
    // Add new battery
    newState.interactables.push({
      id: maxId + 1,
      x,
      y,
      width: 20,
      height: 20,
      type: 'battery',
      state: 'unlocked',
      reality: Math.random() < 0.5 ? 'physical' : 'digital',
      isMoving: true,
      moveSpeed: 0.8,
      moveDirection: Math.random() < 0.5 ? 'horizontal' : 'vertical',
      moveRange: 20,
      originalPosition: { x, y }
    });
    
    newState.lastBatterySpawn = now;
    interactablesChanged = true;
  }
  
  // Check if it's time to spawn a heart
  if (now - lastHeartSpawn > HEART_SPAWN_RATE) {
    // Find max id to ensure uniqueness
    const maxId = Math.max(...newState.interactables.map(i => i.id), 0);
    
    // Random position within canvas bounds
    const x = Math.random() * (canvas.width - 20);
    const y = Math.random() * (canvas.height - 20);
    
    // Add new heart
    newState.interactables.push({
      id: maxId + 1,
      x,
      y,
      width: 20,
      height: 20,
      type: 'heart',
      state: 'unlocked',
      reality: Math.random() < 0.5 ? 'physical' : 'digital',
      isMoving: true,
      moveSpeed: 0.5,
      moveDirection: Math.random() < 0.5 ? 'horizontal' : 'vertical',
      moveRange: 30,
      originalPosition: { x, y }
    });
    
    newState.lastHeartSpawn = now;
    interactablesChanged = true;
  }
  
  // Clean up collected or out-of-bound items
  if (interactablesChanged) {
    newState.interactables = newState.interactables.filter(item => {
      // Keep if not collected and within bounds
      return !item.collected && 
             item.x >= 0 && item.x <= canvas.width &&
             item.y >= 0 && item.y <= canvas.height;
    });
  }
  
  return newState;
}
