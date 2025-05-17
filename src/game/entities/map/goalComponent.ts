import { Component } from "../../../core/component";
import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { TILE_SIZE } from "../../constants";

export class GoalComponent extends Component {
  nextMapUrl?: string;
  isWinGoal?: boolean;
  style?: "flagpole" | "gate";
  private animator?: Animator;
  private image?: HTMLImageElement;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    nextMapUrl?: string,
    isWinGoal?: boolean,
    style?: "flagpole" | "gate"
  ) {
    super();
    this.x = x;
    this.y = y;
    this.width = width; // This will be the rendered width
    this.height = height; // This will be the rendered height
    this.nextMapUrl = nextMapUrl;
    this.isWinGoal = isWinGoal;
    this.style = style;
    this.solid = false; // Goal is a trigger, not solid
    this.zIndex = 0;

    if (this.style === "gate") {
      this.loadGateAssets();
    }
  }

  private async loadGateAssets() {
    try {
      this.image = await AssetLoader.loadImage("/assets/images/map/gate.png");
      // Gate: 3 frames, each 126px high. Spritesheet is vertical.
      // Frame width will be image.width. Frame height is 126.
      this.animator = new Animator(this.image, 'vertical', 5, true); // 5 FPS for gate animation
      this.animator.frameHeight = 126; // Explicit frame height for gate
      this.animator.frameWidth = this.image.width; // Frame width is full image width
      this.animator.frameCount = Math.floor(this.image.height / 126);

      // Adjust component width/height if not set by map data to match sprite aspect ratio
      // For example, if map data gives widthTiles=2, heightTiles=4 (for a 126px tall frame)
      // this.width = 2 * TILE_SIZE; // 64
      // this.height = 4 * TILE_SIZE; // 128
      // The actual drawing will scale the 126px frame to this.height.
    } catch (error) {
      console.error("Failed to load gate assets:", error);
    }
  }

  update(dt: number): void {
    if (this.animator) {
      this.animator.update(dt);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.style === "gate" && this.image && this.animator) {
      const sourceRect = this.animator.getFrameSourceRect();
      if (sourceRect) {
        ctx.drawImage(
          this.image,
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sWidth, // animator's frameWidth
          sourceRect.sHeight, // animator's frameHeight
          this.x,
          this.y,
          this.width,  // Rendered width from map data
          this.height  // Rendered height from map data
        );
      }
    } else if (this.style === "flagpole") {
      // Existing flagpole rendering (or it's handled by FlagPoleComponent)
      // For simplicity, if GoalComponent is just a trigger, it might not render anything itself
      // and rely on a separate FlagPoleComponent for visuals.
      // If it should render a simple box for flagpole goal:
      // ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      // ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
        // Default trigger visualization (optional)
        // ctx.fillStyle = "rgba(255, 215, 0, 0.3)"; // Gold, semi-transparent
        // ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
