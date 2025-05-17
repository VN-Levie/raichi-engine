import { Component } from "../../core/component";
import { PlayerComponent } from "./playerComponent";

export class EnemyComponent extends Component {
  private speed = 1;
  private direction = 1;
  isAlive = true;
  private deathSpeed = 0;
  private readonly gravity = 0.5;
  private scene: Component[] = [];
  private stompAnimationTime = 0;
  private readonly stompDuration = 0.3;

  initialX: number;
  initialY: number;
  initialDirection: number;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.width = width;
    this.height = height;
    this.solid = true;
    this.zIndex = 5;
    this.initialDirection = 1; // Default initial direction
    this.direction = this.initialDirection;
  }

  setScene(scene: Component[]) {
    this.scene = scene;
  }

  update(dt: number) {
    if (this.isAlive) {
      const oldX = this.x;

      // Check for a ledge ahead before moving
      if (this.isLedgeAhead()) {
        this.direction *= -1; // Turn around
        // No horizontal movement this frame if turning at a ledge
      } else {
        // No ledge, proceed with movement
        this.x += this.speed * this.direction;

        // Check for collision with obstacles after moving
        if (this.checkObstacleCollision()) {
          this.x = oldX; // Revert position
          this.direction *= -1; // Change direction
        }
      }

      // World boundary checks
      // Ensure enemy turns around at world edges. Check against oldX to prevent rapid flipping if stuck.
      if (this.x <= 0 && this.direction === -1) { // If moving left and hit or passed left boundary
        if (oldX > 0) { // Only flip if it wasn't already at 0
             this.x = 0;
             this.direction = 1;
        } else { // If it started at 0 and direction is -1, force direction to 1
            this.direction = 1;
        }
      } else if (this.x + this.width >= 3200 && this.direction === 1) { // If moving right and hit or passed right boundary (3200 is world width)
        if (oldX + this.width < 3200) { // Only flip if it wasn't already at the boundary
            this.x = 3200 - this.width;
            this.direction = -1;
        } else { // If it started at boundary and direction is 1, force direction to -1
            this.direction = -1;
        }
      }
    } else {
      if (this.stompAnimationTime > 0) {
        this.stompAnimationTime -= dt;
        if (this.stompAnimationTime <= 0) {
          this.deathSpeed = -8;
        }
      } else {
        this.y += this.deathSpeed;
        this.deathSpeed += this.gravity;

        if (this.y > 800) {
          this.visible = false;
          this.enabled = false;
        }
      }
    }
  }

  private checkObstacleCollision(): boolean {
    for (const c of this.scene) {
      if (c === this || !c.solid || c instanceof PlayerComponent) continue;
      if (
        this.x < c.x + c.width &&
        this.x + this.width > c.x &&
        this.y < c.y + c.height &&
        this.y + this.height > c.y
      ) {
        return true;
      }
    }
    return false;
  }

  private isLedgeAhead(): boolean {
    // Determine the probe point: 1px beyond the leading edge in the current direction,
    // and 1px below the enemy's feet.
    const probeX = this.x + (this.direction === 1 ? this.width : -1);
    const probeY = this.y + this.height + 1; // Check 1px below the base of the enemy

    for (const c of this.scene) {
      // Consider only solid components that are not the enemy itself or the player
      if (c === this || !c.solid || c instanceof PlayerComponent) continue;

      // Check if the probe point (probeX, probeY) falls within the bounds of component 'c'
      if (
        probeX >= c.x &&
        probeX < c.x + c.width &&
        probeY >= c.y &&
        probeY < c.y + c.height
      ) {
        return false; // Ground detected ahead
      }
    }
    return true; // No ground detected, it's a ledge
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;

    if (!this.isAlive && this.stompAnimationTime > 0) {
      this.drawStompedGoomba(ctx);
    } else if (!this.isAlive) {
      this.drawDeadFlippingGoomba(ctx);
    } else {
      this.drawAliveGoomba(ctx);
    }
  }

  private drawAliveGoomba(ctx: CanvasRenderingContext2D) {
    // Goomba colors
    const bodyColor = "#b97a57";
    const darkBody = "#8b5c36";
    const footColor = "#6b3a1c";
    const eyeWhite = "#fff";
    const eyePupil = "#222";
    const browColor = "#442100";

    // Body (main mushroom cap)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.55, this.width * 0.45, this.height * 0.38, 0, Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = darkBody;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lower body (face)
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.75, this.width * 0.38, this.height * 0.22, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    // Feet
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.32, this.y + this.height * 0.93, this.width * 0.16, this.height * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = footColor;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.68, this.y + this.height * 0.93, this.width * 0.16, this.height * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.38, this.y + this.height * 0.68, this.width * 0.09, this.height * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = eyeWhite;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.62, this.y + this.height * 0.68, this.width * 0.09, this.height * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.38, this.y + this.height * 0.73, this.width * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = eyePupil;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.62, this.y + this.height * 0.73, this.width * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = browColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.32, this.y + this.height * 0.62);
    ctx.lineTo(this.x + this.width * 0.44, this.y + this.height * 0.63);
    ctx.moveTo(this.x + this.width * 0.56, this.y + this.height * 0.63);
    ctx.lineTo(this.x + this.width * 0.68, this.y + this.height * 0.62);
    ctx.stroke();

    // Mouth (frown)
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height * 0.81, this.width * 0.13, Math.PI * 0.15, Math.PI * 0.85, false);
    ctx.stroke();

    ctx.restore();
  }

  private drawStompedGoomba(ctx: CanvasRenderingContext2D) {
    // Squished Goomba
    const bodyColor = "#b97a57";
    const darkBody = "#8b5c36";
    const footColor = "#6b3a1c";

    ctx.save();
    // Squished body
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.85, this.width * 0.45, this.height * 0.15, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = darkBody;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Feet (flattened)
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.32, this.y + this.height * 0.93, this.width * 0.16, this.height * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = footColor;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.68, this.y + this.height * 0.93, this.width * 0.16, this.height * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawDeadFlippingGoomba(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
    this.drawAliveGoomba(ctx);
    ctx.restore();
  }

  stomp() {
    console.log("stomp");
    
    if (!this.isAlive) return;
    this.isAlive = false;
    this.solid = false;
    this.stompAnimationTime = this.stompDuration;
  }

  kill() {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.solid = false;
    this.stompAnimationTime = 0;
    this.deathSpeed = -8;
  }

  resetState() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.isAlive = true;
    this.visible = true;
    this.enabled = true;
    this.solid = true;
    this.direction = this.initialDirection;
    this.stompAnimationTime = 0;
    this.deathSpeed = 0;
    // Ensure speed is reset if it can change
    this.speed = 1; 
  }
}