import { Camera } from "./camera"
import { Component } from "./component"

export class Scene {
  components: Component[] = []

  add(component: Component) {
    this.components.push(component)
    this.sortComponents()
  }

  remove(component: Component) {
    const i = this.components.indexOf(component)
    if (i !== -1) this.components.splice(i, 1)
  }

  update(dt: number) {
    for (const c of this.components) {
      if (c.enabled) c.update(dt)
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    Camera.apply(ctx)
    
    this.sortComponents()
    
    for (let i = 0; i < this.components.length; i++) {
      const c = this.components[i]
      if (c.visible) {
        ctx.save()
        c.render(ctx)
        ctx.restore()
      }
    }

    Camera.reset(ctx)
  }
  
  private sortComponents() {
    this.components.sort((a, b) => a.zIndex - b.zIndex)
  }
}
