import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { BaseEnemyComponent } from "./baseEnemyComponent";
import { TILE_SIZE } from "../../constants";

enum BatState {
    FLYING,
    TURNING,
    HIT
}

const BAT_FRAME_HEIGHT = 68; // User-defined constant for frame height

const TURN_FRAMES_START = 0;
const TURN_FRAMES_END = 1;
const FLY_FRAMES_START = 2;
const FLY_FRAMES_END = 3;
const ATTACK_FRAME_INDEX = 4;
const HIT_FRAME_INDEX = 5;

export class BatEnemyComponent extends BaseEnemyComponent {
    private currentState: BatState = BatState.FLYING;
    private animator: Animator | null = null;

    private amplitudeY: number = 20;
    private frequencyY: number = 0.03;
    private initialFlyY: number;

    private patrolStartX: number;
    private patrolEndX: number;

    private animationTimer: number = 0;
    private currentAnimationSubFrame: number = 0;

    private readonly FLY_ANIM_FPS = 8;
    private readonly TURN_ANIM_FPS = 5;

    constructor(x: number, y: number, width: number, height: number, patrolRangeXPx?: [number, number]) {
        super(x, y, width, height);
        this.initialFlyY = y;
        this.speed = this.getDefaultSpeed();
        this.solid = false;

        if (patrolRangeXPx && patrolRangeXPx[0] < patrolRangeXPx[1]) {
            this.patrolStartX = patrolRangeXPx[0];
            this.patrolEndX = patrolRangeXPx[1];
        } else {
            this.patrolStartX = Math.max(0, x - 5 * TILE_SIZE);
            this.patrolEndX = x + 5 * TILE_SIZE;
            if (this.patrolStartX >= this.patrolEndX) {
                this.patrolEndX = this.patrolStartX + 10 * TILE_SIZE;
            }
        }

        this.direction = (this.x < (this.patrolStartX + this.patrolEndX) / 2) ? 1 : -1;
        if (this.x <= this.patrolStartX) this.direction = 1;
        if (this.x + this.width >= this.patrolEndX) this.direction = -1;

        this.loadAssets();
    }

    private async loadAssets() {
        try {
            const batImage = await AssetLoader.loadImage("/assets/images/enemies/bat.png");

            const frameSideLength = batImage.width;

            this.animator = new Animator(batImage, 'vertical', 1, false);
            this.animator.frameWidth = frameSideLength;
            this.animator.frameHeight = BAT_FRAME_HEIGHT; // Use the constant for frame height
            this.animator.frameCount = Math.floor(batImage.height / BAT_FRAME_HEIGHT);

            if (this.animator.frameCount < 6) {
                console.error(`Bat sprite sheet needs at least 6 frames, found ${this.animator.frameCount}. Path: /assets/images/enemies/bat.png`);
                this.enabled = false;
                return;
            }
            this.animator.currentFrame = FLY_FRAMES_START;
            this.animator.playing = false;

        } catch (error) {
            console.error("Failed to load bat assets:", error);
            this.enabled = false;
        }
    }

    protected getDefaultSpeed(): number {
        return 1.2;
    }

    update(dt: number): void {
        if (!this.enabled || !this.animator) return;

        this.animationTimer += dt;

        switch (this.currentState) {
            case BatState.FLYING:
                this.handleFlyingState(dt);
                break;
            case BatState.TURNING:
                this.handleTurningState(dt);
                break;
            case BatState.HIT:
                this.handleHitState(dt);
                break;
        }

        if (this.currentState !== BatState.HIT) {
            // Time-based sinusoidal vertical movement for smoother oscillation independent of horizontal speed/direction
            this.y = this.initialFlyY + this.amplitudeY * Math.sin(this.frequencyY * Date.now() * 0.1);
        }
    }

    private handleFlyingState(dt: number): void {
        this.x += this.speed * this.direction;

        const frameDuration = 1 / this.FLY_ANIM_FPS;
        if (this.animationTimer >= frameDuration) {
            this.animationTimer -= frameDuration;
            this.currentAnimationSubFrame = (this.currentAnimationSubFrame + 1) % (FLY_FRAMES_END - FLY_FRAMES_START + 1);
            this.animator!.currentFrame = FLY_FRAMES_START + this.currentAnimationSubFrame;
        }

        if ((this.direction === 1 && this.x + this.width >= this.patrolEndX) ||
            (this.direction === -1 && this.x <= this.patrolStartX)) {
            this.currentState = BatState.TURNING;
            this.currentAnimationSubFrame = 0;
            this.animator!.currentFrame = TURN_FRAMES_START;
            this.animationTimer = 0;

            this.x = Math.max(this.patrolStartX, Math.min(this.x, this.patrolEndX - this.width));
        }
    }

    private handleTurningState(dt: number): void {
        const frameDuration = 1 / this.TURN_ANIM_FPS;
        if (this.animationTimer >= frameDuration) {
            this.animationTimer -= frameDuration;
            this.currentAnimationSubFrame++;
            if (this.currentAnimationSubFrame <= (TURN_FRAMES_END - TURN_FRAMES_START)) {
                this.animator!.currentFrame = TURN_FRAMES_START + this.currentAnimationSubFrame;
            } else {
                this.direction *= -1;
                this.currentState = BatState.FLYING;
                this.currentAnimationSubFrame = 0;
                this.animator!.currentFrame = FLY_FRAMES_START;
                this.animationTimer = 0;
            }
        }
    }

    private handleHitState(dt: number): void {
        this.y += this.deathSpeed;
        this.deathSpeed += this.gravity;

        if (this.y > 800) {
            this.visible = false;
            this.enabled = false;
        }
    }

    stomp(): void {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.solid = false;
        this.currentState = BatState.HIT;
        if (this.animator) {
            this.animator.currentFrame = HIT_FRAME_INDEX;
        }
        this.deathSpeed = -2;
    }

    isHarmfulOnContact(): boolean {
        return this.isAlive;
    }

    resetState(): void {
        super.resetState();
        this.y = this.initialFlyY;
        this.currentState = BatState.FLYING;

        if (this.x <= this.patrolStartX) this.direction = 1;
        else if (this.x + this.width >= this.patrolEndX) this.direction = -1;

        this.currentAnimationSubFrame = 0;
        this.animationTimer = 0;
        this.deathSpeed = 0;
        if (this.animator) {
            this.animator.currentFrame = FLY_FRAMES_START;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible || !this.animator || !this.animator.spritesheet) return;

        const sourceRect = this.animator.getFrameSourceRect();
        if (sourceRect) {
            ctx.save();
            // The original sprite faces left (for direction = -1)
            // If direction is 1 (moving right), we need to flip it.
            if (this.direction === 1) {
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.animator.spritesheet,
                    sourceRect.sx,
                    sourceRect.sy,
                    sourceRect.sWidth,
                    sourceRect.sHeight,
                    0, // Draw at the new (0,0) of the transformed context
                    0,
                    this.width,
                    this.height
                );
            } else {
                // No flip needed, draw normally
                ctx.translate(this.x, this.y);
                ctx.drawImage(
                    this.animator.spritesheet,
                    sourceRect.sx,
                    sourceRect.sy,
                    sourceRect.sWidth,
                    sourceRect.sHeight,
                    0, // Draw at the new (0,0) of the transformed context
                    0,
                    this.width,
                    this.height
                );
            }
            ctx.restore();
        } else {
            ctx.fillStyle = "purple";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
