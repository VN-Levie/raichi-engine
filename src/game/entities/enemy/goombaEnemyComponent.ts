import { Component } from "../../../core/component";
import { PlayerComponent } from "../playerComponent";
import { BaseEnemyComponent } from "./baseEnemyComponent";
import { AssetLoader } from "../../../core/assetLoader";
import { Animator } from "../../../core/animator";
import { TILE_SIZE } from "../../constants";

enum EnemyState {
  WALKING,
  ATTACKING,
  STOMPED, 
  DEAD    
}

export class GoombaEnemyComponent extends BaseEnemyComponent {
  private stompAnimationTimer = 0; 
  private readonly stompDuration = 0.5; 

  
  private animator: Animator | null = null;
  private assetsLoaded: boolean = false;
  private static readonly SPRITESHEET_PATH = "/assets/images/enemies/crap.png"; 
  private static readonly TOTAL_FRAMES = 5;
  private static readonly WALK_FRAMES = [0, 1, 2];
  private static readonly ATTACK_FRAME = 3;
  private static readonly STOMPED_FRAME = 4;
  private static readonly WALK_ANIM_FPS = 6; 

  
  private currentState: EnemyState = EnemyState.WALKING;
  private static readonly ATTACK_RANGE = TILE_SIZE;
  private static readonly ATTACK_DURATION = 0.4; 
  private static readonly ATTACK_COOLDOWN = 0.5; 
  private attackTimer = 0;
  private timeSinceLastAttack = GoombaEnemyComponent.ATTACK_COOLDOWN; 

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
    this.speed = this.getDefaultSpeed();
    this.loadAssets();
  }

  private async loadAssets() {
    try {
      const image = await AssetLoader.loadImage(GoombaEnemyComponent.SPRITESHEET_PATH);
      const frameWidth = image.width; 
      const frameHeight = image.height / GoombaEnemyComponent.TOTAL_FRAMES;

      this.animator = new Animator(image, 'vertical', GoombaEnemyComponent.WALK_ANIM_FPS, true);
      this.animator.frameWidth = frameWidth;
      this.animator.frameHeight = frameHeight;
      this.animator.frameCount = GoombaEnemyComponent.TOTAL_FRAMES;
      this.animator.currentFrame = GoombaEnemyComponent.WALK_FRAMES[0];
      
      this.assetsLoaded = true;
    } catch (error) {
      console.error(`Failed to load enemy spritesheet from ${GoombaEnemyComponent.SPRITESHEET_PATH}:`, error);
      
      this.enabled = false;
    }
  }

  protected getDefaultSpeed(): number {
    return 0.75; 
  }

  update(dt: number) {
    if (!this.assetsLoaded || !this.animator) {
        
        if (this.currentState === EnemyState.DEAD) {
            this.y += this.deathSpeed;
            this.deathSpeed += this.gravity;
            if (this.y > 800) { this.visible = false; this.enabled = false; }
        }
        return;
    }

    this.timeSinceLastAttack += dt;

    switch (this.currentState) {
      case EnemyState.WALKING:
        this.handleWalking(dt);
        
        const player = this.scene.find(c => c instanceof PlayerComponent && !c.isDying) as PlayerComponent | undefined;
        if (player && this.timeSinceLastAttack >= GoombaEnemyComponent.ATTACK_COOLDOWN) {
          const distanceToPlayer = Math.abs(player.x - this.x);
          const yDifference = Math.abs(player.y - this.y);
          if (distanceToPlayer < GoombaEnemyComponent.ATTACK_RANGE && yDifference < this.height) {
            
            if ((player.x < this.x && this.direction === 1) || (player.x > this.x && this.direction === -1)) {
                 
            }
            this.direction = (player.x < this.x) ? -1 : 1; 
            this.currentState = EnemyState.ATTACKING;
            this.animator.currentFrame = GoombaEnemyComponent.ATTACK_FRAME;
            this.attackTimer = 0;
          }
        }
        break;

      case EnemyState.ATTACKING:
        this.attackTimer += dt;
        
        if (this.attackTimer >= GoombaEnemyComponent.ATTACK_DURATION) {
          this.currentState = EnemyState.WALKING;
          this.animator.currentFrame = GoombaEnemyComponent.WALK_FRAMES[0]; 
          this.animator.playing = true; 
          this.timeSinceLastAttack = 0;
        }
        break;

      case EnemyState.STOMPED:
        this.stompAnimationTimer += dt;
        
        if (this.stompAnimationTimer >= this.stompDuration) {
          this.currentState = EnemyState.DEAD;
          this.deathSpeed = -4; 
        }
        break;

      case EnemyState.DEAD:
        this.y += this.deathSpeed;
        this.deathSpeed += this.gravity;
        if (this.y > 800) { 
          this.visible = false;
          this.enabled = false;
        }
        break;
    }
    
    
    if (this.currentState === EnemyState.WALKING && this.animator.playing) {
        const frameDuration = 1 / GoombaEnemyComponent.WALK_ANIM_FPS;
        this.animator.timer += dt; 
        if (this.animator.timer >= frameDuration) {
            this.animator.timer -= frameDuration;
            let currentWalkFrameIndex = GoombaEnemyComponent.WALK_FRAMES.indexOf(this.animator.currentFrame);
            if (currentWalkFrameIndex === -1 || this.animator.currentFrame > GoombaEnemyComponent.WALK_FRAMES[GoombaEnemyComponent.WALK_FRAMES.length-1] || this.animator.currentFrame < GoombaEnemyComponent.WALK_FRAMES[0]) {
                currentWalkFrameIndex = 0; 
            } else {
                currentWalkFrameIndex = (currentWalkFrameIndex + 1) % GoombaEnemyComponent.WALK_FRAMES.length;
            }
            this.animator.currentFrame = GoombaEnemyComponent.WALK_FRAMES[currentWalkFrameIndex];
        }
    }
  }

  private handleWalking(dt: number) {
    const oldX = this.x;
    if (this.isLedgeAhead()) {
      this.direction *= -1;
    } else {
      this.x += this.speed * this.direction * dt * 60; 
      if (this.checkObstacleCollision()) {
        this.x = oldX;
        this.direction *= -1;
      }
    }

    
    if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; }
    const worldWidth = 3200; 
    if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;

    if (!this.assetsLoaded || !this.animator || !this.animator.spritesheet) {
      
      ctx.fillStyle = "brown"; 
      if (this.currentState === EnemyState.STOMPED || this.currentState === EnemyState.DEAD) {
        ctx.fillRect(this.x, this.y + this.height * 0.6, this.width, this.height * 0.4);
      } else {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
      return;
    }

    const sourceRect = this.animator.getFrameSourceRect();
    if (sourceRect) {
      ctx.save();
      
      
      if (this.direction === 1) { 
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
          this.animator.spritesheet,
          sourceRect.sx, sourceRect.sy, sourceRect.sWidth, sourceRect.sHeight,
          0, 0, this.width, this.height
        );
      } else {
        ctx.drawImage(
          this.animator.spritesheet,
          sourceRect.sx, sourceRect.sy, sourceRect.sWidth, sourceRect.sHeight,
          this.x, this.y, this.width, this.height
        );
      }
      ctx.restore();
    }
  }

  stomp() {
    if (this.currentState === EnemyState.STOMPED || this.currentState === EnemyState.DEAD) return;
    this.isAlive = false; 
    this.currentState = EnemyState.STOMPED;
    if (this.animator) {
        this.animator.currentFrame = GoombaEnemyComponent.STOMPED_FRAME;
        this.animator.playing = false; 
    }
    this.stompAnimationTimer = 0;
    this.solid = false; 
  }

  resetState() {
    super.resetState(); 
    this.currentState = EnemyState.WALKING;
    this.stompAnimationTimer = 0;
    this.attackTimer = 0;
    this.timeSinceLastAttack = GoombaEnemyComponent.ATTACK_COOLDOWN;
    if (this.animator) {
      this.animator.currentFrame = GoombaEnemyComponent.WALK_FRAMES[0];
      this.animator.playing = true;
    }
    this.solid = false; 
  }

  isHarmfulOnContact(): boolean {
    
    return this.isAlive && this.currentState !== EnemyState.STOMPED && this.currentState !== EnemyState.DEAD;
  }
}