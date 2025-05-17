import { MapData } from "../types/mapData";
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

export function createCloudComponent(cloudConfig: MapData['decorations']['clouds'][0]): CloudClusterComponent {
  return new CloudClusterComponent(cloudConfig.x, cloudConfig.y, cloudConfig.size);
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
    yPosition: number, 
    sceneComponents: Component[]): Component { 
  
  const enemyType = enemyConfig.type || "goomba"; 

  let enemy: Component;

  if (enemyType === "turtle") {
    enemy = new TurtleEnemyComponent(enemyConfig.xTile * TILE_SIZE, yPosition, TILE_SIZE, TILE_SIZE);
    (enemy as TurtleEnemyComponent).setScene(sceneComponents);
  } else { 
    enemy = new GoombaEnemyComponent(enemyConfig.xTile * TILE_SIZE, yPosition, TILE_SIZE, TILE_SIZE);
    (enemy as GoombaEnemyComponent).setScene(sceneComponents);
  }
  return enemy;
}

export function createGoal(goalConfig: MapData['goal']): GoalComponent | null {
  if (!goalConfig) return null;
  return new GoalComponent(
    goalConfig.xTile * TILE_SIZE,
    goalConfig.yTile * TILE_SIZE,
    goalConfig.widthTiles * TILE_SIZE,
    goalConfig.heightTiles * TILE_SIZE,
    goalConfig.nextMapUrl,
    goalConfig.isWinGoal
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
