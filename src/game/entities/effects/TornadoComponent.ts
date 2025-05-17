import { Component } from "../../../core/component";
import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { TILE_SIZE } from "../../constants";
import { TornadoConfigType } from "../../types/mapData"; 

const TORNADO_FRAME_HEIGHT = 120;
const TORNADO_SPRITE_WIDTH = 64;
const DEFAULT_TORNADO_PATROL_SPEED_PPS = 0.5 * TILE_SIZE; 

export class TornadoComponent extends Component {
    private animator: Animator | null = null;
    public isHarmful: boolean = true;
    private speedX: number = 0; 
    private direction: number = 1;
    private patrolStartX?: number;
    private patrolEndX?: number;

    
    private canToggle: boolean;
    private toggleIntervalSeconds?: [min: number, max: number];
    private isCurrentlyActive: boolean = true;
    private toggleTimer: number = 0;
    private currentToggleDuration: number = 0;

    constructor(x: number, y: number, config: Partial<TornadoConfigType> = {}) { 
        super();
        this.x = x;
        this.y = y;
        this.width = TORNADO_SPRITE_WIDTH;
        this.height = TORNADO_FRAME_HEIGHT;
        this.solid = false;
        this.zIndex = 5;

        this.canToggle = config.canToggle ?? false;
        this.toggleIntervalSeconds = config.toggleIntervalSeconds;

        if (this.canToggle && this.toggleIntervalSeconds) {
            this.isCurrentlyActive = Math.random() > 0.3; 
            this.setNextToggleTime();
            this.toggleTimer = this.currentToggleDuration;
        } else {
            this.isCurrentlyActive = true; 
        }
        this.isHarmful = this.isCurrentlyActive;
        this.visible = this.isCurrentlyActive;

        if (config.patrolRangeXTiles && config.patrolRangeXTiles[0] < config.patrolRangeXTiles[1]) {
            this.patrolStartX = config.patrolRangeXTiles[0];
            this.patrolEndX = config.patrolRangeXTiles[1];

            let currentBaseSpeed = DEFAULT_TORNADO_PATROL_SPEED_PPS * (config.baseSpeedMultiplier ?? 1);
            if (config.speedRandomnessFactor) {
                const randomness = (Math.random() - 0.5) * 2 * config.speedRandomnessFactor; 
                currentBaseSpeed *= (1 + randomness);
            }
            this.speedX = currentBaseSpeed;
        } else {
            this.speedX = 0; 
        }

        this.loadAssets();
    }

    private setNextToggleTime(): void {
        if (!this.toggleIntervalSeconds) return;
        const [min, max] = this.toggleIntervalSeconds;
        this.currentToggleDuration = min + Math.random() * (max - min);
    }

    private async loadAssets() {
        try {
            const image = await AssetLoader.loadImage("/assets/images/effects/tornado.png");
            this.animator = new Animator(image, 'vertical', 8, true); 
            this.animator.frameWidth = image.width; 
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

        if (this.canToggle) {
            this.toggleTimer -= dt;
            if (this.toggleTimer <= 0) {
                this.isCurrentlyActive = !this.isCurrentlyActive;
                this.isHarmful = this.isCurrentlyActive;
                this.visible = this.isCurrentlyActive; 
                this.setNextToggleTime();
                this.toggleTimer = this.currentToggleDuration;
            }
        }

        if (this.patrolStartX !== undefined && this.patrolEndX !== undefined && this.speedX !== 0) {
            this.x += this.speedX * this.direction * dt;

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
