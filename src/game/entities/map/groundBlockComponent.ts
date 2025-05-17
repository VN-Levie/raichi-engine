import { BoxComponent } from "../../../entities/boxComponent";
import { Component } from "../../../core/component";
import { TILE_SIZE } from "../../constants";

export class GroundBlockComponent extends Component {
  private baseBlock: BoxComponent;
  private topHighlight: BoxComponent;
  private textureColor: string;

  constructor(xTile: number, groundLevelY: number, color: string, topHighlightColor: string, textureColor: string) {
    super();
    this.x = xTile * TILE_SIZE;
    this.y = groundLevelY;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.solid = true;
    this.zIndex = 0;
    this.textureColor = textureColor;

    this.baseBlock = new BoxComponent(this.x, this.y, TILE_SIZE, color);
    this.baseBlock.solid = true; 

    this.topHighlight = new BoxComponent(this.x, this.y, TILE_SIZE, topHighlightColor);
    this.topHighlight.height = 6;
    this.topHighlight.solid = false; 
    this.topHighlight.zIndex = 1; 
  }

  update(dt: number): void {
    
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.baseBlock.x = this.x; 
    this.baseBlock.y = this.y;
    this.baseBlock.render(ctx);

    this.topHighlight.x = this.x;
    this.topHighlight.y = this.y;
    this.topHighlight.render(ctx);

    
    ctx.fillStyle = this.textureColor;
    const lineThickness = 2;
    const numLines = 3;
    const lineSpacing = this.height / (numLines + 1);
    for (let j = 1; j <= numLines; j++) {
      ctx.fillRect(this.x, this.y + j * lineSpacing - lineThickness / 2, this.width, lineThickness);
    }
  }
}
