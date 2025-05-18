export interface MapData {
  name: string;
  player: { initialX: number; initialY: number };
  level: {
    groundLevelY: number;
    gameOverY: number;
    backgroundColor: string;
    worldWidthTiles: number;
    type?: "ground" | "underwater"; 
  };
  decorations: {
    clouds: Array<{ x: number; y: number; size: number }>;
    bushes: Array<{ xTile: number; size: number }>;
    flagPole?: { xTile: number; yTile: number };
    dynamicClouds?: boolean; 
  };
  terrain: {
    ground: {
      segments: Array<{ startTile: number; endTile: number }>;
      color: string;
      topHighlightColor: string;
      textureColor: string;
    };
    pipes: Array<{ xTile: number; heightMultiplier: number }>;
    floatingPlatforms: Array<{ xTile: number; yTile: number; widthTiles: number; style: string }>;
    tornadoes?: Array<TornadoConfigType>; 
  };
  enemies: {
    yOffsetFromGround: number;
    positions: Array<{
      xTile: number;
      yTile?: number;
      type?: "goomba" | "turtle" | "bat";
      patrolRangeXTiles?: [number, number]; 
      hitSfx?: string; 
    }>;
  };
  goal?: {
    xTile: number;
    yTile: number;
    widthTiles: number;
    heightTiles: number;
    nextMapUrl?: string;
    isWinGoal?: boolean;
    style?: "flagpole" | "gate"; 
  };
  checkpoints?: Array<{ xTile: number }>; 
  coins?: Array<{ xTile: number; yTile: number }>; 
  lifeItems?: Array<{ xTile: number; yTile: number }>; 
  mapVersion?: string; 
  bgm?: string; 
}

export type TornadoConfigType = {
  xTile: number;
  yTile: number;
  patrolRangeXTiles?: [number, number];
  canToggle?: boolean; 
  toggleIntervalSeconds?: [min: number, max: number]; 
  baseSpeedMultiplier?: number; 
  speedRandomnessFactor?: number; 
};
