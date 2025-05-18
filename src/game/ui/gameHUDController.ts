import { TextComponent } from "../../entities/textComponent";
import { ButtonComponent } from "../../entities/buttonComponent";

export class GameHUDController {
  private scoreText: TextComponent;
  private livesText: TextComponent;
  private coinsText: TextComponent;

  private restartLevelButton: ButtonComponent;
  private backToCheckpointButton: ButtonComponent;
  public backToMenuButton: ButtonComponent;

  constructor() {
    
    this.scoreText = new TextComponent(
      "Score: 0", 20, 20, "20px Arial", "white", "left", "top",
      "black", 1, 1, 2
    );
    this.scoreText.zIndex = 100;

    
    this.livesText = new TextComponent(
      "Lives: 3", 780, 20, "20px Arial", "white", "right", "top",
      "black", 1, 1, 2
    );
    this.livesText.zIndex = 100;

    
    this.coinsText = new TextComponent(
      "Coins: 0", 400, 20, "20px Arial", "yellow", "center", "top",
      "rgba(0,0,0,0.6)", 1, 1, 3
    );
    this.coinsText.zIndex = 100;

    const buttonY = 40;
    const buttonHeight = 30;
    const buttonWidth = 180;
    const buttonFontSize = "16px Arial";

    this.backToCheckpointButton = new ButtonComponent();
    this.backToCheckpointButton.text = "Last Checkpoint";
    this.backToCheckpointButton.width = buttonWidth;
    this.backToCheckpointButton.height = buttonHeight;
    this.backToCheckpointButton.x = 20;
    this.backToCheckpointButton.y = buttonY;
    this.backToCheckpointButton.font = buttonFontSize;
    this.backToCheckpointButton.zIndex = 101;

    this.restartLevelButton = new ButtonComponent();
    this.restartLevelButton.text = "Restart Level";
    this.restartLevelButton.width = buttonWidth;
    this.restartLevelButton.height = buttonHeight;
    this.restartLevelButton.x = (800 - buttonWidth) / 2;
    this.restartLevelButton.y = buttonY;
    this.restartLevelButton.font = buttonFontSize;
    this.restartLevelButton.zIndex = 101;

    this.backToMenuButton = new ButtonComponent();
    this.backToMenuButton.text = "Menu";
    this.backToMenuButton.width = buttonWidth + 40;
    this.backToMenuButton.height = buttonHeight;
    this.backToMenuButton.x = 800 - (buttonWidth + 40) - 20;
    this.backToMenuButton.y = buttonY;
    this.backToMenuButton.font = buttonFontSize;
    this.backToMenuButton.zIndex = 101;
    this.backToMenuButton.color = "#FF0000";
    this.backToMenuButton.hoverColor = "#FF4444";
  }

  public getScoreTextComponent(): TextComponent {
    return this.scoreText;
  }

  public getLivesTextComponent(): TextComponent {
    return this.livesText;
  }

  public getCoinsTextComponent(): TextComponent {
    return this.coinsText;
  }

  public getRestartLevelButton(): ButtonComponent {
    return this.restartLevelButton;
  }

  public getBackToCheckpointButton(): ButtonComponent {
    return this.backToCheckpointButton;
  }

  public getMenuButton(): ButtonComponent {
    return this.backToMenuButton;
  }

  public updateScore(newScore: number): void {
    this.scoreText.text = `Score: ${newScore}`;
  }

  public updateLives(newLives: number): void {
    this.livesText.text = `Lives: ${newLives}`;
  }

  public updateCoins(count: number): void {
    this.coinsText.text = `Coins: ${count}`;
  }
}
