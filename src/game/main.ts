import { GameAudioManager as AudioManager } from "./audio/gameAudioManager";
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

const CANVAS_ID = "game";

Input.init(CANVAS_ID);
SceneManager.setScene(StartScene.getInstance());

const game = new Game(CANVAS_ID,
  SceneManager.update.bind(SceneManager),
  SceneManager.render.bind(SceneManager)
)
game.start()
