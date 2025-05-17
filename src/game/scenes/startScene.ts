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
import { LoadingScene } from "./LoadingScene"; // Added

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
            SceneManager.setScene(new LoadingScene(async () => MainScene.create('/data/maps/map-1-1.json')));
        }

        this.add(startBtn)
    }
}
