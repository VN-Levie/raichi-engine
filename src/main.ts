import { Game } from "./core/game"
import { Scene } from "./core/scene"
import { BoxComponent } from "./entities/boxComponent"
import { Input } from "./core/input"

Input.init()

const scene = new Scene()
const game = new Game("game", scene.update.bind(scene), scene.render.bind(scene))

const box = new BoxComponent(100, 300, 50, "black")
scene.add(box)

game.start()

setInterval(() => {
  if (Input.isKeyDown("ArrowRight")) box.x += 5
  if (Input.isKeyDown("ArrowLeft")) box.x -= 5
}, 16)
