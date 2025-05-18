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

export class SettingScene extends Scene {
    private static instance: SettingScene;
    public static getInstance(): SettingScene {
        if (!SettingScene.instance) {
            SettingScene.instance = new SettingScene();
        }
        return SettingScene.instance;
    }
    private musicButton: ButtonComponent;
    private sfxButton: ButtonComponent;

    private constructor() {
        super();

        Camera.resetViewport();
        Camera.setPosition(0, 0);

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

        const titleText = new TextComponent("Settings", 400, 120, "bold 40px Arial", "white");
        titleText.align = "center";
        this.add(titleText);

        // Music toggle
        this.musicButton = new ButtonComponent();
        this.musicButton.x = 250;
        this.musicButton.y = 220;
        this.musicButton.width = 300;
        this.musicButton.height = 60;
        this.musicButton.color = "#337AB7";
        this.musicButton.hoverColor = "#286090";
        this.musicButton.onClick = () => {
            setMusicEnabled(!getMusicEnabled());
            this.updateButtonLabels();
        };
        this.add(this.musicButton);

        // SFX toggle
        this.sfxButton = new ButtonComponent();
        this.sfxButton.x = 250;
        this.sfxButton.y = 310;
        this.sfxButton.width = 300;
        this.sfxButton.height = 60;
        this.sfxButton.color = "#337AB7";
        this.sfxButton.hoverColor = "#286090";
        this.sfxButton.onClick = () => {
            setSfxEnabled(!getSfxEnabled());
            this.updateButtonLabels();
        };
        this.add(this.sfxButton);

        // Back button
        const backButton = new ButtonComponent();
        backButton.text = "Back";
        backButton.x = 250;
        backButton.y = 420;
        backButton.width = 300;
        backButton.height = 50;
        backButton.color = "#888";
        backButton.hoverColor = "#555";
        backButton.onClick = () => {
            SceneManager.setScene(SceneManager.getPreviousScene() || StartScene.getInstance());
        };
        this.add(backButton);

        this.updateButtonLabels();
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
