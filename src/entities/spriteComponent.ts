import { Component } from "../core/component.js"
import { Animator } from "../core/animator.js"

export class SpriteComponent extends Component {
  image?: HTMLImageElement
  animator?: Animator

  constructor(image: HTMLImageElement | null = null, animator: Animator | null = null) {
    super()
    this.image = image ?? undefined
    this.animator = animator ?? undefined
  }

  update(dt: number) {
    if (this.animator) this.animator.update(dt)
  }

  render(ctx: CanvasRenderingContext2D) {
    const img = this.animator ? this.animator.getFrame() : this.image
    if (!img) return
    ctx.drawImage(img, this.x, this.y, this.width, this.height)
  }
}
