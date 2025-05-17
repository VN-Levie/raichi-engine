import { Component } from "../../core/component";
import { TILE_SIZE } from "../constants";

export class CheckpointComponent extends Component {
    activated: boolean = false;

    constructor(xTile: number, gameHeight: number) {
        super();
        this.x = xTile * TILE_SIZE;
        this.y = 0; // Covers the full height of the game area
        this.width = TILE_SIZE; // One tile wide trigger area
        this.height = gameHeight; // Full game height
        this.solid = false;
        this.visible = false; // Checkpoints are typically invisible
        this.zIndex = -5; // Behind most things
    }

    activate() {
        if (!this.activated) {
            this.activated = true;
            // console.log(`Checkpoint activated at x: ${this.x}`);
            // Optionally make it visible briefly or play a sound
        }
    }

    reset() {
        this.activated = false;
    }

    update(dt: number): void {
        // Static component
    }

    render(ctx: CanvasRenderingContext2D): void {
        // For debugging, you might want to render it:
        // if (this.visible || !this.activated) { // Show if not yet activated for debug
        //     ctx.save();
        //     ctx.fillStyle = this.activated ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 255, 0, 0.2)";
        //     ctx.fillRect(this.x, this.y, this.width, this.height);
        //     ctx.strokeStyle = "yellow";
        //     ctx.strokeRect(this.x, this.y, this.width, this.height);
        //     ctx.restore();
        // }
    }
}
