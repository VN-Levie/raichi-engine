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
        this.y = yTile * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE * 5;
        this.zIndex = 1;
        this.solid = false;

        const poleHeight = TILE_SIZE * 5;
        const poleWidth = 8;




        const poleActualY = this.y - poleHeight + TILE_SIZE;

        this.pole = new BoxComponent(this.x + (TILE_SIZE / 2) - (poleWidth / 2), poleActualY, poleWidth, "gray");
        this.pole.height = poleHeight;
        this.pole.width = poleWidth;

        this.topBall = new CircleComponent(this.x + (TILE_SIZE / 2), poleActualY, poleWidth * 1.2, "gold");

        this.flag = new BoxComponent(this.x + (TILE_SIZE / 2) - poleWidth / 2 - TILE_SIZE, poleActualY + TILE_SIZE * 0.5, TILE_SIZE, "white");
        this.flag.height = TILE_SIZE * 0.75;

    }

    update(dt: number): void {

    }

    render(ctx: CanvasRenderingContext2D): void {
        this.pole.render(ctx);
        this.topBall.render(ctx);


        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(this.pole.x, this.pole.y + this.pole.height * 0.1);
        ctx.lineTo(this.pole.x - TILE_SIZE * 1.5, this.pole.y + this.pole.height * 0.2);
        ctx.lineTo(this.pole.x - TILE_SIZE * 1.5, this.pole.y + this.pole.height * 0.4);
        ctx.lineTo(this.pole.x, this.pole.y + this.pole.height * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}
