import { Component } from "../core/component"
import { Animator } from "../core/animator"

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
    if (this.animator && this.image) {
      const sourceRect = this.animator.getFrameSourceRect();
      if (sourceRect) {
        ctx.drawImage(
          this.image,
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sWidth,
          sourceRect.sHeight,
          this.x,
          this.y,
          this.width,
          this.height
        );
      }
    } else if (this.image) {

      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}
