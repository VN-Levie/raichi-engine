import { CircleComponent } from "../../../entities/circleComponent";
import { Component } from "../../../core/component";
import { TILE_SIZE } from "../../constants";

export class BushComponent extends Component {
  private parts: CircleComponent[] = [];

  constructor(xTile: number, groundLevelY: number, size: number) {
    super();
    const x = xTile * TILE_SIZE;
    this.x = x;
    this.y = groundLevelY - (24 + size * 8) + 16; 
    this.zIndex = -1;
    this.solid = false;

    const darkGreen = "#025d02";
    const lightGreen = "#00c800";
    const embedDepth = 16;

    
    for (let i = 0; i < size; i++) {
      this.parts.push(new CircleComponent(x + (TILE_SIZE / 2) + i * TILE_SIZE, groundLevelY - (TILE_SIZE / 2) + embedDepth, TILE_SIZE / 2, darkGreen));
    }
    if (size > 1) {
      for (let i = 0; i < size - 1; i++) {
        this.parts.push(new CircleComponent(x + TILE_SIZE + i * TILE_SIZE, groundLevelY - TILE_SIZE + embedDepth, TILE_SIZE / 2, darkGreen));
      }
    }
    if (size > 2) {
      for (let i = 0; i < size - 2; i++) {
        this.parts.push(new CircleComponent(x + (TILE_SIZE * 1.5) + i * TILE_SIZE, groundLevelY - (TILE_SIZE * 1.5) + embedDepth, TILE_SIZE / 2, darkGreen));
      }
    }
    
    for (let i = 0; i < size; i++) {
      this.parts.push(new CircleComponent(x + (TILE_SIZE / 2.66) + i * TILE_SIZE, groundLevelY - (TILE_SIZE / 1.6) + embedDepth, TILE_SIZE / 4, lightGreen));
    }
    if (size > 1) {
      for (let i = 0; i < size - 1; i++) {
        this.parts.push(new CircleComponent(x + (TILE_SIZE / 1.14) + i * TILE_SIZE, groundLevelY - (TILE_SIZE * 1.125) + embedDepth, TILE_SIZE / 4, lightGreen));
      }
    }
    if (size > 2) {
      for (let i = 0; i < size - 2; i++) {
        this.parts.push(new CircleComponent(x + (TILE_SIZE * 1.375) + i * TILE_SIZE, groundLevelY - (TILE_SIZE * 1.625) + embedDepth, TILE_SIZE / 4, lightGreen));
      }
    }
    this.parts.forEach(p => {
        p.zIndex = this.zIndex;
        p.solid = this.solid;
    });
  }

  update(dt: number): void {
    
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.parts.forEach(part => {
        
        part.render(ctx);
    });
  }
}
