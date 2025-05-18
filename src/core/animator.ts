export class Animator {
  spritesheet: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
  loop: boolean;
  orientation: 'horizontal' | 'vertical';

  playing = true;
  currentFrame = 0;
  timer = 0;

  constructor(
    spritesheet: HTMLImageElement,
    orientation: 'horizontal' | 'vertical' = 'vertical',
    frameRate = 8,
    loop = true
  ) {
    this.spritesheet = spritesheet;
    this.orientation = orientation;
    this.frameRate = frameRate > 0 ? frameRate : 1;
    this.loop = loop;

    if (this.orientation === 'vertical') {
      this.frameWidth = spritesheet.width;
      this.frameHeight = spritesheet.width;
      if (this.frameHeight === 0) {
        this.frameCount = 0;
      } else {
        this.frameCount = Math.floor(spritesheet.height / this.frameHeight);
      }
    } else {
      this.frameHeight = spritesheet.height;
      this.frameWidth = spritesheet.height;
      if (this.frameWidth === 0) {
        this.frameCount = 0;
      } else {
        this.frameCount = Math.floor(spritesheet.width / this.frameWidth);
      }
    }
  }

  update(dt: number) {
    if (!this.playing || this.frameCount === 0 || this.frameRate <= 0) return;

    this.timer += dt;
    const rawIndex = Math.floor(this.timer * this.frameRate);

    if (this.loop) {
      this.currentFrame = rawIndex % this.frameCount;
    } else {
      if (rawIndex >= this.frameCount) {
        this.currentFrame = this.frameCount - 1;
        this.playing = false;
      } else {
        this.currentFrame = rawIndex;
      }
    }
  }


  getFrameSourceRect(): { sx: number, sy: number, sWidth: number, sHeight: number } | null {
    if (!this.spritesheet || this.frameCount === 0) return null;

    let sx = 0;
    let sy = 0;

    if (this.orientation === 'vertical') {
      sx = 0;
      sy = this.currentFrame * this.frameHeight;
    } else {
      sx = this.currentFrame * this.frameWidth;
      sy = 0;
    }

    return {
      sx: sx,
      sy: sy,
      sWidth: this.frameWidth,
      sHeight: this.frameHeight,
    };
  }

  reset() {
    this.currentFrame = 0;
    this.timer = 0;
    this.playing = true;
  }
}
