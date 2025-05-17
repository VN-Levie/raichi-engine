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
import { loadGameState, clearGameState, SavedGameState } from "../utils/gameStateManager";
import { INITIAL_LIVES } from "../constants";

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
            clearGameState(); // Clear any old save when starting a new game
            SceneManager.setScene(new LoadingScene(async () => MainScene.create('/data/maps/map-1-1.json', 0, INITIAL_LIVES, undefined, undefined, 0)));
        }

        this.add(startBtn)

        const savedState = loadGameState();
        if (savedState) {
            const continueBtn = new ButtonComponent();
            continueBtn.text = "Continue Game";
            continueBtn.x = 220;
            continueBtn.y = 330; // Position below Start Game button
            continueBtn.width = 200;
            continueBtn.height = 60;
            continueBtn.onClick = async () => {
                SceneManager.setScene(new LoadingScene(async () => 
                    MainScene.create(
                        savedState.mapUrl, 
                        savedState.score, 
                        savedState.lives, 
                        savedState.respawnX, 
                        savedState.respawnY, 
                        savedState.totalCoinsCollected
                    )
                ));
            };
            this.add(continueBtn);

            // Adjust Start Game button text if continue is available
            startBtn.text = "New Game";
        }
    }
}
