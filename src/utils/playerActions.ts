
import { GameState } from '@/types/game.types';
import { GRAVITY, PLAYER_HEIGHT, STAIR_DURATION } from '@/constants/game.constants';

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
  moveSpeed: number
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
  
  // Handle jumping
  if ((keysPressed.has('ArrowUp') || keysPressed.has('KeyW') || keysPressed.has('Space')) && !newState.isJumping) {
    newState.velocity.y = -12; // Jump force
    newState.isJumping = true;
  }
  
  // Apply gravity
  newState.velocity.y += GRAVITY;
  
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
    const newState = {
      ...gameState,
      position: { x: 100, y: 300 },
      velocity: { x: 0, y: 0 },
      health: newHealth
    };
    
    if (newHealth <= 0) {
      showMessage("Game Over - Reiniciando");
    }
    
    return newState;
  }
  
  return gameState;
}
