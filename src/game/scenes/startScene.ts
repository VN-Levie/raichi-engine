import {
    Game,
    Scene,
    SceneManager,
    Input,
    BoxComponent,
    ButtonComponent,
    TextComponent
} from "../../core/core"

import { MainScene } from "./mainScene"
import { LoadingScene } from "./LoadingScene";
import { loadGameState, clearGameState, SavedGameState } from "../utils/gameStateManager";
import { INITIAL_LIVES } from "../constants";
import { Camera } from "../../core/camera";

export class StartScene extends Scene {
    constructor() {
        super();

        Camera.resetViewport(); // Ensure camera is reset for menu scenes
        Camera.setPosition(0, 0);

        const background = new BoxComponent(0, 0, 800, "#1A1A2E"); // Dark blue background
        background.height = 600;
        background.zIndex = -1;
        background.solid = false;
        const originalBgRender = background.render;
        background.render = (ctx) => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for full canvas draw
            ctx.fillStyle = background.color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        };
        this.add(background);

        const titleText = new TextComponent("Super Nario Game", 400, 150, "bold 48px Arial", "white");
        titleText.align = "center";
        this.add(titleText);

        const subtitleText = new TextComponent("A Raichi Engine Demo", 400, 200, "24px Arial", "#CCCCCC");
        subtitleText.align = "center";
        this.add(subtitleText);

        const savedGame = loadGameState();

        if (savedGame && this.isRecent(savedGame.timestamp)) {
            const continueButton = new ButtonComponent();
            continueButton.text = "Continue Game";
            continueButton.x = 300;
            continueButton.y = 280;
            continueButton.width = 200;
            continueButton.height = 50;
            continueButton.color = "#337AB7"; // Blue
            continueButton.hoverColor = "#286090";
            continueButton.onClick = () => {
                SceneManager.setScene(new LoadingScene(async () => MainScene.create(
                    savedGame.mapUrl,
                    savedGame.score,
                    savedGame.lives,
                    savedGame.respawnX,
                    savedGame.respawnY,
                    savedGame.totalCoinsCollected
                )));
            };
            this.add(continueButton);

            const newGameButton = new ButtonComponent();
            newGameButton.text = "New Game";
            newGameButton.x = 300;
            newGameButton.y = 350; // Position below continue
            newGameButton.width = 200;
            newGameButton.height = 50;
            newGameButton.onClick = () => {
                clearGameState();
                SceneManager.setScene(new LoadingScene(async () => MainScene.create('/data/maps/map-1-1.json', 0, INITIAL_LIVES)));
            };
            this.add(newGameButton);

        } else {
            const startButton = new ButtonComponent();
            startButton.text = "Start New Game";
            startButton.x = 300;
            startButton.y = 300; // Centered if no continue button
            startButton.width = 200;
            startButton.height = 50;
            startButton.onClick = () => {
                clearGameState();
                SceneManager.setScene(new LoadingScene(async () => MainScene.create('/data/maps/map-1-1.json', 0, INITIAL_LIVES)));
            };
            this.add(startButton);
        }
    }

    private isRecent(timestamp: number): boolean {
        const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
        return (Date.now() - timestamp) < oneDay;
    }

    override render(ctx: CanvasRenderingContext2D): void {
        // Override to ensure camera is reset before rendering UI elements
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Camera.reset(ctx); // Reset camera transform for UI

        // Render components without applying camera again
        this.sortComponents(); // Ensure zIndex is respected
        for (const c of this.components) {
            if (c.visible) {
                ctx.save();
                c.render(ctx);
                ctx.restore();
            }
        }
    }
}
