import { Component } from "../core/component"

export class BoxComponent extends Component {
  color = "black"
  speed = 50

  constructor(x: number, y: number, size: number, color: string) {
    super()
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.color = color
  }

  update(dt: number) {}
   

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}
