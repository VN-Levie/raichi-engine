import { MapData, TornadoConfigType } from "../types/mapData";
import { GroundBlockComponent } from "../entities/map/groundBlockComponent";
import { PipeComponent } from "../entities/map/pipeComponent";
import { FloatingPlatformComponent } from "../entities/map/floatingPlatformComponent";
import { CloudClusterComponent } from "../entities/map/cloudClusterComponent";
import { BushComponent } from "../entities/map/bushComponent";
import { GoombaEnemyComponent as GoombaEnemyComponent } from "../entities/enemy/goombaEnemyComponent"; 
import { TurtleEnemyComponent } from "../entities/enemy/turtleEnemyComponent";
import { GoalComponent } from "../entities/map/goalComponent";
import { TILE_SIZE } from "../constants";
import { Component } from "../../core/component";
import { FlagPoleComponent } from "../entities/map/flagPoleComponent";
import { CheckpointComponent } from "../entities/map/checkpointComponent";
import { CoinComponent } from "../entities/collectable/coinComponent";
import { LifeItemComponent } from "../entities/collectable/lifeItemComponent";
import { BaseEnemyComponent } from "../entities/enemy/baseEnemyComponent";
import { BatEnemyComponent } from "../entities/enemy/BatEnemyComponent";
import { TornadoComponent } from "../entities/effects/TornadoComponent";

export function createCloudComponent(
  cloudConfig: MapData['decorations']['clouds'][0],
  speedX: number = 0 // Optional speed for dynamic clouds
): CloudClusterComponent {
  const cloud = new CloudClusterComponent(cloudConfig.x, cloudConfig.y, cloudConfig.size, speedX);
  // If speedX is non-zero, it's a dynamic cloud, potentially different zIndex or properties
  if (speedX !== 0) {
    cloud.zIndex = -6; // Ensure dynamic clouds are also far back
  }
  return cloud;
}

export function createBushComponent(bushConfig: MapData['decorations']['bushes'][0], groundLevelY: number): BushComponent {
  return new BushComponent(bushConfig.xTile, groundLevelY, bushConfig.size);
}

export function createGroundBlockComponent(xTile: number, groundLevelY: number, groundConfig: MapData['terrain']['ground']): GroundBlockComponent {
  return new GroundBlockComponent(xTile, groundLevelY, groundConfig.color, groundConfig.topHighlightColor, groundConfig.textureColor);
}

export function createPipeComponent(pipeConfig: MapData['terrain']['pipes'][0], groundLevelY: number): PipeComponent {
  return new PipeComponent(pipeConfig.xTile, groundLevelY, pipeConfig.heightMultiplier);
}

export function createFloatingPlatformComponent(platformConfig: MapData['terrain']['floatingPlatforms'][0]): FloatingPlatformComponent {
  return new FloatingPlatformComponent(platformConfig.xTile, platformConfig.yTile, platformConfig.widthTiles, platformConfig.style);
}

export function createEnemy(
    enemyConfig: MapData['enemies']['positions'][0], 
    defaultYPosition: number, 
    sceneComponents: Component[]): BaseEnemyComponent { 
  
  const enemyType = enemyConfig.type || "goomba"; 
  const xPos = enemyConfig.xTile * TILE_SIZE;
  const yPos = enemyConfig.yTile !== undefined ? enemyConfig.yTile * TILE_SIZE : defaultYPosition;

  let enemy: BaseEnemyComponent;

  if (enemyType === "turtle") {
    enemy = new TurtleEnemyComponent(xPos, yPos, TILE_SIZE, TILE_SIZE);
  } else if (enemyType === "bat") {
    const patrolXTiles = enemyConfig.patrolRangeXTiles;
    let patrolRangeXPx: [number, number] | undefined = undefined;
    if (patrolXTiles && patrolXTiles.length === 2) {
      patrolRangeXPx = [patrolXTiles[0] * TILE_SIZE, patrolXTiles[1] * TILE_SIZE];
    }
    enemy = new BatEnemyComponent(xPos, yPos, TILE_SIZE, TILE_SIZE, patrolRangeXPx);
  } else { 
    enemy = new GoombaEnemyComponent(xPos, yPos, TILE_SIZE, TILE_SIZE);
  }
  enemy.setScene(sceneComponents);
  return enemy;
}

export function createTornadoComponent(tornadoConfig: TornadoConfigType): TornadoComponent {
    const xPos = tornadoConfig.xTile * TILE_SIZE;
    const yPos = tornadoConfig.yTile * TILE_SIZE;
    
    // Prepare a config object for the TornadoComponent constructor
    const componentConfig: Partial<TornadoConfigType> & { patrolRangeXTiles?: [number, number] } = { // Ensure patrolRangeXTiles is correctly typed for component
        canToggle: tornadoConfig.canToggle,
        toggleIntervalSeconds: tornadoConfig.toggleIntervalSeconds,
        baseSpeedMultiplier: tornadoConfig.baseSpeedMultiplier,
        speedRandomnessFactor: tornadoConfig.speedRandomnessFactor,
    };

    if (tornadoConfig.patrolRangeXTiles && 
        tornadoConfig.patrolRangeXTiles.length === 2 &&
        typeof tornadoConfig.patrolRangeXTiles[0] === 'number' &&
        typeof tornadoConfig.patrolRangeXTiles[1] === 'number') {
        componentConfig.patrolRangeXTiles = [
            tornadoConfig.patrolRangeXTiles[0] * TILE_SIZE, 
            tornadoConfig.patrolRangeXTiles[1] * TILE_SIZE
        ];
    }
    // Pass xPos, yPos, and the structured config
    return new TornadoComponent(xPos, yPos, componentConfig);
}

export function createGoal(goalConfig: MapData['goal']): GoalComponent | null {
  if (!goalConfig) return null;
  return new GoalComponent(
    goalConfig.xTile * TILE_SIZE,
    goalConfig.yTile * TILE_SIZE,
    goalConfig.widthTiles * TILE_SIZE,
    goalConfig.heightTiles * TILE_SIZE,
    goalConfig.nextMapUrl,
    goalConfig.isWinGoal,
    goalConfig.style
  );
}

export function createFlagPoleComponent(flagPoleConfig: MapData['decorations']['flagPole']): FlagPoleComponent | null {
  if (!flagPoleConfig) return null;
  return new FlagPoleComponent(flagPoleConfig.xTile, flagPoleConfig.yTile);
}

export function createCheckpointComponent(checkpointConfig: { xTile: number }, gameHeight: number): CheckpointComponent {
  return new CheckpointComponent(checkpointConfig.xTile, gameHeight);
}

export function createCoinComponent(coinConfig: { xTile: number; yTile: number }): CoinComponent {
  return new CoinComponent(coinConfig.xTile, coinConfig.yTile);
}

export function createLifeItemComponent(lifeItemConfig: { xTile: number; yTile: number }): LifeItemComponent {
  return new LifeItemComponent(lifeItemConfig.xTile, lifeItemConfig.yTile);
}
