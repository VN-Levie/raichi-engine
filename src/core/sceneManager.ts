import { Scene } from "./scene"

export class SceneManager {
  private static currentScene: Scene

  static setScene(scene: Scene) {
    this.currentScene = scene
  }

  static update(dt: number) {
    if (this.currentScene && this.currentScene.enabled) { // Check if scene and its enabled flag are true
      this.currentScene.update(dt)
    }
    // console.log("SceneManager.update", this.currentScene);
  }

  static render(ctx: CanvasRenderingContext2D) {
    this.currentScene?.render(ctx)
  }

  static getScene(): Scene {
    return this.currentScene
  }
}
