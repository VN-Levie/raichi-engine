import { BoxComponent } from "../../../entities/boxComponent";
import { Component } from "../../../core/component";
import { TILE_SIZE } from "../../constants";

export class FloatingPlatformComponent extends Component {
  private segments: Component[] = [];

  constructor(xTile: number, yTile: number, widthTiles: number, style: string) {
    super();
    this.x = xTile * TILE_SIZE;
    this.y = yTile * TILE_SIZE;
    this.width = widthTiles * TILE_SIZE;
    this.height = TILE_SIZE;
    this.solid = true; 
    this.zIndex = 1;

    let colors = { base: "#8B4513", top: "#A0522D", side: "#654321" };
    if (style === 'stone') {
      colors = { base: "#A0A0A0", top: "#D8D8D8", side: "#707070" };
    }

    for (let i = 0; i < widthTiles; i++) {
      const blockX = this.x + (i * TILE_SIZE);

      const block = new BoxComponent(blockX, this.y, TILE_SIZE, colors.base);
      block.solid = true; 
      block.zIndex = 1;
      this.segments.push(block);

      const topHighlight = new BoxComponent(blockX, this.y, TILE_SIZE, colors.top);
      topHighlight.height = 8;
      topHighlight.solid = false;
      topHighlight.zIndex = 2;
      this.segments.push(topHighlight);

      if (i === 0) {
        const leftHighlight = new BoxComponent(blockX, this.y, 6, colors.side);
        leftHighlight.height = TILE_SIZE;
        leftHighlight.solid = false;
        leftHighlight.zIndex = 2;
        this.segments.push(leftHighlight);
      }
      if (i === widthTiles - 1) {
        const rightHighlight = new BoxComponent(blockX + TILE_SIZE - 6, this.y, 6, colors.side);
        rightHighlight.height = TILE_SIZE;
        rightHighlight.solid = false;
        rightHighlight.zIndex = 2;
        this.segments.push(rightHighlight);
      }
    }
  }

  update(dt: number): void {
    
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.segments.forEach(segment => {
        
        
        
        
        segment.render(ctx);
    });
  }
}
