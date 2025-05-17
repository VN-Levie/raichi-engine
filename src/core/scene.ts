import { Component } from "./component"

export class Scene {
  components: Component[] = []

  add(component: Component) {
    this.components.push(component)
    this.components.sort((a, b) => a.zIndex - b.zIndex)
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
    for (const c of this.components) {
      if (c.visible) c.render(ctx)
    }
  }
}
