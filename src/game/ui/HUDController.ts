import { TextComponent } from "../../entities/textComponent";

export class HUDController {
  private scoreText: TextComponent;
  private livesText: TextComponent;

  constructor() {
    this.scoreText = new TextComponent("Score: 0", 10, 30, "20px Arial", "black");
    this.scoreText.zIndex = 100;

    this.livesText = new TextComponent("Lives: 3", 790, 30, "20px Arial", "black");
    this.livesText.align = "right";
    this.livesText.zIndex = 100;
  }

  public getScoreTextComponent(): TextComponent {
    return this.scoreText;
  }

  public getLivesTextComponent(): TextComponent {
    return this.livesText;
  }

  public updateScore(newScore: number): void {
    this.scoreText.text = `Score: ${newScore}`;
  }

  public updateLives(newLives: number): void {
    this.livesText.text = `Lives: ${newLives}`;
  }
}
