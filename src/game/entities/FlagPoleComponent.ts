import { Component } from "../../core/component";
import { BoxComponent } from "../../entities/boxComponent";
import { CircleComponent } from "../../entities/circleComponent";
import { TILE_SIZE } from "../constants";

export class FlagPoleComponent extends Component {
    private pole: BoxComponent;
    private flag: BoxComponent;
    private topBall: CircleComponent;

    constructor(xTile: number, yTile: number) {
        super();
        this.x = xTile * TILE_SIZE;
        this.y = yTile * TILE_SIZE; // y position of the top of the pole base on the ground
        this.width = TILE_SIZE; // Approximate width for culling, etc.
        this.height = TILE_SIZE * 5; // Approximate height
        this.zIndex = 1; // Behind player, but in front of some background elements
        this.solid = false;

        const poleHeight = TILE_SIZE * 5;
        const poleWidth = 8;
        
        // Pole position should be relative to the ground.
        // Assuming yTile is where the base of the pole sits on the ground.
        // The actual rendering y will be yTile * TILE_SIZE - poleHeight.
        const poleActualY = this.y - poleHeight + TILE_SIZE; // Adjust so yTile is ground level for pole base

        this.pole = new BoxComponent(this.x + (TILE_SIZE / 2) - (poleWidth / 2), poleActualY, poleWidth, "gray");
        this.pole.height = poleHeight;
        this.pole.width = poleWidth;

        this.topBall = new CircleComponent(this.x + (TILE_SIZE / 2), poleActualY, poleWidth * 1.2, "gold");

        this.flag = new BoxComponent(this.x + (TILE_SIZE/2) - poleWidth/2 - TILE_SIZE, poleActualY + TILE_SIZE * 0.5, TILE_SIZE, "white");
        this.flag.height = TILE_SIZE * 0.75;
        // Flag will be on the left side of the pole, assuming player approaches from left
    }

    update(dt: number): void {
        // Flag could animate here
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.pole.render(ctx);
        this.topBall.render(ctx);
        
        // Draw flag (simple rectangle for now)
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(this.pole.x, this.pole.y + this.pole.height * 0.1); // Top point connected to pole
        ctx.lineTo(this.pole.x - TILE_SIZE * 1.5, this.pole.y + this.pole.height * 0.2); // Outer top point
        ctx.lineTo(this.pole.x - TILE_SIZE * 1.5, this.pole.y + this.pole.height * 0.4); // Outer bottom point
        ctx.lineTo(this.pole.x, this.pole.y + this.pole.height * 0.3); // Bottom point connected to pole
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}
