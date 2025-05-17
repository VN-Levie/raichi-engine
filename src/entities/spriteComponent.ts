import { Component } from "../core/component"
import { Animator } from "../core/animator"

export class SpriteComponent extends Component {
  image?: HTMLImageElement // This will be the spritesheet if animator is used
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
          this.image, // The spritesheet
          sourceRect.sx,
          sourceRect.sy,
          sourceRect.sWidth,
          sourceRect.sHeight,
          this.x,
          this.y,
          this.width,  // Destination width
          this.height  // Destination height
        );
      }
    } else if (this.image) {
      // Draw static image (no animation)
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}
