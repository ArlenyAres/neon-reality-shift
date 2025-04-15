export type GameState = {
  health: number;
  energy: number;
  lives: number;
  reality: 'physical' | 'digital';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isJumping: boolean;
  platforms: Platform[];
  interactables: Interactable[];
  tempStairs: TempStair[];
  level: number;
  hazardHits: number;
  inventory: InventoryItem[];
  lastBatterySpawn?: number;
  lastHeartSpawn?: number;
};

export type InventoryItem = {
  id: string;
  type: 'battery' | 'heart';
  quantity: number;
};

export type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'physical' | 'digital' | 'both';
};

export type Interactable = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'terminal' | 'door' | 'item' | 'ladder' | 'hazard' | 'battery' | 'heart';
  state: 'locked' | 'unlocked';
  reality: 'physical' | 'digital' | 'both';
  isMoving?: boolean;
  moveSpeed?: number;
  moveDirection?: 'horizontal' | 'vertical';
  moveRange?: number;
  originalPosition?: { x: number; y: number };
  collected?: boolean;
};

export type TempStair = {
  x: number;
  y: number;
  width: number;
  height: number;
  reality: 'physical' | 'digital' | 'both';
  createdAt: number;
  duration: number;
};

export type GameCanvasProps = {
  onObjectSolved?: () => void;
  level?: number;
};

export type LevelColors = {
  physical: {
    background: string;
    platform: string;
    player: string;
  };
  digital: {
    background: string;
    platform: string;
    player: string;
  };
};
