import { Scene } from "../core/scene";
import { SceneManager } from "../core/sceneManager";
import { BoxComponent } from "../entities/boxComponent";
import { TextComponent } from "../entities/textComponent";
import { PlayerComponent } from "../game/entities/playerComponent";
import { GameOverScene } from "./gameOverScene";
import { MainScene } from "./mainScene";
import { Camera } from "../core/camera";

export class DeathScene extends Scene {
    private timer: number = 3; // seconds
    private remainingLives: number;
    private currentScore: number;
    private deathReason: string;

    private playerSprite: PlayerComponent;

    constructor(remainingLives: number, currentScore: number, deathReason: string) {
        super();
        this.remainingLives = remainingLives;
        this.currentScore = currentScore;
        this.deathReason = deathReason;

        // Ensure camera is reset for this full-screen scene
        Camera.resetViewport(); // Reset camera position and any zoom/pan
        Camera.setPosition(0,0);


        const background = new BoxComponent(0, 0, 800, "black"); // Fullscreen black
        background.height = 600;
        background.zIndex = -1;
        background.solid = false;
        // Make background render in screen space
        const originalBgRender = background.render;
        background.render = (ctx) => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Ensure it covers the screen
            ctx.fillStyle = background.color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        };
        this.add(background);

        const worldText = new TextComponent("WORLD 1-1", 400, 200, "32px Arial", "white");
        worldText.align = "center";
        this.add(worldText);

        // Player sprite for display
        this.playerSprite = new PlayerComponent(350, 280); // Position centrally
        // We don't add playerSprite to this.components to prevent its update() from being called by Scene.update()
        // We will render it manually. Or, ensure its update does nothing if added.
        // For simplicity, render manually.

        const livesText = new TextComponent(`x  ${this.remainingLives}`, 450, 300, "32px Arial", "white");
        livesText.align = "left"; // Align next to player sprite
        this.add(livesText);
    }

    override update(dt: number) {
        super.update(dt); // Call super to update any components if added (like TextComponents)
        
        this.timer -= dt;
        if (this.timer <= 0) {
            if (this.remainingLives <= 0) {
                SceneManager.setScene(new GameOverScene(this.deathReason + " - No lives left!"));
            } else {
                SceneManager.setScene(new MainScene(this.currentScore, this.remainingLives));
            }
        }
    }

    override render(ctx: CanvasRenderingContext2D) {
        // Ensure camera is not applied for this scene, or reset it for UI rendering
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Camera.reset(ctx); // Render UI elements in screen space

        // Render components added to the scene (background, text)
        super.render(ctx); // This will call Camera.apply and Camera.reset internally.
                           // We need to ensure it doesn't mess with our screen-space rendering.
                           // Let's adjust Scene.render or do it manually here.

        // Manual render loop for DeathScene to ensure screen space
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear again
        ctx.setTransform(1,0,0,1,0,0); // Explicitly set to screen space

        for (const c of this.components) {
            if (c.visible) {
                ctx.save();
                c.render(ctx);
                ctx.restore();
            }
        }
        
        // Manually render the player sprite
        if (this.playerSprite.visible) {
            ctx.save();
            // Temporarily set player to standing pose for display
            // This is a bit of a hack; ideally, PlayerComponent would have a setPose method.
            (this.playerSprite as any).isGrounded = true; 
            (this.playerSprite as any).isMoving = false;
            (this.playerSprite as any).animFrame = 0;
            this.playerSprite.render(ctx);
            ctx.restore();
        }
    }
}
