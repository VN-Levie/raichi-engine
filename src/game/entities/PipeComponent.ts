import { BoxComponent } from "../../entities/boxComponent";
import { Component } from "../../core/component";
import { TILE_SIZE } from "../constants";

export class PipeComponent extends Component {
  private pipeBody: BoxComponent;
  private pipeTop: BoxComponent;
  private highlight: BoxComponent;
  private topHighlightPipe: BoxComponent;

  constructor(xTile: number, groundLevelY: number, heightMultiplier: number) {
    super();
    const x = xTile * TILE_SIZE;
    const pipeWidth = TILE_SIZE * 2;
    const pipeColor = "#00AA00";
    const pipeBorderColor = "#008800";
    const pipeHeight = heightMultiplier * TILE_SIZE;

    this.x = x;
    this.y = groundLevelY - pipeHeight - 16; // Approximate y for the whole entity
    this.width = pipeWidth + 16; // Approximate width
    this.height = pipeHeight + 16; // Approximate height
    this.solid = true;
    this.zIndex = 5;

    this.pipeBody = new BoxComponent(x, groundLevelY - pipeHeight, pipeWidth, pipeColor);
    this.pipeBody.height = pipeHeight;
    this.pipeBody.solid = true;

    const pipeTopHeight = 16;
    const pipeTopWidth = pipeWidth + 16;
    this.pipeTop = new BoxComponent(x - 8, groundLevelY - pipeHeight - pipeTopHeight, pipeTopWidth, pipeColor);
    this.pipeTop.height = pipeTopHeight;
    this.pipeTop.solid = true;

    this.highlight = new BoxComponent(x + 8, groundLevelY - pipeHeight, 16, pipeBorderColor);
    this.highlight.height = pipeHeight;
    this.highlight.solid = false;

    this.topHighlightPipe = new BoxComponent(x, groundLevelY - pipeHeight - pipeTopHeight, 24, pipeBorderColor);
    this.topHighlightPipe.height = pipeTopHeight / 2;
    this.topHighlightPipe.solid = false;
  }

  update(dt: number): void {
    // Pipes are static
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Assuming x,y of PipeComponent is the top-left of the entire pipe structure for scene management
    // The internal components will render relative to their own defined positions.
    this.pipeBody.render(ctx);
    this.pipeTop.render(ctx);
    this.highlight.render(ctx);
    this.topHighlightPipe.render(ctx);
  }
}
