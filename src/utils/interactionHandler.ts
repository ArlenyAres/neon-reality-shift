
import { GameState, Interactable } from '@/types/game.types';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '@/constants/game.constants';

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
      (interactable.reality === gameState.reality || interactable.reality === 'both')
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
  
  // Handle item pickup
  else if (interactable.type === 'item') {
    // Remove the item from the game and add energy
    const updatedInteractables = newState.interactables.filter(item => 
      !(item.id === interactable.id)
    );
    
    newState = {
      ...newState,
      energy: Math.min(100, newState.energy + 30),
      interactables: updatedInteractables
    };
    
    if (showMessage) showMessage("Fragmento de energía recogido (+30 energía)");
    
    // Notify parent that object was solved
    if (onObjectSolved) onObjectSolved();
  }
  
  return newState;
}
