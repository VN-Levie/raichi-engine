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
  private timer = 0;

  constructor(
    spritesheet: HTMLImageElement, 
    orientation: 'horizontal' | 'vertical' = 'vertical', 
    frameRate = 8, 
    loop = true
  ) {
    this.spritesheet = spritesheet;
    this.orientation = orientation;
    this.frameRate = frameRate > 0 ? frameRate : 1; // Ensure frameRate is positive
    this.loop = loop;

    if (this.orientation === 'vertical') {
      this.frameWidth = spritesheet.width;
      this.frameHeight = spritesheet.width; // Assuming square frames based on width
      if (this.frameHeight === 0) {
        this.frameCount = 0;
      } else {
        this.frameCount = Math.floor(spritesheet.height / this.frameHeight);
      }
    } else { // Horizontal
      this.frameHeight = spritesheet.height;
      this.frameWidth = spritesheet.height; // Assuming square frames based on height
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
    const frameTime = 1 / this.frameRate;

    if (this.timer >= frameTime) {
      this.timer = 0;
      const oldFrame = this.currentFrame;
      this.currentFrame++;

      if (this.currentFrame >= this.frameCount) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frameCount - 1;
          this.playing = false;
        }
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
    } else { // Horizontal
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
