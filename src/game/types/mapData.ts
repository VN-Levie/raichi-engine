export interface MapData {
  name: string;
  player: { initialX: number; initialY: number };
  level: {
    groundLevelY: number;
    gameOverY: number;
    backgroundColor: string;
    worldWidthTiles: number;
    type?: "ground" | "underwater"; // Added level type
  };
  decorations: {
    clouds: Array<{ x: number; y: number; size: number }>;
    bushes: Array<{ xTile: number; size: number }>;
    flagPole?: { xTile: number; yTile: number };
    dynamicClouds?: boolean; // Added for dynamic clouds
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
    tornadoes?: Array<TornadoConfigType>; // Ensure this exists
  };
  enemies: {
    yOffsetFromGround: number;
    positions: Array<{
      xTile: number;
      yTile?: number;
      type?: "goomba" | "turtle" | "bat";
      patrolRangeXTiles?: [number, number]; // Optional: [startXTile, endXTile] for bat patrol
    }>;
  };
  goal?: {
    xTile: number;
    yTile: number;
    widthTiles: number;
    heightTiles: number;
    nextMapUrl?: string;
    isWinGoal?: boolean;
    style?: "flagpole" | "gate"; // Added goal style
  };
  checkpoints?: Array<{ xTile: number }>; // Added checkpoints
  coins?: Array<{ xTile: number; yTile: number }>; // Added coins
  lifeItems?: Array<{ xTile: number; yTile: number }>; // Added life items
}

export type TornadoConfigType = {
  xTile: number;
  yTile: number;
  patrolRangeXTiles?: [number, number];
};
