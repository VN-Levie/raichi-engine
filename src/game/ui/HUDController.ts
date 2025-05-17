import { TextComponent } from "../../entities/textComponent";

export class HUDController {
  private scoreText: TextComponent;
  private livesText: TextComponent;
  private coinsText: TextComponent;

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
