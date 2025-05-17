import { Scene } from "../core/scene"
import { TextComponent } from "../entities/textComponent"
import { ButtonComponent } from "../entities/buttonComponent"
import { SceneManager } from "../core/sceneManager"
import { StartScene } from "./startScene"
import { MainScene } from "./mainScene"
import { BoxComponent } from "../entities/boxComponent"

export class GameOverScene extends Scene {
  constructor() {
    super()

    // Add dark background overlay
    const background = new BoxComponent(0, 0, 800, "rgba(0, 0, 0, 0.7)")
    background.height = 600
    background.zIndex = -1
    background.solid = false
    this.add(background)

    // Game Over title
    const gameOverText = new TextComponent("Game Over", 400, 150, "bold 64px Arial", "red")
    gameOverText.align = "center"
    this.add(gameOverText)

    // Subtitle message
    const subtitleText = new TextComponent("You fell into a pit!", 400, 220, "24px Arial", "white")
    subtitleText.align = "center"
    this.add(subtitleText)

    // Retry button
    const retryButton = new ButtonComponent()
    retryButton.text = "Play Again"
    retryButton.x = 300
    retryButton.y = 280
    retryButton.width = 200
    retryButton.height = 50
    retryButton.color = "#444"
    retryButton.hoverColor = "#666"
    retryButton.onClick = () => {
      SceneManager.setScene(new MainScene())
    }
    this.add(retryButton)

    // Menu button
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
