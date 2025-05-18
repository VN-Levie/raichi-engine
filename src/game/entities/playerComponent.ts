import { Component } from "../../core/component"
import { Input } from "../../core/input"
import { AssetLoader } from "../../core/assetLoader";
import { Animator } from "../../core/animator";
import { GameAudioManager } from "../audio/gameAudioManager";

enum PlayerState {
  IDLE,
  RUNNING,
  JUMPING,
  FALLING,
  DYING,
  SWIMMING,
}

export class PlayerComponent extends Component {
  velocityY = 0
  private gravity = 0.45
  private jumpForce = -10
  private isGrounded = false
  private speed = 3
  private direction = 1
  private isMoving = false
  private animFrame = 0
  private animTimer = 0
  private jumpPressed = false
  private groundY = 0
  private isUnderwater: boolean = false;
  private state: PlayerState = PlayerState.IDLE
  private readonly underwaterDrag = 0.95;
  private readonly jumpDrag = 0.9;
  private readonly swimDrag = 0.8;

  private velocityX = 0
  isDying = false;
  private deathAnimTimer = 0;
  private readonly DEATH_ANIM_DURATION = 1.5;
  private readonly DEATH_BOUNCE_FORCE = -7;

  private currentJumps: number = 0;
  private readonly maxJumps: number = 2;

  private readonly buoyancyAcceleration = 0.075;
  private readonly swimAcceleration = 0.3;
  private readonly underwaterDragFactor = 0.97;
  private readonly maxUnderwaterVerticalSpeed = 2.0;
  private readonly underwaterHorizontalSpeedFactor = 0.8;

  respawnX: number;
  respawnY: number;

  
  private animator: Animator | null = null;
  private spritesheet: HTMLImageElement | null = null;
  private assetsLoaded: boolean = false;
  private readonly SPRITESHEET_PATH = "/assets/images/char/char.png";
  private readonly SPRITESHEET_TOTAL_FRAMES = 6;
  private readonly SPRITE_FRAME_WIDTH = 50;
  private readonly SPRITE_FRAME_HEIGHT = 52;

  
  private readonly IDLE_FRAMES = [0, 1];
  private readonly IDLE_ANIM_FPS = 4;
  private readonly RUN_FRAMES = [2, 3, 4, 5];
  private readonly RUN_ANIM_FPS = 15;
  private readonly JUMP_UP_FRAME = 4; 
  private readonly FALL_FRAME = 5;
  private readonly DEATH_FRAME = 5;

  constructor(x: number, y: number, isUnderwater: boolean = false) {
    super()
    this.x = x
    this.y = y
    this.respawnX = x;
    this.respawnY = y;
    this.width = 32
    this.height = 46
    this.zIndex = 10
    this.solid = true
    this.velocityY = 0
    this.isUnderwater = isUnderwater
    this.gravity = isUnderwater ? 0 : 0.45

    if (this.isUnderwater) {
      this.state = PlayerState.SWIMMING;
    }
    this.loadAssets();
  }

  private async loadAssets() {
    try {
      this.spritesheet = await AssetLoader.loadImage(this.SPRITESHEET_PATH);
      const frameWidth = this.SPRITE_FRAME_WIDTH;
      const frameHeight = this.SPRITE_FRAME_HEIGHT;
      const calculatedFrameCount = Math.floor(this.spritesheet.height / frameHeight);

      if (calculatedFrameCount < this.SPRITESHEET_TOTAL_FRAMES) {
        console.warn(`Player spritesheet ${this.SPRITESHEET_PATH} has only ${calculatedFrameCount} frames of ${frameWidth}px width, but SPRITESHEET_TOTAL_FRAMES is ${this.SPRITESHEET_TOTAL_FRAMES}. Animations might be incorrect.`);
      }

      this.animator = new Animator(this.spritesheet, 'vertical', this.IDLE_ANIM_FPS, true);
      this.animator.frameWidth = frameWidth;
      this.animator.frameHeight = frameHeight;
      this.animator.frameCount = calculatedFrameCount;
      this.animator.currentFrame = this.IDLE_FRAMES[0];
      
      this.assetsLoaded = true;
    } catch (error) {
      console.error("Failed to load player spritesheet:", error);
    }
  }

  setRespawnPoint(x: number, y: number) {
    this.respawnX = x;
    this.respawnY = y;
  }

  getRespawnPoint(): { x: number, y: number } {
    return { x: this.respawnX, y: this.respawnY };
  }

  startDeathSequence(deathType: 'enemy' | 'pit') {
    if (this.isDying) return;

    this.isDying = true;
    this.deathAnimTimer = this.DEATH_ANIM_DURATION;
    this.isGrounded = false;
    this.solid = false;
    this.state = PlayerState.DYING;

    if (deathType === 'enemy') {
      GameAudioManager.getInstance().playSound("assets/sound/sfx/die.wav");
      this.velocityY = this.DEATH_BOUNCE_FORCE;
    }
  }

  isDeathAnimationComplete(): boolean {
    return this.isDying && this.deathAnimTimer <= 0;
  }

  resetToLastCheckpoint() {
    this.x = this.respawnX;
    this.y = this.respawnY;
    this.velocityY = 0;
    this.isGrounded = false;
    this.isDying = false;
    this.deathAnimTimer = 0;
    this.solid = true;
    this.enabled = true;
    this.direction = 1;
    this.animFrame = 0;
    this.isMoving = false;
    this.currentJumps = 0;

    this.state = this.isUnderwater ? PlayerState.SWIMMING : PlayerState.IDLE;
    if (this.animator) this.animator.currentFrame = this.IDLE_FRAMES[0];
  }

  resetToMapStart(mapInitialX: number, mapInitialY: number) {
    this.x = mapInitialX;
    this.y = mapInitialY;
    this.respawnX = mapInitialX;
    this.respawnY = mapInitialY;
    this.velocityY = 0;
    this.isGrounded = false;
    this.isDying = false;
    this.deathAnimTimer = 0;
    this.solid = true;
    this.enabled = true;
    this.direction = 1;
    this.animFrame = 0;
    this.isMoving = false;
    this.currentJumps = 0;

    if (this.isUnderwater) {
      this.state = PlayerState.SWIMMING;
    } else {
      this.state = PlayerState.IDLE;
    }
    if (this.animator) this.animator.currentFrame = this.IDLE_FRAMES[0];
  }

  jump() {
    if (this.isUnderwater) {
      return;
    }
    
    if (this.isGrounded || this.currentJumps < this.maxJumps) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
      this.currentJumps++;
      GameAudioManager.getInstance().playSound("assets/sound/sfx/jump.wav");
    }
  }

  private applyGravity() {
    if (!this.isGrounded) {
      this.velocityY += this.gravity;
    }
  }

  update(dt: number) {
    if (!this.assetsLoaded || !this.animator) {
      if (this.isDying) {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.deathAnimTimer -= dt;
      }
      return;
    }

    if (this.isDying) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;
      this.deathAnimTimer -= dt;
      this.animator.currentFrame = Math.min(this.DEATH_FRAME, this.animator.frameCount - 1);
      return;
    }

    const isJumpKeyDown = Input.isKeyDown("ArrowUp");
    const isSwimDownKeyDown = Input.isKeyDown("ArrowDown");

    this.isMoving = false;

    this.velocityX = 0;
    const currentSpeed = this.isUnderwater ? this.speed * this.underwaterHorizontalSpeedFactor : this.speed;
    if (Input.isKeyDown("ArrowLeft")) {
      this.velocityX = -currentSpeed;
      this.direction = -1;
      this.isMoving = true;
    }
    if (Input.isKeyDown("ArrowRight")) {
      this.velocityX = currentSpeed;
      this.direction = 1;
      this.isMoving = true;
    }

    if (this.isUnderwater) {
      this.state = this.isMoving ? PlayerState.RUNNING : PlayerState.IDLE;
    } else if (!this.isGrounded) {
      this.state = this.velocityY < 0 ? PlayerState.JUMPING : PlayerState.FALLING;
    } else if (this.isMoving) {
      this.state = PlayerState.RUNNING;
    } else {
      this.state = PlayerState.IDLE;
    }
    
    this.animTimer += dt;
    switch (this.state) {
      case PlayerState.JUMPING:
        
        this.animator.currentFrame = Math.min(this.JUMP_UP_FRAME, this.animator.frameCount - 1);
        break;
      case PlayerState.FALLING:
        this.animator.currentFrame = Math.min(this.FALL_FRAME, this.animator.frameCount - 1);
        break;
      case PlayerState.RUNNING:
        const runFrameDuration = 1 / this.RUN_ANIM_FPS;
        if (this.animTimer >= runFrameDuration) {
          this.animTimer -= runFrameDuration;
          const validRunFrames = this.RUN_FRAMES.filter(f => f < this.animator!.frameCount);
          if (validRunFrames.length === 0) {
            this.animator.currentFrame = 0;
            break;
          }
          let currentIndexInSeq = validRunFrames.indexOf(this.animator.currentFrame);
          if (currentIndexInSeq === -1 || !validRunFrames.includes(this.animator.currentFrame)) {
            this.animFrame = 0;
            GameAudioManager.getInstance().playSound("assets/sound/sfx/step.wav");
          } else {
            this.animFrame = (currentIndexInSeq + 1) % validRunFrames.length;
          }
          
          this.animator.currentFrame = validRunFrames[this.animFrame];
        }
        break;
      case PlayerState.IDLE:
        const idleFrameDuration = 1 / this.IDLE_ANIM_FPS;
        if (this.animTimer >= idleFrameDuration) {
          this.animTimer -= idleFrameDuration;
          const validIdleFrames = this.IDLE_FRAMES.filter(f => f < this.animator!.frameCount);
          if (validIdleFrames.length === 0) {
            this.animator.currentFrame = 0;
            break;
          }
          let currentIndexInSeq = validIdleFrames.indexOf(this.animator.currentFrame);
          if (currentIndexInSeq === -1 || !validIdleFrames.includes(this.animator.currentFrame)) {
            this.animFrame = 0;
          } else {
            this.animFrame = (currentIndexInSeq + 1) % validIdleFrames.length;
          }
          this.animator.currentFrame = validIdleFrames[this.animFrame];
        }
        break;
    }

    if (this.isUnderwater) {
      this.velocityX *= this.underwaterDragFactor;
      this.velocityY -= this.buoyancyAcceleration * dt * 60;

      if (isJumpKeyDown) {
        this.velocityY -= this.swimAcceleration * dt * 60;        
      }
      if (isSwimDownKeyDown) {
        this.velocityY += this.swimAcceleration * dt * 60;
      }

      this.velocityY *= this.underwaterDragFactor;
      this.velocityY = Math.max(-this.maxUnderwaterVerticalSpeed, Math.min(this.maxUnderwaterVerticalSpeed, this.velocityY));
      this.isGrounded = false;
    } else {
      if (isJumpKeyDown && !this.jumpPressed) {
        this.jump();
        this.jumpPressed = true;
      } else if (!isJumpKeyDown) {
        this.jumpPressed = false;
      }
      this.applyGravity();
    }

    this.y += this.velocityY;
    this.x += this.velocityX;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.assetsLoaded || !this.animator || !this.spritesheet) {
      ctx.fillStyle = "magenta";
      ctx.fillRect(this.x, this.y, this.width, this.height);
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
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sWidth,
          sourceRect.sHeight,
          0,
          0,
          this.width,
          this.height
        );
      } else {
        ctx.translate(this.x, this.y);
        ctx.drawImage(
          this.spritesheet,
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sWidth,
          sourceRect.sHeight,
          0,
          0,
          this.width,
          this.height
        );
      }
    }
    ctx.restore();
  }

  setGrounded(isGrounded: boolean, groundY?: number) {
    if (this.isDying) return;

    if (this.isUnderwater) {
      if (isGrounded && this.velocityY > 0) {
        this.velocityY = 0;
      }
      this.isGrounded = false;
    } else {
      if (groundY !== undefined) {
        this.groundY = groundY;

        if (isGrounded) {
          this.y = this.groundY - this.height;
        }
      }
      this.isGrounded = isGrounded;
      if (isGrounded) {
        this.currentJumps = 0;
      }
    }
  }

  stopVerticalMovement() {
    if (this.isDying) return;
    this.velocityY = 0;
  }

  bounceOffEnemy() {
    if (this.isDying) return;
    this.velocityY = -5;
    
  }

  bounceOffEnemySlightly() {
    if (this.isDying) return;
    this.velocityY = -3;
    
  }
}
