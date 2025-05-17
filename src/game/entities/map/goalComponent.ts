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
    this.width = width; 
    this.height = height; 
    this.nextMapUrl = nextMapUrl;
    this.isWinGoal = isWinGoal;
    this.style = style;
    this.solid = false; 
    this.zIndex = 0;

    if (this.style === "gate") {
      this.loadGateAssets();
    }
  }

  private async loadGateAssets() {
    try {
      this.image = await AssetLoader.loadImage("/assets/images/map/gate.png");
      
      
      this.animator = new Animator(this.image, 'vertical', 5, true); 
      this.animator.frameHeight = 126; 
      this.animator.frameWidth = this.image.width; 
      this.animator.frameCount = Math.floor(this.image.height / 126);

      
      
      
      
      
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
          sourceRect.sWidth, 
          sourceRect.sHeight, 
          this.x,
          this.y,
          this.width,  
          this.height  
        );
      }
    } else if (this.style === "flagpole") {
      
      
      
      
      
      
    } else {
        
        
        
    }
  }
}
