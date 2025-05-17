export abstract class Component {
  x = 0
  y = 0
  width = 0
  height = 0
  visible = true
  enabled = true
  zIndex = 0

  abstract update(dt: number): void
  abstract render(ctx: CanvasRenderingContext2D): void
}
