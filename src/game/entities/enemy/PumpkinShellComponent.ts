import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { BaseEnemyComponent } from "./baseEnemyComponent";
import { PlayerComponent } from "../playerComponent";
import { TILE_SIZE } from "../../constants";
import { Component } from "../../../core/component";

enum PumpkinShellState {
    IDLE,
    MOVING,
    FALLING_DEAD
}

export class PumpkinShellComponent extends BaseEnemyComponent {
    private animator: Animator | null = null;
    private spritesheet: HTMLImageElement | null = null;
    private assetsLoaded: boolean = false;

    private static readonly SPRITESHEET_PATH = "/assets/images/enemies/pumpkin_1.png";
    private static readonly TOTAL_FRAMES = 4;
    private static readonly IDLE_ANIM_FRAMES = [0, 1, 2, 3];
    private static readonly IDLE_ANIM_FPS = 5;
    private static readonly MOVE_ANIM_FRAMES = [0, 1, 2, 3];
    private static readonly MOVE_ANIM_FPS = 10;

    private static readonly SHELL_MOVE_SPEED = 5;
    private static readonly LIFESPAN_SECONDS = 30;

    private currentState: PumpkinShellState = PumpkinShellState.IDLE;
    private lifespanTimer: number = PumpkinShellComponent.LIFESPAN_SECONDS;

    private spriteNativeFrameWidth = 0;
    private spriteNativeFrameHeight = 0;
    private parentPumpkinHeight: number;

    public isFlippedVertically = false;

    private debugLogCooldown = 0;
    private readonly DEBUG_LOG_INTERVAL = 0.25; // Log more frequently for MOVING

    constructor(x: number, y: number, parentPumpkinOriginalHeight: number) {
        super(x, y, TILE_SIZE, TILE_SIZE / 2);
        this.parentPumpkinHeight = parentPumpkinOriginalHeight;
        this.speed = PumpkinShellComponent.SHELL_MOVE_SPEED;
        this.solid = true;
        this.isAlive = true;
        this.initialX = x; // Capture initialX from constructor
        this.initialY = y; // Capture initialY from constructor, this is the intended final Y
        this.loadAssets();
        // Log uses this.y which is set by super() and is the constructor 'y'
        console.log(`PumpkinShell CREATED at x:${this.x.toFixed(2)}, y:${this.y.toFixed(2)}, initial state: IDLE`);
    }

    private async loadAssets() {
        try {
            this.spritesheet = await AssetLoader.loadImage(PumpkinShellComponent.SPRITESHEET_PATH);
            this.spriteNativeFrameWidth = this.spritesheet.width;
            this.spriteNativeFrameHeight = this.spritesheet.height / PumpkinShellComponent.TOTAL_FRAMES;

            // Set the correct height for the shell
            this.height = this.parentPumpkinHeight / 2;
            // Set the correct width based on aspect ratio
            this.width = this.spriteNativeFrameWidth * (this.height / this.spriteNativeFrameHeight);

            // this.y is already correctly set by the super() call in the constructor
            // to the 'y' parameter passed in.
            // this.initialY is also set in the constructor to this 'y' parameter.
            // No further adjustment to this.y or this.initialY is needed here.

            this.animator = new Animator(this.spritesheet, 'vertical', PumpkinShellComponent.IDLE_ANIM_FPS, true);
            this.animator.frameWidth = this.spriteNativeFrameWidth;
            this.animator.frameHeight = this.spriteNativeFrameHeight;
            this.animator.frameCount = PumpkinShellComponent.TOTAL_FRAMES;
            this.animator.currentFrame = PumpkinShellComponent.IDLE_ANIM_FRAMES[0];

            this.assetsLoaded = true;
        } catch (error) {
            console.error(`Failed to load pumpkin_1 spritesheet: ${PumpkinShellComponent.SPRITESHEET_PATH}`, error);
            this.enabled = false;
        }
    }

    protected getDefaultSpeed(): number {
        return PumpkinShellComponent.SHELL_MOVE_SPEED;
    }

    update(dt: number): void {
        if (!this.assetsLoaded || !this.animator) {
            if (this.currentState === PumpkinShellState.FALLING_DEAD) {
                this.y += this.deathSpeed; this.deathSpeed += this.gravity;
                if (this.y > 800) { this.visible = false; this.enabled = false; }
            }
            return;
        }

        this.lifespanTimer -= dt;
        if (this.lifespanTimer <= 0 && this.currentState !== PumpkinShellState.FALLING_DEAD) {
            this.visible = false;
            this.enabled = false;
            this.isAlive = false;
            return;
        }

        this.animator.update(dt);

        if (this.debugLogCooldown > 0) {
            this.debugLogCooldown -= dt;
        }

        switch (this.currentState) {
            case PumpkinShellState.IDLE:
                this.animator.frameRate = PumpkinShellComponent.IDLE_ANIM_FPS;
                if (this.debugLogCooldown <= 0) {
                    // console.log(`Shell IDLE: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}`); // This can be spammy
                    // this.debugLogCooldown = this.DEBUG_LOG_INTERVAL * 4; // Log idle less often
                }
                break;
            case PumpkinShellState.MOVING:
                this.animator.frameRate = PumpkinShellComponent.MOVE_ANIM_FPS;
                const oldX = this.x;
                const moveAmount = this.speed * this.direction * dt * 60;
                this.x += moveAmount;

                const collided = this.checkObstacleCollision();

                if (this.debugLogCooldown <= 0) {
                    console.log(`Shell MOVING ATTEMPT: x=${this.x.toFixed(2)} (was ${oldX.toFixed(2)}), y=${this.y.toFixed(2)}, dir=${this.direction}, speed=${this.speed.toFixed(2)}, moveAmt=${moveAmount.toFixed(2)}, collided=${collided}, dt=${dt.toFixed(4)}`);
                    if (collided) {
                        for (const c of this.scene) {
                            if (c === this || !c.solid || c instanceof PlayerComponent) continue;
                            const currentXAfterMove = this.x; // x after move attempt
                            if (currentXAfterMove < c.x + c.width && currentXAfterMove + this.width > c.x && this.y < c.y + c.height && this.y + this.height > c.y) {
                                console.log(`  Shell COLLIDED WITH: ${(c as any).constructor.name}, objX=${c.x.toFixed(2)}, objY=${c.y.toFixed(2)}, objW=${c.width.toFixed(2)}, objH=${c.height.toFixed(2)}`);
                                console.log(`    Shell_bottom: ${(this.y + this.height).toFixed(2)}, Obstacle_top: ${c.y.toFixed(2)}`);
                                break;
                            }
                        }
                    }
                    this.debugLogCooldown = this.DEBUG_LOG_INTERVAL;
                }

                if (collided) {
                    this.x = oldX;
                    this.direction *= -1;
                    console.log(`  Shell COLLISION RESOLVED: x reverted to ${this.x.toFixed(2)}, new_dir=${this.direction}`);
                }

                if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; console.log("Shell hit left boundary, reversed."); }
                const worldWidth = 3200;
                if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; console.log("Shell hit right boundary, reversed."); }
                break;
            case PumpkinShellState.FALLING_DEAD:
                this.y += this.deathSpeed;
                this.deathSpeed += this.gravity;
                if (this.y > 800) {
                    this.visible = false;
                    this.enabled = false;
                }
                break;
        }
    }

    stomp(): void {
        console.log("PumpkinShellComponent.stomp() called", this.currentState, this.x, this.y);
        if (!this.isAlive) {
            console.log("Shell STOMP IGNORED: Not alive.");
            return;
        }

        if (this.currentState === PumpkinShellState.IDLE) {
            console.log(`SHELL STOMPED (WAS IDLE): x:${this.x.toFixed(2)}, y:${this.y.toFixed(2)}. Transitioning to MOVING.`);
            this.currentState = PumpkinShellState.MOVING;
            const player = this.scene.find(c => c instanceof PlayerComponent) as PlayerComponent | undefined;
            if (player) {
                this.direction = (player.x + player.width / 2 < this.x + this.width / 2) ? 1 : -1; // Move away from player
                console.log(`  Player center: ${(player.x + player.width / 2).toFixed(2)}, Shell center: ${(this.x + this.width / 2).toFixed(2)}. New shell direction: ${this.direction}`);
            } else {
                console.warn("  PumpkinShellComponent: Player not found for stomp direction. Defaulting direction to 1.");
                this.direction = 1;
            }
            this.lifespanTimer = PumpkinShellComponent.LIFESPAN_SECONDS;
            this.debugLogCooldown = 0; // Allow immediate logging for MOVING state
        } else if (this.currentState === PumpkinShellState.MOVING) {
            console.log("SHELL STOMPED (WAS MOVING): Transitioning to FALLING_DEAD.");
            this.killAndFall(true);
        } else {
            console.log(`Shell STOMPED (UNHANDLED STATE): Current state is ${PumpkinShellState[this.currentState]}.`);
        }
    }

    public killAndFall(flipped: boolean): void {
        if (!this.isAlive) return;
        console.log(`Shell killAndFall called. Flipped: ${flipped}. Current state: ${PumpkinShellState[this.currentState]}`);
        this.isAlive = false;
        this.solid = false;
        this.currentState = PumpkinShellState.FALLING_DEAD;
        this.isFlippedVertically = flipped;
        this.deathSpeed = -2;
        this.lifespanTimer = 0.1;
    }

    isHarmfulOnContact(): boolean {
        return this.isAlive && this.currentState === PumpkinShellState.MOVING;
    }

    resetState(): void {
        super.resetState();
        this.y = this.initialY; // Ensure y is reset to the correct initialY from constructor
        this.currentState = PumpkinShellState.IDLE;
        this.lifespanTimer = PumpkinShellComponent.LIFESPAN_SECONDS;
        this.isFlippedVertically = false;
        this.solid = true;
        if (this.animator) {
            this.animator.currentFrame = PumpkinShellComponent.IDLE_ANIM_FRAMES[0];
            this.animator.frameRate = PumpkinShellComponent.IDLE_ANIM_FPS;
            this.animator.playing = true;
        }
        console.log(`PumpkinShell RESET to x:${this.x.toFixed(2)}, y:${this.y.toFixed(2)}, state: IDLE`);
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;

        if (!this.assetsLoaded || !this.animator || !this.spritesheet) {
            ctx.fillStyle = "gray";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        ctx.save();
        const sourceRect = this.animator.getFrameSourceRect();
        if (sourceRect) {
            if (this.currentState === PumpkinShellState.FALLING_DEAD && this.isFlippedVertically) {
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.scale(1, -1);
                ctx.drawImage(
                    this.spritesheet,
                    sourceRect.sx, sourceRect.sy,
                    this.spriteNativeFrameWidth, this.spriteNativeFrameHeight,
                    -this.width / 2, -this.height / 2, this.width, this.height
                );
            } else {
                ctx.drawImage(
                    this.spritesheet,
                    sourceRect.sx, sourceRect.sy,
                    this.spriteNativeFrameWidth, this.spriteNativeFrameHeight,
                    this.x, this.y, this.width, this.height
                );
            }
        }
        ctx.restore();
    }
}
