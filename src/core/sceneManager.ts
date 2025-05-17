import { Scene } from "./scene"

export class SceneManager {
  private static currentScene: Scene

  static setScene(scene: Scene) {
    this.currentScene = scene
  }

  static update(dt: number) {
    this.currentScene?.update(dt)
  }

  static render(ctx: CanvasRenderingContext2D) {
    this.currentScene?.render(ctx)
  }

  static getScene(): Scene {
    return this.currentScene
  }
}
