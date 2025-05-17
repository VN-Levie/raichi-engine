import { Component } from "../../../core/component";
import { TILE_SIZE } from "../../constants";
import { CollectableComponent } from "./collectableComponent";

export class LifeItemComponent extends CollectableComponent {
    public readonly value = 1;


    protected readonly spritesheetAssetPath: string = '/assets/live.png';
    protected readonly spritesheetOrientation: 'horizontal' | 'vertical' = 'vertical';
    protected readonly animationFrameRate: number = 5;

    constructor(xTile: number, yTile: number) {


        super(xTile, yTile, 0.8, 0.8);


        this.bobSpeed = 0.7;
        this.bobHeight = 3;


        this.renderFallback = (ctx: CanvasRenderingContext2D) => {
            ctx.save();
            ctx.fillStyle = "green";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = "darkgreen";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        };

        this.loadSprite();
    }


}
