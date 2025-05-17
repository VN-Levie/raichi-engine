import { Component } from "../../core/component";
import { PlayerComponent } from "./playerComponent"; // For collision checks if needed

export class TurtleEnemyComponent extends Component {
  private speed = 0.8; // Turtles might be slower
  private direction = 1;
  isAlive = true;
  private deathSpeed = 0;
  private readonly gravity = 0.5;
  private scene: Component[] = []; // For environment interaction
  // Turtle specific states:
  // isStunned = false;
  // stunTimer = 0;
  // readonly STUN_DURATION = 5; // seconds

  initialX: number;
  initialY: number;
  initialDirection: number;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.width = width; // Turtles might be wider or taller
    this.height = height;
    this.solid = true;
    this.zIndex = 5;
    this.initialDirection = 1;
    this.direction = this.initialDirection;
  }

  setScene(scene: Component[]) {
    this.scene = scene;
  }

  update(dt: number) {
    // Simplified movement logic, similar to EnemyComponent for now
    if (this.isAlive) {
      const oldX = this.x;
      if (this.isLedgeAhead()) {
        this.direction *= -1;
      } else {
        this.x += this.speed * this.direction;
        if (this.checkObstacleCollision()) {
          this.x = oldX;
          this.direction *= -1;
        }
      }
       // World boundary checks (simplified)
      if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; }
      // Assuming world width from map data isn't directly available here, use a large enough number or pass it
      const worldWidth = 3200; // Placeholder, ideally get from map data or scene
      if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; }

    } else {
      // Death animation (e.g., shell spinning or falling off screen)
      this.y += this.deathSpeed;
      this.deathSpeed += this.gravity;
      if (this.y > 800) { // Off-screen
        this.visible = false;
        this.enabled = false;
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
    const probeX = this.x + (this.direction === 1 ? this.width : -1);
    const probeY = this.y + this.height + 1;
    for (const c of this.scene) {
      if (c === this || !c.solid || c instanceof PlayerComponent) continue;
      if (probeX >= c.x && probeX < c.x + c.width && probeY >= c.y && probeY < c.y + c.height) {
        return false;
      }
    }
    return true;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;

    // Simplified turtle rendering
    const shellColor = "#008000"; // Green
    const bodyColor = "#FFD700"; // Gold/Yellow

    ctx.save();
    // Shell
    ctx.fillStyle = shellColor;
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.4, this.width * 0.45, this.height * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (head and legs)
    ctx.fillStyle = bodyColor;
    // Head
    ctx.fillRect(this.x + this.width * (this.direction === 1 ? 0.7 : 0.05), this.y + this.height * 0.3, this.width * 0.25, this.height * 0.2);
    // Feet (simple rects)
    ctx.fillRect(this.x + this.width * 0.15, this.y + this.height * 0.7, this.width * 0.2, this.height * 0.2);
    ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.7, this.width * 0.2, this.height * 0.2);
    
    if (!this.isAlive) { // e.g. draw shell upside down or cracked
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
        ctx.stroke();
    }
    ctx.restore();
  }

  stomp() { // Turtles might react differently to stomps
    // For now, same as goomba
    if (!this.isAlive) return;
    this.isAlive = false;
    this.solid = false;
    this.deathSpeed = -8; // Bounce up slightly
  }
  
  kill() { // General kill method
    if (!this.isAlive) return;
    this.isAlive = false;
    this.solid = false;
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
    this.deathSpeed = 0;
    this.speed = 0.8;
  }
}
