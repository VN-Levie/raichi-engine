export class Animator {
  frames: HTMLImageElement[] = []
  frameRate = 8
  loop = true
  playing = true
  currentFrame = 0
  private timer = 0

  constructor(frames: HTMLImageElement[], frameRate = 8, loop = true) {
    this.frames = frames
    this.frameRate = frameRate
    this.loop = loop
  }

  update(dt: number) {
    if (!this.playing || this.frames.length === 0) return
    this.timer += dt
    const frameTime = 1 / this.frameRate
    if (this.timer >= frameTime) {
      this.timer -= frameTime
      this.currentFrame++
      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0
        } else {
          this.currentFrame = this.frames.length - 1
          this.playing = false
        }
      }
    }
  }

  getFrame(): HTMLImageElement | null {
    return this.frames[this.currentFrame] || null
  }

  reset() {
    this.currentFrame = 0
    this.timer = 0
    this.playing = true
  }
}
