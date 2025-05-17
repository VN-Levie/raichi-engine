import { Component } from "../../core/component";
import { TILE_SIZE } from "../constants";
import { CollectableComponent } from "./CollectableComponent"; // Import the base class

export class CoinComponent extends CollectableComponent {
    public readonly value = 10; // Coins give 10 points (or 1 for totalCoinsCollected logic)

    // Sprite configuration
    protected readonly spritesheetAssetPath: string = '/assets/coin.png';
    protected readonly spritesheetOrientation: 'horizontal' | 'vertical' = 'vertical';
    protected readonly animationFrameRate: number = 10; // Frames per second

    constructor(xTile: number, yTile: number) {
        // Call the base class constructor
        // Coin size ratio can be adjusted if needed, defaults are 0.75
        super(xTile, yTile, 0.75, 0.75); 

        // Set specific bobbing parameters if different from base defaults
        // this.bobSpeed = 0.8; (already default)
        // this.bobHeight = 4; (already default)

        // Fallback rendering specific to Coin (optional, base provides a magenta square)
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
        
        this.loadSprite(); // Load the sprite using base class method
    }

    // The collect(), update(), and render() methods are inherited from CollectableComponent.
    // No need to redefine them unless specific overrides are needed.
}
