
import { GameState, Interactable, InventoryItem } from '@/types/game.types';
import { PLAYER_HEIGHT, PLAYER_WIDTH, BATTERY_ENERGY, HEART_HEALTH, CLIMB_SPEED } from '@/constants/game.constants';

export function findInteractableAtPosition(gameState: GameState) {
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
      (interactable.reality === gameState.reality || interactable.reality === 'both') &&
      !interactable.collected // Skip already collected items
    ) {
      return interactable;
    }
  }
  
  return null;
}

export function handleInteractableAction(
  interactable: Interactable, 
  gameState: GameState, 
  onObjectSolved?: () => void, 
  showMessage?: (message: string) => void,
  showToast?: (title: string, description: string) => void
): GameState {
  let newState = { ...gameState };
  
  // Handle terminal interaction
  if (interactable.type === 'terminal' && gameState.reality === 'digital') {
    if (interactable.state === 'locked') {
      // Unlock the terminal and the door
      const updatedInteractables = newState.interactables.map(item => {
        if (item.id === interactable.id) {
          return { ...item, state: 'unlocked' as const };
        }
        if (item.type === 'door' && newState.interactables.filter(i => 
          i.type === 'terminal' && i.state === 'unlocked'
        ).length >= 3) {
          return { ...item, state: 'unlocked' as const };
        }
        return item;
      });
      
      newState = {
        ...newState,
        interactables: updatedInteractables
      };
      
      if (showMessage) showMessage("Terminal hackeado! Terminal desbloqueado.");
      if (showToast) {
        showToast(
          "Terminal Hackeado",
          "Has desbloqueado un terminal. Hackea más para desbloquear la puerta."
        );
      }
      
      // Notify parent that object was solved
      if (onObjectSolved) onObjectSolved();
    } else {
      if (showMessage) showMessage("Terminal ya hackeado");
    }
  }
  
  // Handle door interaction
  else if (interactable.type === 'door') {
    if (interactable.state === 'unlocked' && gameState.reality === 'physical') {
      if (showMessage) showMessage("Puerta desbloqueada! Avanzando al siguiente desafío...");
      if (showToast) {
        showToast(
          "Puerta Desbloqueada",
          "Acceso concedido. Este objeto cuenta como 3 objetivos resueltos."
        );
      }
      
      // Door counts as 3 objects when solved
      if (onObjectSolved) {
        onObjectSolved();
        onObjectSolved();
        onObjectSolved();
      }
    } else if (interactable.state === 'locked') {
      if (showMessage) showMessage("Puerta bloqueada. Hackea terminales en la realidad digital.");
    }
  }
  
  // Handle ladder interaction
  else if (interactable.type === 'ladder') {
    // Move player up the ladder
    newState.position.y -= CLIMB_SPEED * 2;
    newState.velocity.y = 0;
    newState.isJumping = false;
    
    if (showMessage) showMessage("Subiendo por la escalera...");
  }
  
  // Handle item pickup (energy item, battery, heart)
  else if (interactable.type === 'item' || interactable.type === 'battery' || interactable.type === 'heart') {
    // Mark item as collected
    const updatedInteractables = newState.interactables.map(item => {
      if (item.id === interactable.id) {
        return { ...item, collected: true };
      }
      return item;
    });
    
    newState.interactables = updatedInteractables;
    
    // Apply effects based on item type
    if (interactable.type === 'item') {
      newState.energy = Math.min(100, newState.energy + 30);
      if (showMessage) showMessage("Fragmento de energía recogido (+30 energía)");
    } 
    else if (interactable.type === 'battery') {
      // Add to inventory
      const existingItem = newState.inventory.find(item => item.type === 'battery');
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        newState.inventory.push({
          id: `battery-${Date.now()}`,
          type: 'battery',
          quantity: 1
        });
      }
      
      // Also provide immediate energy boost
      newState.energy = Math.min(100, newState.energy + BATTERY_ENERGY);
      
      if (showMessage) showMessage(`Batería recogida (+${BATTERY_ENERGY} energía, guardada en inventario)`);
      if (showToast) {
        showToast(
          "Batería Recogida",
          `+${BATTERY_ENERGY} energía. La batería se ha guardado en tu inventario.`
        );
      }
    } 
    else if (interactable.type === 'heart') {
      // Add to inventory
      const existingItem = newState.inventory.find(item => item.type === 'heart');
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        newState.inventory.push({
          id: `heart-${Date.now()}`,
          type: 'heart',
          quantity: 1
        });
      }
      
      // Also provide immediate health boost
      newState.health = Math.min(100, newState.health + HEART_HEALTH);
      
      if (showMessage) showMessage(`Corazón recogido (+${HEART_HEALTH} salud, guardado en inventario)`);
      if (showToast) {
        showToast(
          "Corazón Recogido",
          `+${HEART_HEALTH} salud. El corazón se ha guardado en tu inventario.`
        );
      }
    }
    
    // Notify parent that object was solved
    if (onObjectSolved) onObjectSolved();
  }
  
  return newState;
}

// Helper function to use items from inventory
export function useInventoryItem(
  gameState: GameState,
  itemType: 'battery' | 'heart',
  showMessage?: (message: string) => void,
  showToast?: (title: string, description: string) => void
): GameState {
  const inventoryItem = gameState.inventory.find(item => item.type === itemType);
  
  if (!inventoryItem || inventoryItem.quantity <= 0) {
    if (showMessage) showMessage(`No tienes ${itemType === 'battery' ? 'baterías' : 'corazones'} en tu inventario`);
    return gameState;
  }
  
  // Create a copy of the state
  let newState = { ...gameState };
  
  // Update the inventory
  newState.inventory = newState.inventory.map(item => {
    if (item.type === itemType) {
      return { ...item, quantity: item.quantity - 1 };
    }
    return item;
  }).filter(item => item.quantity > 0); // Remove items with zero quantity
  
  // Apply the effect
  if (itemType === 'battery') {
    newState.energy = Math.min(100, newState.energy + BATTERY_ENERGY);
    if (showMessage) showMessage(`Batería usada (+${BATTERY_ENERGY} energía)`);
    if (showToast) {
      showToast(
        "Batería Usada",
        `Has recuperado ${BATTERY_ENERGY}% de energía.`
      );
    }
  } else if (itemType === 'heart') {
    // Hearts can either restore health or add an extra life
    if (newState.health < 100) {
      // If health is not full, restore health
      newState.health = Math.min(100, newState.health + HEART_HEALTH);
      if (showMessage) showMessage(`Corazón usado (+${HEART_HEALTH} salud)`);
    } else {
      // If health is full, add an extra life
      newState.lives += 1;
      if (showMessage) showMessage("Corazón usado (+1 vida extra)");
    }
    
    if (showToast) {
      showToast(
        "Corazón Usado",
        newState.health < 100 ? `Has recuperado ${HEART_HEALTH}% de salud.` : "Has ganado una vida extra."
      );
    }
  }
  
  return newState;
}
