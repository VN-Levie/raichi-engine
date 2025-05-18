import { Component } from "../../../core/component";
import { PlayerComponent } from "../playerComponent";
import { BaseEnemyComponent } from "./baseEnemyComponent";
import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { TILE_SIZE } from "../../constants";
import { PumpkinShellComponent } from "./PumpkinShellComponent"; 

enum PumpkinState {
    IDLE, 
    WALKING,
    ATTACKING,
    STOMPED,
    DEAD
}

export class TurtleEnemyComponent extends BaseEnemyComponent { 
    private stompAnimationTimer = 0;
    private readonly stompDuration = 0.5; 

    private animator: Animator | null = null; 
    private spritesheet: HTMLImageElement | null = null; 
    private assetsLoaded: boolean = false;

    private static readonly SPRITESHEET_PATH = "/assets/images/enemies/pumpkin_0.png";
    private static readonly TOTAL_FRAMES = 8;

    
    private static readonly IDLE_FRAMES = [0, 1]; 
    private static readonly IDLE_ANIM_FPS = 4;
    private static readonly WALK_FRAMES = [0, 1, 2, 3, 4, 5];
    private static readonly WALK_ANIM_FPS = 8; 
    private static readonly ATTACK_FRAME = 6;
    private static readonly STOMPED_FRAME = 7; 

    private static readonly PLAYER_TARGET_HEIGHT = 46; 
    private spriteNativeFrameWidth = 0;
    private spriteNativeFrameHeight = 0;

    private animFrame = 0;
    private animTimer = 0;
    private isMoving = false;

    private currentState: PumpkinState = PumpkinState.IDLE; 
    private static readonly ATTACK_RANGE = TILE_SIZE;
    private static readonly ATTACK_DURATION = 0.4;
    private static readonly ATTACK_COOLDOWN = 0.4; 
    private attackTimer = 0;
    private timeSinceLastAttack = TurtleEnemyComponent.ATTACK_COOLDOWN;

    private hasSpawnedShell = false; 

    constructor(x: number, y: number, width: number, height: number) { 
        super(x, y, TILE_SIZE, TurtleEnemyComponent.PLAYER_TARGET_HEIGHT); 
        this.speed = this.getDefaultSpeed();
        this.loadAssets();
    }

    private async loadAssets() {
        try {
            this.spritesheet = await AssetLoader.loadImage(TurtleEnemyComponent.SPRITESHEET_PATH);

            this.spriteNativeFrameWidth = this.spritesheet.width; 
            this.spriteNativeFrameHeight = this.spritesheet.height / TurtleEnemyComponent.TOTAL_FRAMES;
            
            
            this.height = TurtleEnemyComponent.PLAYER_TARGET_HEIGHT;
            this.width = this.spriteNativeFrameWidth * (this.height / this.spriteNativeFrameHeight);

            this.animator = new Animator(this.spritesheet, 'vertical', TurtleEnemyComponent.IDLE_ANIM_FPS, true);
            this.animator.frameWidth = this.spriteNativeFrameWidth; 
            this.animator.frameHeight = this.spriteNativeFrameHeight;
            this.animator.frameCount = TurtleEnemyComponent.TOTAL_FRAMES;
            this.animator.currentFrame = TurtleEnemyComponent.IDLE_FRAMES[0];
            
            this.assetsLoaded = true;
        } catch (error) {
            console.error(`Failed to load pumpkin_0 spritesheet: ${TurtleEnemyComponent.SPRITESHEET_PATH}`, error);
            this.enabled = false;
        }
    }

    protected getDefaultSpeed(): number {
        return 0.6; 
    }

    update(dt: number) {
        if (!this.assetsLoaded || !this.animator) {
            if (this.currentState === PumpkinState.DEAD) { 
                this.y += this.deathSpeed; this.deathSpeed += this.gravity;
                if (this.y > 800) { this.visible = false; this.enabled = false; }
            }
            return;
        }
        if (!this.isAlive && this.currentState !== PumpkinState.STOMPED && this.currentState !== PumpkinState.DEAD) {
            this.currentState = PumpkinState.DEAD; 
            this.deathSpeed = 0; 
        }

        this.timeSinceLastAttack += dt;
        this.animTimer += dt; 

        
        
        let tryingToMove = (this.currentState === PumpkinState.WALKING || this.currentState === PumpkinState.IDLE);

        if (tryingToMove) {
            this.handleMovementLogic(dt); 
        } else {
            this.isMoving = false;
        }

        const player = this.scene.find(c => c instanceof PlayerComponent && !c.isDying) as PlayerComponent | undefined;
        const canAttack = player && this.timeSinceLastAttack >= TurtleEnemyComponent.ATTACK_COOLDOWN;
        let playerInRange = false;
        if (canAttack) {
            const distanceToPlayer = Math.abs(player!.x - this.x);
            const yDifference = Math.abs(player!.y - this.y);
            playerInRange = distanceToPlayer < TurtleEnemyComponent.ATTACK_RANGE && yDifference < this.height * 1.5;
        }

        
        if (this.currentState !== PumpkinState.ATTACKING && 
            this.currentState !== PumpkinState.STOMPED && 
            this.currentState !== PumpkinState.DEAD) {
            if (playerInRange && canAttack) {
                this.direction = (player!.x < this.x) ? -1 : 1; 
                this.currentState = PumpkinState.ATTACKING;
                this.animator!.currentFrame = TurtleEnemyComponent.ATTACK_FRAME;
                this.attackTimer = 0;
                this.isMoving = false; 
            } else if (this.isMoving && this.currentState !== PumpkinState.WALKING) {
                this.currentState = PumpkinState.WALKING;
                this.animFrame = 0; 
                this.animTimer = 0; 
            } else if (!this.isMoving && this.currentState !== PumpkinState.IDLE) {
                this.currentState = PumpkinState.IDLE;
                this.animFrame = 0; 
                this.animTimer = 0; 
            }
        }

        switch (this.currentState) {
            case PumpkinState.IDLE:
                const idleFrameDuration = 1 / TurtleEnemyComponent.IDLE_ANIM_FPS;
                if (this.animTimer >= idleFrameDuration) {
                    this.animTimer -= idleFrameDuration;
                    this.animFrame = (this.animFrame + 1) % TurtleEnemyComponent.IDLE_FRAMES.length;
                    this.animator.currentFrame = TurtleEnemyComponent.IDLE_FRAMES[this.animFrame];
                }
                break;
            case PumpkinState.WALKING:
                
                const walkFrameDuration = 1 / TurtleEnemyComponent.WALK_ANIM_FPS;
                if (this.animTimer >= walkFrameDuration) {
                    this.animTimer -= walkFrameDuration;
                    this.animFrame = (this.animFrame + 1) % TurtleEnemyComponent.WALK_FRAMES.length;
                    this.animator.currentFrame = TurtleEnemyComponent.WALK_FRAMES[this.animFrame];
                }
                break;
            case PumpkinState.ATTACKING:
                this.handleAttackingState(dt);
                break;
            case PumpkinState.STOMPED:
                this.handleStompedState(dt);
                break;
            case PumpkinState.DEAD:
                this.handleDeadState(dt);
                break;
        }
    }

    private handleMovementLogic(dt: number) { 
        const oldX = this.x;
        let movedThisFrame = false;

        if (this.isLedgeAhead()) {
            this.direction *= -1;
        } else {
            this.x += this.speed * this.direction * dt * 60;
            if (this.checkObstacleCollision()) {
                this.x = oldX;
                this.direction *= -1;
            } else {
                movedThisFrame = Math.abs(this.x - oldX) > 0.001;
            }
        }
        
        if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; }
        const worldWidth = 3200; 
        if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; }
        
        this.isMoving = movedThisFrame;
    }

    private handleAttackingState(dt: number) {
        this.attackTimer += dt;
        if (this.attackTimer >= TurtleEnemyComponent.ATTACK_DURATION) {
            
            
            this.currentState = PumpkinState.IDLE; 
            this.animator!.currentFrame = TurtleEnemyComponent.IDLE_FRAMES[0];
            this.animFrame = 0;
            this.animTimer = 0;
            this.timeSinceLastAttack = 0;
        }
    }

    private handleStompedState(dt: number) {
        this.stompAnimationTimer += dt;
        if (this.stompAnimationTimer >= this.stompDuration) {
            this.currentState = PumpkinState.DEAD;
            this.deathSpeed = -4; 

            if (!this.hasSpawnedShell && this.scene) {
                
                const shellHeight = TurtleEnemyComponent.PLAYER_TARGET_HEIGHT / 2;
                const shellY = this.y + this.height - shellHeight;
                const shell = new PumpkinShellComponent(this.x, shellY, TurtleEnemyComponent.PLAYER_TARGET_HEIGHT);
                let sceneComponents = this.scene as Component[];
                if (sceneComponents && typeof sceneComponents.push === 'function') {
                    sceneComponents.push(shell);
                    shell.setScene(sceneComponents);
                }
                
                const player = this.scene.find(c => c instanceof PlayerComponent) as PlayerComponent | undefined;
                if (player && Math.abs(player.x - this.x) < this.width) {
                    player.bounceOffEnemySlightly();
                }
                this.hasSpawnedShell = true;
            }
        }
    }

    private handleDeadState(dt: number) {
        this.y += this.deathSpeed;
        this.deathSpeed += this.gravity;
        if (this.y > 800) { 
            this.visible = false;
            this.enabled = false;
        }
    }

    stomp() {
        if (!this.isAlive || this.currentState === PumpkinState.STOMPED || this.currentState === PumpkinState.DEAD) return;
        this.isAlive = false;
        this.currentState = PumpkinState.STOMPED;
        if (this.animator) {
            this.animator.currentFrame = TurtleEnemyComponent.STOMPED_FRAME;
            this.animator.playing = false;
        }
        this.stompAnimationTimer = 0;
        this.solid = false;
    }

    hitByPlayerNonStomp(): boolean {
        
        return true; 
    }

    resetState() {
        super.resetState();
        this.currentState = PumpkinState.IDLE; 
        this.stompAnimationTimer = 0;
        this.attackTimer = 0;
        this.timeSinceLastAttack = TurtleEnemyComponent.ATTACK_COOLDOWN;
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.hasSpawnedShell = false; 
        if (this.animator) {
            this.animator.currentFrame = TurtleEnemyComponent.IDLE_FRAMES[0];
            this.animator.playing = true; 
        }
        this.solid = false; 
    }

    public isHarmfulOnContact(): boolean {
        if (!this.isAlive) return false;
        return this.currentState === PumpkinState.WALKING ||
               this.currentState === PumpkinState.ATTACKING;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (!this.visible) return;

        if (!this.assetsLoaded || !this.animator || !this.spritesheet) {
            ctx.fillStyle = "#FF8C00"; 
            if (this.currentState === PumpkinState.STOMPED || this.currentState === PumpkinState.DEAD) {
                ctx.fillRect(this.x, this.y + this.height * 0.6, this.width, this.height * 0.4);
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            return;
        }

        ctx.save();
        const sourceRect = this.animator.getFrameSourceRect();
        if (sourceRect) {
            
            
            if (this.direction === 1) { 
                ctx.translate(this.x + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.spritesheet,
                    sourceRect.sx, sourceRect.sy, 
                    this.spriteNativeFrameWidth, this.spriteNativeFrameHeight, 
                    0, 0, this.width, this.height 
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
