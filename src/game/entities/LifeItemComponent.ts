import { Component } from "../../core/component";
import { TILE_SIZE } from "../constants";
import { CollectableComponent } from "./CollectableComponent"; // Import the base class

export class LifeItemComponent extends CollectableComponent {
    public readonly value = 1; // Gives 1 life

    // Sprite configuration
    protected readonly spritesheetAssetPath: string = '/assets/live.png';
    protected readonly spritesheetOrientation: 'horizontal' | 'vertical' = 'vertical';
    protected readonly animationFrameRate: number = 5; // Slower animation for life item

    constructor(xTile: number, yTile: number) {
        // Call the base class constructor
        // Life item size ratio can be adjusted, defaults are 0.75, using 0.8 as before
        super(xTile, yTile, 0.8, 0.8);

        // Set specific bobbing parameters if different from base defaults
        this.bobSpeed = 0.7;
        this.bobHeight = 3;

        // Fallback rendering specific to LifeItem (optional, base provides a magenta square)
        this.renderFallback = (ctx: CanvasRenderingContext2D) => {
            ctx.save();
            ctx.fillStyle = "green"; 
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = "darkgreen";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        };

        this.loadSprite(); // Load the sprite using base class method
    }

    // The collect(), update(), and render() methods are inherited from CollectableComponent.
}
