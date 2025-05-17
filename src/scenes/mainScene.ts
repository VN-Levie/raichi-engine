import { Scene } from "../core/scene"
import { Input } from "../core/input"
import { BoxComponent } from "../entities/boxComponent"
import { CircleComponent } from "../entities/circleComponent"
import { Camera } from "../core/camera"
import { SceneManager } from "../core/sceneManager"
import { GameOverScene } from "./gameOverScene"
import { EnemyComponent } from "../game/entities/enemyComponent"

export class MainScene extends Scene {
  private player: BoxComponent
  private velocityY = 0
  private gravity = 0.45
  private jumpForce = -10
  private isGrounded = false
  private gameOverY = 600
  private enemies: EnemyComponent[] = []

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

    this.createGroundWithGaps()

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

    this.createPipes()
    this.createFloatingPlatforms()
    this.createEnemies()

    Camera.follow(this.player)
  }

  private createEnemies() {
    const enemyPositions = [
      { x: 8 * 32, y: 268 },
      { x: 20 * 32, y: 268 },
      { x: 32 * 32, y: 268 },
      { x: 48 * 32, y: 268 },
      { x: 57 * 32, y: 268 },
      { x: 67 * 32, y: 268 },
      { x: 85 * 32, y: 268 },
    ]
    
    for (const pos of enemyPositions) {
      const enemy = new EnemyComponent(pos.x, pos.y, 32, 32)
      this.enemies.push(enemy)
      this.add(enemy)
    }
  }

  private createGroundWithGaps() {
    const groundSegments = [
      { start: 0, end: 15 },
      { start: 19, end: 40 },
      { start: 44, end: 70 },
      { start: 74, end: 100 }
    ]

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

  private createPipes() {
    const pipePositions = [
      { x: 5, height: 2 },
      { x: 12, height: 3 },
      { x: 25, height: 4 },
      { x: 35, height: 2 },
      { x: 50, height: 5 },
      { x: 60, height: 3 },
      { x: 80, height: 3 },
      { x: 90, height: 2 },
    ]

    for (const pipe of pipePositions) {
      this.createMarioPipe(pipe.x * 32, 300, pipe.height)
    }
  }

  private createFloatingPlatforms() {
    const platforms = [
      { x: 16, y: 8, width: 3, style: 'stone' },
      { x: 23, y: 7, width: 2, style: 'stone' },
      { x: 24, y: 5, width: 2, style: 'stone' },
      { x: 26, y: 3, width: 2, style: 'stone' },
      { x: 41, y: 7, width: 3, style: 'stone' },
      { x: 48, y: 8, width: 2, style: 'stone' },
      { x: 49, y: 6, width: 2, style: 'stone' },
      { x: 51, y: 4, width: 2, style: 'stone' },
      { x: 52, y: 2, width: 2, style: 'stone' },
      { x: 71, y: 7, width: 3, style: 'stone' },
    ]
    
    for (const platform of platforms) {
      this.createStylizedPlatform(platform.x, platform.y, platform.width, platform.style)
    }
  }

  private createStylizedPlatform(x: number, y: number, width: number, style: string) {
    const blockY = y * 32
    
    let colors = {
      base: "#8B4513",
      top: "#A0522D",
      side: "#654321"
    }
    
    if (style === 'stone') {
      colors = {
        base: "#696969",
        top: "#A9A9A9",
        side: "#555555"
      }
    }
    
    for (let i = 0; i < width; i++) {
      const blockX = (x + i) * 32
      
      const block = new BoxComponent(blockX, blockY, 32, colors.base)
      block.solid = true
      block.zIndex = 1
      this.add(block)
      
      const topHighlight = new BoxComponent(blockX, blockY, 32, colors.top)
      topHighlight.height = 8
      topHighlight.solid = false
      topHighlight.zIndex = 2
      this.add(topHighlight)
      
      if (i === 0) {
        const leftHighlight = new BoxComponent(blockX, blockY, 6, colors.side)
        leftHighlight.height = 32
        leftHighlight.solid = false
        leftHighlight.zIndex = 2
        this.add(leftHighlight)
      }
      
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
    const pipeWidth = 64
    const pipeColor = "#00AA00"
    const pipeBorderColor = "#008800"
    
    const pipeHeight = height * 32
    
    const pipeBody = new BoxComponent(x, groundY - pipeHeight, pipeWidth, pipeColor)
    pipeBody.width = pipeWidth
    pipeBody.height = pipeHeight
    pipeBody.zIndex = 5
    pipeBody.solid = true
    this.add(pipeBody)
    
    const pipeTopHeight = 16
    const pipeTopWidth = pipeWidth + 16
    const pipeTop = new BoxComponent(x - 8, groundY - pipeHeight - pipeTopHeight, pipeTopWidth, pipeColor)
    pipeTop.width = pipeTopWidth
    pipeTop.height = pipeTopHeight
    pipeTop.zIndex = 5
    pipeTop.solid = true
    this.add(pipeTop)
    
    const highlight = new BoxComponent(x + 8, groundY - pipeHeight, 16, pipeBorderColor)
    highlight.width = 16
    highlight.height = pipeHeight
    highlight.zIndex = 6
    highlight.solid = false
    this.add(highlight)
    
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
    const darkGreen = "#025d02"
    const lightGreen = "#00c800"
    
    const bushWidth = size * 32
    const bushHeight = 24 + size * 8
    
    const embedDepth = 16
    const bushY = groundY - bushHeight + embedDepth
    
    for (let i = 0; i < size; i++) {
      const circle = new CircleComponent(
        x + 16 + i * 32, 
        groundY - 16 + embedDepth,
        16, 
        darkGreen
      )
      circle.zIndex = -1
      circle.solid = false
      this.add(circle)
    }
    
    if (size > 1) {
      for (let i = 0; i < size - 1; i++) {
        const circle = new CircleComponent(
          x + 32 + i * 32, 
          groundY - 32 + embedDepth,
          16, 
          darkGreen
        )
        circle.zIndex = -1
        circle.solid = false
        this.add(circle)
      }
    }
    
    if (size > 2) {
      for (let i = 0; i < size - 2; i++) {
        const circle = new CircleComponent(
          x + 48 + i * 32, 
          groundY - 48 + embedDepth,
          16, 
          darkGreen
        )
        circle.zIndex = -1
        circle.solid = false
        this.add(circle)
      }
    }
    
    for (let i = 0; i < size; i++) {
      const highlight = new CircleComponent(
        x + 12 + i * 32, 
        groundY - 20 + embedDepth,
        8, 
        lightGreen
      )
      highlight.zIndex = -1
      highlight.solid = false
      this.add(highlight)
    }
    
    if (size > 1) {
      for (let i = 0; i < size - 1; i++) {
        const highlight = new CircleComponent(
          x + 28 + i * 32, 
          groundY - 36 + embedDepth,
          8, 
          lightGreen
        )
        highlight.zIndex = -1
        highlight.solid = false
        this.add(highlight)
      }
    }
    
    if (size > 2) {
      for (let i = 0; i < size - 2; i++) {
        const highlight = new CircleComponent(
          x + 44 + i * 32, 
          groundY - 52 + embedDepth,
          8, 
          lightGreen
        )
        highlight.zIndex = -1
        highlight.solid = false
        this.add(highlight)
      }
    }
  }

  override update(dt: number) {
    const speed = 3
    Camera.update()

    const originalX = this.player.x
    const originalY = this.player.y

    if (Input.isKeyDown("ArrowLeft")) {
      this.player.x -= speed
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

    // Update all enemies first
    for (const enemy of this.enemies) {
      enemy.update(dt)
    }

    // Then check collisions
    this.checkEnemyCollisions()

    if (this.player.y > this.gameOverY) {
      SceneManager.setScene(new GameOverScene("You fell into a pit!"))
    }
  }

  private checkEnemyCollisions() {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue
      
      const playerLeft = this.player.x
      const playerRight = this.player.x + this.player.width
      const playerTop = this.player.y
      const playerBottom = this.player.y + this.player.height
      
      const enemyLeft = enemy.x
      const enemyRight = enemy.x + enemy.width
      const enemyTop = enemy.y
      const enemyBottom = enemy.y + enemy.height
      
      // Check if there's any overlap between player and enemy
      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerBottom > enemyTop &&
        playerTop < enemyBottom
      ) {
        const safeLanding = enemy.checkPlayerCollision(this.player)
        
        if (!safeLanding) {
          // Player jumped on enemy - bounce up
          this.velocityY = -5
        } else {
          // Player hit enemy from the side - game over
          SceneManager.setScene(new GameOverScene("You were defeated by an enemy!"))
        }
      }
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
