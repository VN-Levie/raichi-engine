import { Scene } from "../../core/scene";
import { SceneManager } from "../../core/sceneManager";
import { TextComponent } from "../../entities/textComponent";
import { BoxComponent } from "../../entities/boxComponent";
import { Camera } from "../../core/camera";

type NextSceneLoader = () => Promise<Scene>;

export class LoadingScene extends Scene {
    private nextSceneLoader: NextSceneLoader;
    private loadingText: TextComponent;
    private dots = 0;
    private dotTimer = 0;

    constructor(nextSceneLoader: NextSceneLoader) {
        super();
        this.nextSceneLoader = nextSceneLoader;

        Camera.resetViewport(); 
        Camera.setPosition(0,0);


        const background = new BoxComponent(0,0, 800, "black");
        background.height = 600;
        background.zIndex = -1;
        const originalBgRender = background.render;
        background.render = (ctx) => { 
            ctx.save();
            ctx.setTransform(1,0,0,1,0,0);
            ctx.fillStyle = background.color;
            ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        };
        this.add(background);

        this.loadingText = new TextComponent("Loading", 400, 300, "48px Arial", "white");
        this.loadingText.align = "center";
        this.add(this.loadingText);

        this.loadNextScene();
    }

    private async loadNextScene() {
        try {
            const nextScene = await this.nextSceneLoader();
            SceneManager.setScene(nextScene);
        } catch (error) {
            console.error("Failed to load the next scene:", error);
            
            
            this.loadingText.text = "Error loading. Please refresh.";
        }
    }

    update(dt: number) {
        super.update(dt);
        this.dotTimer += dt;
        if (this.dotTimer > 0.5) {
            this.dotTimer = 0;
            this.dots = (this.dots + 1) % 4;
            this.loadingText.text = "Loading" + ".".repeat(this.dots);
        }
    }
    
    render(ctx: CanvasRenderingContext2D): void {
        
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
        Camera.reset(ctx); 
        
        
        
        
        for (const c of this.components) {
            if (c.visible) {
                ctx.save();
                c.render(ctx);
                ctx.restore();
            }
        }
    }
}
