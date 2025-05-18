export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private lastTime = 0
  private isRunning = false
  private updateCallback: (dt: number) => void
  private renderCallback: (ctx: CanvasRenderingContext2D) => void
  private maxDeltaTime: number;

  constructor(
    canvasId: string,
    update: (dt: number) => void,
    render: (ctx: CanvasRenderingContext2D) => void,
    maxDeltaTimeMs = 100
  ) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) throw new Error("Canvas not found")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context not supported")
    this.canvas = canvas
    this.ctx = ctx
    this.updateCallback = update
    this.renderCallback = render
    this.maxDeltaTime = maxDeltaTimeMs / 1000;
  }

  start() {
    console.log("Game started");
    if (this.isRunning) return;
    this.isRunning = true
    this.lastTime = performance.now()
    requestAnimationFrame(this.loop)
  }

  stop() {
    this.isRunning = false;
    console.log("Game stopped");
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;

    let dt = (time - this.lastTime) / 1000


    if (dt > this.maxDeltaTime) {
      console.warn(`Delta time too large (${dt.toFixed(3)}s), capping to ${this.maxDeltaTime.toFixed(3)}s`);
      dt = this.maxDeltaTime;
    }

    this.lastTime = time

    this.updateCallback(dt)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.renderCallback(this.ctx)

    requestAnimationFrame(this.loop)
  }
}