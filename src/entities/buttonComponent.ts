import { Component } from "../core/component"
import { Input } from "../core/input"

export class ButtonComponent extends Component {
    text = ""
    color = "#444"
    hoverColor = "#666"
    activeColor = "#333"
    textColor = "#fff"
    font = "16px sans-serif"
    onClick: (() => void) | null = null

    private isHovered = false
    private isPressed = false
    private wasMouseDownLastFrame = false

    update(dt: number) {
        const mx = Input.mouseX
        const my = Input.mouseY
        const isMouseDownThisFrame = Input.isMousePressed()

        this.isHovered = this.contains(mx, my)


        if (this.isHovered && isMouseDownThisFrame) {
            if (!this.wasMouseDownLastFrame) {
                this.isPressed = true
            }
        }



        if (this.wasMouseDownLastFrame && !isMouseDownThisFrame && this.isPressed && this.isHovered) {
            this.onClick?.()
        }


        if (!isMouseDownThisFrame || (this.isPressed && !this.isHovered)) {
            this.isPressed = false
        }


        this.wasMouseDownLastFrame = isMouseDownThisFrame
    }

    render(ctx: CanvasRenderingContext2D) {
        let currentBgColor = this.color
        if (this.isPressed && this.isHovered) {
            currentBgColor = this.activeColor
        } else if (this.isHovered) {
            currentBgColor = this.hoverColor
        }

        ctx.fillStyle = currentBgColor
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