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
  createLifeItemComponent,
  createTornadoComponent
} from "../factories/levelElementFactory"
import { TILE_SIZE, INITIAL_LIVES, MAX_LIVES_ON_LOAD } from "../constants"
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
import { saveGameState, clearGameState } from "../utils/gameStateManager";
import { StartScene } from "./startScene";
import { CloudClusterComponent } from "../entities/map/cloudClusterComponent";
import { TornadoComponent } from "../entities/effects/TornadoComponent";
import { PumpkinShellComponent } from "../entities/enemy/PumpkinShellComponent";

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
  private tornadoes: TornadoComponent[] = []
  private shells: PumpkinShellComponent[] = []

  private score = 0
  private lives = MAX_LIVES_ON_LOAD
  private totalCoinsCollected = 0
  private hudController!: HUDController

  private initialPlayerX!: number
  private initialPlayerY!: number

  private playerIsCurrentlyDying = false
  private lastDeathReason = ""

  private isUnderwater: boolean = false;


  private dynamicCloudsEnabled: boolean = false;
  private dynamicCloudSpawnTimer: number = 0;
  private nextDynamicCloudSpawnTime: number = 0;
  private readonly MIN_CLOUD_SPAWN_INTERVAL = 4;
  private readonly MAX_CLOUD_SPAWN_INTERVAL = 8;

  private constructor() {
    super()
  }

  public static async create(
    mapUrl: string,
    initialScore: number = 0,
    initialLives: number = MAX_LIVES_ON_LOAD,
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
    this.isUnderwater = mapData.level.type === "underwater";

    this.initialPlayerX = playerInitialXOverride ?? mapData.player.initialX
    this.initialPlayerY = playerInitialYOverride ?? mapData.player.initialY


    this.dynamicCloudsEnabled = mapData.decorations.dynamicClouds || false;
    if (this.dynamicCloudsEnabled) {
      this.setNextDynamicCloudSpawnTime();
      this.dynamicCloudSpawnTimer = 0;
    }

    if (!playerInitialXOverride && !playerInitialYOverride) {
      this.player = new PlayerComponent(this.initialPlayerX, this.initialPlayerY, this.isUnderwater);
      this.player.setRespawnPoint(this.initialPlayerX, this.initialPlayerY)
    } else {
      this.player = new PlayerComponent(this.initialPlayerX, this.initialPlayerY, this.isUnderwater);
    }

    this.hudController = new HUDController()

    this.hudController.getBackToCheckpointButton().onClick = () => this.handleBackToLastCheckpointClick()
    this.hudController.getRestartLevelButton().onClick = () => this.handleRestartLevelClick()
    this.hudController.getBackToMenuButton().onClick = () => this.handleBackToMenuButton()

    this.add(this.hudController.getScoreTextComponent())
    this.add(this.hudController.getLivesTextComponent())
    this.add(this.hudController.getCoinsTextComponent())
    this.add(this.hudController.getBackToCheckpointButton())
    this.add(this.hudController.getRestartLevelButton())
    this.add(this.hudController.getBackToMenuButton())


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
    this.populateTornadoes(mapData);

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

    saveGameState({
      mapUrl: this.currentMapUrl,
      respawnX: this.player.getRespawnPoint().x,
      respawnY: this.player.getRespawnPoint().y,
      score: this.score,
      lives: this.lives,
      totalCoinsCollected: this.totalCoinsCollected,
    })
  }

  private setNextDynamicCloudSpawnTime(): void {
    this.nextDynamicCloudSpawnTime = Math.random() * (this.MAX_CLOUD_SPAWN_INTERVAL - this.MIN_CLOUD_SPAWN_INTERVAL) + this.MIN_CLOUD_SPAWN_INTERVAL;
  }

  private spawnDynamicCloud(): void {
    const canvasWidth = SceneManager.getScene().components.find(c => c instanceof BoxComponent && c.zIndex === -10)?.width || 800;

    const y = Math.random() * 200 + 30;
    const size = Math.random() * 1.0 + 0.8;
    const speed = -(Math.random() * 25 + 25);

    const startX = Camera.x + canvasWidth + Math.random() * 50 + 50;

    const cloud = createCloudComponent({ x: startX, y, size }, speed);
    this.add(cloud);
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
    this.shells = [];
    for (const pos of mapData.enemies.positions) {

      const enemy = createEnemy(pos, enemyYPosition, this.components) as BaseEnemyComponent
      this.enemies.push(enemy)
      this.add(enemy)
    }
  }

  private populateTornadoes(mapData: MapData) {
    this.tornadoes = [];
    if (mapData.terrain.tornadoes) {
      for (const tornadoConfig of mapData.terrain.tornadoes) {
        const tornado = createTornadoComponent(tornadoConfig);
        this.add(tornado);
        this.tornadoes.push(tornado);
      }
    }
  }

  private checkEnemyCollisions(playerVelocityYBeforeCollisionResolution: number) {
    if (this.playerIsCurrentlyDying || this.player.isDying) return

    const collidableEnemies = this.components.filter(
      c => c instanceof BaseEnemyComponent && c.isAlive && c.enabled
    ) as BaseEnemyComponent[];

    for (const enemy of collidableEnemies) {

      if (!enemy.isAlive || !enemy.enabled) continue;

      const isEnemyHarmful = enemy.isHarmfulOnContact();

      if (!isEnemyHarmful && !(enemy instanceof TurtleEnemyComponent)) {
        if (!(enemy instanceof PumpkinShellComponent)) {
          continue;
        }
      } else {

      }

      const playerFeetY = this.player.y + this.player.height;
      const playerPrevFeetY = playerFeetY - playerVelocityYBeforeCollisionResolution;
      const playerLeft = this.player.x;
      const playerRight = this.player.x + this.player.width;
      const playerTop = this.player.y;
      const playerBottom = playerFeetY;

      const enemyTop = enemy.y;
      const enemyBottom = enemy.y + enemy.height;
      const enemyLeft = enemy.x;
      const enemyRight = enemy.x + enemy.width;
      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerBottom >= enemyTop &&
        playerTop < enemyBottom
      ) {
        const isFalling = playerVelocityYBeforeCollisionResolution > 0;
        const wasAbove = playerPrevFeetY <= enemyTop + 2;
        const stompMargin = Math.max(5, Math.min(10, enemy.height * 0.4));
        const landedOnTop = playerFeetY >= enemyTop && playerFeetY <= enemyTop + stompMargin;

        let stompedEnemy = false;

        const canStomp = (
          playerVelocityYBeforeCollisionResolution > 0
          || (
            this.player['isGrounded'] &&
            Math.abs(playerFeetY - enemyTop) < 2
          )
        );
        if (canStomp && wasAbove && landedOnTop) {


          if (enemy instanceof PumpkinShellComponent) {
            const shell = enemy as PumpkinShellComponent;
            if (shell.isHarmfulOnContact()) {

              shell.killAndFall(true);
              this.player.bounceOffEnemySlightly();
            } else {

              shell.stomp();
              this.player.bounceOffEnemySlightly();
            }
            stompedEnemy = true;
          } else if (enemy instanceof TurtleEnemyComponent || enemy instanceof GoombaEnemyComponent) {

            enemy.stomp();
            this.player.bounceOffEnemy();
            stompedEnemy = true;
          }


          if (stompedEnemy) {
            this.score += 10;
            this.hudController.updateScore(this.score);
          }
        }

        if (!stompedEnemy && isEnemyHarmful) {
          let playerDies = true;

          if (playerDies) {
            this.handlePlayerDeath(enemy instanceof PumpkinShellComponent ? "Hit by a pumpkin shell!" : "You were defeated by an enemy!")
          }
        }
      }
    }
  }

  private checkShellInteractions() {
    this.shells = this.components.filter(c => c instanceof PumpkinShellComponent && c.isAlive && c.enabled) as PumpkinShellComponent[];


    for (let i = 0; i < this.shells.length; i++) {
      const shellA = this.shells[i];


      if (shellA.isHarmfulOnContact()) {
        for (const enemy of this.enemies) {

          if (!enemy || !enemy.isAlive || !enemy.enabled || enemy === shellA) continue;


          if (
            shellA.x < enemy.x + enemy.width &&
            shellA.x + shellA.width > enemy.x &&
            shellA.y < enemy.y + enemy.height &&
            shellA.y + shellA.height > enemy.y
          ) {

            enemy.stomp();
            //console.log(`Enemy ${enemy.constructor.name} killed by shell at (${shellA.x}, ${shellA.y})`);


            this.score += 50;
            this.hudController.updateScore(this.score);
          }
        }
      }



      if (!shellA.isHarmfulOnContact()) continue;

      for (let j = i + 1; j < this.shells.length; j++) {
        const shellB = this.shells[j];


        if (
          shellA.x < shellB.x + shellB.width &&
          shellA.x + shellA.width > shellB.x &&
          shellA.y < shellB.y + shellB.height &&
          shellA.y + shellA.height > shellB.y
        ) {
          shellA.killAndFall(true);
          shellB.killAndFall(true);
        }
      }
    }
  }

  private checkTornadoCollisions() {
    if (!this.player || this.player.isDying || this.playerIsCurrentlyDying) return;

    for (const tornado of this.tornadoes) {
      if (!tornado.enabled || !tornado.isHarmful) continue;


      if (
        this.player.x < tornado.x + tornado.width &&
        this.player.x + this.player.width > tornado.x &&
        this.player.y < tornado.y + tornado.height &&
        this.player.y + this.player.height > tornado.y
      ) {
        this.handlePlayerDeath("Hit by a tornado!");
        return;
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
          console.log(`Checkpoint activated at ${checkpoint.x}, new respawn: ${checkpoint.x}, ${this.player.y}`)

          saveGameState({
            mapUrl: this.currentMapUrl,
            respawnX: this.player.getRespawnPoint().x,
            respawnY: this.player.getRespawnPoint().y,
            score: this.score,
            lives: this.lives,
            totalCoinsCollected: this.totalCoinsCollected,
          })
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
        playerBottom >= blockTop &&
        playerTop < blockBottom
      ) {

        let performHorizontalResolution = true;

        if (direction === 'horizontal') {



          const playerIsWalkingOnTopOfThisBlock = (playerBottom <= blockTop + 0.1 && playerTop < blockTop);

          if (playerIsWalkingOnTopOfThisBlock) {
            performHorizontalResolution = false;
          }

          if (performHorizontalResolution) {
            collided = true;
            if (originalX + this.player.width <= blockLeft) {
              this.player.x = blockLeft - this.player.width;
            } else if (originalX >= blockRight) {
              this.player.x = blockRight;
            }
          }
        } else if (direction === 'vertical') {
          collided = true;
          if (originalY !== undefined) {
            if (originalY + this.player.height <= blockTop + 0.01) {
              this.player.y = blockTop - this.player.height;
              this.player.stopVerticalMovement();
              isGrounded = true;
              groundY = blockTop;
            } else if (originalY >= blockBottom - 0.01) {
              this.player.y = blockBottom;
              if (this.isUnderwater && this.player.velocityY < 0) {
                this.player.velocityY = 0;
              } else {
                this.player.velocityY = 0.1;
              }
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

        saveGameState({
          mapUrl: nextMapUrl,
          respawnX: 0,
          respawnY: 0,
          score: currentScore,
          lives: currentLives,
          totalCoinsCollected: currentTotalCoins,
        })

        SceneManager.setScene(new LoadingScene(async () => await MainScene.create(nextMapUrl, currentScore, currentLives, undefined, undefined, currentTotalCoins)))
      }
    }
  }

  override update(dt: number) {
    if (!this.enabled || !this.player) return;



    if (this.hudController) {
      this.hudController.getBackToCheckpointButton().update(dt);
      this.hudController.getRestartLevelButton().update(dt);
      this.hudController.getBackToMenuButton().update(dt);
    }


    if (this.dynamicCloudsEnabled) {
      this.dynamicCloudSpawnTimer += dt;
      if (this.dynamicCloudSpawnTimer >= this.nextDynamicCloudSpawnTime) {
        this.spawnDynamicCloud();
        this.dynamicCloudSpawnTimer = 0;
        this.setNextDynamicCloudSpawnTime();
      }
    }

    if (this.playerIsCurrentlyDying) {
      this.player.update(dt);

      if (this.player.isDeathAnimationComplete()) {
        this.playerIsCurrentlyDying = false;
        this.lives--;
        const playerRespawnPoint = this.player.getRespawnPoint();

        Camera.resetViewport();
        SceneManager.setScene(new DeathScene(this.lives, this.score, this.lastDeathReason, this.currentMapUrl, this.mapName, playerRespawnPoint.x, playerRespawnPoint.y, this.totalCoinsCollected));
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

    Camera.update();

    const originalX = this.player.x;
    const originalY = this.player.y;

    this.player.update(dt);
    const playerVelocityYBeforeCollisionResolution = this.player.velocityY;

    this.checkAndResolveCollisions('horizontal', originalX);
    this.checkAndResolveCollisions('vertical', originalX, originalY);

    for (const component of this.components) {
      if (component === this.player) continue;

      if (component.enabled) {
        if (component instanceof BaseEnemyComponent) {
          component.setScene(this.components);
        }
        component.update(dt);
      }
    }

    for (const tornado of this.tornadoes) {
      if (tornado.enabled) {
        tornado.update(dt);
      }
    }

    for (let i = this.components.length - 1; i >= 0; i--) {
      const component = this.components[i];
      if (component instanceof CloudClusterComponent && component.speedX < 0) {
        if (component.x + component.width < Camera.x) {
          this.remove(component);
        }
      }
    }

    for (const coint of this.coins) {
      if (coint.enabled) {
        coint.update(dt);
      }
    }
    for (const lifeItem of this.lifeItems) {
      if (lifeItem.enabled) {
        lifeItem.update(dt);
      }
    }
    for (const checkpoint of this.checkpoints) {
      if (checkpoint.enabled) {
        checkpoint.update(dt);
      }
    }

    this.checkEnemyCollisions(playerVelocityYBeforeCollisionResolution);
    this.checkShellInteractions();
    this.checkTornadoCollisions();
    this.checkGoalCollision();
    this.checkCoinCollisions();
    this.checkLifeItemCollisions();
    this.checkCheckpointCollisions();

    if (this.player.y > this.gameOverY && !this.player.isDying) {
      this.handlePlayerDeath("You fell into a pit!");
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
      if (c === this.hudController.getScoreTextComponent() ||
        c === this.hudController.getLivesTextComponent() ||
        c === this.hudController.getCoinsTextComponent() ||
        c === this.hudController.getBackToCheckpointButton() ||
        c === this.hudController.getRestartLevelButton() ||
        c === this.hudController.getBackToMenuButton()) {
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

    const backToCheckpointButton = this.hudController.getBackToCheckpointButton()
    if (backToCheckpointButton.visible) {
      ctx.save()
      backToCheckpointButton.render(ctx)
      ctx.restore()
    }

    const restartLevelButton = this.hudController.getRestartLevelButton()
    if (restartLevelButton.visible) {
      ctx.save()
      restartLevelButton.render(ctx)
      ctx.restore()
    }

    const backToMenuButton = this.hudController.getBackToMenuButton()
    if (backToMenuButton.visible) {
      ctx.save()
      backToMenuButton.render(ctx)
      ctx.restore()
    }
  }

  private handleRestartLevelClick(): void {
    console.log("Restarting level:", this.currentMapUrl)
    SceneManager.setScene(new LoadingScene(async () =>
      MainScene.create(this.currentMapUrl, this.score, this.lives, undefined, undefined, this.totalCoinsCollected)
    ))
  }

  private handleBackToLastCheckpointClick(): void {
    console.log("Going back to last checkpoint.")
    this.player.resetToLastCheckpoint()
    Camera.follow(this.player)
    Camera.update()
    saveGameState({
      mapUrl: this.currentMapUrl,
      respawnX: this.player.getRespawnPoint().x,
      respawnY: this.player.getRespawnPoint().y,
      score: this.score,
      lives: this.lives,
      totalCoinsCollected: this.totalCoinsCollected,
    })
  }

  private handleBackToMenuButton(): void {





    console.log("Going back to start scene.")

    SceneManager.setScene(new StartScene())

  }
}
