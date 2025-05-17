import { Component } from "../../core/component";
import { PlayerComponent } from "./playerComponent";

export class TurtleEnemyComponent extends Component {
    private speed = 0.8;
    private direction = 1;
    isAlive = true;
    private deathSpeed = 0;
    private readonly gravity = 0.5;
    private scene: Component[] = [];
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

            if (this.x <= 0 && this.direction === -1) { this.x = 0; this.direction = 1; }

            const worldWidth = 3200;
            if (this.x + this.width >= worldWidth && this.direction === 1) { this.x = worldWidth - this.width; this.direction = -1; }

        } else {

            this.y += this.deathSpeed;
            this.deathSpeed += this.gravity;
            if (this.y > 800) {
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


        const shellColor = "#008000";
        const bodyColor = "#FFD700";

        ctx.save();

        ctx.fillStyle = shellColor;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height * 0.4, this.width * 0.45, this.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();


        ctx.fillStyle = bodyColor;

        ctx.fillRect(this.x + this.width * (this.direction === 1 ? 0.7 : 0.05), this.y + this.height * 0.3, this.width * 0.25, this.height * 0.2);

        ctx.fillRect(this.x + this.width * 0.15, this.y + this.height * 0.7, this.width * 0.2, this.height * 0.2);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.7, this.width * 0.2, this.height * 0.2);

        if (!this.isAlive) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.3);
            ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.7);
            ctx.stroke();
        }
        ctx.restore();
    }

    stomp() {

        if (!this.isAlive) return;
        this.isAlive = false;
        this.solid = false;
        this.deathSpeed = -8;
    }

    kill() {
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
