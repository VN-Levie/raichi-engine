import { Component } from "../../core/component"
import { Input } from "../../core/input"

enum PlayerState {
  IDLE,
  RUNNING,
  JUMPING,
  FALLING,
  DYING,
  SWIMMING, // Added swimming state
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
  private readonly underwaterDrag = 0.95; // Drag factor for underwater movement
  private readonly jumpDrag = 0.9; // Drag factor for jumping
  private readonly swimDrag = 0.8; // Drag factor for swimming
  // velocityX
  private velocityX = 0
  isDying = false;
  private deathAnimTimer = 0;
  private readonly DEATH_ANIM_DURATION = 1.5;
  private readonly DEATH_BOUNCE_FORCE = -7;

  private currentJumps: number = 0;
  private readonly maxJumps: number = 2; // Allow double jump

  // Underwater physics properties
  private readonly buoyancyAcceleration = 0.15; // Upward acceleration in water
  private readonly swimAcceleration = 0.3;    // Acceleration when player actively swims
  private readonly underwaterDragFactor = 0.97; // Drag factor for velocity in water (closer to 1 means less drag)
  private readonly maxUnderwaterVerticalSpeed = 2.0;
  private readonly underwaterHorizontalSpeedFactor = 0.8; // Player moves a bit slower horizontally underwater


  respawnX: number;
  respawnY: number;

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
      this.state = PlayerState.SWIMMING; // Start in swimming state if underwater
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

    if (deathType === 'enemy') {
      this.velocityY = this.DEATH_BOUNCE_FORCE;
    } else if (deathType === 'pit') {


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

    if (this.isUnderwater) {
      this.state = PlayerState.SWIMMING;
    } else {
      this.state = PlayerState.IDLE;
    }
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
  }

  jump() {
    if (this.isUnderwater) {
      return;
    }
    if (this.isGrounded || this.currentJumps < this.maxJumps) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
      this.currentJumps++;
    }
  }

  private applyGravity() {
    if (!this.isGrounded) {
      this.velocityY += this.gravity;
    }
  }

  update(dt: number) {
    if (this.isDying) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;
      this.deathAnimTimer -= dt;

      this.animFrame = 1;
      return;
    }

    const isJumpKeyDown = Input.isKeyDown("ArrowUp");
    const isSwimDownKeyDown = Input.isKeyDown("ArrowDown");

    this.isMoving = false;

    // Horizontal Movement
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
      // Apply drag to horizontal movement underwater
      this.velocityX *= this.underwaterDragFactor;

      // Vertical Underwater Movement
      this.velocityY -= this.buoyancyAcceleration * dt * 60;

      if (isJumpKeyDown) {
        this.velocityY -= this.swimAcceleration * dt * 60;
      }
      if (isSwimDownKeyDown) {
        this.velocityY += this.swimAcceleration * dt * 60;
      }

      // Apply underwater drag to vertical movement
      this.velocityY *= this.underwaterDragFactor;

      // Clamp vertical speed
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

    // Update position
    this.y += this.velocityY;
    this.x += this.velocityX;

    if (this.isMoving && this.isGrounded) {
      this.animTimer += dt
      if (this.animTimer > 0.1) {
        this.animTimer = 0
        this.animFrame = (this.animFrame + 1) % 3
      }
    } else if (!this.isGrounded) {
      this.animFrame = 1
    } else {
      this.animFrame = 0
      this.animTimer = 0
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    this.drawMarioCharacter(ctx)
  }

  private drawMarioCharacter(ctx: CanvasRenderingContext2D) {
    const redColor = "#FF0000"
    const darkRedColor = "#CC0000"
    const skinColor = "#FFC88A"
    const skinShadow = "#EAA66B"
    const blueColor = "#0000CC"
    const blueShadow = "#000099"
    const brownColor = "#8B4513"
    const brownShadow = "#5C2E0D"
    const whiteColor = "#FFFFFF"
    const blackColor = "#000000"

    ctx.save()

    if (this.direction === -1) {
      ctx.translate(this.x + this.width, this.y)
      ctx.scale(-1, 1)
    } else {
      ctx.translate(this.x, this.y)
    }


    if (!this.isGrounded) {
      this.drawJumpingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    } else if (this.isMoving) {
      switch (this.animFrame) {
        case 0:
          this.drawRunningPose1(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
          break
        case 1:
          this.drawRunningPose2(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
          break
        case 2:
          this.drawRunningPose3(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
          break
      }
    } else {
      this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    }

    ctx.restore()
  }

  private drawStandingPose(
    ctx: CanvasRenderingContext2D,
    redColor: string,
    darkRedColor: string,
    blueColor: string,
    blueShadow: string,
    skinColor: string,
    skinShadow: string,
    brownColor: string,
    brownShadow: string,
    whiteColor: string,
    blackColor: string
  ) {

    ctx.lineWidth = 1
    ctx.strokeStyle = blackColor


    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.moveTo(5, 10)
    ctx.lineTo(28, 10)
    ctx.lineTo(28, 3)
    ctx.lineTo(5, 3)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.moveTo(2, 10)
    ctx.lineTo(17, 10)
    ctx.lineTo(14, 13)
    ctx.lineTo(2, 13)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = darkRedColor
    ctx.fillRect(24, 3, 4, 7)


    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(8, 10)
    ctx.lineTo(26, 10)
    ctx.lineTo(26, 22)
    ctx.lineTo(8, 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = brownColor
    ctx.beginPath()
    ctx.moveTo(8, 10)
    ctx.lineTo(8, 15)
    ctx.lineTo(12, 15)
    ctx.lineTo(12, 10)
    ctx.closePath()
    ctx.fill()


    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(16, 15, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = blackColor
    ctx.beginPath()
    ctx.arc(17, 15, 1.5, 0, Math.PI * 2)
    ctx.fill()


    ctx.fillStyle = skinShadow
    ctx.beginPath()
    ctx.moveTo(20, 17)
    ctx.lineTo(23, 17)
    ctx.lineTo(20, 19)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = brownColor
    ctx.beginPath()
    ctx.moveTo(15, 19)
    ctx.lineTo(23, 19)
    ctx.lineTo(23, 21)
    ctx.lineTo(15, 21)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.moveTo(8, 22)
    ctx.lineTo(26, 22)
    ctx.lineTo(26, 28)
    ctx.lineTo(8, 28)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = blueColor
    ctx.fillRect(8, 28, 18, 12)
    ctx.strokeRect(8, 28, 18, 12)


    ctx.fillRect(10, 22, 4, 8)
    ctx.strokeRect(10, 22, 4, 8)
    ctx.fillRect(20, 22, 4, 8)
    ctx.strokeRect(20, 22, 4, 8)


    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(12, 28, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(22, 28, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = blueShadow
    ctx.fillRect(22, 28, 4, 12)


    ctx.fillStyle = skinColor
    ctx.fillRect(4, 22, 4, 12)
    ctx.strokeRect(4, 22, 4, 12)
    ctx.fillRect(26, 22, 4, 12)
    ctx.strokeRect(26, 22, 4, 12)


    ctx.fillStyle = whiteColor
    ctx.fillRect(2, 32, 6, 4)
    ctx.strokeRect(2, 32, 6, 4)
    ctx.fillRect(26, 32, 6, 4)
    ctx.strokeRect(26, 32, 6, 4)


    ctx.fillStyle = blueColor
    ctx.fillRect(10, 40, 6, 6)
    ctx.strokeRect(10, 40, 6, 6)
    ctx.fillRect(18, 40, 6, 6)
    ctx.strokeRect(18, 40, 6, 6)


    ctx.fillStyle = brownColor
    ctx.beginPath()
    ctx.moveTo(8, 46)
    ctx.lineTo(18, 46)
    ctx.lineTo(18, 42)
    ctx.lineTo(8, 42)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(16, 46)
    ctx.lineTo(26, 46)
    ctx.lineTo(26, 42)
    ctx.lineTo(16, 42)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = brownShadow
    ctx.fillRect(8, 44, 10, 2)
    ctx.fillRect(16, 44, 10, 2)
  }

  private drawRunningPose1(
    ctx: CanvasRenderingContext2D,
    redColor: string,
    darkRedColor: string,
    blueColor: string,
    blueShadow: string,
    skinColor: string,
    skinShadow: string,
    brownColor: string,
    brownShadow: string,
    whiteColor: string,
    blackColor: string
  ) {

    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)


    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)


    ctx.fillStyle = blueColor


    ctx.fillRect(14, 35, 6, 8)
    ctx.strokeRect(14, 35, 6, 8)


    ctx.fillRect(10, 40, 6, 6)
    ctx.strokeRect(10, 40, 6, 6)


    ctx.fillStyle = brownColor


    ctx.beginPath()
    ctx.moveTo(12, 43)
    ctx.lineTo(22, 43)
    ctx.lineTo(22, 39)
    ctx.lineTo(12, 39)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.beginPath()
    ctx.moveTo(8, 46)
    ctx.lineTo(18, 46)
    ctx.lineTo(18, 42)
    ctx.lineTo(8, 42)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)


    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(6, 18)
    ctx.lineTo(12, 25)
    ctx.lineTo(9, 27)
    ctx.lineTo(3, 20)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.beginPath()
    ctx.moveTo(26, 24)
    ctx.lineTo(30, 30)
    ctx.lineTo(27, 32)
    ctx.lineTo(23, 26)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(4, 19, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(28, 31, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  private drawRunningPose2(
    ctx: CanvasRenderingContext2D,
    redColor: string,
    darkRedColor: string,
    blueColor: string,
    blueShadow: string,
    skinColor: string,
    skinShadow: string,
    brownColor: string,
    brownShadow: string,
    whiteColor: string,
    blackColor: string
  ) {

    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)


    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)


    ctx.fillStyle = blueColor
    ctx.fillRect(12, 38, 5, 8)
    ctx.strokeRect(12, 38, 5, 8)
    ctx.fillRect(17, 38, 5, 8)
    ctx.strokeRect(17, 38, 5, 8)


    ctx.fillStyle = brownColor
    ctx.beginPath()
    ctx.moveTo(10, 46)
    ctx.lineTo(17, 46)
    ctx.lineTo(17, 43)
    ctx.lineTo(10, 43)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(17, 46)
    ctx.lineTo(24, 46)
    ctx.lineTo(24, 43)
    ctx.lineTo(17, 43)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)

    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(8, 22)
    ctx.lineTo(4, 28)
    ctx.lineTo(8, 33)
    ctx.lineTo(12, 27)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(24, 22)
    ctx.lineTo(28, 28)
    ctx.lineTo(24, 33)
    ctx.lineTo(20, 27)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(8, 32, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(24, 32, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  private drawRunningPose3(
    ctx: CanvasRenderingContext2D,
    redColor: string,
    darkRedColor: string,
    blueColor: string,
    blueShadow: string,
    skinColor: string,
    skinShadow: string,
    brownColor: string,
    brownShadow: string,
    whiteColor: string,
    blackColor: string
  ) {

    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)


    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)


    ctx.fillStyle = blueColor


    ctx.fillRect(18, 35, 6, 8)
    ctx.strokeRect(18, 35, 6, 8)


    ctx.fillRect(14, 40, 6, 6)
    ctx.strokeRect(14, 40, 6, 6)


    ctx.fillStyle = brownColor


    ctx.beginPath()
    ctx.moveTo(16, 43)
    ctx.lineTo(26, 43)
    ctx.lineTo(26, 39)
    ctx.lineTo(16, 39)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.beginPath()
    ctx.moveTo(12, 46)
    ctx.lineTo(22, 46)
    ctx.lineTo(22, 42)
    ctx.lineTo(12, 42)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)


    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(26, 18)
    ctx.lineTo(20, 25)
    ctx.lineTo(23, 27)
    ctx.lineTo(29, 20)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.beginPath()
    ctx.moveTo(6, 24)
    ctx.lineTo(2, 30)
    ctx.lineTo(5, 32)
    ctx.lineTo(9, 26)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(28, 19, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(4, 31, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  private drawJumpingPose(
    ctx: CanvasRenderingContext2D,
    redColor: string,
    darkRedColor: string,
    blueColor: string,
    blueShadow: string,
    skinColor: string,
    skinShadow: string,
    brownColor: string,
    brownShadow: string,
    whiteColor: string,
    blackColor: string
  ) {

    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)


    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)


    ctx.fillStyle = blueColor


    ctx.fillRect(8, 35, 6, 8)
    ctx.strokeRect(8, 35, 6, 8)


    ctx.fillRect(20, 35, 6, 8)
    ctx.strokeRect(20, 35, 6, 8)


    ctx.fillStyle = brownColor


    ctx.beginPath()
    ctx.moveTo(6, 43)
    ctx.lineTo(16, 43)
    ctx.lineTo(16, 40)
    ctx.lineTo(6, 40)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.beginPath()
    ctx.moveTo(18, 43)
    ctx.lineTo(28, 43)
    ctx.lineTo(28, 40)
    ctx.lineTo(18, 40)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)


    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(8, 18)
    ctx.lineTo(2, 16)
    ctx.lineTo(0, 20)
    ctx.lineTo(6, 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.beginPath()
    ctx.moveTo(24, 18)
    ctx.lineTo(30, 16)
    ctx.lineTo(32, 20)
    ctx.lineTo(26, 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()


    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(0, 20, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(32, 20, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
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
    this.velocityY = -3; // A smaller bounce
  }
}
