import { Component } from "../core/component"

export class LineComponent extends Component {
  x2: number
  y2: number
  color: string
  lineWidth: number

  constructor(x1: number, y1: number, x2: number, y2: number, color: string = "#000", lineWidth: number = 1) {
    super()
    this.x = x1
    this.y = y1
    this.x2 = x2
    this.y2 = y2
    this.color = color
    this.lineWidth = lineWidth
  }

  update(dt: number) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x2, this.y2)
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.lineWidth
    ctx.stroke()
  }
}
