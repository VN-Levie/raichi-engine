import { Component } from "../../core/component";
import { TILE_SIZE } from "../constants";

export class CheckpointComponent extends Component {
    activated: boolean = false;

    constructor(xTile: number, gameHeight: number) {
        super();
        this.x = xTile * TILE_SIZE;
        this.y = 0;
        this.width = TILE_SIZE;
        this.height = gameHeight;
        this.solid = false;
        this.visible = false;
        this.zIndex = -5;
    }

    activate() {
        if (!this.activated) {
            this.activated = true;


        }
    }

    reset() {
        this.activated = false;
    }

    update(dt: number): void {

    }

    render(ctx: CanvasRenderingContext2D): void {

        if (this.visible || !this.activated) {
            ctx.save();
            ctx.fillStyle = this.activated ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 255, 0, 0.2)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }
}
