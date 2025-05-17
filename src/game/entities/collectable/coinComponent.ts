import { Component } from "../../../core/component";
import { TILE_SIZE } from "../../constants";
import { CollectableComponent } from "./collectableComponent";

export class CoinComponent extends CollectableComponent {
    public readonly value = 10;


    protected readonly spritesheetAssetPath: string = '/assets/coin.png';
    protected readonly spritesheetOrientation: 'horizontal' | 'vertical' = 'vertical';
    protected readonly animationFrameRate: number = 10;

    constructor(xTile: number, yTile: number) {


        super(xTile, yTile, 0.75, 0.75);






        this.renderFallback = (ctx: CanvasRenderingContext2D) => {
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "orange";
            ctx.stroke();
            ctx.restore();
        };

        this.loadSprite();
    }



}
