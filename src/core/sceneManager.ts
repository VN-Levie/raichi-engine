import { Scene } from "./scene"

export class SceneManager {
  private static currentScene: Scene
  private static previousScene: Scene | null = null

  static getPreviousScene(): Scene | null {
    return this.previousScene
  }
  static setPreviousScene(scene: Scene) {
    this.previousScene = scene
  }

  static setScene(scene: Scene) {
    this.setPreviousScene(this.currentScene)
    this.currentScene = scene;
  }

  static update(dt: number) {
    if (this.currentScene && this.currentScene.enabled) {
      this.currentScene.update(dt)
    }

  }

  static render(ctx: CanvasRenderingContext2D) {
    this.currentScene?.render(ctx)
  }

  static getScene(): Scene {
    return this.currentScene
  }
}
