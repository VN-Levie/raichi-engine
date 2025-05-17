import { Scene } from "../../core/scene"
import { TextComponent } from "../../entities/textComponent"
import { ButtonComponent } from "../../entities/buttonComponent"
import { SceneManager } from "../../core/sceneManager"
import { StartScene } from "./startScene"
import { MainScene } from "./mainScene"
import { BoxComponent } from "../../entities/boxComponent"
import { LoadingScene } from "./LoadingScene";

export class GameOverScene extends Scene {
  private mapUrlToRestart: string;
  private mapName: string;

  constructor(message: string = "Game Over", mapUrl: string = '/data/maps/map-1-1.json', mapName: string = "World 1-1") { 
    super()
    this.mapUrlToRestart = mapUrl;
    this.mapName = mapName;

    const background = new BoxComponent(0, 0, 800, "rgba(0, 0, 0, 0.7)")
    background.height = 600
    background.zIndex = -1
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

    const gameOverText = new TextComponent("Game Over", 400, 150, "bold 64px Arial", "red")
    gameOverText.align = "center"
    this.add(gameOverText)

    const subtitleText = new TextComponent(message, 400, 220, "24px Arial", "white")
    subtitleText.align = "center"
    this.add(subtitleText)

    const retryButton = new ButtonComponent()
    retryButton.text = "Play Again"
    retryButton.x = 300
    retryButton.y = 280
    retryButton.width = 200
    retryButton.height = 50
    retryButton.color = "#444"
    retryButton.hoverColor = "#666"
    retryButton.onClick = async () => {
        const mapToLoad = this.mapUrlToRestart || '/data/maps/map-1-1.json';
        // For "Play Again" after Game Over, score is 0, lives reset to 3.
        // No respawn coordinates are passed, so MainScene uses map's default start.
        // PlayerComponent's resetToMapStart will be effectively called via its constructor.
        SceneManager.setScene(new LoadingScene(async () => MainScene.create(mapToLoad, 0, 3)));
    }
    this.add(retryButton)

    const menuButton = new ButtonComponent()
    menuButton.text = "Return to Menu"
    menuButton.x = 300
    menuButton.y = 350
    menuButton.width = 200
    menuButton.height = 50
    menuButton.color = "#444"
    menuButton.hoverColor = "#666"
    menuButton.onClick = () => {
      SceneManager.setScene(new StartScene())
    }
    this.add(menuButton)
  }
}
