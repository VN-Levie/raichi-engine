import { Component } from "../../core/component"
import { Input } from "../../core/input"
import { EnemyComponent } from "./enemyComponent"

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
  
  constructor(x: number, y: number) {
    super()
    this.x = x
    this.y = y
    this.width = 32
    this.height = 46
    this.zIndex = 10
    this.solid = true
    this.velocityY = 0
  }

  update(dt: number) {
    // Handle horizontal movement - should work regardless of grounded state
    this.isMoving = false
    
    if (Input.isKeyDown("ArrowLeft")) {
      this.x -= this.speed
      this.direction = -1
      this.isMoving = true
      if (this.x < 0) {
        this.x = 0
      }
    }
    
    if (Input.isKeyDown("ArrowRight")) {
      this.x += this.speed
      this.direction = 1
      this.isMoving = true
    }

    // Handle jumping - only when grounded and jump key is pressed
    if (Input.isKeyDown("ArrowUp")) {
      if (this.isGrounded && !this.jumpPressed) {
        this.velocityY = this.jumpForce
        this.isGrounded = false
        this.jumpPressed = true;
      }
    } else {
      this.jumpPressed = false;
    }

    // Apply gravity and vertical movement
    if (!this.isGrounded) {
      this.velocityY += this.gravity;
      this.y += this.velocityY;
    }
    
    // Handle animation
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
    const redColor = "#FF0000"          // Bright red for hat and shirt
    const darkRedColor = "#CC0000"      // Darker red for shading
    const skinColor = "#FFC88A"         // Warm skin tone
    const skinShadow = "#EAA66B"        // Skin shadow
    const blueColor = "#0000CC"         // Richer blue for overalls
    const blueShadow = "#000099"        // Blue shadow
    const brownColor = "#8B4513"        // Brown for hair and shoes
    const brownShadow = "#5C2E0D"       // Darker brown for shoe details
    const whiteColor = "#FFFFFF"        // White for gloves and eyes
    const blackColor = "#000000"        // Black for outlines and details
    
    ctx.save()
    
    if (this.direction === -1) {
      ctx.translate(this.x + this.width, this.y)
      ctx.scale(-1, 1)
    } else {
      ctx.translate(this.x, this.y)
    }
    
    // Mario body based on animation state
    if (!this.isGrounded) {
      this.drawJumpingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    } else if (this.isMoving) {
      switch(this.animFrame) {
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
    // Draw outline
    ctx.lineWidth = 1
    ctx.strokeStyle = blackColor
    
    // Cap (hat)
    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.moveTo(5, 10)
    ctx.lineTo(28, 10)
    ctx.lineTo(28, 3)
    ctx.lineTo(5, 3)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Cap visor
    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.moveTo(2, 10)
    ctx.lineTo(17, 10)
    ctx.lineTo(14, 13)
    ctx.lineTo(2, 13)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Cap shading
    ctx.fillStyle = darkRedColor
    ctx.fillRect(24, 3, 4, 7)
    
    // Face
    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(8, 10)
    ctx.lineTo(26, 10)
    ctx.lineTo(26, 22)
    ctx.lineTo(8, 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Hair
    ctx.fillStyle = brownColor
    ctx.beginPath()
    ctx.moveTo(8, 10)
    ctx.lineTo(8, 15)
    ctx.lineTo(12, 15)
    ctx.lineTo(12, 10)
    ctx.closePath()
    ctx.fill()
    
    // Eyes
    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(16, 15, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // Pupils
    ctx.fillStyle = blackColor
    ctx.beginPath()
    ctx.arc(17, 15, 1.5, 0, Math.PI * 2)
    ctx.fill()
    
    // Nose
    ctx.fillStyle = skinShadow
    ctx.beginPath()
    ctx.moveTo(20, 17)
    ctx.lineTo(23, 17)
    ctx.lineTo(20, 19)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Mustache
    ctx.fillStyle = brownColor
    ctx.beginPath()
    ctx.moveTo(15, 19)
    ctx.lineTo(23, 19)
    ctx.lineTo(23, 21)
    ctx.lineTo(15, 21)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Body - Shirt
    ctx.fillStyle = redColor
    ctx.beginPath()
    ctx.moveTo(8, 22)
    ctx.lineTo(26, 22)
    ctx.lineTo(26, 28)
    ctx.lineTo(8, 28)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Body - Overalls
    ctx.fillStyle = blueColor
    ctx.fillRect(8, 28, 18, 12)
    ctx.strokeRect(8, 28, 18, 12)
    
    // Overall straps
    ctx.fillRect(10, 22, 4, 8)
    ctx.strokeRect(10, 22, 4, 8)
    ctx.fillRect(20, 22, 4, 8)
    ctx.strokeRect(20, 22, 4, 8)
    
    // Overall buttons
    ctx.fillStyle = whiteColor
    ctx.beginPath()
    ctx.arc(12, 28, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(22, 28, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // Blue shading
    ctx.fillStyle = blueShadow
    ctx.fillRect(22, 28, 4, 12)
    
    // Arms
    ctx.fillStyle = skinColor
    ctx.fillRect(4, 22, 4, 12)
    ctx.strokeRect(4, 22, 4, 12)
    ctx.fillRect(26, 22, 4, 12)
    ctx.strokeRect(26, 22, 4, 12)
    
    // Gloves
    ctx.fillStyle = whiteColor
    ctx.fillRect(2, 32, 6, 4)
    ctx.strokeRect(2, 32, 6, 4)
    ctx.fillRect(26, 32, 6, 4)
    ctx.strokeRect(26, 32, 6, 4)
    
    // Legs
    ctx.fillStyle = blueColor
    ctx.fillRect(10, 40, 6, 6)
    ctx.strokeRect(10, 40, 6, 6)
    ctx.fillRect(18, 40, 6, 6)
    ctx.strokeRect(18, 40, 6, 6)
    
    // Shoes
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
    
    // Shoe shadow
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
    // Draw the same hat and face as standing pose
    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    
    // Override the body parts for animation
    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)
    
    // Running leg positions
    ctx.fillStyle = blueColor
    
    // Left leg forward
    ctx.fillRect(14, 35, 6, 8)
    ctx.strokeRect(14, 35, 6, 8)
    
    // Right leg back
    ctx.fillRect(10, 40, 6, 6)
    ctx.strokeRect(10, 40, 6, 6)
    
    // Shoes
    ctx.fillStyle = brownColor
    
    // Forward shoe
    ctx.beginPath()
    ctx.moveTo(12, 43)
    ctx.lineTo(22, 43)
    ctx.lineTo(22, 39)
    ctx.lineTo(12, 39)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Back shoe
    ctx.beginPath()
    ctx.moveTo(8, 46)
    ctx.lineTo(18, 46)
    ctx.lineTo(18, 42)
    ctx.lineTo(8, 42)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Running arm positions
    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)
    
    // Left arm forward and up
    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(6, 18)
    ctx.lineTo(12, 25)
    ctx.lineTo(9, 27)
    ctx.lineTo(3, 20)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Right arm back
    ctx.beginPath()
    ctx.moveTo(26, 24)
    ctx.lineTo(30, 30)
    ctx.lineTo(27, 32)
    ctx.lineTo(23, 26)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Gloves
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
    // Draw the same hat and face as standing pose
    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    
    // Override the body parts for animation
    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)
    
    // Both legs in middle stride position
    ctx.fillStyle = blueColor
    ctx.fillRect(12, 38, 5, 8)
    ctx.strokeRect(12, 38, 5, 8)
    ctx.fillRect(17, 38, 5, 8)
    ctx.strokeRect(17, 38, 5, 8)
    
    // Shoes
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
    
    // Middle position arms
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
    
    // Gloves
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
    // Draw the same hat and face as standing pose
    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    
    // Override the body parts for animation
    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)
    
    // Right leg forward, left leg back (opposite of pose 1)
    ctx.fillStyle = blueColor
    
    // Right leg forward
    ctx.fillRect(18, 35, 6, 8)
    ctx.strokeRect(18, 35, 6, 8)
    
    // Left leg back
    ctx.fillRect(14, 40, 6, 6)
    ctx.strokeRect(14, 40, 6, 6)
    
    // Shoes
    ctx.fillStyle = brownColor
    
    // Forward shoe
    ctx.beginPath()
    ctx.moveTo(16, 43)
    ctx.lineTo(26, 43)
    ctx.lineTo(26, 39)
    ctx.lineTo(16, 39)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Back shoe
    ctx.beginPath()
    ctx.moveTo(12, 46)
    ctx.lineTo(22, 46)
    ctx.lineTo(22, 42)
    ctx.lineTo(12, 42)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Running arm positions (opposite of pose 1)
    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)
    
    // Right arm forward and up
    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(26, 18)
    ctx.lineTo(20, 25)
    ctx.lineTo(23, 27)
    ctx.lineTo(29, 20)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Left arm back
    ctx.beginPath()
    ctx.moveTo(6, 24)
    ctx.lineTo(2, 30)
    ctx.lineTo(5, 32)
    ctx.lineTo(9, 26)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Gloves
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
    // Draw the same hat and face as standing pose
    this.drawStandingPose(ctx, redColor, darkRedColor, blueColor, blueShadow, skinColor, skinShadow, brownColor, brownShadow, whiteColor, blackColor)
    
    // Override the body parts for jump animation
    ctx.fillStyle = blueColor
    ctx.clearRect(8, 40, 16, 6)
    
    // Legs - bent and spread for jumping
    ctx.fillStyle = blueColor
    
    // Left leg bent
    ctx.fillRect(8, 35, 6, 8)
    ctx.strokeRect(8, 35, 6, 8)
    
    // Right leg bent
    ctx.fillRect(20, 35, 6, 8)
    ctx.strokeRect(20, 35, 6, 8)
    
    // Shoes
    ctx.fillStyle = brownColor
    
    // Left shoe
    ctx.beginPath()
    ctx.moveTo(6, 43)
    ctx.lineTo(16, 43)
    ctx.lineTo(16, 40)
    ctx.lineTo(6, 40)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Right shoe
    ctx.beginPath()
    ctx.moveTo(18, 43)
    ctx.lineTo(28, 43)
    ctx.lineTo(28, 40)
    ctx.lineTo(18, 40)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Arms - both up and out to sides
    ctx.clearRect(2, 22, 8, 14)
    ctx.clearRect(24, 22, 8, 14)
    
    // Left arm up
    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(8, 18)
    ctx.lineTo(2, 16)
    ctx.lineTo(0, 20)
    ctx.lineTo(6, 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Right arm up
    ctx.beginPath()
    ctx.moveTo(24, 18)
    ctx.lineTo(30, 16)
    ctx.lineTo(32, 20)
    ctx.lineTo(26, 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // Gloves
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
    if (groundY !== undefined) {
      this.groundY = groundY;
      // Position player exactly on ground to prevent sinking
      if (isGrounded) {
        this.y = this.groundY - this.height;
      }
    }
    this.isGrounded = isGrounded;
  }

  stopVerticalMovement() {
    this.velocityY = 0;
  }

  bounceOffEnemy() {
    this.velocityY = -5;
  }

  checkEnemyCollision(enemy: EnemyComponent): boolean {
    const playerBottom = this.y + this.height;
    const playerTop = this.y;
    const enemyTop = enemy.y;
    
    const landingOnTop = playerBottom >= enemyTop - 5 && 
                      playerBottom <= enemyTop + 10 && 
                      playerTop < enemyTop && 
                      this.velocityY >= 0;
    
    if (landingOnTop) {
      return true;
    }
    
    return false;
  }
}
