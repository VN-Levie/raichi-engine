import { Component } from "../core/component.js"
import { Input } from "../core/input.js"

export class ButtonComponent extends Component {
  text = ""
  color = "#444"
  hoverColor = "#666"
  textColor = "#fff"
  font = "16px sans-serif"
  onClick: (() => void) | null = null
  private isHovered = false

  update(dt: number) {
    const mx = Input.mouseX
    const my = Input.mouseY
    this.isHovered = this.contains(mx, my)

    if (this.isHovered && Input.isMousePressed()) {
      this.onClick?.()
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.isHovered ? this.hoverColor : this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)

    ctx.fillStyle = this.textColor
    ctx.font = this.font
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2)
  }

  private contains(px: number, py: number): boolean {
    return (
      px >= this.x &&
      py >= this.y &&
      px <= this.x + this.width &&
      py <= this.y + this.height
    )
  }
}
