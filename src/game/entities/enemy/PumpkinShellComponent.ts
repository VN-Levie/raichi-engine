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
    private readonly DEBUG_LOG_INTERVAL = 0.25; 

    constructor(x: number, y: number, parentPumpkinOriginalHeight: number) {
        super(x, y, TILE_SIZE, TILE_SIZE / 2);
        this.parentPumpkinHeight = parentPumpkinOriginalHeight;
        this.speed = PumpkinShellComponent.SHELL_MOVE_SPEED;
        this.solid = true;
        this.isAlive = true;
        this.initialX = x; 
        this.initialY = y; 
        this.loadAssets();
        
        console.log(`PumpkinShell CREATED at x:${this.x.toFixed(2)}, y:${this.y.toFixed(2)}, initial state: IDLE`);
    }

    private async loadAssets() {
        try {
            this.spritesheet = await AssetLoader.loadImage(PumpkinShellComponent.SPRITESHEET_PATH);
            this.spriteNativeFrameWidth = this.spritesheet.width;
            this.spriteNativeFrameHeight = this.spritesheet.height / PumpkinShellComponent.TOTAL_FRAMES;

            
            this.height = this.parentPumpkinHeight / 2;
            
            this.width = this.spriteNativeFrameWidth * (this.height / this.spriteNativeFrameHeight);

            
            
            
            

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

    protected override checkObstacleCollision(): boolean {
        const collisionEpsilon = 0.1; 

        for (const c of this.scene) {
            
            
            if (c === this || !c.solid || c instanceof PlayerComponent || c instanceof PumpkinShellComponent) {
                continue;
            }

            
            if (
                this.x < c.x + c.width &&
                this.x + this.width > c.x &&
                this.y < c.y + c.height &&
                (this.y + this.height) > (c.y + collisionEpsilon) 
            ) {
                const verticalOverlap = (this.y + this.height > c.y + collisionEpsilon) && (this.y < c.y + c.height - collisionEpsilon);

                if (verticalOverlap) {
                    return true; 
                }
            }
        }
        return false; 
    }

    private handleIdleState(dt: number) {
        if (this.animator) {
            const frameDuration = 1 / PumpkinShellComponent.IDLE_ANIM_FPS;
            this.animator.timer += dt;
            if (this.animator.timer >= frameDuration) {
                this.animator.timer -= frameDuration;
                let currentFrameIndex = PumpkinShellComponent.IDLE_ANIM_FRAMES.indexOf(this.animator.currentFrame);
                if (currentFrameIndex === -1) {
                    currentFrameIndex = 0; 
                } else {
                    currentFrameIndex = (currentFrameIndex + 1) % PumpkinShellComponent.IDLE_ANIM_FRAMES.length;
                }
                this.animator.currentFrame = PumpkinShellComponent.IDLE_ANIM_FRAMES[currentFrameIndex];
            }
        }
        
        
        
    }

    private handleMovingState(dt: number) {
        this.x += this.speed * this.direction * dt * 60;

        if (this.checkObstacleCollision()) {
            this.x -= this.speed * this.direction * dt * 60; 
            this.direction *= -1;
        } else if (this.isLedgeAhead()) { 
            this.currentState = PumpkinShellState.FALLING_DEAD;
            this.solid = false; 
            this.deathSpeed = 0; 
        }

        this.lifespanTimer -= dt;
        if (this.lifespanTimer <= 0) {
            this.killAndFall(false);
        }

        if (this.animator) {
            const frameDuration = 1 / PumpkinShellComponent.MOVE_ANIM_FPS;
            this.animator.timer += dt;
            if (this.animator.timer >= frameDuration) {
                this.animator.timer -= frameDuration;
                let currentFrameIndex = PumpkinShellComponent.MOVE_ANIM_FRAMES.indexOf(this.animator.currentFrame);
                if (currentFrameIndex === -1) {
                    currentFrameIndex = 0;
                } else {
                    currentFrameIndex = (currentFrameIndex + 1) % PumpkinShellComponent.MOVE_ANIM_FRAMES.length;
                }
                this.animator.currentFrame = PumpkinShellComponent.MOVE_ANIM_FRAMES[currentFrameIndex];
            }
        }
    }

    private handleFallingDeadState(dt: number) {
        this.y += this.deathSpeed;
        this.deathSpeed += this.gravity;

        if (this.y > (this.scene.find(c => c.constructor.name === 'BoxComponent' && (c as any).color === 'gray')?.y || 800) + 200) { 
            this.visible = false;
            this.enabled = false;
        }
    }

    update(dt: number): void {
        if (!this.assetsLoaded || !this.animator) {
            if (this.currentState === PumpkinShellState.FALLING_DEAD) {
                this.handleFallingDeadState(dt);
            }
            return;
        }

        this.debugLogCooldown -= dt;

        switch (this.currentState) {
            case PumpkinShellState.IDLE:
                this.handleIdleState(dt);
                break;
            case PumpkinShellState.MOVING:
                this.handleMovingState(dt);
                break;
            case PumpkinShellState.FALLING_DEAD:
                this.handleFallingDeadState(dt);
                break;
        }

        if (this.debugLogCooldown <= 0) {
            this.debugLogCooldown = this.DEBUG_LOG_INTERVAL;
        }
    }

    stomp(): void {
        if (this.currentState === PumpkinShellState.MOVING) {
            this.currentState = PumpkinShellState.IDLE;
            this.lifespanTimer = PumpkinShellComponent.LIFESPAN_SECONDS; 
            if (this.animator) {
                this.animator.currentFrame = PumpkinShellComponent.IDLE_ANIM_FRAMES[0];
            }
        } else if (this.currentState === PumpkinShellState.IDLE) {
            this.currentState = PumpkinShellState.MOVING;
            
            const player = this.scene.find(c => c instanceof PlayerComponent) as PlayerComponent | undefined;
            if (player) {
                this.direction = (player.x + player.width / 2 < this.x + this.width / 2) ? 1 : -1;
            } else {
                this.direction = 1; 
            }
            this.lifespanTimer = PumpkinShellComponent.LIFESPAN_SECONDS;
        }
    }

    public killAndFall(isHitByAnotherShell: boolean = false): void {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.solid = false;
        this.currentState = PumpkinShellState.FALLING_DEAD;
        this.deathSpeed = isHitByAnotherShell ? -2 : 0; 
        if (this.animator) {
            this.animator.currentFrame = PumpkinShellComponent.IDLE_ANIM_FRAMES[0];
            this.animator.playing = false;
        }
    }

    isHarmfulOnContact(): boolean {
        return this.isAlive && this.currentState === PumpkinShellState.MOVING;
    }

    resetState(): void {
        super.resetState();
        this.y = this.initialY; 
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
