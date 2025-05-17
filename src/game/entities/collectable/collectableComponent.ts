import { Component } from "../../../core/component";
import { TILE_SIZE } from "../../constants";
import { AssetLoader } from "../../../core/assetLoader";
import { SpriteComponent } from "../../../entities/spriteComponent";
import { Animator } from "../../../core/animator";

export abstract class CollectableComponent extends Component {
    public collected = false;
    public abstract readonly value: number;

    protected initialY: number;
    protected bobSpeed: number = 0.8;
    protected bobHeight: number = 4;
    protected bobAngle: number = Math.random() * Math.PI * 2;

    protected spriteComponent?: SpriteComponent;
    protected imageLoaded = false;


    protected abstract readonly spritesheetAssetPath: string;
    protected abstract readonly spritesheetOrientation: 'horizontal' | 'vertical';
    protected abstract readonly animationFrameRate: number;


    protected renderFallback?: (ctx: CanvasRenderingContext2D) => void;

    constructor(xTile: number, yTile: number, widthRatio: number = 0.75, heightRatio: number = 0.75) {
        super();

        this.width = TILE_SIZE * widthRatio;
        this.height = TILE_SIZE * heightRatio;

        this.x = xTile * TILE_SIZE + (TILE_SIZE - this.width) / 2;
        this.initialY = yTile * TILE_SIZE + (TILE_SIZE - this.height) / 2;
        this.y = this.initialY;
        this.zIndex = 0;
        this.solid = false;
    }

    protected async loadSprite() {
        try {
            const image = await AssetLoader.loadImage(this.spritesheetAssetPath);
            const animator = new Animator(
                image,
                this.spritesheetOrientation,
                this.animationFrameRate
            );
            this.spriteComponent = new SpriteComponent(image, animator);
            this.spriteComponent.width = this.width;
            this.spriteComponent.height = this.height;
            this.imageLoaded = true;
        } catch (error) {
            console.error(`Failed to load sprite from ${this.spritesheetAssetPath}:`, error);

            if (!this.renderFallback) {
                this.renderFallback = (ctx: CanvasRenderingContext2D) => {
                    ctx.save();
                    ctx.fillStyle = "magenta";
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.strokeStyle = "black";
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                    ctx.restore();
                };
            }
        }
    }

    update(dt: number): void {
        if (this.collected) {
            this.visible = false;
            this.enabled = false;
            return;
        }

        if (!this.imageLoaded && !this.renderFallback) return;


        this.bobAngle += this.bobSpeed * dt;
        this.y = this.initialY + Math.sin(this.bobAngle) * this.bobHeight;


        if (this.imageLoaded && this.spriteComponent) {
            this.spriteComponent.animator?.update(dt);
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible || this.collected) return;

        if (!this.imageLoaded && this.renderFallback) {
            this.renderFallback(ctx);
            return;
        }

        if (this.imageLoaded && this.spriteComponent) {
            this.spriteComponent.x = this.x;
            this.spriteComponent.y = this.y;
            this.spriteComponent.render(ctx);
        }
    }

    collect() {
        if (!this.collected) {
            this.collected = true;

        }
    }
}
