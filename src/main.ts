import { Game } from "./core/Game"

const game = new Game("game", update, render)

let x = 100

function update(dt: number) {
  x += 50 * dt
  if (x > 800) x = 0
}

function render(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "skyblue"
  ctx.fillRect(0, 0, 800, 600)
  ctx.fillStyle = "black"
  ctx.fillRect(x, 300, 50, 50)
}

game.start()
