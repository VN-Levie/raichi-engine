import { Game } from "./core/game"
import { Scene } from "./core/scene"
import { Input } from "./core/input"
import { BoxComponent } from "./entities/boxComponent"
import { SpriteComponent } from "./entities/spriteComponent"
import { ButtonComponent } from "./entities/buttonComponent"
import { Animator } from "./core/animator"
import { AssetLoader } from "./core/assetLoader"

Input.init()

const scene = new Scene()
const game = new Game("game", scene.update.bind(scene), scene.render.bind(scene))
game.start()


const box = new BoxComponent(100, 300, 50, "black")
scene.add(box)

setInterval(() => {
    if (Input.isKeyDown("ArrowRight")) box.x += 5
    if (Input.isKeyDown("ArrowLeft")) box.x -= 5
}, 16)


const btn = new ButtonComponent()
btn.text = "Click Me"
btn.x = 300
btn.y = 200
btn.width = 150
btn.height = 50
btn.onClick = () => console.log("Button clicked!")
scene.add(btn)


Promise.all([
    AssetLoader.loadImage("assets/doi_khu.png"),
]).then(frames => {
    const anim = new Animator(frames, 8, true)
    const sprite = new SpriteComponent(null, anim)
    sprite.x = 300
    sprite.y = 100
    sprite.width = 64
    sprite.height = 64
    scene.add(sprite)
})
