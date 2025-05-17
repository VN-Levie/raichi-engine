import { Component } from "../../../core/component";
import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { TILE_SIZE } from "../../constants";

const TORNADO_FRAME_HEIGHT = 120;
const TORNADO_SPRITE_WIDTH = 64; // Assuming a width for the tornado sprite, adjust if necessary

export class TornadoComponent extends Component {
    private animator: Animator | null = null;
    public isHarmful: boolean = true;
    private speedX: number = 0;
    private direction: number = 1;
    private patrolStartX?: number;
    private patrolEndX?: number;

    constructor(x: number, y: number, patrolRangeXPx?: [number, number]) {
        super();
        this.x = x;
        this.y = y;
        this.width = TORNADO_SPRITE_WIDTH; // Adjust as per your sprite's actual content width
        this.height = TORNADO_FRAME_HEIGHT;
        this.solid = false; // Player passes through, but takes damage
        this.zIndex = 5; // In front of background, behind player? Or same as enemies.

        if (patrolRangeXPx && patrolRangeXPx[0] < patrolRangeXPx[1]) {
            this.patrolStartX = patrolRangeXPx[0];
            this.patrolEndX = patrolRangeXPx[1];
            this.speedX = 0.5 * TILE_SIZE / 60; // Slow drift, e.g., 0.5 tile per second
        }

        this.loadAssets();
    }

    private async loadAssets() {
        try {
            const image = await AssetLoader.loadImage("/assets/images/effects/tornado.png");
            this.animator = new Animator(image, 'vertical', 8, true); // 8 FPS animation
            this.animator.frameWidth = image.width; // Assuming full width of sprite sheet for each frame
            this.animator.frameHeight = TORNADO_FRAME_HEIGHT;
            this.animator.frameCount = Math.floor(image.height / TORNADO_FRAME_HEIGHT);
            if (this.animator.frameCount !== 4) {
                console.warn(`Tornado sprite sheet expected 4 frames, found ${this.animator.frameCount}`);
            }
        } catch (error) {
            console.error("Failed to load tornado assets:", error);
        }
    }

    update(dt: number): void {
        this.animator?.update(dt);

        if (this.patrolStartX !== undefined && this.patrolEndX !== undefined && this.speedX !== 0) {
            this.x += this.speedX * this.direction * dt * 60; // dt is in seconds, speedX in pixels per frame (assuming 60fps logic)

            if (this.direction === 1 && this.x + this.width >= this.patrolEndX) {
                this.direction = -1;
                this.x = this.patrolEndX - this.width;
            } else if (this.direction === -1 && this.x <= this.patrolStartX) {
                this.direction = 1;
                this.x = this.patrolStartX;
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible || !this.animator || !this.animator.spritesheet) return;

        const sourceRect = this.animator.getFrameSourceRect();
        if (sourceRect) {
            ctx.drawImage(
                this.animator.spritesheet,
                sourceRect.sx,
                sourceRect.sy,
                sourceRect.sWidth,
                sourceRect.sHeight,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
}
