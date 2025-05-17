import { Scene } from "../../core/scene";
import { SceneManager } from "../../core/sceneManager";
import { BoxComponent } from "../../entities/boxComponent";
import { TextComponent } from "../../entities/textComponent";
import { PlayerComponent } from "../entities/playerComponent";
import { GameOverScene } from "./gameOverScene";
import { MainScene } from "./mainScene";
import { Camera } from "../../core/camera";
import { LoadingScene } from "./LoadingScene";

export class DeathScene extends Scene {
    private timer: number = 3;
    private remainingLives: number;
    private currentScore: number;
    private deathReason: string;
    private mapUrlToRestart: string;
    private mapName: string;
    private playerRespawnX: number; // Added
    private playerRespawnY: number; // Added

    private playerSprite: PlayerComponent;

    constructor(
        remainingLives: number, 
        currentScore: number, 
        deathReason: string, 
        mapUrl: string, 
        mapName: string,
        playerRespawnX: number, // Added
        playerRespawnY: number  // Added
        ) {
        super();
        this.remainingLives = remainingLives;
        this.currentScore = currentScore;
        this.deathReason = deathReason;
        this.mapUrlToRestart = mapUrl;
        this.mapName = mapName;
        this.playerRespawnX = playerRespawnX; // Store respawn coords
        this.playerRespawnY = playerRespawnY;

        Camera.resetViewport();
        Camera.setPosition(0, 0);

        const background = new BoxComponent(0, 0, 800, "black");
        background.height = 600;
        background.zIndex = -1;
        background.solid = false;

        const originalBgRender = background.render;
        background.render = (ctx) => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = background.color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        };
        this.add(background);

        const worldText = new TextComponent(this.mapName.toUpperCase(), 400, 200, "32px Arial", "white");
        worldText.align = "center";
        this.add(worldText);

        this.playerSprite = new PlayerComponent(350, 280);

        const livesText = new TextComponent(`x  ${this.remainingLives}`, 450, 300, "32px Arial", "white");
        livesText.align = "left";
        this.add(livesText);
    }

    override async update(dt: number) {
        super.update(dt);

        this.timer -= dt;
        if (this.timer <= 0) {
            if (this.remainingLives <= 0) {
                SceneManager.setScene(new GameOverScene(this.deathReason + " - No lives left!", this.mapUrlToRestart, this.mapName));
            } else {
                const score = this.currentScore;
                const lives = this.remainingLives;
                const mapUrl = this.mapUrlToRestart;
                // Pass respawn coordinates to MainScene.create
                SceneManager.setScene(new LoadingScene(async () => MainScene.create(mapUrl, score, lives, this.playerRespawnX, this.playerRespawnY)));
            }
        }
    }

    override render(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Camera.reset(ctx);

        super.render(ctx);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        for (const c of this.components) {
            if (c.visible) {
                ctx.save();
                c.render(ctx);
                ctx.restore();
            }
        }

        if (this.playerSprite.visible) {
            ctx.save();

            (this.playerSprite as any).isGrounded = true;
            (this.playerSprite as any).isMoving = false;
            (this.playerSprite as any).animFrame = 0;
            this.playerSprite.render(ctx);
            ctx.restore();
        }
    }
}
