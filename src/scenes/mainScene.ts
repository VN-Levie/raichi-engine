import { Scene } from "../core/scene"
import { BoxComponent } from "../entities/boxComponent"
import { CircleComponent } from "../entities/circleComponent"
import { Camera } from "../core/camera"
import { SceneManager } from "../core/sceneManager"
import { GameOverScene } from "./gameOverScene"
import { DeathScene } from "./deathScene"
import { EnemyComponent } from "../game/entities/enemyComponent"
import { PlayerComponent } from "../game/entities/playerComponent"
import { TextComponent } from "../entities/textComponent"

export class MainScene extends Scene {
  private player: PlayerComponent
  private gameOverY = 750
  private enemies: EnemyComponent[] = []
  private newGroundLevelY = 450

  private score = 0
  private lives = 3
  private scoreText: TextComponent
  private livesText: TextComponent

  private initialPlayerX = 150
  private initialPlayerY = 100

  private playerIsCurrentlyDying = false;
  private lastDeathReason = "";

  constructor(initialScore: number = 0, initialLives: number = 3) {
    super()

    this.score = initialScore;
    this.lives = initialLives;

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

    this.createGroundWithGaps()

    this.player = new PlayerComponent(this.initialPlayerX, this.initialPlayerY)
    this.add(this.player)

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
      this.createMarioBush(bush.x * 32, this.newGroundLevelY, bush.size)
    }

    this.createPipes()
    this.createFloatingPlatforms()

    this.createEnemies()

    this.scoreText = new TextComponent(`Score: ${this.score}`, 10, 30, "20px Arial", "black")
    this.scoreText.zIndex = 100
    this.add(this.scoreText)

    this.livesText = new TextComponent(`Lives: ${this.lives}`, 790, 30, "20px Arial", "black")
    this.livesText.align = "right"
    this.livesText.zIndex = 100
    this.add(this.livesText)

    
    this.updateScoreUI();
    this.updateLivesUI();

    Camera.follow(this.player)
  }

  private updateScoreUI() {
    this.scoreText.text = `Score: ${this.score}`
  }

  private updateLivesUI() {
    this.livesText.text = `Lives: ${this.lives}`
  }

  private resetPlayerAndLevel() {
    
    
    
    this.player.resetState(this.initialPlayerX, this.initialPlayerY);

    for (const enemy of this.enemies) {
      enemy.resetState()
    }

    Camera.follow(this.player)
    Camera.update() 
    this.playerIsCurrentlyDying = false; 
  }

  private handlePlayerDeath(reason: string) {
    if (this.playerIsCurrentlyDying || this.player.isDying) return; 

    this.playerIsCurrentlyDying = true;
    this.lastDeathReason = reason;

    if (reason === "You fell into a pit!") {
      this.player.startDeathSequence('pit');
    } else { 
      this.player.startDeathSequence('enemy');
    }
  }

  private createEnemies() {
    const enemyYPosition = this.newGroundLevelY - 32
    const enemyPositions = [
      { x: 8 * 32, y: enemyYPosition },
      { x: 20 * 32, y: enemyYPosition },
      { x: 32 * 32, y: enemyYPosition },
      { x: 48 * 32, y: enemyYPosition },
      { x: 57 * 32, y: enemyYPosition },
      { x: 67 * 32, y: enemyYPosition },
      { x: 85 * 32, y: enemyYPosition },
    ]

    for (const pos of enemyPositions) {
      const enemy = new EnemyComponent(pos.x, pos.y, 32, 32)
      enemy.setScene(this.components)
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
    ];

    const groundColor = "#A0522D";
    const groundTopHighlightColor = "#DEB887";
    const groundTextureColor = "#8B4513";

    for (const segment of groundSegments) {
      for (let i = segment.start; i <= segment.end; i++) {
        const blockX = i * 32;
        const blockY = this.newGroundLevelY;

        const g = new BoxComponent(blockX, blockY, 32, groundColor);
        g.width = 32;
        g.height = 32;
        g.zIndex = 0;
        g.solid = true;

        const originalGroundRender = g.render.bind(g);
        g.render = (ctx) => {
          originalGroundRender(ctx);

          ctx.fillStyle = groundTextureColor;
          const lineThickness = 2;
          const numLines = 3;
          const lineSpacing = g.height / (numLines + 1);
          for (let j = 1; j <= numLines; j++) {
            ctx.fillRect(g.x, g.y + j * lineSpacing - lineThickness / 2, g.width, lineThickness);
          }
        }
        this.add(g);

        const topHighlight = new BoxComponent(blockX, blockY, 32, groundTopHighlightColor);
        topHighlight.height = 6;
        topHighlight.solid = false;
        topHighlight.zIndex = 1;
        this.add(topHighlight);
      }
    }
  }

  private createPipes() {
    const pipePositions = [
      { x: 5, height: 1.5 },
      { x: 12, height: 2 },
      { x: 25, height: 2.5 },
      { x: 35, height: 1.5 },
      { x: 50, height: 2.5 },
      { x: 60, height: 2 },
      { x: 80, height: 2 },
      { x: 90, height: 1.5 },
    ]

    for (const pipe of pipePositions) {
      this.createMarioPipe(pipe.x * 32, this.newGroundLevelY, pipe.height)
    }
  }

  private createFloatingPlatforms() {
    const platforms = [
      { x: 10, y: 12, width: 3, style: 'stone' },
      { x: 18, y: 10, width: 2, style: 'stone' },
      { x: 22, y: 11, width: 3, style: 'stone' },
      { x: 30, y: 9, width: 2, style: 'stone' },
      { x: 38, y: 12, width: 3, style: 'stone' },
      { x: 45, y: 10, width: 2, style: 'stone' },
      { x: 55, y: 13, width: 3, style: 'stone' },
      { x: 65, y: 11, width: 2, style: 'stone' },
      { x: 75, y: 9, width: 3, style: 'stone' },
      { x: 88, y: 12, width: 2, style: 'stone' },
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
        base: "#A0A0A0",
        top: "#D8D8D8",
        side: "#707070"
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
    if (this.playerIsCurrentlyDying) {
      this.player.update(dt); 

      if (this.player.isDeathAnimationComplete()) {
        this.playerIsCurrentlyDying = false; 
        this.lives--; 

        Camera.resetViewport();
        SceneManager.setScene(new DeathScene(this.lives, this.score, this.lastDeathReason));
        return; 
      }
      
      for (const enemy of this.enemies) {
        if (enemy.enabled) {
          enemy.setScene(this.components);
          enemy.update(dt);
        }
      }
      Camera.update(); 
      return; 
    }

    Camera.update()

    const originalX = this.player.x
    const originalY = this.player.y

    this.player.update(dt) 
    const playerVelocityYBeforeCollisionResolution = this.player.velocityY

    this.checkAndResolveCollisions('horizontal', originalX)
    const isGrounded = this.checkAndResolveCollisions('vertical', originalX, originalY)
    this.player.setGrounded(isGrounded)

    for (const enemy of this.enemies) {
      if (enemy.enabled) {
        enemy.setScene(this.components)
        enemy.update(dt)
      }
    }

    this.checkEnemyCollisions(playerVelocityYBeforeCollisionResolution)

    if (this.player.y > this.gameOverY && !this.player.isDying) { 
      this.handlePlayerDeath("You fell into a pit!")
    }
  }

  private checkEnemyCollisions(playerVelocityYBeforeCollisionResolution: number) {
    if (this.playerIsCurrentlyDying || this.player.isDying) return; 

    for (const enemy of this.enemies) {
      if (!enemy.isAlive || !enemy.enabled) continue

      const playerFeetY = this.player.y + this.player.height
      const playerPrevFeetY = playerFeetY - playerVelocityYBeforeCollisionResolution
      const playerLeft = this.player.x
      const playerRight = this.player.x + this.player.width
      const playerTop = this.player.y

      const enemyTop = enemy.y
      const enemyBottom = enemy.y + enemy.height
      const enemyLeft = enemy.x
      const enemyRight = enemy.x + enemy.width

      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerFeetY >= enemyTop &&
        playerTop < enemyBottom
      ) {
        const isFalling = playerVelocityYBeforeCollisionResolution > 0
        const wasAbove = playerPrevFeetY <= enemyTop + 2

        if (isFalling && wasAbove) {
          const stompDepthTolerance = Math.min(10, enemy.height * 0.3)

          if (playerFeetY <= enemyTop + stompDepthTolerance) {
            enemy.stomp()
            this.player.bounceOffEnemy()
            this.score += 10
            this.updateScoreUI()
          } else {
            if (enemy.isAlive) {
              this.handlePlayerDeath("You were defeated by an enemy!")
            }
          }
        } else {
          if (enemy.isAlive) {
            this.handlePlayerDeath("You were defeated by an enemy!")
          }
        }
      }
    }
  }

  private checkAndResolveCollisions(direction: 'horizontal' | 'vertical', originalX: number, originalY?: number): boolean {
    if (this.playerIsCurrentlyDying || this.player.isDying) { 
      if (direction === 'vertical') return false; 
      return false; 
    }

    let collided = false;
    let isGrounded = false;
    let groundY = 0;

    for (const c of this.components) {
      if (c === this.player || !c.solid) continue;

      const playerLeft = this.player.x;
      const playerRight = this.player.x + this.player.width;
      const playerTop = this.player.y;
      const playerBottom = this.player.y + this.player.height;

      const blockLeft = c.x;
      const blockRight = c.x + c.width;
      const blockTop = c.y;
      const blockBottom = c.y + c.height;

      if (
        playerRight > blockLeft &&
        playerLeft < blockRight &&
        playerBottom > blockTop &&
        playerTop < blockBottom
      ) {
        collided = true;

        if (direction === 'horizontal') {
          if (originalX + this.player.width <= blockLeft) {
            this.player.x = blockLeft - this.player.width;
          } else if (originalX >= blockRight) {
            this.player.x = blockRight;
          }
        } else if (direction === 'vertical') {
          if (originalY !== undefined) {
            if (originalY + this.player.height <= blockTop) {
              this.player.y = blockTop - this.player.height;
              this.player.stopVerticalMovement();
              isGrounded = true;
              groundY = blockTop;
            } else if (originalY >= blockBottom) {
              this.player.y = blockBottom;
              this.player.velocityY = 0.1;
            }
          }
        }
      }
    }

    if (direction === 'vertical') {
      this.player.setGrounded(isGrounded, isGrounded ? groundY : undefined);
    }

    return direction === 'vertical' ? isGrounded : collided;
  }

  override render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    Camera.apply(ctx)

    for (let i = 0; i < this.components.length; i++) {
      const c = this.components[i]
      if (c === this.scoreText || c === this.livesText) continue

      if (c.visible) {
        ctx.save()
        c.render(ctx)
        ctx.restore()
      }
    }

    Camera.reset(ctx)

    if (this.scoreText.visible) {
      ctx.save()
      this.scoreText.render(ctx)
      ctx.restore()
    }
    if (this.livesText.visible) {
      ctx.save()
      this.livesText.render(ctx)
      ctx.restore()
    }
  }
}
