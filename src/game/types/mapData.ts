export interface MapData {
  name: string;
  player: { initialX: number; initialY: number };
  level: { groundLevelY: number; gameOverY: number; backgroundColor: string; worldWidthTiles: number };
  decorations: {
    clouds: Array<{ x: number; y: number; size: number }>;
    bushes: Array<{ xTile: number; size: number }>;
    flagPole?: { xTile: number; yTile: number }; // Added flagpole
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
  };
  enemies: {
    yOffsetFromGround: number;
    positions: Array<{ xTile: number; type?: "goomba" | "turtle" }>;
  };
  goal?: {
    xTile: number;
    yTile: number;
    widthTiles: number;
    heightTiles: number;
    nextMapUrl?: string;
    isWinGoal?: boolean;
  };
  checkpoints?: Array<{ xTile: number }>; // Added checkpoints
  coins?: Array<{ xTile: number; yTile: number }>; // Added coins
  lifeItems?: Array<{ xTile: number; yTile: number }>; // Added life items
}
