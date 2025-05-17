import { Component } from "../../../core/component";
import { PlayerComponent } from "../playerComponent";
import { BaseEnemyComponent } from "./baseEnemyComponent";

export class GoombaEnemyComponent extends BaseEnemyComponent {
  private stompAnimationTime = 0;
  private readonly stompDuration = 0.3;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
    this.speed = this.getDefaultSpeed();
  }

  protected getDefaultSpeed(): number {
    return 1;
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

  

  resetState() {
    super.resetState();
    this.stompAnimationTime = 0;
  }

  isHarmfulOnContact(): boolean {
    return this.isAlive;
  }
}