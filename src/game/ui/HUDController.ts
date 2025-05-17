import { TextComponent } from "../../entities/textComponent";
import { ButtonComponent } from "../../entities/buttonComponent";

export class HUDController {
  private scoreText: TextComponent;
  private livesText: TextComponent;
  private coinsText: TextComponent;

  private restartLevelButton: ButtonComponent;
  private backToCheckpointButton: ButtonComponent;
  private restartGameButton: ButtonComponent;

  constructor() {
    this.scoreText = new TextComponent("Score: 0", 20, 20, "20px Arial", "white");
    this.scoreText.zIndex = 100;
    this.scoreText.align = "left";

    this.livesText = new TextComponent("Lives: 3", 780, 20, "20px Arial", "white");
    this.livesText.zIndex = 100;
    this.livesText.align = "right";

    this.coinsText = new TextComponent("Coins: 0", 400, 20, "20px Arial", "yellow");
    this.coinsText.zIndex = 100;
    this.coinsText.align = "center";

    // Position new buttons at the bottom
    const buttonY = 560;
    const buttonHeight = 30;
    const buttonWidth = 180;
    const buttonFontSize = "16px Arial";

    this.backToCheckpointButton = new ButtonComponent();
    this.backToCheckpointButton.text = "Last Checkpoint";
    this.backToCheckpointButton.width = buttonWidth;
    this.backToCheckpointButton.height = buttonHeight;
    this.backToCheckpointButton.x = 20; // Left
    this.backToCheckpointButton.y = buttonY;
    this.backToCheckpointButton.font = buttonFontSize;
    this.backToCheckpointButton.zIndex = 101;

    this.restartLevelButton = new ButtonComponent();
    this.restartLevelButton.text = "Restart Level";
    this.restartLevelButton.width = buttonWidth;
    this.restartLevelButton.height = buttonHeight;
    this.restartLevelButton.x = (800 - buttonWidth) / 2; // Center
    this.restartLevelButton.y = buttonY;
    this.restartLevelButton.font = buttonFontSize;
    this.restartLevelButton.zIndex = 101;
    
    this.restartGameButton = new ButtonComponent();
    this.restartGameButton.text = "Restart Game (Menu)";
    this.restartGameButton.width = buttonWidth + 40;
    this.restartGameButton.height = buttonHeight;
    this.restartGameButton.x = 800 - (buttonWidth + 40) - 20; // Right
    this.restartGameButton.y = buttonY;
    this.restartGameButton.font = buttonFontSize;
    this.restartGameButton.zIndex = 101;
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

  public getRestartGameButton(): ButtonComponent {
    return this.restartGameButton;
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
