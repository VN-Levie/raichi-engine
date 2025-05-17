import { Scene } from "../../core/scene"
import { BoxComponent } from "../../entities/boxComponent"
import { Camera } from "../../core/camera"
import { SceneManager } from "../../core/sceneManager"
import { DeathScene } from "./deathScene"
import { GoombaEnemyComponent } from "../entities/enemy/goombaEnemyComponent"
import { PlayerComponent } from "../entities/playerComponent"
import { AssetLoader } from "../../core/assetLoader"
import { MapData } from "../types/mapData"
import {
  createCloudComponent,
  createBushComponent,
  createGroundBlockComponent,
  createPipeComponent,
  createFloatingPlatformComponent,
  createEnemy,
  createGoal,
  createFlagPoleComponent,
  createCheckpointComponent,
  createCoinComponent,
  createLifeItemComponent
} from "../factories/levelElementFactory"
import { TILE_SIZE } from "../constants"
import { HUDController } from "../ui/HUDController"
import { TextComponent } from "../../entities/textComponent"
import { GoalComponent } from "../entities/map/goalComponent"
import { WinScene } from "./WinScene"
import { TurtleEnemyComponent } from "../entities/enemy/turtleEnemyComponent"
import { LoadingScene } from "./LoadingScene";
import { CheckpointComponent } from "../entities/map/checkpointComponent";
import { CoinComponent } from "../entities/collectable/coinComponent";
import { LifeItemComponent } from "../entities/collectable/lifeItemComponent";
import { BaseEnemyComponent } from "../entities/enemy/baseEnemyComponent";

export class MainScene extends Scene {
  private player!: PlayerComponent
  private gameOverY!: number
  private enemies: BaseEnemyComponent[] = []
  private newGroundLevelY!: number
  private goalComponent: GoalComponent | null = null
  private currentMapUrl!: string
  private mapName: string = ""
  private checkpoints: CheckpointComponent[] = []
  private coins: CoinComponent[] = []
  private lifeItems: LifeItemComponent[] = []

  private score = 0
  private lives = 10
  private totalCoinsCollected = 0
  private hudController!: HUDController

  private initialPlayerX!: number
  private initialPlayerY!: number

  private playerIsCurrentlyDying = false
  private lastDeathReason = ""

  private constructor() {
    super()
  }

  public static async create(
    mapUrl: string,
    initialScore: number = 0,
    initialLives: number = 10,
    playerStartX?: number,
    playerStartY?: number,
    initialTotalCoins: number = 0
  ): Promise<MainScene> {
    const scene = new MainScene()
    scene.currentMapUrl = mapUrl
    try {
      const mapData = await AssetLoader.loadJson<MapData>(mapUrl)
      scene.initializeScene(mapData, initialScore, initialLives, false, playerStartX, playerStartY, initialTotalCoins)
    } catch (error) {
      console.error(`Failed to load or parse map data from ${mapUrl}:`, error)
      scene.initializeScene(scene.getDefaultFallbackMapData(), initialScore, initialLives, true, playerStartX, playerStartY, initialTotalCoins)
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
      enemies: { yOffsetFromGround: -32, positions: [{ "xTile": 5, "type": "goomba" }] },
      checkpoints: [],
      coins: [],
      lifeItems: []
    }
  }

  private initializeScene(
    mapData: MapData,
    initialScore: number,
    initialLives: number,
    isFallback: boolean = false,
    playerInitialXOverride?: number,
    playerInitialYOverride?: number,
    initialTotalCoins: number = 0
  ) {
    this.score = initialScore
    this.lives = initialLives
    this.totalCoinsCollected = initialTotalCoins
    this.mapName = mapData.name

    this.gameOverY = mapData.level.gameOverY
    this.newGroundLevelY = mapData.level.groundLevelY

    this.initialPlayerX = playerInitialXOverride ?? mapData.player.initialX
    this.initialPlayerY = playerInitialYOverride ?? mapData.player.initialY

    this.hudController = new HUDController()
    this.add(this.hudController.getScoreTextComponent())
    this.add(this.hudController.getLivesTextComponent())
    this.add(this.hudController.getCoinsTextComponent())
    this.hudController.updateScore(this.score)
    this.hudController.updateLives(this.lives)
    this.hudController.updateCoins(this.totalCoinsCollected)

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

    this.checkpoints = []
    if (mapData.checkpoints) {
      const gameHeight = 600
      for (const cpConfig of mapData.checkpoints) {
        const checkpoint = createCheckpointComponent(cpConfig, gameHeight)
        this.add(checkpoint)
        this.checkpoints.push(checkpoint)
      }
    }

    this.coins = []
    if (mapData.coins) {
      for (const coinConfig of mapData.coins) {
        const coin = createCoinComponent(coinConfig)
        this.add(coin)
        this.coins.push(coin)
      }
    }

    this.lifeItems = []
    if (mapData.lifeItems) {
      for (const lifeItemConfig of mapData.lifeItems) {
        const lifeItem = createLifeItemComponent(lifeItemConfig)
        this.add(lifeItem)
        this.lifeItems.push(lifeItem)
      }
    }

    if (mapData.goal) {
      this.goalComponent = createGoal(mapData.goal)
      if (this.goalComponent) {
        this.add(this.goalComponent)

        if (mapData.decorations.flagPole) {
          const flagPole = createFlagPoleComponent(mapData.decorations.flagPole)
          if (flagPole) {
            this.add(flagPole)
          }
        }
      }
    } else {
      this.goalComponent = null
    }

    if (isFallback) {
      const errorText = new TextComponent("Failed to load map. Fallback level.", 400, 50, "20px Arial", "red")
      errorText.align = "center"
      errorText.zIndex = 200
      this.add(errorText)
    }

    Camera.follow(this.player)
  }

  private resetPlayerAndLevel() {
    this.player.resetToLastCheckpoint()

    for (const enemy of this.enemies) {
      if ('resetState' in enemy && typeof enemy.resetState === 'function') {
        enemy.resetState()
      }
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
      const enemy = createEnemy(pos, enemyYPosition, this.components) as BaseEnemyComponent
      this.enemies.push(enemy)
      this.add(enemy)
    }
  }

  private checkEnemyCollisions(playerVelocityYBeforeCollisionResolution: number) {
    if (this.playerIsCurrentlyDying || this.player.isDying) return

    for (const enemy of this.enemies) {
      if (!enemy.isAlive || !enemy.enabled) continue

      const isEnemyHarmful = enemy.isHarmfulOnContact()

      if (!isEnemyHarmful && !(enemy instanceof TurtleEnemyComponent && enemy.isShelled && !enemy.isMovingInShell)) {
        continue
      }

      const playerFeetY = this.player.y + this.player.height
      const playerPrevFeetY = playerFeetY - playerVelocityYBeforeCollisionResolution
      const playerLeft = this.player.x
      const playerRight = this.player.x + this.player.width
      const playerTop = this.player.y
      const playerBottom = playerFeetY

      const enemyTop = enemy.y
      const enemyBottom = enemy.y + enemy.height
      const enemyLeft = enemy.x
      const enemyRight = enemy.x + enemy.width

      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerBottom > enemyTop &&
        playerTop < enemyBottom
      ) {
        const isFalling = playerVelocityYBeforeCollisionResolution > 0
        const wasAbove = playerPrevFeetY <= enemyTop + 2
        const landedOnTop = playerFeetY >= enemyTop && playerFeetY <= enemyTop + Math.min(10, enemy.height * 0.3)

        let stompedEnemy = false
        if (isFalling && wasAbove && landedOnTop) {
          enemy.stomp()
          this.score += 10
          this.hudController.updateScore(this.score)
          stompedEnemy = true

          if (enemy instanceof TurtleEnemyComponent && enemy.isShelled && !enemy.isMovingInShell) {
            this.player.bounceOffEnemySlightly()
          } else {
            this.player.bounceOffEnemy()
          }
        }

        if (!stompedEnemy && isEnemyHarmful) {
          let playerDies = true
          if (enemy instanceof TurtleEnemyComponent) {
            if (enemy.isShelled && !enemy.isMovingInShell) {
              playerDies = enemy.hitByPlayerNonStomp()
            } else {
              playerDies = true
            }
          }

          if (playerDies) {
            this.handlePlayerDeath("You were defeated by an enemy!")
          }
        }
      }
    }
  }

  private checkCoinCollisions() {
    if (!this.player || this.player.isDying) return

    for (const coin of this.coins) {
      if (coin.collected || !coin.enabled) continue

      if (
        this.player.x < coin.x + coin.width &&
        this.player.x + this.player.width > coin.x &&
        this.player.y < coin.y + coin.height &&
        this.player.y + this.player.height > coin.y
      ) {
        coin.collect()
        this.score += coin.value
        this.totalCoinsCollected++
        this.hudController.updateScore(this.score)
        this.hudController.updateCoins(this.totalCoinsCollected)
      }
    }
  }

  private checkLifeItemCollisions() {
    if (!this.player || this.player.isDying) return

    for (const lifeItem of this.lifeItems) {
      if (lifeItem.collected || !lifeItem.enabled) continue
      if (
        this.player.x < lifeItem.x + lifeItem.width &&
        this.player.x + this.player.width > lifeItem.x &&
        this.player.y < lifeItem.y + lifeItem.height &&
        this.player.y + this.player.height > lifeItem.y
      ) {
        lifeItem.collect()
        this.lives += lifeItem.value
        this.hudController.updateLives(this.lives)
      }
    }
  }

  private checkCheckpointCollisions() {
    if (!this.player || this.player.isDying) return

    for (const checkpoint of this.checkpoints) {
      if (!checkpoint.activated && checkpoint.enabled) {
        if (
          this.player.x < checkpoint.x + checkpoint.width &&
          this.player.x + this.player.width > checkpoint.x &&
          this.player.y < checkpoint.y + checkpoint.height &&
          this.player.y + this.player.height > checkpoint.y
        ) {
          checkpoint.activate()
          this.player.setRespawnPoint(checkpoint.x, this.player.y)
          console.log(`Checkpoint activated at ${checkpoint.x}, new respawn: ${this.player.getRespawnPoint().x}, ${this.player.getRespawnPoint().y}`)
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

  private async checkGoalCollision() {
    if (!this.goalComponent || this.playerIsCurrentlyDying || this.player.isDying) return

    const playerRect = { x: this.player.x, y: this.player.y, width: this.player.width, height: this.player.height }
    const goalRect = { x: this.goalComponent.x, y: this.goalComponent.y, width: this.goalComponent.width, height: this.goalComponent.height }

    if (
      playerRect.x < goalRect.x + goalRect.width &&
      playerRect.x + playerRect.width > goalRect.x &&
      playerRect.y < goalRect.y + goalRect.height &&
      playerRect.y + playerRect.height > goalRect.y
    ) {
      this.player.enabled = false
      this.enabled = false

      if (this.goalComponent.isWinGoal) {
        Camera.resetViewport()
        SceneManager.setScene(new WinScene())
      } else if (this.goalComponent.nextMapUrl) {
        const nextMapUrl = this.goalComponent.nextMapUrl
        const currentScore = this.score
        const currentLives = this.lives
        const currentTotalCoins = this.totalCoinsCollected
        SceneManager.setScene(new LoadingScene(async () => await MainScene.create(nextMapUrl, currentScore, currentLives, undefined, undefined, currentTotalCoins)))
      }
    }
  }

  override update(dt: number) {
    if (!this.enabled || !this.player) return

    if (this.playerIsCurrentlyDying) {
      this.player.update(dt)

      if (this.player.isDeathAnimationComplete()) {
        this.playerIsCurrentlyDying = false
        this.lives--
        const playerRespawnPoint = this.player.getRespawnPoint()

        Camera.resetViewport()
        SceneManager.setScene(new DeathScene(this.lives, 0, this.lastDeathReason, this.currentMapUrl, this.mapName, playerRespawnPoint.x, playerRespawnPoint.y, this.totalCoinsCollected))
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
    for (const coint of this.coins) {
      if (coint.enabled) {
        coint.update(dt)
      }
    }
    for (const lifeItem of this.lifeItems) {
      if (lifeItem.enabled) {
        lifeItem.update(dt)
      }
    }
    for (const checkpoint of this.checkpoints) {
      if (checkpoint.enabled) {
        checkpoint.update(dt)
      }
    }

    this.checkEnemyCollisions(playerVelocityYBeforeCollisionResolution)
    this.checkGoalCollision()
    this.checkCoinCollisions()
    this.checkLifeItemCollisions()
    this.checkCheckpointCollisions()

    if (this.player.y > this.gameOverY && !this.player.isDying) {
      this.handlePlayerDeath("You fell into a pit!")
    }
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

    Camera.apply(ctx)

    for (let i = 0; i < this.components.length; i++) {
      const c = this.components[i]
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

    const scoreText = this.hudController.getScoreTextComponent()
    if (scoreText.visible) {
      ctx.save()
      scoreText.render(ctx)
      ctx.restore()
    }

    const livesText = this.hudController.getLivesTextComponent()
    if (livesText.visible) {
      ctx.save()
      livesText.render(ctx)
      ctx.restore()
    }

    const coinsText = this.hudController.getCoinsTextComponent()
    if (coinsText.visible) {
      ctx.save()
      coinsText.render(ctx)
      ctx.restore()
    }
  }
}
