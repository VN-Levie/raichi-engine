import { Scene } from "../core/scene"
import { Input } from "../core/input"
import { BoxComponent } from "../entities/boxComponent"
import { CircleComponent } from "../entities/circleComponent"
import { Camera } from "../core/camera"
import { SceneManager } from "../core/sceneManager"
import { GameOverScene } from "./gameOverScene"

export class MainScene extends Scene {
  private player: BoxComponent
  private velocityY = 0
  private gravity = 0.45
  private jumpForce = -10
  private isGrounded = false
  private gameOverY = 600 // Y position threshold for game over

  constructor() {
    super()

    const background = new BoxComponent(0, 0, 800, "lightblue")
    background.height = 600
    background.zIndex = -10
    background.solid = false

    const originalRender = background.render
    background.render = (ctx) => {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = background.color
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.restore()
    }

    this.add(background)

    const cloudPositions = [
      { x: 100, y: 50, size: 2.5 },
      { x: 400, y: 80, size: 3 },
      { x: 700, y: 40, size: 2 },
      { x: 1000, y: 60, size: 3.5 },
      { x: 1300, y: 70, size: 2.2 },
      { x: 1700, y: 50, size: 3 },
      { x: 2000, y: 90, size: 2.8 },
      { x: 2400, y: 30, size: 2.2 },
    ]

    for (const cloudPos of cloudPositions) {
      this.createDetailedCloud(cloudPos.x, cloudPos.y, cloudPos.size)
    }

    this.player = new BoxComponent(100, 100, 32, "blue")
    this.player.width = 32
    this.player.height = 32
    this.player.zIndex = 10
    this.player.solid = true
    this.add(this.player)

    // Create ground with gaps
    this.createGroundWithGaps()

    // Add bushes
    const bushPositions = [
      { x: 3, size: 3 },
      { x: 12, size: 2 },
      { x: 20, size: 4 },
      { x: 31, size: 2 },
      { x: 40, size: 3 },
      { x: 51, size: 4 },
      { x: 65, size: 2 },
      { x: 78, size: 3 },
      { x: 89, size: 5 },
    ]

    for (const bush of bushPositions) {
      this.createMarioBush(bush.x * 32, 300, bush.size)
    }

    // Add pipes on solid ground sections
    this.createPipes()

    // Add floating platforms for gameplay
    this.createFloatingPlatforms()

    Camera.follow(this.player)
  }

  // Create ground with strategic gaps that require jumping
  private createGroundWithGaps() {
    // Define ground segments with fewer, more logical gaps
    const groundSegments = [
      { start: 0, end: 15 },     // Initial platform
      { start: 19, end: 40 },    // Long middle section
      { start: 44, end: 70 },    // Another long section
      { start: 74, end: 100 }    // Final section
    ]

    // Create ground blocks based on defined segments
    for (const segment of groundSegments) {
      for (let i = segment.start; i <= segment.end; i++) {
        const g = new BoxComponent(i * 32, 300, 32, "green")
        g.width = 32
        g.height = 32
        g.zIndex = 0
        g.solid = true
        this.add(g)
      }
    }
  }

  // Add pipes at different positions with heights that player can jump over
  private createPipes() {
    // Only place pipes on solid ground, with varying heights
    const pipePositions = [
      { x: 5, height: 2 },     // Small pipe on first section
      { x: 12, height: 3 },    // Medium pipe on first section
      
      { x: 25, height: 4 },    // Tall pipe on middle section (needs platforms to climb)
      { x: 35, height: 2 },    // Small pipe on middle section
      
      { x: 50, height: 5 },    // Very tall pipe (needs stair-like platforms to climb)
      { x: 60, height: 3 },    // Medium pipe
      
      { x: 80, height: 3 },    // Medium pipe on final section
      { x: 90, height: 2 },    // Small pipe near end
    ]

    for (const pipe of pipePositions) {
      this.createMarioPipe(pipe.x * 32, 300, pipe.height)
    }
  }

  // Create better-looking floating platforms to help with navigation
  private createFloatingPlatforms() {
    // Strategic platforms - both for gaps and for climbing tall pipes
    const platforms = [
      // Platforms for the first gap
      { x: 16, y: 8, width: 3, style: 'stone' },
      
      // Stair-like platforms to climb the tall pipe at x=25
      { x: 23, y: 7, width: 2, style: 'stone' }, // First step
      { x: 24, y: 5, width: 2, style: 'stone' }, // Second step
      { x: 26, y: 3, width: 2, style: 'stone' }, // Top step (allows jumping over pipe)
      
      // Platform for the second gap
      { x: 41, y: 7, width: 3, style: 'stone' },
      
      // Stair-like platforms to climb the very tall pipe at x=50
      { x: 48, y: 8, width: 2, style: 'stone' }, // First step
      { x: 49, y: 6, width: 2, style: 'stone' }, // Second step
      { x: 51, y: 4, width: 2, style: 'stone' }, // Third step
      { x: 52, y: 2, width: 2, style: 'stone' }, // Top step
      
      // Platform for the third gap
      { x: 71, y: 7, width: 3, style: 'stone' },
    ]
    
    for (const platform of platforms) {
      this.createStylizedPlatform(platform.x, platform.y, platform.width, platform.style)
    }
  }

  private createStylizedPlatform(x: number, y: number, width: number, style: string) {
    const blockY = y * 32
    
    // Colors for different platform styles
    let colors = {
      base: "#8B4513", // Brown
      top: "#A0522D",  // Lighter brown
      side: "#654321"  // Darker brown
    }
    
    if (style === 'stone') {
      colors = {
        base: "#696969", // Dark gray
        top: "#A9A9A9",  // Medium gray
        side: "#555555"  // Darker gray
      }
    }
    
    // Create base blocks for the platform
    for (let i = 0; i < width; i++) {
      const blockX = (x + i) * 32
      
      // Main block
      const block = new BoxComponent(blockX, blockY, 32, colors.base)
      block.solid = true
      block.zIndex = 1
      this.add(block)
      
      // Top highlight (smaller rectangle on top)
      const topHighlight = new BoxComponent(blockX, blockY, 32, colors.top)
      topHighlight.height = 8
      topHighlight.solid = false
      topHighlight.zIndex = 2
      this.add(topHighlight)
      
      // Side highlight for first block
      if (i === 0) {
        const leftHighlight = new BoxComponent(blockX, blockY, 6, colors.side)
        leftHighlight.height = 32
        leftHighlight.solid = false
        leftHighlight.zIndex = 2
        this.add(leftHighlight)
      }
      
      // Side highlight for last block
      if (i === width - 1) {
        const rightHighlight = new BoxComponent(blockX + 26, blockY, 6, colors.side)
        rightHighlight.height = 32
        rightHighlight.solid = false
        rightHighlight.zIndex = 2
        this.add(rightHighlight)
      }
    }
  }

  private createMarioPipe(x: number, groundY: number, height: number) {
    const pipeWidth = 64 // 2 blocks wide
    const pipeColor = "#00AA00" // Green color
    const pipeBorderColor = "#008800" // Darker green for borders/highlights
    
    // Calculate the total height of the pipe (in pixels)
    const pipeHeight = height * 32
    
    // Create pipe body (main shaft)
    const pipeBody = new BoxComponent(x, groundY - pipeHeight, pipeWidth, pipeColor)
    pipeBody.width = pipeWidth
    pipeBody.height = pipeHeight
    pipeBody.zIndex = 5
    pipeBody.solid = true
    this.add(pipeBody)
    
    // Create pipe top (the lip at the top of the pipe)
    const pipeTopHeight = 16
    const pipeTopWidth = pipeWidth + 16
    const pipeTop = new BoxComponent(x - 8, groundY - pipeHeight - pipeTopHeight, pipeTopWidth, pipeColor)
    pipeTop.width = pipeTopWidth
    pipeTop.height = pipeTopHeight
    pipeTop.zIndex = 5
    pipeTop.solid = true
    this.add(pipeTop)
    
    // Add highlight to the left side of the pipe (light reflection)
    const highlight = new BoxComponent(x + 8, groundY - pipeHeight, 16, pipeBorderColor)
    highlight.width = 16
    highlight.height = pipeHeight
    highlight.zIndex = 6
    highlight.solid = false // Highlight is visual only
    this.add(highlight)
    
    // Add highlight to the top left of the pipe top
    const topHighlight = new BoxComponent(x - 0, groundY - pipeHeight - pipeTopHeight, 24, pipeBorderColor)
    topHighlight.width = 24
    topHighlight.height = pipeTopHeight / 2
    topHighlight.zIndex = 6
    topHighlight.solid = false
    this.add(topHighlight)
  }

  private createDetailedCloud(x: number, y: number, size: number) {
    const baseSize = 20 * size
    const cloudColor = "#ffffff"

    const baseCircle = new CircleComponent(x, y, baseSize, cloudColor)
    baseCircle.zIndex = -5
    baseCircle.solid = false
    this.add(baseCircle)

    const variations = [
      { xOffset: -baseSize * 0.6, yOffset: -baseSize * 0.2, sizeRatio: 0.7 },
      { xOffset: baseSize * 0.7, yOffset: -baseSize * 0.3, sizeRatio: 0.8 },
      { xOffset: -baseSize * 0.8, yOffset: baseSize * 0.1, sizeRatio: 0.6 },
      { xOffset: baseSize * 0.5, yOffset: baseSize * 0.2, sizeRatio: 0.7 },
      { xOffset: 0, yOffset: -baseSize * 0.4, sizeRatio: 0.9 },
      { xOffset: -baseSize * 0.3, yOffset: baseSize * 0.3, sizeRatio: 0.6 },
      { xOffset: baseSize * 0.2, yOffset: baseSize * 0.1, sizeRatio: 0.8 },
    ]

    for (const v of variations) {
      const circle = new CircleComponent(
        x + v.xOffset,
        y + v.yOffset,
        baseSize * v.sizeRatio,
        cloudColor
      )
      circle.zIndex = -5
      circle.solid = false
      this.add(circle)
    }
  }

  private createMarioBush(x: number, groundY: number, size: number) {
    // Color palette for authentic Mario-style bushes
    const darkGreen = "#025d02";  // Darker base color
    const lightGreen = "#00c800"; // Brighter highlight color
    
    // Bush dimensions
    const bushWidth = size * 32;
    const bushHeight = 24 + size * 8; // Taller bushes for larger sizes
    
    // Embed the bush slightly into the ground (8 pixels)
    const embedDepth = 16;
    const bushY = groundY - bushHeight + embedDepth;
    
    // Create cloud-like bush structures using circles
    
    // Base (bottom layer)
    for (let i = 0; i < size; i++) {
      const circle = new CircleComponent(
        x + 16 + i * 32, 
        groundY - 16 + embedDepth, // Move down by embedDepth
        16, 
        darkGreen
      );
      circle.zIndex = -1; // Set to negative so ground covers the bottom
      circle.solid = false;
      this.add(circle);
    }
    
    // Middle layer (slightly smaller, offset upward)
    if (size > 1) {
      for (let i = 0; i < size - 1; i++) {
        const circle = new CircleComponent(
          x + 32 + i * 32, 
          groundY - 32 + embedDepth, // Move down by embedDepth
          16, 
          darkGreen
        );
        circle.zIndex = -1;
        circle.solid = false;
        this.add(circle);
      }
    }
    
    // Top layer (for larger bushes)
    if (size > 2) {
      for (let i = 0; i < size - 2; i++) {
        const circle = new CircleComponent(
          x + 48 + i * 32, 
          groundY - 48 + embedDepth, // Move down by embedDepth
          16, 
          darkGreen
        );
        circle.zIndex = -1;
        circle.solid = false;
        this.add(circle);
      }
    }
    
    // Add highlights (smaller light green circles)
    
    // Bottom layer highlights
    for (let i = 0; i < size; i++) {
      const highlight = new CircleComponent(
        x + 12 + i * 32, 
        groundY - 20 + embedDepth, // Move down by embedDepth
        8, 
        lightGreen
      );
      highlight.zIndex = -1;
      highlight.solid = false;
      this.add(highlight);
    }
    
    // Middle layer highlights
    if (size > 1) {
      for (let i = 0; i < size - 1; i++) {
        const highlight = new CircleComponent(
          x + 28 + i * 32, 
          groundY - 36 + embedDepth, // Move down by embedDepth
          8, 
          lightGreen
        );
        highlight.zIndex = -1;
        highlight.solid = false;
        this.add(highlight);
      }
    }
    
    // Top layer highlights
    if (size > 2) {
      for (let i = 0; i < size - 2; i++) {
        const highlight = new CircleComponent(
          x + 44 + i * 32, 
          groundY - 52 + embedDepth, // Move down by embedDepth
          8, 
          lightGreen
        );
        highlight.zIndex = -1;
        highlight.solid = false;
        this.add(highlight);
      }
    }
  }

  override update(dt: number) {
    const speed = 3
    Camera.update()

    const originalX = this.player.x
    const originalY = this.player.y

    // Update horizontal position with boundary check for left edge
    if (Input.isKeyDown("ArrowLeft")) {
      this.player.x -= speed
      // Add left boundary check (prevent going past x=0)
      if (this.player.x < 0) {
        this.player.x = 0
      }
    }
    
    if (Input.isKeyDown("ArrowRight")) this.player.x += speed

    this.checkAndResolveCollisions('horizontal', originalX)

    this.velocityY += this.gravity
    this.player.y += this.velocityY

    this.isGrounded = this.checkAndResolveCollisions('vertical', originalX, originalY)

    if (this.isGrounded && Input.isKeyPressed("ArrowUp")) {
      this.velocityY = this.jumpForce
    }

    // Check for game over (falling off the screen)
    if (this.player.y > this.gameOverY) {
      SceneManager.setScene(new GameOverScene())
    }
  }

  private checkAndResolveCollisions(direction: 'horizontal' | 'vertical', originalX: number, originalY?: number): boolean {
    let collided = false
    let isGrounded = false

    for (const c of this.components) {
      if (c === this.player || !c.solid) continue

      const playerLeft = this.player.x
      const playerRight = this.player.x + this.player.width
      const playerTop = this.player.y
      const playerBottom = this.player.y + this.player.height

      const blockLeft = c.x
      const blockRight = c.x + c.width
      const blockTop = c.y
      const blockBottom = c.y + c.height

      if (
        playerRight > blockLeft &&
        playerLeft < blockRight &&
        playerBottom > blockTop &&
        playerTop < blockBottom
      ) {
        collided = true

        if (direction === 'horizontal') {
          if (originalX + this.player.width <= blockLeft) {
            this.player.x = blockLeft - this.player.width
          } else if (originalX >= blockRight) {
            this.player.x = blockRight
          }
        } else if (direction === 'vertical') {
          if (originalY !== undefined) {
            if (originalY + this.player.height <= blockTop) {
              this.player.y = blockTop - this.player.height
              this.velocityY = 0
              isGrounded = true
            } else if (originalY >= blockBottom) {
              this.player.y = blockBottom
              this.velocityY = 0.1
            }
          }
        }
      }
    }

    return direction === 'vertical' ? isGrounded : collided
  }
}
