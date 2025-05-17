import { Scene } from "../../core/scene"
import { BoxComponent } from "../../entities/boxComponent"
import { Camera } from "../../core/camera"
import { SceneManager } from "../../core/sceneManager"
import { DeathScene } from "./deathScene"
import { EnemyComponent } from "../entities/enemyComponent"
import { PlayerComponent } from "../entities/playerComponent"
import { AssetLoader } from "../../core/assetLoader"
import { MapData } from "../types/mapData"
import { 
  createCloudComponent,
  createBushComponent,
  createGroundBlockComponent,
  createPipeComponent,
  createFloatingPlatformComponent,
  createEnemy
} from "../factories/levelElementFactory"
import { TILE_SIZE } from "../constants"
import { HUDController } from "../ui/HUDController"
import { TextComponent } from "../../entities/textComponent"

export class MainScene extends Scene {
  private player!: PlayerComponent
  private gameOverY!: number
  private enemies: EnemyComponent[] = []
  private newGroundLevelY!: number

  private score = 0
  private lives = 3
  private hudController!: HUDController

  private initialPlayerX!: number
  private initialPlayerY!: number

  private playerIsCurrentlyDying = false
  private lastDeathReason = ""

  private constructor() {
    super()
  }

  public static async create(initialScore: number = 0, initialLives: number = 3): Promise<MainScene> {
    const scene = new MainScene()
    try {
      const mapData = await AssetLoader.loadJson<MapData>('/data/maps/map-1-1.json')
      scene.initializeScene(mapData, initialScore, initialLives)
    } catch (error) {
      console.error("Failed to load or parse map data using AssetLoader:", error)
      scene.initializeScene(scene.getDefaultFallbackMapData(), initialScore, initialLives, true)
    }
    return scene
  }

  private getDefaultFallbackMapData(): MapData {
    console.warn("Using fallback map data.")
    return {
      name: "Fallback World",
      player: { initialX: 150, initialY: 100 },
      level: { groundLevelY: 570, gameOverY: 600, backgroundColor: "gray", worldWidthTiles: 25 },
      decorations: { clouds: [], bushes: [] },
      terrain: {
        ground: {
          segments: [{ startTile: 0, endTile: 25 }],
          color: "#A0522D", topHighlightColor: "#DEB887", textureColor: "#8B4513"
        },
        pipes: [],
        floatingPlatforms: []
      },
      enemies: { yOffsetFromGround: -32, positions: [] }
    }
  }

  private initializeScene(mapData: MapData, initialScore: number, initialLives: number, isFallback: boolean = false) {
    this.score = initialScore
    this.lives = initialLives

    this.gameOverY = mapData.level.gameOverY
    this.newGroundLevelY = mapData.level.groundLevelY
    this.initialPlayerX = mapData.player.initialX
    this.initialPlayerY = mapData.player.initialY

    this.hudController = new HUDController()
    this.add(this.hudController.getScoreTextComponent())
    this.add(this.hudController.getLivesTextComponent())
    this.hudController.updateScore(this.score)
    this.hudController.updateLives(this.lives)

    const background = new BoxComponent(0, 0, 800, mapData.level.backgroundColor)
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

    for (const cloudConfig of mapData.decorations.clouds) {
      this.add(createCloudComponent(cloudConfig))
    }

    for (const segment of mapData.terrain.ground.segments) {
      for (let i = segment.startTile; i <= segment.endTile; i++) {
        this.add(createGroundBlockComponent(i, this.newGroundLevelY, mapData.terrain.ground))
      }
    }

    this.player = new PlayerComponent(this.initialPlayerX, this.initialPlayerY)
    this.add(this.player)

    for (const bushConfig of mapData.decorations.bushes) {
      this.add(createBushComponent(bushConfig, this.newGroundLevelY))
    }

    for (const pipeConfig of mapData.terrain.pipes) {
      this.add(createPipeComponent(pipeConfig, this.newGroundLevelY))
    }

    for (const platformConfig of mapData.terrain.floatingPlatforms) {
      this.add(createFloatingPlatformComponent(platformConfig))
    }

    this.populateEnemies(mapData)

    if (isFallback) {
      const errorText = new TextComponent("Failed to load map. Fallback level.", 400, 50, "20px Arial", "red")
      errorText.align = "center"
      errorText.zIndex = 200
      this.add(errorText)
    }

    Camera.follow(this.player)
  }

  private resetPlayerAndLevel() {
    this.player.resetState(this.initialPlayerX, this.initialPlayerY)

    for (const enemy of this.enemies) {
      enemy.resetState()
    }

    Camera.follow(this.player)
    Camera.update()
    this.playerIsCurrentlyDying = false
  }

  private handlePlayerDeath(reason: string) {
    if (this.playerIsCurrentlyDying || this.player.isDying) return

    this.playerIsCurrentlyDying = true
    this.lastDeathReason = reason

    if (reason === "You fell into a pit!") {
      this.player.startDeathSequence('pit')
    } else {
      this.player.startDeathSequence('enemy')
    }
  }

  private populateEnemies(mapData: MapData) {
    const enemyYPosition = this.newGroundLevelY + mapData.enemies.yOffsetFromGround
    this.enemies = []
    for (const pos of mapData.enemies.positions) {
      const enemy = createEnemy(pos, enemyYPosition, this.components)
      this.enemies.push(enemy)
      this.add(enemy)
    }
  }

  override update(dt: number) {
    if (!this.player) return

    if (this.playerIsCurrentlyDying) {
      this.player.update(dt)

      if (this.player.isDeathAnimationComplete()) {
        this.playerIsCurrentlyDying = false
        this.lives--

        Camera.resetViewport()
        SceneManager.setScene(new DeathScene(this.lives, this.score, this.lastDeathReason))
        return
      }

      for (const enemy of this.enemies) {
        if (enemy.enabled) {
          enemy.setScene(this.components)
          enemy.update(dt)
        }
      }
      Camera.update()
      return
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
    if (this.playerIsCurrentlyDying || this.player.isDying) return

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
            this.hudController.updateScore(this.score)
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
      if (direction === 'vertical') return false
      return false
    }

    let collided = false
    let isGrounded = false
    let groundY = 0

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
              this.player.stopVerticalMovement()
              isGrounded = true
              groundY = blockTop
            } else if (originalY >= blockBottom) {
              this.player.y = blockBottom
              this.player.velocityY = 0.1
            }
          }
        }
      }
    }

    if (direction === 'vertical') {
      this.player.setGrounded(isGrounded, isGrounded ? groundY : undefined)
    }

    return direction === 'vertical' ? isGrounded : collided
  }

  override render(ctx: CanvasRenderingContext2D) {
    if (!this.player) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.font = "20px Arial"
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.fillText("Loading map or map error...", ctx.canvas.width / 2, ctx.canvas.height / 2)
      return
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // --- World Space Rendering ---
    Camera.apply(ctx)

    for (let i = 0; i < this.components.length; i++) {
      const c = this.components[i]
      // Skip HUD elements in this pass
      if (c === this.hudController.getScoreTextComponent() || c === this.hudController.getLivesTextComponent()) {
        continue
      }

      if (c.visible) {
        ctx.save()
        c.render(ctx)
        ctx.restore()
      }
    }

    Camera.reset(ctx)

    // --- Screen Space Rendering (UI) ---
    // Render HUD elements now, after camera reset, so they are in screen coordinates.
    const scoreText = this.hudController.getScoreTextComponent();
    if (scoreText.visible) {
      ctx.save()
      scoreText.render(ctx) // scoreText.x and scoreText.y are now screen coordinates
      ctx.restore()
    }

    const livesText = this.hudController.getLivesTextComponent();
    if (livesText.visible) {
      ctx.save()
      livesText.render(ctx) // livesText.x and livesText.y are now screen coordinates
      ctx.restore()
    }
  }
}
