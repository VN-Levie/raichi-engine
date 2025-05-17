import { MapData } from "../types/mapData";
import { GroundBlockComponent } from "../entities/GroundBlockComponent";
import { PipeComponent } from "../entities/PipeComponent";
import { FloatingPlatformComponent } from "../entities/FloatingPlatformComponent";
import { CloudClusterComponent } from "../entities/CloudClusterComponent";
import { BushComponent } from "../entities/BushComponent";
import { EnemyComponent } from "../entities/enemyComponent";
import { TILE_SIZE } from "../constants";
import { Component } from "../../core/component";

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
    sceneComponents: Component[]): EnemyComponent {
  const enemy = new EnemyComponent(enemyConfig.xTile * TILE_SIZE, yPosition, TILE_SIZE, TILE_SIZE);
  enemy.setScene(sceneComponents); // Enemy needs scene context for its AI (ledge detection, etc.)
  return enemy;
}
