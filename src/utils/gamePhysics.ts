
import { GameState } from '@/types/game.types';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '@/constants/game.constants';

export function checkCollisions(gameState: GameState, canvas: HTMLCanvasElement): GameState {
  const newState = { ...gameState };
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
  
  // Boundary constraints
  if (newState.position.x < 0) newState.position.x = 0;
  if (newState.position.x > canvas.width - PLAYER_WIDTH) {
    newState.position.x = canvas.width - PLAYER_WIDTH;
  }
  
  return newState;
}

export function updateInteractables(gameState: GameState): GameState {
  const newState = { ...gameState };
  
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
  return newState;
}

export function cleanupStairs(gameState: GameState): GameState {
  const now = Date.now();
  
  // Filter out expired stairs
  const updatedStairs = gameState.tempStairs.filter(stair => 
    now - stair.createdAt < stair.duration
  );
  
  // Only update if there's been a change
  if (updatedStairs.length !== gameState.tempStairs.length) {
    return {
      ...gameState,
      tempStairs: updatedStairs
    };
  }
  
  return gameState;
}
