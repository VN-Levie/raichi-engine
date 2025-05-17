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

export class StartScene extends Scene {
    constructor() {
        super()

        const title = new TextComponent("Super Nario", 200, 150, "bold 48px Arial", "#ff4444")
        title.width = 300
        title.height = 50
        this.add(title)

        const startBtn = new ButtonComponent()
        startBtn.text = "Start Game"
        startBtn.x = 220
        startBtn.y = 250
        startBtn.width = 200
        startBtn.height = 60
        startBtn.onClick = async () => {
            try {
                const mainScene = await MainScene.create();
                SceneManager.setScene(mainScene);
            } catch (error) {
                console.error("Failed to create MainScene:", error);
                // Optionally, handle this error in the UI, e.g., show a message
            }
        }

        this.add(startBtn)
    }
}
