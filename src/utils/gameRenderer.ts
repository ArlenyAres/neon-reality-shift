
import { GameState, LevelColors } from '@/types/game.types';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '@/constants/game.constants';

export function renderGame(context: CanvasRenderingContext2D, gameState: GameState, levelColors: LevelColors, isTransitioning: boolean) {
  const canvas = context.canvas;
  
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
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
}
