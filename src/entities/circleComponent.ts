import { Component } from "../core/component"

export class CircleComponent extends Component {
  radius: number
  color: string

  constructor(x: number, y: number, radius: number, color: string = "#000") {
    super()
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  update(dt: number) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}
