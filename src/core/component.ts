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


export class ColliderComponent extends Component {
  tag: string
  isTrigger: boolean
  parent: Component

  constructor(parent: Component, tag: string, isTrigger = false) {
    super()
    this.parent = parent
    this.tag = tag
    this.isTrigger = isTrigger
    
  }

  update(dt: number) {
    
    this.x = this.parent.x
    this.y = this.parent.y
    this.width = this.parent.width
    this.height = this.parent.height
  }

  render(ctx: CanvasRenderingContext2D) {
    
    
    
    
    
  }
}
