import {
  Game,
  Scene,
  SceneManager,
  Input,
  BoxComponent,
  ButtonComponent,
  TextComponent
} from "../core/core"

import { StartScene } from "../scenes/startScene"

Input.init()
SceneManager.setScene(new StartScene())

const game = new Game("game",
  SceneManager.update.bind(SceneManager),
  SceneManager.render.bind(SceneManager)
)
game.start()
