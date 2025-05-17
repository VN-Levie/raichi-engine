export abstract class Component {
  x = 0
  y = 0
  width = 0
  height = 0
  visible = true
  enabled = true
  zIndex = 0
  solid = false

  abstract update(dt: number): void
  abstract render(ctx: CanvasRenderingContext2D): void
}

// ColliderComponent for flexible collision handling
export class ColliderComponent extends Component {
  tag: string
  isTrigger: boolean
  parent: Component

  constructor(parent: Component, tag: string, isTrigger = false) {
    super()
    this.parent = parent
    this.tag = tag
    this.isTrigger = isTrigger
    // Collider uses parent's position/size
  }

  update(dt: number) {
    // Collider itself does not move, follows parent
    this.x = this.parent.x
    this.y = this.parent.y
    this.width = this.parent.width
    this.height = this.parent.height
  }

  render(ctx: CanvasRenderingContext2D) {
    // Optional: visualize collider for debugging
    // ctx.save()
    // ctx.strokeStyle = this.isTrigger ? "orange" : "red"
    // ctx.strokeRect(this.x, this.y, this.width, this.height)
    // ctx.restore()
  }
}
