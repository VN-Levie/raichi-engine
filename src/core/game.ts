export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private lastTime = 0
  private isRunning = false
  private updateCallback: (dt: number) => void
  private renderCallback: (ctx: CanvasRenderingContext2D) => void

  constructor(canvasId: string, update: (dt: number) => void, render: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) throw new Error("Canvas not found")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context not supported")
    this.canvas = canvas
    this.ctx = ctx
    this.updateCallback = update
    this.renderCallback = render
  }

  start() {
    console.log("Game started");
    
    this.lastTime = performance.now()
    this.isRunning = true
    requestAnimationFrame(this.loop)
  }

  private loop = (time: number) => {
    const dt = (time - this.lastTime) / 1000
    this.lastTime = time
    this.updateCallback(dt)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.renderCallback(this.ctx)
    if (this.isRunning) requestAnimationFrame(this.loop)
  }
}
