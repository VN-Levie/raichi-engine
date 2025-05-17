import { Component } from "../../../core/component";
import { PlayerComponent } from "../playerComponent";

export class GoombaEnemyComponent extends Component {
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
    this.solid = false;

    this.zIndex = 5;
    this.initialDirection = 1;
    this.direction = this.initialDirection;
  }

  setScene(scene: Component[]) {
    this.scene = scene;
  }

  update(dt: number) {
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



      if (this.x <= 0 && this.direction === -1) {
        if (oldX > 0) {
          this.x = 0;
          this.direction = 1;
        } else {
          this.direction = 1;
        }
      } else if (this.x + this.width >= 3200 && this.direction === 1) {
        if (oldX + this.width < 3200) {
          this.x = 3200 - this.width;
          this.direction = -1;
        } else {
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


    const probeX = this.x + (this.direction === 1 ? this.width : -1);
    const probeY = this.y + this.height + 1;

    for (const c of this.scene) {

      if (c === this || !c.solid || c instanceof PlayerComponent) continue;


      if (
        probeX >= c.x &&
        probeX < c.x + c.width &&
        probeY >= c.y &&
        probeY < c.y + c.height
      ) {
        return false;
      }
    }
    return true;
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

    const bodyColor = "#b97a57";
    const darkBody = "#8b5c36";
    const footColor = "#6b3a1c";
    const eyeWhite = "#fff";
    const eyePupil = "#222";
    const browColor = "#442100";


    ctx.save();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.55, this.width * 0.45, this.height * 0.38, 0, Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = darkBody;
    ctx.lineWidth = 2;
    ctx.stroke();


    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.75, this.width * 0.38, this.height * 0.22, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();


    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.32, this.y + this.height * 0.93, this.width * 0.16, this.height * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = footColor;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.68, this.y + this.height * 0.93, this.width * 0.16, this.height * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();


    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.38, this.y + this.height * 0.68, this.width * 0.09, this.height * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = eyeWhite;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.62, this.y + this.height * 0.68, this.width * 0.09, this.height * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.38, this.y + this.height * 0.73, this.width * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = eyePupil;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.62, this.y + this.height * 0.73, this.width * 0.03, 0, Math.PI * 2);
    ctx.fill();


    ctx.strokeStyle = browColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.32, this.y + this.height * 0.62);
    ctx.lineTo(this.x + this.width * 0.44, this.y + this.height * 0.63);
    ctx.moveTo(this.x + this.width * 0.56, this.y + this.height * 0.63);
    ctx.lineTo(this.x + this.width * 0.68, this.y + this.height * 0.62);
    ctx.stroke();


    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height * 0.81, this.width * 0.13, Math.PI * 0.15, Math.PI * 0.85, false);
    ctx.stroke();

    ctx.restore();
  }

  private drawStompedGoomba(ctx: CanvasRenderingContext2D) {

    const bodyColor = "#b97a57";
    const darkBody = "#8b5c36";
    const footColor = "#6b3a1c";

    ctx.save();

    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.85, this.width * 0.45, this.height * 0.15, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = darkBody;
    ctx.lineWidth = 2;
    ctx.stroke();


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
    if (!this.isAlive) return;
    this.isAlive = false;
    this.stompAnimationTime = this.stompDuration;
  }

  kill() {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.stompAnimationTime = 0;
    this.deathSpeed = -8;
  }

  resetState() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.isAlive = true;
    this.visible = true;
    this.enabled = true;
    this.solid = false;
    this.direction = this.initialDirection;
    this.stompAnimationTime = 0;
    this.deathSpeed = 0;

    this.speed = 1;
  }
}