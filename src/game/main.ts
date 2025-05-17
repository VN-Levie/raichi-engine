import {
  Game,
  Scene,
  SceneManager,
  Input,
  BoxComponent,
  ButtonComponent,
  TextComponent
} from "../core/core"

import { StartScene } from "./scenes/startScene"

const CANVAS_ID = "game"; // Define canvas ID

Input.init(CANVAS_ID); // Initialize Input with canvas ID
SceneManager.setScene(new StartScene())

const game = new Game(CANVAS_ID, // Use the same ID for Game
  SceneManager.update.bind(SceneManager),
  SceneManager.render.bind(SceneManager)
)
game.start()
