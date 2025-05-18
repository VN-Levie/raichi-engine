import {
    Scene,
    SceneManager,
    BoxComponent,
    ButtonComponent,
    TextComponent
} from "../../core/core";
import { Camera } from "../../core/camera";
import { getMusicEnabled, setMusicEnabled, getSfxEnabled, setSfxEnabled } from "../utils/audioSettings";
import { StartScene } from "./startScene";

export class MenuScene extends Scene {
    private static instance: MenuScene;
    public static getInstance(): MenuScene {
        if (!MenuScene.instance) {
            MenuScene.instance = new MenuScene();
        }
        return MenuScene.instance;
    }
    private musicButton: ButtonComponent = new ButtonComponent();
    private sfxButton: ButtonComponent = new ButtonComponent();

    private constructor() {
        super();

        Camera.resetViewport();
        Camera.setPosition(0, 0);

        this.setupMenuScene();
    }

    private setupMenuScene() {
        const background = new BoxComponent(0, 0, 800, "#222244");
        background.height = 600;
        background.zIndex = -1;
        background.solid = false;
        background.render = (ctx) => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = background.color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        };
        this.add(background);

        const titleText = new TextComponent("Menu", 400, 100, "bold 40px Arial", "white");
        titleText.align = "center";
        this.add(titleText);

        const settingsText = new TextComponent("Audio Settings", 400, 180, "bold 28px Arial", "white");
        settingsText.align = "center";
        this.add(settingsText);

        this.musicButton = new ButtonComponent();
        this.musicButton.x = 250;
        this.musicButton.y = 240;
        this.musicButton.width = 300;
        this.musicButton.height = 60;
        this.musicButton.color = "#337AB7";
        this.musicButton.hoverColor = "#286090";
        this.musicButton.onClick = () => {
            setMusicEnabled(!getMusicEnabled());
            this.updateButtonLabels();
        };
        this.add(this.musicButton);

        this.sfxButton = new ButtonComponent();
        this.sfxButton.x = 250;
        this.sfxButton.y = 320;
        this.sfxButton.width = 300;
        this.sfxButton.height = 60;
        this.sfxButton.color = "#337AB7";
        this.sfxButton.hoverColor = "#286090";
        this.sfxButton.onClick = () => {
            setSfxEnabled(!getSfxEnabled());
            this.updateButtonLabels();
        };
        this.add(this.sfxButton);
        const previousScene = SceneManager.getPreviousScene();
        const backButton = new ButtonComponent();
        backButton.text = "Back";
        backButton.x = 250;
        backButton.y = 420;
        backButton.width = 300;
        backButton.height = 50;
        backButton.color = "#6c757d";
        backButton.hoverColor = "#5a6268";
        backButton.onClick = () => {
            SceneManager.setScene(SceneManager.getPreviousScene() || StartScene.getInstance());
        };

        this.add(backButton);

        if (previousScene && !(previousScene instanceof StartScene)) {
            const bacToHomeButton = new ButtonComponent();
            bacToHomeButton.text = "Back to Home";
            bacToHomeButton.x = 250;
            bacToHomeButton.y = 490;
            bacToHomeButton.width = 300;
            bacToHomeButton.height = 50;
            bacToHomeButton.color = "#6c757d";
            bacToHomeButton.hoverColor = "#5a6268";
            bacToHomeButton.onClick = () => {
                SceneManager.setScene(StartScene.getInstance());
            }
            this.add(bacToHomeButton);
        }




        this.updateButtonLabels();
    }

    public getCurrentMenuScene(): MenuScene {
        this.components = [];
        this.setupMenuScene();
        return this;
    }

    private updateButtonLabels() {
        this.musicButton.text = "Music: " + (getMusicEnabled() ? "ON" : "OFF");
        this.sfxButton.text = "SFX: " + (getSfxEnabled() ? "ON" : "OFF");
    }

    override render(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Camera.reset(ctx);
        this.sortComponents();
        for (const c of this.components) {
            if (c.visible) {
                ctx.save();
                c.render(ctx);
                ctx.restore();
            }
        }
    }
}
