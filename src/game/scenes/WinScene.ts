import { Scene } from "../../core/scene";
import { TextComponent } from "../../entities/textComponent";
import { ButtonComponent } from "../../entities/buttonComponent";
import { SceneManager } from "../../core/sceneManager";
import { StartScene } from "./startScene";
import { BoxComponent } from "../../entities/boxComponent";
import { clearGameState } from "../utils/gameStateManager";
import { AudioManager } from "../../core/audioManager";
import { getMusicEnabled } from "../utils/audioSettings";

export class WinScene extends Scene {
  constructor() {
    super();

    AudioManager.stopMusic(); // Stop any previous music
    if (getMusicEnabled()) {
      AudioManager.playMusic("assets/sound/bgm/bgm_final_boss_approach.mp3", true);
    }

    const background = new BoxComponent(0, 0, 800, "#33AA33");
    background.height = 600;
    background.zIndex = -1;
    background.solid = false;

    const originalRender = background.render;
    background.render = (ctx) => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = background.color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    };
    this.add(background);

    const winText = new TextComponent("YOU WIN!", 400, 200, "bold 72px Arial", "white");
    winText.align = "center";
    this.add(winText);

    const messageText = new TextComponent("Congratulations, you saved the princess!", 400, 300, "28px Arial", "white");
    messageText.align = "center";
    this.add(messageText);

    const menuButton = new ButtonComponent();
    menuButton.text = "Play Again?";
    menuButton.x = 300;
    menuButton.y = 380;
    menuButton.width = 200;
    menuButton.height = 50;
    menuButton.color = "#4CAF50";
    menuButton.hoverColor = "#45a049";
    menuButton.onClick = () => {
      AudioManager.stopMusic(); // Stop music before transitioning
      clearGameState();
      SceneManager.setScene(new StartScene());
    };
    this.add(menuButton);
  }
}
